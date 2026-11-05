import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { transformWithEsbuild } from 'vite';
import * as protection from '../src/utils/promotionProtection.js';
import * as storage from '../src/utils/cartStorage.js';
import * as volume from '../src/utils/volumePricing.js';
import * as fixedPacks from '../src/utils/fixedPackPricing.js';
import * as reservation from '../src/utils/reservationSale.js';
import * as harvest from '../src/utils/tempranoHarvestIdentity.js';
import * as tracking from '../src/utils/cartTracking.js';
import * as money from '../src/utils/formatMoney.js';

const MESSAGE = 'Este código no se puede aplicar porque el pedido incluye productos en promoción.';
const BF26 = ['BF26-TEMP6', 'BF26-TEMP12', 'BF26-ECO6', 'BF26-PARA3', 'BF26-PARA6', 'BF26-5L3'];
const CODES = ['LEGACY-LOCAL', 'MANUAL-LOCAL', 'NEWSLETTER-UNKNOWN-LOCAL'];
const ordinary = { id: 'ordinary-local', sku: 'ORDINARY-LOCAL', slug: 'ordinary-local', name: 'Fixture', price: 20, quantity: 2, purchaseType: 'one-time' };
const coupon = { oneTimeDiscount: 10, subscriptionDiscount: 20 };
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const clone = (value) => JSON.parse(JSON.stringify(value));
const compiled = async (path) => (await transformWithEsbuild(read(path), path, {
  loader: path.endsWith('.jsx') ? 'jsx' : 'js', format: 'cjs',
  define: { 'import.meta.env': '{}' },
})).code;
const providerCode = await compiled('src/context/CartContext.jsx');
const drawerCode = await compiled('src/components/cart/CartDrawer.jsx');
const stripeCode = await compiled('src/services/stripeService.js');
const modules = {
  '../utils/cartStorage': storage,
  '../utils/volumePricing': volume,
  '../utils/fixedPackPricing': fixedPacks,
  '../utils/cartTracking': tracking,
  '../utils/metaPixel': { trackMetaAddToCart() {} },
  '../utils/googleAnalytics': { trackGA4AddToCart() {} },
  '../utils/reservationSale': reservation,
  '../utils/tempranoHarvestIdentity': harvest,
  '../utils/promotionProtection': protection,
};
const success = (code, valid_in_promotion = false) => ({ ok: true, json: async () => ({ valid: true, coupon: { code, discount_percentage: 10, valid_in_promotion } }) });

// Hooks and fetch are deterministic mocks: no browser, API, analytics or Stripe calls.
function cartHarness(initial = [], send = async (_url, init) => success(JSON.parse(init.body).code)) {
  const slots = [], effects = [];
  const saved = new Map([[storage.CART_STORAGE_KEY, JSON.stringify(initial)]]);
  const calls = [];
  let cursor = 0, dirty = false, value;
  const React = {
    createContext: () => ({ Provider: 'Provider' }),
    useContext: () => value,
    useState(initializer) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initializer === 'function' ? initializer() : initializer;
      return [slots[index], (next) => {
        const resolved = typeof next === 'function' ? next(slots[index]) : next;
        if (!Object.is(resolved, slots[index])) { slots[index] = resolved; dirty = true; }
      }];
    },
    useRef(initializer) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initializer };
      return slots[index];
    },
    useEffect(setup, deps) {
      const index = cursor++;
      if (!slots[index] || deps.some((dep, i) => !Object.is(dep, slots[index][i]))) {
        slots[index] = deps;
        effects.push(setup);
      }
    },
    createElement(type, props, ...children) { return { type, props: { ...props, children } }; },
  };
  const exports = {};
  const module = { exports };
  runInNewContext(providerCode, {
    module, exports, React,
    require: (name) => {
      if (name === 'react') return React;
      if (!(name in modules)) throw new Error(`Unmocked module: ${name}`);
      return modules[name];
    },
    window: { localStorage: {
      getItem: (key) => saved.get(key) ?? null,
      setItem: (key, next) => saved.set(key, next),
      removeItem: (key) => saved.delete(key),
    } },
    fetch: async (...args) => { calls.push(args); return send(...args); },
    console: { error() {}, log() {} },
  });
  function render(flushEffects = true) {
    let iterations = 0;
    do {
      if (++iterations > 20) throw new Error('Hook render did not settle');
      cursor = 0; dirty = false;
      value = module.exports.CartProvider({ children: null }).props.value;
      if (!flushEffects) break;
      while (effects.length) effects.shift()();
    } while (dirty);
    return value;
  }
  render();
  return { get value() { return value; }, calls, saved, render };
}

function renderDrawer(value) {
  const exports = {};
  const module = { exports };
  const React = {
    useState: (initial) => [initial, () => {}],
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  };
  runInNewContext(drawerCode, {
    module, exports, React,
    require: (name) => {
      const mocks = {
        react: React, 'react-i18next': { useTranslation: () => ({ t: (key) => key }) },
        '../../context/CartContext': { useCart: () => value },
        'lucide-react': { X: 'X', Plus: 'Plus', Minus: 'Minus', ShoppingBag: 'ShoppingBag' },
        'framer-motion': { motion: { div: 'div', aside: 'aside' }, AnimatePresence: 'AnimatePresence' },
        'react-router-dom': { Link: 'Link' },
        '../../utils/formatMoney': money, '../../utils/fixedPackPricing': fixedPacks,
        '../../utils/reservationSale': reservation, '../../utils/promotionProtection': protection,
        '../../utils/tempranoHarvestIdentity': harvest,
      };
      if (!(name in mocks)) throw new Error(`Unmocked drawer module: ${name}`);
      return mocks[name];
    },
  });
  return module.exports.default();
}
const nodes = (node) => Array.isArray(node) ? node.flatMap(nodes)
  : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];
const assertInlineVeto = (h) => {
  const tree = renderDrawer({ ...h.value, isCartOpen: true });
  assert.equal(nodes(tree).some((node) => node.props?.role === 'alert' && node.props.children.includes(MESSAGE)), true);
  assert.doesNotMatch(JSON.stringify(tree), /El cupón solo se aplica/);
};
const assertVeto = (h) => {
  assert.equal(h.value.appliedDiscount, null);
  assert.equal(h.value.discountCode, '');
  assert.equal(h.value.getDiscountAmount(), 0);
  assert.equal(h.value.couponError, MESSAGE);
  assertInlineVeto(h);
};

test('only six exact BF26 identities plus inherited protections and both flags veto coupons, not pricing', () => {
  assert.equal(protection.PROMOTION_COUPON_MESSAGE, MESSAGE);
  for (const sku of BF26) {
    const item = { ...ordinary, sku: ` ${sku.toLowerCase()} `, inPromotion: false, in_promotion: false,
      tieredDiscountConfig: [{ minQuantity: 2, discount: 10 }] };
    const before = clone(item);
    assert.equal(protection.isPromotionProtectedItem(item), false, 'legacy pricing rule must not be widened');
    assert.equal(protection.isCouponProtectedItem(item), true);
    assert.equal(protection.getCouponDiscountAmount([ordinary, item], coupon, (line) => line.price), 0);
    assert.equal(protection.normalizePromotionProtectedCartItem(item), item);
    assert.equal(volume.getVolumeDiscountedUnitPrice(item, 2), 18, 'published volume rules unchanged');
    assert.deepEqual(item, before);
  }
  for (const sku of ['BF26-TEMP6-EXTRA', 'BF26-UNKNOWN', 'BF26-TEMP3', 'MIKVET500R', 'MIKVET5002526', 'MIKVE5LPBF3']) {
    assert.equal(protection.isCouponProtectedItem({ ...ordinary, sku }), false, sku);
  }
  for (const flags of [{ inPromotion: true }, { in_promotion: true }, { inPromotion: false, in_promotion: true }]) {
    const item = { ...ordinary, ...flags };
    assert.equal(protection.isCouponProtectedItem(item), true);
    assert.equal(protection.normalizePromotionProtectedCartItem(item), item);
  }
  for (const sku of ['MIKVET500', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP']) {
    assert.equal(protection.isCouponProtectedItem({ ...ordinary, sku, inPromotion: false, in_promotion: false }), true);
  }
});

test('any coupon origin is validated by backend with only id/slug/sku, no client metadata', async () => {
  for (const code of CODES) {
    const h = cartHarness([{ ...ordinary, quantity: 7, inPromotion: false, in_promotion: false,
      arbitraryPrivateField: 'must-not-send', couponProtectedCompositionSkus: ['ORDINARY-LOCAL'] }]);
    assert.equal((await h.value.applyDiscountCode(` ${code} `)).success, true);
    h.render();
    assert.equal(h.value.discountCode, code);
    assert.equal(h.value.getDiscountAmount(), 14);
    const [url, init] = h.calls[0];
    assert.ok(url.endsWith('/api/coupon/validate'));
    assert.equal(init.method, 'POST');
    assert.deepEqual(JSON.parse(init.body), { code, items: [{ id: ordinary.id, slug: ordinary.slug, sku: ordinary.sku }] });
    assert.equal(h.calls.length, 1);
  }
});

test('legacy/manual/unknown newsletter coupon on mixed carts is wholly rejected; only unconditional protections stop before API', async () => {
  const protectedItems = [
    ...['MIKVET500', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP', ...BF26].map((sku, i) => ({ ...ordinary, id: `protected-${i}`, sku })),
    { ...ordinary, id: 'flag-camel', inPromotion: true },
    { ...ordinary, id: 'flag-snake', in_promotion: true },
    { ...ordinary, id: 'composition', couponProtectedCompositionSkus: ['MIKVET500'] },
  ];
  for (const item of protectedItems) for (const code of CODES) for (const cart of [[ordinary, item], [item, ordinary], [item]]) {
    const h = cartHarness(cart);
    const before = clone(h.value.cart);
    assert.deepEqual(clone(await h.value.applyDiscountCode(code)), { success: false, message: MESSAGE });
    h.render();
    assertVeto(h);
    assert.equal(h.calls.length, protection.isUnconditionallyCouponProtectedItem(item) ? 0 : 1,
      `${code}/${item.sku}: global promotion must reach validation, unconditional SKU must not`);
    assert.deepEqual(clone(h.value.cart), before, 'coupon veto never edits price, quantity or identity');
  }
});

test('MIKVET500 plus any representative article vetoes all codes in both real addToCart sequences', async () => {
  const companions = [
    ordinary,
    ...['MIKVET5002526', 'MIKVET500R', 'MIKESTTEM', 'MIKVE5LPBF3', ...BF26].map((sku, i) => ({ ...ordinary, id: `companion-${i}`, sku })),
    { ...ordinary, id: 'subscription-local', purchaseType: 'subscription' },
  ];
  for (const companion of companions) for (const reverse of [false, true]) {
    const temprano = { ...ordinary, id: 'temprano-local', sku: 'MIKVET500', price: 19.90 };
    const h = cartHarness();
    for (const item of reverse ? [companion, temprano] : [temprano, companion]) {
      h.value.addToCart(item, 3, item.purchaseType); h.render();
    }
    const before = clone(h.value.cart);
    for (const code of CODES) {
      assert.equal((await h.value.applyDiscountCode(code)).message, MESSAGE);
      h.render(); assertVeto(h);
      assert.deepEqual(clone(h.value.cart), before);
    }
    assert.equal(h.calls.length, 0);
  }
});

test('coupon then protected addition invalidates immediately, remains zero and never auto-restores after removal', async () => {
  const identities = ['MIKVET500', 'MIKPACKF', ...BF26].map((sku, i) => ({ ...ordinary, id: `added-${i}`, sku }));
  identities.push({ ...ordinary, id: 'flag-camel', inPromotion: true }, { ...ordinary, id: 'flag-snake', in_promotion: true });
  for (const item of identities) {
    const h = cartHarness([ordinary]);
    await h.value.applyDiscountCode('MANUAL-LOCAL'); h.render();
    assert.equal(h.value.getDiscountAmount(), 4);
    h.value.addToCart(item, 3);
    h.render(false); // Before effects: checkout consumers already receive null, not a fraction.
    assertVeto(h);
    h.render(); assertVeto(h);
    assert.equal(h.value.cart[1].quantity, 3);
    assert.equal(h.value.cart[1].sku, item.sku);
    assert.equal(h.value.getCartTotal(), h.value.cart.reduce((sum, line) => sum + h.value.getItemPrice(line) * line.quantity, 0));
    h.value.removeFromCart(1); h.render();
    assert.equal(h.value.appliedDiscount, null);
    assert.equal(h.value.getDiscountAmount(), 0);
    assert.equal((await h.value.applyDiscountCode('MANUAL-LOCAL')).success, true);
    h.render(); assert.equal(h.value.getDiscountAmount(), 4);
  }
});

test('new and merged persisted lines remember both promotion flags, including explicit false without adding absent flags', async () => {
  for (const flags of [{ inPromotion: true }, { in_promotion: true }, { inPromotion: false, in_promotion: false }]) {
    const h = cartHarness();
    h.value.addToCart({ ...ordinary, ...flags }); h.render();
    const persisted = JSON.parse(h.saved.get(storage.CART_STORAGE_KEY));
    for (const [key, value] of Object.entries(flags)) assert.equal(persisted[0][key], value);
    const restored = cartHarness(persisted);
    assert.equal(protection.hasPromotionProtectedItem(restored.value.cart), Object.values(flags).some(Boolean));
  }
  const plain = cartHarness(); plain.value.addToCart(ordinary); plain.render();
  assert.equal('inPromotion' in plain.value.cart[0], false);
  assert.equal('in_promotion' in plain.value.cart[0], false);
  await plain.value.applyDiscountCode('LEGACY-LOCAL'); plain.render();
  plain.value.addToCart({ ...ordinary, inPromotion: true }); plain.render(); assertVeto(plain);
  plain.value.addToCart({ ...ordinary, inPromotion: false }); plain.render(); assertVeto(plain);
  assert.equal(plain.value.cart.length, 1);
  assert.equal(plain.value.cart[0].quantity, 3);
});

test('false/absent forged flags cannot override persisted backend authority and veto remains inline', async () => {
  for (const flags of [{}, { inPromotion: false, in_promotion: false }]) for (const code of CODES) {
    let calls = 0;
    const h = cartHarness([{ ...ordinary, id: 'persisted-promotion-local', ...flags }], async (_url, init) => {
      calls++;
      const body = JSON.parse(init.body);
      assert.equal(body.items[0].id, 'persisted-promotion-local');
      assert.deepEqual(Object.keys(body.items[0]).sort(), ['id', 'sku', 'slug']);
      if (calls === 1) return success(body.code);
      // Mock persistence marks this identity as promoted; client flags are irrelevant.
      return { ok: false, json: async () => ({ valid: false, error: 'PROMOTION_NOT_AVAILABLE', message: MESSAGE }) };
    });
    await h.value.applyDiscountCode('PREVIOUS-LOCAL'); h.render();
    assert.equal(h.value.getDiscountAmount(), 4);
    assert.deepEqual(clone(await h.value.applyDiscountCode(code)), { success: false, message: MESSAGE });
    h.render(); assertVeto(h);
    assert.equal(h.calls.length, 2);
  }
});

test('late successful validation cannot reapply a coupon after protected addition, remove or cart identity change', async () => {
  for (const action of ['protected', 'identity-change', 'remove-code']) {
    let resolve;
    const h = cartHarness([ordinary], () => new Promise((done) => { resolve = done; }));
    const pending = h.value.applyDiscountCode('MANUAL-LOCAL');
    if (action === 'remove-code') h.value.removeDiscountCode();
    else h.value.addToCart({ ...ordinary, id: 'late-local', sku: action === 'protected' ? 'BF26-ECO6' : 'OTHER-LOCAL' });
    h.render();
    resolve(success('MANUAL-LOCAL'));
    const result = await pending; h.render();
    assert.equal(result.success, false);
    assert.equal(h.value.appliedDiscount, null);
    assert.equal(h.value.getDiscountAmount(), 0);
    if (action === 'protected') assertVeto(h);
  }
});

test('backend transport failure or invalid unknown coupon never applies a new discount', async () => {
  for (const send of [
    async () => { throw new Error('offline mocked failure'); },
    async () => ({ ok: false, json: async () => ({ valid: true, coupon: { code: 'BAD-LOCAL', discount_percentage: 10 } }) }),
    async () => ({ ok: true, json: async () => ({ valid: false, message: 'Cupón no válido' }) }),
  ]) {
    const h = cartHarness([ordinary], send);
    assert.equal((await h.value.applyDiscountCode('UNKNOWN-LOCAL')).success, false);
    h.render(); assert.equal(h.value.appliedDiscount, null); assert.equal(h.value.getDiscountAmount(), 0);
  }
  const empty = cartHarness([]);
  assert.equal((await empty.value.applyDiscountCode('MANUAL-LOCAL')).success, false);
  assert.equal((await empty.value.applyDiscountCode(' ')).success, false);
  assert.equal(empty.calls.length, 0);
});

test('both exact collaborators can validate and discount all six promotion packs only with server boolean true', async () => {
  for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls']) for (const sku of BF26) {
    const promoted = { ...ordinary, id: `promo-${sku}`, sku, inPromotion: true, in_promotion: true };
    const h = cartHarness([promoted, ordinary], async (_url, init) => success(JSON.parse(init.body).code, true));
    assert.match(JSON.stringify(renderDrawer({ ...h.value, isCartOpen: true })), /¿Tienes un código\?/);
    assert.equal((await h.value.applyDiscountCode(` ${code} `)).success, true);
    h.render();
    assert.equal(h.calls.length, 1, 'the global promotion must not stop backend validation');
    assert.equal(h.value.appliedDiscount.valid_in_promotion, true);
    assert.equal(h.value.discountCode, code);
    assert.equal(h.value.getDiscountAmount(), 8);
    assert.equal(h.value.getCartTotal(), 72);
    assert.equal(h.value.couponError, '');
    assert.deepEqual(JSON.parse(h.calls[0][1].body).items,
      [promoted, ordinary].map(({ id, slug, sku }) => ({ id, slug, sku })));
  }
});

test('canonical allowlist is exact after case/space normalization; code alone and nonboolean flags grant nothing', () => {
  for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls', ' irviancestral ', ' DR.GEMMAVALLS ']) {
    assert.equal(protection.isPromotionAuthorizedCoupon({ code, valid_in_promotion: true }), true);
    for (const flag of [false, undefined, null, 1, 'true']) {
      assert.equal(protection.isPromotionAuthorizedCoupon({ code, valid_in_promotion: flag }), false);
    }
  }
  for (const code of ['IRVIANCESTRAL-EXTRA', 'DR.GEMMAVALLS.EXTRA', 'MIKELSFRIENDS', 'MIKELSFRIENDS-10', 'FRIENDS', ...CODES]) {
    assert.equal(protection.isPromotionAuthorizedCoupon({ code, valid_in_promotion: true }), false);
  }
});

test('same collaborators with false/missing flags and any friends/unknown code even with forged true cannot discount promotion', async () => {
  const scenarios = [
    ...['IRVIANCESTRAL', 'dr.gemmavalls'].flatMap((code) => [false, undefined, 'true', 1].map((flag) => ({ code, flag }))),
    ...['MIKELSFRIENDS', 'mikelsfriends', 'MIKELSFRIENDS-10', 'FRIENDS', 'UNKNOWN-LOCAL', ...CODES]
      .map((code) => ({ code, flag: true })),
  ];
  for (const { code, flag } of scenarios) for (const sku of BF26) {
    const h = cartHarness([{ ...ordinary, sku }], async () => success(code, flag));
    assert.deepEqual(clone(await h.value.applyDiscountCode(code)), { success: false, message: MESSAGE });
    h.render(); assertVeto(h);
    assert.equal(h.calls.length, 1);
  }
  const mismatch = cartHarness([{ ...ordinary, inPromotion: true }], async () => success('IRVIANCESTRAL', true));
  assert.equal((await mismatch.value.applyDiscountCode('MIKELSFRIENDS')).message, MESSAGE);
  mismatch.render(); assertVeto(mismatch);
});

test('invalid unknown codes on a promotion cart reach backend and display the identical inline promotion message', async () => {
  for (const body of [
    { valid: false, message: 'Cupón no válido' },
    { valid: false, error: 'PROMOTION_NOT_AVAILABLE', message: 'Internal detail' },
  ]) {
    const h = cartHarness([{ ...ordinary, in_promotion: true }], async () => ({ ok: false, json: async () => body }));
    assert.equal((await h.value.applyDiscountCode('UNKNOWN-LOCAL')).message, MESSAGE);
    h.render(); assertVeto(h); assert.equal(h.calls.length, 1);
  }
});

test('each unconditional SKU vetoes the entire collaborator coupon even mixed with a promotion pack in either order', async () => {
  for (const sku of ['MIKVET500', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP']) {
    for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls']) for (const reverse of [false, true]) {
      const protectedLine = { ...ordinary, id: `protected-${sku}`, sku, inPromotion: false, in_promotion: false };
      const pack = { ...ordinary, id: 'pack-local', sku: 'BF26-ECO6', inPromotion: true };
      const cart = reverse ? [protectedLine, pack] : [pack, protectedLine];
      const h = cartHarness(cart, async () => success(code, true));
      assert.equal((await h.value.applyDiscountCode(code)).message, MESSAGE);
      h.render(); assertVeto(h); assert.equal(h.calls.length, 0);
      assert.equal(protection.getCouponDiscountAmount(cart, { ...coupon, code, valid_in_promotion: true }, (line) => line.price), 0);
    }
  }
});

test('authorized collaborators stay applied when promotion is added but are removed immediately by any unconditional SKU', async () => {
  for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls']) {
    for (const sku of ['MIKVET500', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP']) {
      const h = cartHarness([ordinary], async () => success(code, true));
      await h.value.applyDiscountCode(code); h.render();
      h.value.addToCart({ ...ordinary, id: 'new-promo', sku: 'BF26-ECO6', inPromotion: true }, 1);
      h.render(false);
      assert.equal(h.value.discountCode, code); assert.equal(h.value.getDiscountAmount(), 6);
      h.render(); assert.equal(h.value.discountCode, code);
      h.value.addToCart({ ...ordinary, id: `new-protected-${sku}`, sku }, 1);
      h.render(false); assertVeto(h);
      h.render(); assertVeto(h);
      h.value.removeFromCart(2); h.render();
      assert.equal(h.value.appliedDiscount, null, 'removal never automatically restores a coupon');
    }
  }
});

test('noncollaborators including forged friends authorization work on ordinary products but never survive added promotion', async () => {
  for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls', 'MIKELSFRIENDS', ...CODES]) {
    const flag = code === 'MIKELSFRIENDS';
    const h = cartHarness([ordinary], async () => success(code, flag));
    assert.equal((await h.value.applyDiscountCode(code)).success, true);
    h.render(); assert.equal(h.value.getDiscountAmount(), 4);
    assert.equal(h.value.appliedDiscount.valid_in_promotion, false);
    h.value.addToCart({ ...ordinary, id: 'new-promo', sku: 'BF26-ECO6', inPromotion: true });
    h.render(false); assertVeto(h);
    h.render(); assertVeto(h);
  }
});

test('stored product flags and forged authorization never hydrate a validated coupon; checkout revalidates current cart identity', async () => {
  const stale = { ...ordinary, inPromotion: false, in_promotion: false, valid_in_promotion: true, code: 'IRVIANCESTRAL' };
  const restored = cartHarness([stale]);
  assert.equal(restored.value.appliedDiscount, null);
  assert.equal(restored.value.getDiscountAmount(), 0);
  for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls', 'MIKELSFRIENDS', ...CODES]) {
    const h = cartHarness([stale], async (_url, init) => {
      const body = JSON.parse(init.body);
      if (body.items.length === 1) return success(code, true);
      return { ok: false, json: async () => ({ valid: false, error: 'PROMOTION_NOT_AVAILABLE', message: MESSAGE }) };
    });
    await h.value.applyDiscountCode(code); h.render();
    h.value.addToCart({ ...ordinary, id: 'persisted-promo', inPromotion: false, in_promotion: false }); h.render();
    assert.equal((await h.value.revalidateDiscountForCheckout()).message, MESSAGE);
    h.render(); assertVeto(h);
    assert.equal(h.calls.length, 2);
    assert.equal(JSON.parse(h.calls[1][1].body).items.length, 2);
  }
  const checkout = read('src/pages/Checkout.jsx');
  assert.ok(checkout.indexOf('await revalidateDiscountForCheckout()') < checkout.indexOf('trackMetaInitiateCheckout(cart'));
  assert.ok(checkout.indexOf('await revalidateDiscountForCheckout()') < checkout.indexOf('await createCheckoutSession('));
});

test('checkout revalidation failure clears discount and successful collaborator validation preserves it', async () => {
  for (const fails of [false, true]) {
    let count = 0;
    const h = cartHarness([{ ...ordinary, sku: 'BF26-ECO6' }], async () => {
      if (++count > 1 && fails) throw new Error('offline mock');
      return success('IRVIANCESTRAL', true);
    });
    await h.value.applyDiscountCode('IRVIANCESTRAL'); h.render();
    const result = await h.value.revalidateDiscountForCheckout(); h.render();
    assert.equal(result.success, !fails);
    assert.equal(h.calls.length, 2);
    assert.equal(h.value.getDiscountAmount(), fails ? 0 : 4);
  }
});

test('checkout pauses for a fresh render if server changes discount percentage or promotion authorization', async () => {
  for (const changes of [{ discount_percentage: 5 }, { valid_in_promotion: false }]) {
    let count = 0;
    const h = cartHarness([ordinary], async () => ({ ok: true, json: async () => ({
      valid: true,
      coupon: { code: 'IRVIANCESTRAL', discount_percentage: 10, valid_in_promotion: true,
        ...(++count > 1 ? changes : {}) },
    }) }));
    await h.value.applyDiscountCode('IRVIANCESTRAL'); h.render();
    const result = await h.value.revalidateDiscountForCheckout(); h.render();
    assert.equal(result.success, false, 'checkout must not use a captured stale amount');
    assert.match(result.message, /El cupón ha cambiado/);
    assert.equal(h.value.getDiscountAmount(), changes.discount_percentage === 5 ? 2 : 4);
    assert.equal((await h.value.revalidateDiscountForCheckout()).success, true, 'next attempt uses refreshed validated coupon');
  }
});

test('Stripe service prioritizes backend message for both paths and preserves PRICE_MISMATCH, with no redirects', async () => {
  for (const errorBody of [
    { error: 'PROMOTION_NOT_AVAILABLE', message: MESSAGE },
    { error: 'TECHNICAL_CODE_LOCAL' },
    { error: 'PRICE_MISMATCH', message: 'Los precios han cambiado', price_updates: [{ slug: 'fixture-local', current_price: 20 }] },
  ]) {
    const exports = {}, calls = [];
    const module = { exports };
    let loads = 0;
    const location = { href: 'local-before' };
    runInNewContext(stripeCode, {
      module, exports,
      require: (name) => {
        assert.equal(name, '@stripe/stripe-js');
        return { loadStripe: () => { loads++; return Promise.resolve(null); } };
      },
      fetch: async (...args) => { calls.push(args); return { ok: false, json: async () => errorBody }; },
      window: { location }, console: { log() {}, error() {} },
    });
    for (const call of [() => module.exports.createCheckoutSession([ordinary], {}), () => module.exports.createSubscriptionCheckout(ordinary, {})]) {
      await assert.rejects(call, (error) => {
        assert.equal(error.message, errorBody.message || errorBody.error);
        if (calls.length === 1 && errorBody.error === 'PRICE_MISMATCH') {
          assert.equal(error.code, 'PRICE_MISMATCH');
          assert.deepEqual(error.priceUpdates, errorBody.price_updates);
        }
        return true;
      });
    }
    assert.equal(loads, 1, 'Stripe loader mocked; no SDK/network calls');
    assert.equal(location.href, 'local-before');
    assert.equal(calls.length, 2);
  }
});
