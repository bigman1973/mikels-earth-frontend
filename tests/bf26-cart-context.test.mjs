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
      if (url.includes('/api/coupon/validate')) return { json: async () => ({ valid: true, coupon: { code: 'NORMAL10', discount_percentage: 10 } }) };
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
  assert.deepEqual(JSON.parse(validation.options.body).items, [{ id: ordinary.id, sku: ordinary.sku, slug: ordinary.slug, quantity: 1 }]);
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
