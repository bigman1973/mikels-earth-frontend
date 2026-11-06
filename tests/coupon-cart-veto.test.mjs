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
import * as review from '../src/utils/cartPromotionValidation.js';
import * as independent from '../src/utils/independentPacks.js';
import * as unitReference from '../src/utils/campaignUnitReference.js';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';
import * as delivery from '../src/utils/deliveryPolicy.js';
import { products as catalogue } from '../src/data/products.js';

const MESSAGE = 'Este código no se puede aplicar porque el pedido incluye productos en promoción.';
const BF26 = ['BF26-TEMP6', 'BF26-TEMP12', 'BF26-ECO6', 'BF26-PARA3', 'BF26-PARA6', 'BF26-5L3'];
const CODES = ['LEGACY-LOCAL', 'MANUAL-LOCAL', 'NEWSLETTER-UNKNOWN-LOCAL'];
const ordinary = { id: 'ordinary-local', sku: 'ORDINARY-LOCAL', slug: 'ordinary-local', name: 'Fixture', price: 20, quantity: 2, purchaseType: 'one-time' };
const NORMAL_SKUS = ['MIKVET500', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP'];
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
const checkoutCode = await compiled('src/pages/Checkout.jsx');
const detailCode = await compiled('src/pages/ProductDetail.jsx');
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
  '../utils/cartPromotionValidation': {
    ...review,
    reviewCartPromotions: async ({ cart }) => cart.map(item => ({
      inPromotion: item.inPromotion === true, promotionValidationPending: false,
    })),
  },
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
      if (name === '../utils/cartPromotionValidation') return {
        ...review,
        reviewCartPromotions: async ({ cart }) => cart.map(item => {
          const authoritative = initial.find(product => product.id === item.id);
          return { inPromotion: authoritative?.inPromotion === true || authoritative?.in_promotion === true || item.inPromotion === true, promotionValidationPending: false };
        }),
      };
      if (!(name in modules)) throw new Error(`Unmocked module: ${name}`);
      return modules[name];
    },
    window: { localStorage: {
      getItem: (key) => saved.get(key) ?? null,
      setItem: (key, next) => saved.set(key, next),
      removeItem: (key) => saved.delete(key),
    } },
    fetch: async (...args) => { calls.push(args); return send(...args); },
    AbortSignal, AbortController,
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
  return { async ready() { await new Promise(resolve => setImmediate(resolve)); render(); }, get value() { return value; }, calls, saved, render };
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
        '../../utils/independentPacks': independent,
      };
      if (!(name in mocks)) throw new Error(`Unmocked drawer module: ${name}`);
      return mocks[name];
    },
  });
  return module.exports.default();
}
const nodes = (node) => Array.isArray(node) ? node.flatMap(nodes)
  : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];

function uiHarness(code, getCart, extra = {}) {
  const slots = [];
  let cursor = 0;
  const React = {
    useState(initializer) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initializer === 'function' ? initializer() : initializer;
      return [slots[index], (next) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    },
    useRef(initializer) { const index = cursor++; return slots[index] ||= { current: initializer }; },
    useEffect() {}, // No external review, analytics or browser calls.
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  };
  const icons = Object.fromEntries(['X', 'Plus', 'Minus', 'ShoppingBag', 'Package', 'CreditCard', 'Truck', 'AlertTriangle', 'ShoppingCart', 'ArrowLeft', 'Check', 'Tag'].map((icon) => [icon, icon]));
  const mocks = {
    react: React,
    'react-i18next': { useTranslation: () => ({ t: (key) => key, i18n: { language: 'es' } }) },
    'lucide-react': icons,
    'framer-motion': { motion: { div: 'div', aside: 'aside' }, AnimatePresence: 'AnimatePresence' },
    'react-router-dom': { Link: 'Link', useNavigate: () => () => { throw new Error('Unexpected navigation'); } },
    '../context/CartContext': { useCart: getCart }, '../../context/CartContext': { useCart: getCart },
    '../utils/formatMoney': money, '../../utils/formatMoney': money,
    '../utils/promotionProtection': protection, '../../utils/promotionProtection': protection,
    '../utils/reservationSale': reservation, '../../utils/reservationSale': reservation,
    '../utils/fixedPackPricing': fixedPacks, '../../utils/fixedPackPricing': fixedPacks,
    '../utils/tempranoHarvestIdentity': harvest, '../../utils/tempranoHarvestIdentity': harvest,
    '../utils/volumePricing': volume, '../utils/deliveryPolicy': delivery,
    '../utils/independentPacks': independent, '../../utils/independentPacks': independent,
    '../utils/campaignUnitReference': unitReference,
    '../components/products/CampaignUnitReference': 'CampaignUnitReference',
    '../utils/cartPromotionValidation': review,
    '../utils/metaPixel': { hasMarketingConsent: () => false, trackMetaInitiateCheckout() {}, trackMetaViewContent() {} },
    '../utils/googleAnalytics': { trackGA4BeginCheckout() {}, trackGA4ViewItem() {} },
    '../services/stripeService': { createCheckoutSession() { throw new Error('Unexpected Stripe call'); }, createSubscriptionCheckout() { throw new Error('Unexpected Stripe call'); } },
    'react-markdown': 'ReactMarkdown', '../components/SoldOutNotification': 'SoldOutNotification',
    '../components/ProductReviews': 'ProductReviews', '../components/ProductSeo': 'ProductSeo',
    ...extra,
  };
  const exports = {}, module = { exports };
  runInNewContext(code, {
    module, exports, React,
    require: (name) => { if (!(name in mocks)) throw new Error(`Unmocked UI module: ${name}`); return mocks[name]; },
    window: { setTimeout() {} },
    fetch: () => { throw new Error('Unexpected outbound request'); },
    console: { error() {}, log() {} },
  });
  return { render() { cursor = 0; return module.exports.default(); } };
}

const assertInlineVeto = (h) => {
  const tree = renderDrawer({ ...h.value, isCartOpen: true });
  assert.equal(nodes(tree).some((node) => node.props?.role === 'alert' && node.props.children.includes(MESSAGE)), true);
  assert.doesNotMatch(JSON.stringify(tree), /El cupón solo se aplica/);
};
const assertNoCouponAlert = (h) => {
  assert.equal(h.value.couponError, '');
  assert.equal(h.value.couponMessage, '');
  const tree = renderDrawer({ ...h.value, isCartOpen: true });
  assert.equal(nodes(tree).some((node) => node.props?.role === 'alert'), false);
  assert.equal(JSON.stringify(tree).includes(MESSAGE), false);
};
const assertVeto = (h) => {
  assert.equal(h.value.appliedDiscount, null);
  assert.equal(h.value.discountCode, '');
  assert.equal(h.value.getDiscountAmount(), 0);
  assert.equal(h.value.couponError, MESSAGE);
  assert.equal(h.value.couponMessage, MESSAGE);
  assertInlineVeto(h);
};

test('adding each exact BF26 pack without any coupon leaves no alert, error or message and preserves totals before and after effects', () => {
  for (const definition of independent.INDEPENDENT_PACKS) {
    const h = cartHarness();
    const promoted = { ...ordinary, ...definition, id: `no-coupon-${definition.sku}`, inPromotion: true };
    const before = clone(promoted);
    h.value.addToCart(promoted, 3);
    for (const flushEffects of [false, true]) {
      h.render(flushEffects);
      assertNoCouponAlert(h);
      assert.equal(h.value.appliedDiscount, null);
      assert.equal(h.value.discountCode, '');
      assert.equal(h.value.getDiscountAmount(), 0);
      assert.equal(h.value.cart.length, 1);
      assert.equal(h.value.cart[0].sku, definition.sku);
      assert.equal(h.value.cart[0].quantity, 3);
      assert.equal(h.value.cart[0].price, definition.price);
      assert.equal(h.value.getItemPrice(h.value.cart[0]), definition.price);
      assert.equal(Math.round(h.value.getCartTotal() * 100), Math.round(definition.price * 3 * 100));
    }
    assert.deepEqual(promoted, before, 'adding a promo does not mutate its identity or price');
    assert.equal(h.calls.length, 0, 'no coupon attempt means no coupon validation request');
  }
});

test('restored promotion carts without a coupon attempt show no coupon alert while pending review or after review', async () => {
  const promoted = [
    ...independent.INDEPENDENT_PACKS.map((definition) => ({ ...ordinary, ...definition, id: `restored-${definition.sku}` })),
    { ...ordinary, id: 'restored-camel-promo', inPromotion: true },
    { ...ordinary, id: 'restored-snake-promo', in_promotion: true },
  ];
  for (const item of promoted) {
    const h = cartHarness([item]);
    const before = clone(h.value.cart);
    const subtotal = h.value.getCartTotal();
    assert.equal(h.value.promotionReviewReady, false);
    assertNoCouponAlert(h);
    await h.ready();
    assert.equal(h.value.promotionReviewReady, true);
    assert.equal(protection.isCouponProtectedItem(h.value.cart[0]), true);
    assertNoCouponAlert(h);
    assert.equal(h.value.appliedDiscount, null);
    assert.equal(h.value.discountCode, '');
    assert.equal(h.value.getDiscountAmount(), 0);
    assert.equal(h.value.getCartTotal(), subtotal);
    for (const field of ['id', 'sku', 'slug', 'quantity', 'price']) assert.equal(h.value.cart[0][field], before[0][field]);
    assert.equal(h.calls.length, 0);
  }
});

test('a real promotion denial remains inline across renders; removing the coupon or a valid collaborator success clears the error', async () => {
  for (const code of ['IRVIANCESTRAL', 'DR.GEMMAVALLS']) {
    const definition = independent.INDEPENDENT_PACKS[0];
    const h = cartHarness([{ ...ordinary, ...definition, id: 'denied-promo', inPromotion: true }],
      async (_url, init) => success(JSON.parse(init.body).code, true));
    await h.ready();
    assertNoCouponAlert(h);
    const before = clone(h.value.cart);
    const subtotal = h.value.getCartTotal();
    assert.deepEqual(clone(await h.value.applyDiscountCode('MANUAL-LOCAL')), { success: false, message: MESSAGE });
    h.render(); assertVeto(h);
    h.render(); assertVeto(h);
    assert.equal(h.calls.length, 1);
    assert.equal(h.value.getCartTotal(), subtotal);
    assert.deepEqual(clone(h.value.cart), before);
    h.value.removeDiscountCode(); h.render();
    assertNoCouponAlert(h);
    assert.equal(h.value.getDiscountAmount(), 0);
    assert.equal(h.value.getCartTotal(), subtotal);
    assert.deepEqual(clone(h.value.cart), before);
    assert.equal(h.calls.length, 1, 'removal clears errors without a request');
    assert.equal((await h.value.applyDiscountCode('MANUAL-LOCAL')).success, false);
    h.render(); assertVeto(h);
    assert.equal((await h.value.applyDiscountCode(code)).success, true);
    h.render(); assertNoCouponAlert(h);
    assert.equal(h.value.discountCode, code);
    assert.equal(h.value.appliedDiscount.valid_in_promotion, true);
    assert.equal(Math.round(h.value.getDiscountAmount() * 100), Math.round(subtotal * 10));
    assert.equal(Math.round(h.value.getCartTotal() * 100), Math.round(subtotal * 90));
    assert.deepEqual(clone(h.value.cart), before);
    assert.equal(h.calls.length, 3);
    for (const [, init] of h.calls) assert.deepEqual(JSON.parse(init.body).items,
      before.map(({ id, slug, sku }) => ({ id, slug, sku })));
    h.value.removeDiscountCode(); h.render();
    assertNoCouponAlert(h);
    assert.equal(h.value.appliedDiscount, null);
    assert.equal(h.value.discountCode, '');
    assert.equal(h.value.getDiscountAmount(), 0);
    assert.equal(h.value.getCartTotal(), subtotal);
  }
});

test('only six exact BF26 identities and both promotion flags veto coupons; ordinary price protections do not', () => {
  assert.equal(protection.PROMOTION_COUPON_MESSAGE, MESSAGE);
  for (const sku of BF26) {
    const item = { ...ordinary, sku: ` ${sku.toLowerCase()} `, inPromotion: false, in_promotion: false,
      tieredDiscountConfig: [{ minQuantity: 2, discount: 10 }] };
    const before = clone(item);
    assert.equal(protection.isPromotionProtectedItem(item), true, 'approved branch independent packs remain protected');
    assert.equal(protection.isCouponProtectedItem(item), true);
    assert.equal(protection.getCouponDiscountAmount([ordinary, item], coupon, (line) => line.price), 0);
    assert.equal(protection.normalizePromotionProtectedCartItem(item).price, item.price);
    assert.equal(volume.getVolumeDiscountedUnitPrice(item, 2), 20, 'approved independent pack price has no extra volume reduction');
    assert.deepEqual(item, before);
  }
  for (const sku of ['BF26-TEMP6-EXTRA', 'BF26-UNKNOWN', 'BF26-TEMP3', 'MIKVET500R', 'MIKVET5002526', 'MIKVE5LPBF3']) {
    assert.equal(protection.isCouponProtectedItem({ ...ordinary, sku }), false, sku);
  }
  for (const flags of [{ inPromotion: true }, { in_promotion: true }, { inPromotion: false, in_promotion: true }]) {
    const item = { ...ordinary, ...flags };
    assert.equal(protection.isCouponProtectedItem(item), true);
    assert.equal(protection.normalizePromotionProtectedCartItem(item).price, item.price);
    assert.deepEqual(item, { ...ordinary, ...flags }, 'normalization must not mutate the input');
  }
  for (const sku of ['MIKVET500', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP']) {
    assert.equal(protection.isCouponProtectedItem({ ...ordinary, sku, inPromotion: false, in_promotion: false }), false);
    assert.equal(protection.isCouponProtectedItem({ ...ordinary, sku, inPromotion: true }), true, 'a real promotion still vetoes ordinary identities');
    assert.equal(protection.isCouponProtectedItem({ ...ordinary, sku, in_promotion: true }), true);
  }
  assert.equal(protection.isCouponProtectedItem({ ...ordinary, couponProtectedCompositionSkus: ['MIKVET500', 'MIKPARA450'] }), false);
});

test('any coupon origin is validated by backend with only id/slug/sku, no client metadata', async () => {
  for (const code of CODES) {
    const h = cartHarness([{ ...ordinary, quantity: 7, inPromotion: false, in_promotion: false,
      arbitraryPrivateField: 'must-not-send', couponProtectedCompositionSkus: ['ORDINARY-LOCAL'] }]);
    await h.ready();
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

test('legacy/manual/unknown newsletter coupon on real promotion mixed carts is wholly rejected after API validation', async () => {
  const protectedItems = [
    ...BF26.map((sku, i) => ({ ...ordinary, id: `protected-${i}`, sku })),
    ...NORMAL_SKUS.map((sku, i) => ({ ...ordinary, id: `normal-promoted-${i}`, sku, inPromotion: true })),
    { ...ordinary, id: 'flag-camel', inPromotion: true },
    { ...ordinary, id: 'flag-snake', in_promotion: true },
    { ...ordinary, id: 'composition', couponProtectedCompositionSkus: ['MIKVET500'], inPromotion: true },
  ];
  for (const item of protectedItems) for (const code of CODES) for (const cart of [[ordinary, item], [item, ordinary], [item]]) {
    const h = cartHarness(cart);
    await h.ready();
    const before = clone(h.value.cart);
    assert.deepEqual(clone(await h.value.applyDiscountCode(code)), { success: false, message: MESSAGE });
    h.render();
    assertVeto(h);
    assert.equal(h.calls.length, 1, `${code}/${item.sku}: all nonempty carts reach server validation`);
    assert.deepEqual(clone(h.value.cart), before, 'coupon veto never edits price, quantity or identity');
  }
});

test('MIKVET500 plus representative ordinary articles accepts validated codes in both addToCart sequences; BF still wholly vetoes', async () => {
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
      const result = await h.value.applyDiscountCode(code);
      h.render();
      if (BF26.includes(companion.sku)) {
        assert.equal(result.message, MESSAGE);
        assertVeto(h);
      } else {
        assert.equal(result.success, true);
        assert.equal(h.value.discountCode, code);
        const expected = h.value.cart.reduce((sum, item) => sum + h.value.getItemPrice(item) * item.quantity * (item.purchaseType === 'subscription' ? 0 : 0.10), 0);
        assert.equal(Math.round(h.value.getDiscountAmount() * 100), Math.round(expected * 100));
        assert.equal(h.value.getItemPrice(h.value.cart.find((item) => item.sku === 'MIKVET500')), 19.90);
      }
      assert.deepEqual(clone(h.value.cart), before);
    }
    assert.equal(h.calls.length, CODES.length);
  }
});

test('coupon then protected addition invalidates immediately, remains zero and never auto-restores after removal', async () => {
  const identities = [...NORMAL_SKUS.map((sku) => ({ ...ordinary, id: `added-${sku}`, sku, inPromotion: true })),
    ...BF26.map((sku, i) => ({ ...ordinary, id: `added-${i}`, sku }))];
  identities.push({ ...ordinary, id: 'flag-camel', inPromotion: true }, { ...ordinary, id: 'flag-snake', in_promotion: true });
  for (const item of identities) {
    const h = cartHarness([ordinary]);
    await h.ready();
    await h.value.applyDiscountCode('MANUAL-LOCAL'); h.render();
    assert.equal(h.value.getDiscountAmount(), 4);
    assertNoCouponAlert(h);
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
    assertVeto(h);
    assert.equal((await h.value.applyDiscountCode('MANUAL-LOCAL')).success, true);
    h.render(); assert.equal(h.value.getDiscountAmount(), 4);
    assertNoCouponAlert(h);
  }
});

test('new and merged lines retain conservative flags in memory but persisted flags require independent review', async () => {
  for (const flags of [{ inPromotion: true }, { in_promotion: true }, { inPromotion: false, in_promotion: false }]) {
    const h = cartHarness();
    h.value.addToCart({ ...ordinary, ...flags }); h.render();
    for (const [key, value] of Object.entries(flags)) assert.equal(h.value.cart[0][key], value);
    const persisted = JSON.parse(h.saved.get(storage.CART_STORAGE_KEY));
    for (const key of ['inPromotion', 'in_promotion', 'promotionValidationPending']) assert.equal(key in persisted[0], false);
    const restored = cartHarness(persisted);
    assert.equal(restored.value.promotionReviewReady, false);
    assert.equal(restored.value.appliedDiscount, null);
  }
  const plain = cartHarness(); plain.value.addToCart(ordinary); plain.render();
  const stored = JSON.parse(plain.saved.get(storage.CART_STORAGE_KEY));
  assert.equal('inPromotion' in stored[0], false);
  assert.equal('in_promotion' in stored[0], false);
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
    await h.ready();
    await h.value.applyDiscountCode('PREVIOUS-LOCAL'); h.render();
    assert.equal(h.value.getDiscountAmount(), 4);
    assert.deepEqual(clone(await h.value.applyDiscountCode(code)), { success: false, message: MESSAGE });
    h.render(); assertVeto(h);
    assert.equal(h.calls.length, 2);
  }
});

test('late successful validation cannot reapply a coupon after protected addition, remove or cart identity change', async () => {
  for (const action of ['protected', 'identity-change', 'quantity-change', 'remove-code']) {
    let resolve;
    const h = cartHarness([ordinary], () => new Promise((done) => { resolve = done; }));
    await h.ready();
    const pending = h.value.applyDiscountCode('MANUAL-LOCAL');
    await new Promise(resolve => setImmediate(resolve));
    if (action === 'remove-code') h.value.removeDiscountCode();
    else if (action === 'quantity-change') h.value.updateQuantity(0, 7);
    else h.value.addToCart({ ...ordinary, id: 'late-local', sku: action === 'protected' ? 'BF26-ECO6' : 'OTHER-LOCAL' });
    h.render();
    if (action === 'protected') assertNoCouponAlert(h);
    resolve(success('MANUAL-LOCAL'));
    const result = await pending; h.render();
    assert.equal(result.success, false);
    assert.equal(result.message, 'El carrito ha cambiado. Vuelve a aplicar el código.');
    assert.equal(h.value.appliedDiscount, null);
    assert.equal(h.value.getDiscountAmount(), 0);
    assert.equal(h.calls.length, 1);
    if (action === 'protected') assertNoCouponAlert(h);
  }
});

test('backend transport failure or invalid unknown coupon never applies a new discount', async () => {
  for (const send of [
    async () => { throw new Error('offline mocked failure'); },
    async () => ({ ok: false, json: async () => ({ valid: true, coupon: { code: 'BAD-LOCAL', discount_percentage: 10 } }) }),
    async () => ({ ok: true, json: async () => ({ valid: false, message: 'Cupón no válido' }) }),
  ]) {
    const h = cartHarness([ordinary], send);
    await h.ready();
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
    await h.ready();
    assert.match(JSON.stringify(renderDrawer({ ...h.value, isCartOpen: true })), /¿Tienes un código\?/);
    assertNoCouponAlert(h);
    assert.equal((await h.value.applyDiscountCode(` ${code} `)).success, true);
    h.render();
    assert.equal(h.calls.length, 1, 'the global promotion must not stop backend validation');
    assert.equal(h.value.appliedDiscount.valid_in_promotion, true);
    assert.equal(h.value.discountCode, code);
    assert.equal(h.value.getDiscountAmount(), 8);
    assert.equal(h.value.getCartTotal(), 72);
    assert.equal(h.value.couponError, '');
    assertNoCouponAlert(h);
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
    await h.ready();
    assert.deepEqual(clone(await h.value.applyDiscountCode(code)), { success: false, message: MESSAGE });
    h.render(); assertVeto(h);
    assert.equal(h.calls.length, 1);
  }
  const mismatch = cartHarness([{ ...ordinary, inPromotion: true }], async () => success('IRVIANCESTRAL', true));
  await mismatch.ready();
  assert.equal((await mismatch.value.applyDiscountCode('MIKELSFRIENDS')).message, MESSAGE);
  mismatch.render(); assertVeto(mismatch);
});

test('invalid unknown codes on a promotion cart reach backend and display the identical inline promotion message', async () => {
  for (const body of [
    { valid: false, message: 'Cupón no válido' },
    { valid: false, error: 'PROMOTION_NOT_AVAILABLE', message: 'Internal detail' },
  ]) {
    const h = cartHarness([{ ...ordinary, in_promotion: true }], async () => ({ ok: false, json: async () => body }));
    await h.ready();
    assert.equal((await h.value.applyDiscountCode('UNKNOWN-LOCAL')).message, MESSAGE);
    h.render(); assertVeto(h); assert.equal(h.calls.length, 1);
  }
});

test('each formerly unconditional ordinary SKU accepts server-authorized collaborator coupons mixed with a BF pack in either order', async () => {
  for (const sku of ['MIKVET500', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP']) {
    for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls']) for (const reverse of [false, true]) {
      const protectedLine = { ...ordinary, id: `protected-${sku}`, sku, inPromotion: false, in_promotion: false };
      const pack = { ...ordinary, id: 'pack-local', sku: 'BF26-ECO6', inPromotion: true };
      const cart = reverse ? [protectedLine, pack] : [pack, protectedLine];
      const h = cartHarness(cart, async () => success(code, true));
      await h.ready();
      assert.equal((await h.value.applyDiscountCode(code)).success, true);
      h.render(); assert.equal(h.value.discountCode, code); assert.equal(h.calls.length, 1);
      const subtotal = h.value.cart.reduce((sum, item) => sum + h.value.getItemPrice(item) * item.quantity, 0);
      assert.equal(Math.round(h.value.getDiscountAmount() * 100), Math.round(subtotal * 0.10 * 100));
      assert.equal(protection.getCouponDiscountAmount(cart, { ...coupon, code, valid_in_promotion: true }, (line) => line.price), 8);
      assert.equal(h.value.couponError, '');
    }
  }
});

test('authorized collaborators survive added promotion and every formerly unconditional ordinary SKU, then checkout validates the current cart', async () => {
  for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls']) {
    for (const sku of ['MIKVET500', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP']) {
      const h = cartHarness([ordinary], async () => success(code, true));
      await h.ready();
      await h.value.applyDiscountCode(code); h.render();
      h.value.addToCart({ ...ordinary, id: 'new-promo', sku: 'BF26-ECO6', inPromotion: true }, 1);
      h.render(false);
      assert.equal(h.value.discountCode, code); assert.equal(h.value.getDiscountAmount(), 6);
      h.render(); assert.equal(h.value.discountCode, code);
      h.value.addToCart({ ...ordinary, id: `new-protected-${sku}`, sku }, 1);
      h.render(false); assert.equal(h.value.discountCode, code);
      h.render(); assert.equal(h.value.discountCode, code);
      assert.equal((await h.value.revalidateDiscountForCheckout()).success, true);
      h.render(); assert.equal(h.calls.length, 2);
      assert.deepEqual(JSON.parse(h.calls[1][1].body).items,
        clone(h.value.cart.map(({ id, slug, sku }) => ({ id, slug, sku }))));
      h.value.removeFromCart(2); h.render();
      assert.equal(h.value.discountCode, code);
      assert.equal(h.value.getDiscountAmount(), 6);
    }
  }
});

test('noncollaborators including forged friends authorization work on ordinary products but never survive added promotion', async () => {
  for (const code of ['IRVIANCESTRAL', 'dr.gemmavalls', 'MIKELSFRIENDS', ...CODES]) {
    const flag = code === 'MIKELSFRIENDS';
    const h = cartHarness([ordinary], async () => success(code, flag));
    await h.ready();
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
    await h.ready();
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
    await h.ready();
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
    await h.ready();
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

// The previous policy's ordinary-SKU scenarios are retained above with updated
// expectations; these regressions explicitly cover the newly authorized scope.
test('all five ordinary identities and legacy compositions accept every server-valid coupon origin without becoming promotion-authorized', async () => {
  const codes = ['MIKELSFRIENDS', 'NEWSLETTER-CURRENT-LOCAL', 'HISTORIC-CURRENT-LOCAL', 'MANUAL-CURRENT-LOCAL', 'IRVIANCESTRAL', 'dr.gemmavalls'];
  for (const sku of NORMAL_SKUS) for (const code of codes) for (const flags of [{}, { inPromotion: false, in_promotion: false }]) {
    const line = { ...ordinary, id: `normal-${sku}`, sku, ...flags, couponProtectedCompositionSkus: ['MIKVET500', 'MIKVE5LP', 'MIKPARA450'] };
    const h = cartHarness([line], async (_url, init) => success(JSON.parse(init.body).code, false));
    await h.ready();
    const before = clone(h.value.cart);
    assert.equal(protection.canValidateCouponForCart(h.value.cart), true);
    assert.match(JSON.stringify(renderDrawer({ ...h.value, isCartOpen: true })), /¿Tienes un código\?/);
    assert.equal((await h.value.applyDiscountCode(code)).success, true, `${sku}/${code}`);
    h.render();
    assert.equal(h.value.appliedDiscount.valid_in_promotion, false);
    assert.equal(h.value.couponError, '');
    const subtotal = h.value.cart.reduce((sum, item) => sum + h.value.getItemPrice(item) * item.quantity, 0);
    assert.equal(Math.round(h.value.getDiscountAmount() * 100), Math.round(subtotal * 0.10 * 100));
    assert.deepEqual(clone(h.value.cart), before, 'coupon changes totals, never unit prices or settings');
    assert.equal(h.calls.length, 1);
  }
  for (const product of catalogue.filter((item) => item.visibleInStore !== false && item.inPromotion !== true && item.in_promotion !== true && !BF26.includes(item.sku))) {
    assert.equal(protection.canValidateCouponForCart([{ ...product, quantity: 1 }]), true, product.sku || product.slug);
    assert.equal(protection.isCouponProtectedItem(product), false, product.sku || product.slug);
  }
});

test('current Temprano keeps 19.90 base at every quantity; only a server-validated 10% coupon produces 17.91 per bottle', async () => {
  for (const quantity of [1, 2, 3, 6, 12, 36]) {
    const h = cartHarness();
    const line = { ...ordinary, id: 'current-temprano', sku: 'MIKVET500', slug: 'aceite-temprano-sin-filtrar',
      price: 9, originalPrice: 99, subscriptionAvailable: true, subscriptionDiscount: 80,
      subscriptionFrequencies: [{ value: 'monthly', discount: 80 }],
      volumeDiscountConfig: { minQuantity: 2, discount: 80 },
      tieredDiscountConfig: [{ minQuantity: 2, discount: 80 }] };
    h.value.addToCart(line, quantity, 'subscription', 'monthly'); h.render();
    assert.equal(h.value.cart[0].price, 19.90);
    assert.equal(h.value.cart[0].purchaseType, 'one-time');
    assert.equal(h.value.cart[0].subscriptionFrequency, null);
    assert.equal(h.value.getItemPrice(h.value.cart[0]), 19.90);
    assert.equal(Math.round(h.value.getCartTotal() * 100), 1990 * quantity);
    assert.equal(h.value.getDiscountAmount(), 0);
    assert.equal((await h.value.applyDiscountCode('NEWSLETTER-CURRENT-LOCAL')).success, true); h.render();
    assert.equal(Math.round(h.value.getDiscountAmount() * 100), 199 * quantity);
    assert.equal(Math.round(h.value.getCartTotal() * 100), 1791 * quantity);
    assert.equal(h.value.getItemPrice(h.value.cart[0]), 19.90, 'coupons do not reactivate volume or reprice lines');
    h.value.updateQuantity(0, quantity + 1); h.render();
    assert.equal(h.value.getItemPrice(h.value.cart[0]), 19.90);
    assert.equal((await h.value.revalidateDiscountForCheckout()).success, true); h.render();
    assert.equal(h.calls.length, 2);
    h.value.removeDiscountCode(); h.render();
    assert.equal(Math.round(h.value.getCartTotal() * 100), 1990 * (quantity + 1));
  }
});

test('Friends and newsletter are accepted on ordinary SKU mixes but every exact BF26 SKU vetoes the whole coupon in either order', async () => {
  for (const code of ['MIKELSFRIENDS', 'NEWSLETTER-CURRENT-LOCAL']) for (const sku of NORMAL_SKUS) for (const bf of BF26) for (const reverse of [false, true]) {
    const normal = { ...ordinary, id: `normal-${sku}`, sku, inPromotion: false, in_promotion: false };
    const promoted = { ...ordinary, id: `bf-${bf}`, sku: bf, inPromotion: false, in_promotion: false };
    const h = cartHarness([ordinary, normal], async () => success(code, false));
    await h.ready();
    assert.equal((await h.value.applyDiscountCode(code)).success, true); h.render();
    assert.equal(h.value.appliedDiscount.valid_in_promotion, false);
    const mixed = cartHarness(reverse ? [normal, promoted] : [promoted, normal], async () => success(code, false));
    await mixed.ready();
    assert.equal((await mixed.value.applyDiscountCode(code)).message, MESSAGE); mixed.render(); assertVeto(mixed);
    assert.equal(mixed.calls.length, 1);
  }
});

test('customers can open the compiled cart accordion, type and apply a current coupon on each ordinary identity', async () => {
  for (const sku of NORMAL_SKUS) {
    const h = cartHarness([{ ...ordinary, sku, quantity: 1 }]);
    await h.ready();
    const ui = uiHarness(drawerCode, () => ({ ...h.value, isCartOpen: true }));
    let tree = ui.render();
    const toggle = nodes(tree).find((node) => node.type === 'button' && node.props.children.includes('¿Tienes un código?'));
    assert.ok(toggle, sku);
    assert.equal(toggle.props['aria-expanded'], false);
    toggle.props.onClick(); tree = ui.render();
    const input = nodes(tree).find((node) => node.type === 'input' && node.props.placeholder === 'Introduce tu código');
    assert.ok(input, `${sku}: actual text input must be available`);
    assert.equal(input.props['aria-label'], 'Código de descuento');
    input.props.onChange({ target: { value: 'newsletter-current-local' } }); tree = ui.render();
    const apply = nodes(tree).find((node) => node.type === 'button' && node.props.children.includes('checkout.apply'));
    await apply.props.onClick(); h.render();
    assert.equal(h.value.discountCode, 'NEWSLETTER-CURRENT-LOCAL');
    assert.equal(h.calls.length, 1);
    assert.equal(JSON.parse(h.calls[0][1].body).items[0].sku, sku);
  }
});

test('compiled checkout directly accepts a typed coupon for Temprano and ordinary packs using shared server validation', async () => {
  for (const sku of NORMAL_SKUS) {
    const h = cartHarness([{ ...ordinary, sku, quantity: 1 }]);
    await h.ready();
    const ui = uiHarness(checkoutCode, () => h.value);
    let tree = ui.render();
    const input = nodes(tree).find((node) => node.type === 'input' && node.props.id === 'checkout-coupon');
    assert.ok(input, sku);
    assert.equal(input.props.disabled, false);
    input.props.onChange({ target: { value: 'mikelsfriends' } }); tree = ui.render();
    const apply = nodes(tree).find((node) => node.type === 'button' && node.props.children.includes('checkout.apply'));
    await apply.props.onClick(); h.render(); tree = ui.render();
    assert.equal(h.value.discountCode, 'MIKELSFRIENDS');
    assert.equal(h.value.appliedDiscount.valid_in_promotion, false);
    assert.equal(h.calls.length, 1);
    assert.equal(nodes(tree).some((node) => node.type === 'input' && node.props.id === 'checkout-coupon'), false);
    assert.equal(Math.round(h.value.getCartTotal() * 100), sku === 'MIKVET500' ? 1791 : 1800);
  }
});

test('compiled Temprano product flow opens the eligible coupon cart; coupon changes never activate hidden BF product pages', () => {
  const temprano = applyEditorialOverrides({ ...catalogue.find((product) => product.sku === 'MIKVET500'), available: true, visibleInStore: true });
  const h = cartHarness();
  const productUi = uiHarness(detailCode, () => h.value, {
    'react-router-dom': { Link: 'Link', useParams: () => ({ slug: temprano.slug }) },
    '../hooks/useProducts': { useProducts: () => ({ products: [temprano], loading: false }), useProduct: () => ({ product: temprano, loading: false }) },
  });
  const button = nodes(productUi.render()).find((node) => node.type === 'button' && node.props.children.includes('product_detail.add_to_cart'));
  assert.ok(button);
  button.props.onClick(); h.render();
  assert.equal(h.value.isCartOpen, true);
  assert.equal(h.value.cart[0].sku, 'MIKVET500');
  assert.equal(h.value.getItemPrice(h.value.cart[0]), 19.90);
  assert.match(JSON.stringify(renderDrawer(h.value)), /¿Tienes un código\?/);
  for (const sku of BF26) {
    const hidden = { ...ordinary, sku, slug: `hidden-${sku.toLowerCase()}`, active: false, visibleInStore: false, available: false, inPromotion: true };
    const before = clone(hidden);
    const hiddenUi = uiHarness(detailCode, () => h.value, {
      'react-router-dom': { Link: 'Link', useParams: () => ({ slug: hidden.slug }) },
      '../hooks/useProducts': { useProducts: () => ({ products: [], loading: false }), useProduct: () => ({ product: null, loading: false }) },
    });
    const tree = hiddenUi.render();
    assert.match(JSON.stringify(tree), /product_detail.not_found/);
    assert.equal(nodes(tree).some((node) => node.type === 'button' && node.props.children.includes('product_detail.add_to_cart')), false);
    assert.deepEqual(hidden, before);
    assert.equal(catalogue.some((product) => product.sku === sku), false, 'BF test fixtures never become catalogue rows');
  }
});

test('every ordinary SKU keeps invalid, used, expired, email, minimum and usage-limit conditions server-authoritative at application and checkout', async () => {
  for (const sku of NORMAL_SKUS) for (const reason of ['Cupón no válido', 'Cupón usado', 'Cupón caducado', 'No cumple las condiciones del cupón', 'Email no autorizado', 'Importe mínimo no alcanzado', 'Límite de usos alcanzado']) {
    let count = 0;
    const line = { ...ordinary, sku };
    const rejection = { ok: false, json: async () => ({ valid: false, message: reason }) };
    const invalid = cartHarness([line], async () => rejection);
    await invalid.ready();
    assert.equal((await invalid.value.applyDiscountCode('NEWSLETTER-CURRENT-LOCAL')).message, reason); invalid.render();
    assert.equal(invalid.value.appliedDiscount, null);
    assert.equal(invalid.value.getDiscountAmount(), 0);
    const h = cartHarness([line], async () => ++count === 1 ? success('HISTORIC-CURRENT-LOCAL') : rejection);
    await h.ready();
    assert.equal((await h.value.applyDiscountCode('HISTORIC-CURRENT-LOCAL')).success, true); h.render();
    assert.equal((await h.value.revalidateDiscountForCheckout()).message, reason); h.render();
    assert.equal(h.calls.length, 2);
    assert.equal(h.value.appliedDiscount, null);
    assert.equal(h.value.getDiscountAmount(), 0);
    for (const [, init] of [...invalid.calls, ...h.calls]) {
      const body = JSON.parse(init.body);
      assert.deepEqual(Object.keys(body).sort(), ['code', 'items'], 'preflight sends no client subtotal, price, email or authorization flags');
      assert.deepEqual(Object.keys(body.items[0]).sort(), ['id', 'sku', 'slug']);
    }
  }
});

test('a late successful coupon cannot authorize a changed Temprano cart or quantity; a fresh validation uses current identities', async () => {
  for (const action of ['ordinary-temprano-addition', 'temprano-quantity-change']) {
    let resolve;
    let count = 0;
    const h = cartHarness([{ ...ordinary, sku: 'MIKVET500', quantity: 1 }], (_url, init) => {
      if (++count === 1) return new Promise((done) => { resolve = done; });
      return Promise.resolve(success(JSON.parse(init.body).code));
    });
    await h.ready();
    const pending = h.value.applyDiscountCode('MIKELSFRIENDS');
    await new Promise(resolve => setImmediate(resolve));
    if (action === 'ordinary-temprano-addition') h.value.addToCart({ ...ordinary, id: 'new-normal', sku: 'MIKPACKF' });
    else h.value.updateQuantity(0, 12);
    h.render(); resolve(success('MIKELSFRIENDS'));
    assert.equal((await pending).success, false); h.render();
    assert.equal(h.value.appliedDiscount, null);
    assert.equal((await h.value.applyDiscountCode('MIKELSFRIENDS')).success, true); h.render();
    assert.equal(h.calls.length, 2);
    assert.deepEqual(JSON.parse(h.calls[1][1].body).items, clone(h.value.cart.map(({ id, slug, sku }) => ({ id, slug, sku }))));
    assert.equal(h.value.getItemPrice(h.value.cart[0]), 19.90);
  }
});
