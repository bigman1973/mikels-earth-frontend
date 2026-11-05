import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { INDEPENDENT_PACKS } from '../src/utils/independentPacks.js';
import { PROMOTION_COUPON_MESSAGE } from '../src/utils/promotionProtection.js';

const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve('vite'));
const { build } = viteRequire('esbuild');
const bundle = await build({
  entryPoints: [new URL('../src/context/CartContext.jsx', import.meta.url).pathname],
  bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic',
  external: ['react', 'react/jsx-runtime'], define: { 'import.meta.env': '{}' },
});

const createHarness = ({ stored = [], catalogue = [] } = {}) => {
  const hooks = [];
  const pendingEffects = [];
  const calls = [];
  let index = 0;
  let dirty = true;
  let value;
  const storage = new Map([['mikels_cart', JSON.stringify(stored)]]);
  const react = {
    createContext: () => ({ Provider: 'provider' }), useContext: () => value,
    useState: (initial) => {
      const slot = index++;
      if (!(slot in hooks)) hooks[slot] = typeof initial === 'function' ? initial() : initial;
      return [hooks[slot], (update) => { hooks[slot] = typeof update === 'function' ? update(hooks[slot]) : update; dirty = true; }];
    },
    useRef: (initial) => {
      const slot = index++;
      if (!(slot in hooks)) hooks[slot] = { current: initial };
      return hooks[slot];
    },
    useEffect: (fn, deps) => {
      const slot = index++;
      const previous = hooks[slot];
      if (!previous || deps.some((dep, i) => !Object.is(dep, previous.deps[i]))) {
        previous?.cleanup?.();
        hooks[slot] = { deps };
        pendingEffects.push(() => { hooks[slot].cleanup = fn(); });
      }
    },
  };
  const exports = {};
  const context = vm.createContext({
    exports, module: { exports }, require: (name) => name === 'react' ? react : { jsx: (type, props) => ({ type, props }) },
    console, AbortSignal, AbortController, setTimeout, clearTimeout,
    window: { localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, data) => storage.set(key, data), removeItem: (key) => storage.delete(key) } },
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      if (url.includes('/api/coupon/validate')) return { ok: true, json: async () => ({ valid: true, coupon: { code: 'NORMAL10', discount_percentage: 10 } }) };
      const slug = decodeURIComponent(new URL(url).pathname.split('/').pop());
      const product = catalogue.find((item) => item.slug === slug);
      return { ok: Boolean(product), status: product ? 200 : 404, json: async () => ({ product }) };
    },
  });
  vm.runInContext(bundle.outputFiles[0].text, context);
  const render = () => {
    for (let renders = 0; dirty && renders < 20; renders += 1) {
      index = 0;
      dirty = false;
      value = context.module.exports.CartProvider({ children: null }).props.value;
      while (pendingEffects.length) pendingEffects.shift()();
    }
    assert.equal(dirty, false, 'provider must settle');
    return value;
  };
  const flush = async () => {
    for (let cycle = 0; cycle < 10; cycle += 1) { render(); await new Promise((done) => setImmediate(done)); }
    return render();
  };
  return { render, flush, calls, storage };
};

const ordinary = { id: 8001, sku: 'NORMAL-OIL', slug: 'normal-oil', name: 'Aceite ordinario', price: 20, active: true, visibleInStore: true, inPromotion: false };
const pack = { ...INDEPENDENT_PACKS[0], id: 8002, name: INDEPENDENT_PACKS[0].name, active: true, visibleInStore: false, inPromotion: true };

test('real provider invalidates a previously applied coupon immediately when adding a promo pack and never removes it', async () => {
  const harness = createHarness({ catalogue: [ordinary, pack] });
  let value = harness.render();
  value.addToCart(ordinary, 1);
  value = harness.render();
  const result = await value.applyDiscountCode('NORMAL10');
  assert.equal(result.success, true);
  value = harness.render();
  assert.equal(value.appliedDiscount.code, 'NORMAL10');
  assert.equal(value.getDiscountAmount(), 2);
  value.addToCart(pack, 1);
  value = harness.render();
  assert.equal(value.cart.length, 2);
  assert.equal(value.cart[1].sku, 'BF26-TEMP6');
  assert.equal(value.cart[1].quantity, 1);
  assert.equal(value.cart[1].price, 59.70);
  assert.equal(value.appliedDiscount, null);
  assert.equal(value.discountCode, '');
  assert.equal(value.getDiscountAmount(), 0);
  assert.equal(Math.round(value.getCartTotal() * 100), 7970);
  assert.equal(value.couponMessage, PROMOTION_COUPON_MESSAGE);
  assert.equal((await value.applyDiscountCode('NORMAL10')).message, PROMOTION_COUPON_MESSAGE);
  const persisted = JSON.parse(harness.storage.get('mikels_cart'));
  assert.equal('inPromotion' in persisted[1], false);
  const validation = harness.calls.find((call) => call.url.includes('/api/coupon/validate'));
  assert.deepEqual(JSON.parse(validation.options.body).items, [{ id: ordinary.id, sku: ordinary.sku, slug: ordinary.slug }]);
});

test('real provider refuses persisted false flags and recovers the true generic catalogue state before payment', async () => {
  const genericPromotion = { ...ordinary, inPromotion: true };
  const harness = createHarness({ stored: [{ ...ordinary, quantity: 1, purchaseType: 'one-time', inPromotion: false, promotionValidationPending: false }], catalogue: [genericPromotion] });
  let value = harness.render();
  assert.equal(value.promotionReviewReady, false);
  assert.equal((await value.applyDiscountCode('NORMAL10')).success, false);
  value = await harness.flush();
  assert.equal(value.promotionReviewReady, true);
  assert.equal(value.cart[0].inPromotion, true);
  assert.equal(value.couponMessage, PROMOTION_COUPON_MESSAGE);
  assert.equal(value.cart.length, 1);
  assert.equal(harness.calls.some((call) => call.url.includes('/api/coupon/validate')), false);
});

test('real provider retains unresolved hidden pack and blocks payment after authoritative 404', async () => {
  const harness = createHarness({ stored: [{ ...pack, quantity: 1, purchaseType: 'one-time' }], catalogue: [] });
  let value = harness.render();
  assert.equal(value.promotionReviewReady, false);
  value = await harness.flush();
  assert.equal(value.promotionReviewReady, false);
  assert.ok(value.promotionReviewError);
  assert.equal(value.cart.length, 1);
  assert.equal(value.cart[0].sku, 'BF26-TEMP6');
});

const master = {
  id: 8003, sku: 'MIKVET500', slug: 'aceite-temprano-sin-filtrar',
  name: 'Nombre antiguo', price: 19.90, active: true, visibleInStore: true, inPromotion: false,
  volumeDiscount: { minQuantity: 3, discount: 50 },
  tieredDiscount: [{ minQuantity: 6, discount: 50 }],
  subscriptionFrequencies: [{ value: 'monthly', discount: 50 }],
};
const literalMessage = 'Este código no se puede aplicar porque el pedido incluye productos en promoción.';

for (const [label, blocker] of [['BF26-TEMP6 promoted', pack], ['MIKVET500 protected with catalogue inPromotion false', master]]) {
  test(`real provider rejects the entire mixed ${label} order before coupon API in both insertion orders`, async () => {
    for (const order of [[blocker, ordinary], [ordinary, blocker]]) {
      const harness = createHarness({ catalogue: [blocker, ordinary] });
      let value = harness.render();
      for (const item of order) { value.addToCart(item, 1); value = harness.render(); }
      const before = JSON.stringify(value.cart);
      const result = await value.applyDiscountCode('NORMAL10');
      assert.equal(result.success, false);
      assert.equal(result.message, literalMessage);
      value = harness.render();
      assert.equal(value.couponMessage, literalMessage);
      assert.equal(value.appliedDiscount, null);
      assert.equal(value.discountCode, '');
      assert.equal(value.getDiscountAmount(), 0);
      assert.equal(JSON.stringify(value.cart), before, 'rejection cannot remove or modify lines');
      assert.equal(Math.round(value.getCartTotal() * 100), Math.round((blocker.price + ordinary.price) * 100));
      assert.equal(harness.calls.length, 0, 'known protected/promoted mixed carts reject without any API request');
    }
  });
}

test('real provider invalidates a pre-applied coupon synchronously when protected master joins an ordinary order', async () => {
  const harness = createHarness({ catalogue: [ordinary, master] });
  let value = harness.render();
  value.addToCart(ordinary, 1);
  value = harness.render();
  assert.equal((await value.applyDiscountCode('NORMAL10')).success, true);
  value = harness.render();
  assert.equal(value.getDiscountAmount(), 2);
  const callsBefore = harness.calls.length;
  value.addToCart(master, 1);
  value = harness.render();
  assert.equal(value.cart.length, 2);
  assert.equal(value.appliedDiscount, null);
  assert.equal(value.discountCode, '');
  assert.equal(value.getDiscountAmount(), 0);
  assert.equal(Math.round(value.getCartTotal() * 100), 3990);
  assert.equal((await value.applyDiscountCode('NORMAL10')).message, literalMessage);
  assert.equal(harness.calls.length, callsBefore, 'rejection performs no new coupon/catalogue API calls');
});

test('real provider keeps master 19.90 at quantities 1, 3, 6 and 12 without volume or subscription reductions', () => {
  for (const quantity of [1, 3, 6, 12]) {
    const harness = createHarness();
    let value = harness.render();
    value.addToCart({ ...master, price: 17.50 }, quantity, 'subscription', 'monthly');
    value = harness.render();
    const item = value.cart[0];
    assert.equal(item.sku, 'MIKVET500');
    assert.equal(item.name, 'Aceite de oliva virgen extra Temprano 2026/27 sin filtrar');
    assert.equal(item.price, 19.90);
    assert.equal(item.purchaseType, 'one-time');
    assert.equal(item.subscriptionFrequency, null);
    assert.equal(item.selectedPackQuantity, null);
    assert.equal(item.volumeDiscountConfig, undefined);
    assert.equal(item.tieredDiscountConfig, undefined);
    assert.equal(value.getItemPrice(item), 19.90);
    assert.equal(Math.round(value.getCartTotal() * 100), quantity * 1990);
  }
});

test('real provider preserves both full harvest names, old pack 59.70 and no borrowed old-harvest image', () => {
  const harness = createHarness();
  let value = harness.render();
  value.addToCart({ ...pack, image: null }, 1);
  value = harness.render();
  value.addToCart(master, 1);
  value = harness.render();
  assert.equal(value.cart.length, 2);
  assert.equal(value.cart[0].name, INDEPENDENT_PACKS[0].name);
  assert.equal(value.cart[0].image, null);
  assert.equal(value.getItemPrice(value.cart[0]), 59.70);
  assert.equal(Math.round(value.getItemPrice(value.cart[0]) / INDEPENDENT_PACKS[0].units * 100), 995);
  assert.equal(value.cart[1].name, 'Aceite de oliva virgen extra Temprano 2026/27 sin filtrar');
  assert.equal(value.getItemPrice(value.cart[1]), 19.90);
  assert.equal(Math.round(value.getCartTotal() * 100), 7960);
});

test('real provider revalidates a persisted protected master mixed order yet refuses its coupon without validation API', async () => {
  const harness = createHarness({
    stored: [master, ordinary].map((item) => ({ ...item, quantity: 1, purchaseType: 'one-time', inPromotion: false })),
    catalogue: [master, ordinary],
  });
  let value = await harness.flush();
  assert.equal(value.promotionReviewReady, true);
  assert.equal(value.cart[0].inPromotion, false, 'must not invent a catalogue promotion flag');
  const result = await value.applyDiscountCode('NORMAL10');
  assert.equal(result.success, false);
  assert.equal(result.message, literalMessage);
  value = harness.render();
  assert.equal(value.getDiscountAmount(), 0);
  assert.equal(Math.round(value.getCartTotal() * 100), 3990);
  assert.equal(value.cart.length, 2);
  assert.equal(harness.calls.filter((call) => call.url.includes('/api/coupon/validate')).length, 0);
});
