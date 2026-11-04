import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { products } from '../src/data/products.js';
import { INDEPENDENT_PACKS, getIndependentPackIdentity } from '../src/utils/independentPacks.js';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';
import { getCouponDiscountAmount, hasInPromotionItem, PROMOTION_COUPON_MESSAGE, normalizePromotionProtectedCartItem, isPromotionProtectedItem } from '../src/utils/promotionProtection.js';
import { loadProductDetail, isListedProduct, isPublicFallbackProduct } from '../src/utils/productAccess.js';
import { getVolumeDiscountedLineTotal } from '../src/utils/volumePricing.js';
import { getFixedPackOptions } from '../src/utils/fixedPackPricing.js';
import { loadStoredCart, withoutStoredPromotionFields } from '../src/utils/cartStorage.js';
import { getCartReferenceKey, getCouponItemReferences, reviewCartPromotions } from '../src/utils/cartPromotionValidation.js';
import { buildProductMetadata, buildProductStructuredData } from '../src/seo/metadata.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const response = (product, status = 200) => ({ ok: status === 200, status, json: async () => ({ product }) });
const fixture = (pack, index = 0) => ({ ...pack, id: 2600 + index, name: 'Pack autorizado', price: pack.price, quantity: 1, active: true, visibleInStore: false, inPromotion: true, tags: [] });
const coupon = { oneTimeDiscount: 10, subscriptionDiscount: 20 };
const ordinary = { sku: 'ORDINARY-EXAMPLE', slug: 'ordinary-product', price: 5, quantity: 2 };

test('six definitive SKUs, exact preserved slugs and complete-container totals', () => {
  assert.deepEqual(INDEPENDENT_PACKS.map(({ sku, price, units }) => [sku, price, units]), [
    ['BF26-TEMP6', 59.70, 6], ['BF26-TEMP12', 119.40, 12], ['BF26-ECO6', 71.40, 6],
    ['BF26-PARA3', 30.90, 3], ['BF26-PARA6', 61.70, 6], ['BF26-5L3', 96.75, 3],
  ]);
  assert.deepEqual(INDEPENDENT_PACKS.map(({ slug }) => slug), [
    'aceite-temprano-sin-filtrar-cosecha-2025-26-pack-6', 'aceite-temprano-sin-filtrar-cosecha-2025-26-caja-12',
    'black-friday-aceite-ecologico-pack-6', 'black-friday-paraguayo-720g-pack-3',
    'black-friday-paraguayo-720g-pack-6', 'black-friday-aceite-5l-caja-3',
  ]);
  for (const pack of INDEPENDENT_PACKS) {
    for (const quantity of [1, 2, 6, 12]) {
      const item = fixture(pack);
      assert.equal(Math.round(getVolumeDiscountedLineTotal(item, quantity) * 100), Math.round(pack.price * quantity * 100));
      assert.deepEqual(getFixedPackOptions(item), []);
      assert.equal(normalizePromotionProtectedCartItem({ ...item, quantity }).quantity, quantity);
    }
    assert.equal(products.some((product) => product.sku === pack.sku || product.slug === pack.slug), false);
  }
});

test('pack identity is exact and cannot reinterpret singles or historical MIKPACK SKUs', () => {
  assert.equal(getIndependentPackIdentity({ sku: ' bf26-temp6 ' }).sku, 'BF26-TEMP6');
  assert.equal(getIndependentPackIdentity({ slug: INDEPENDENT_PACKS[0].slug }).sku, 'BF26-TEMP6');
  for (const sku of ['MIKVET500', 'MIKVET5002526', 'MIKVE5LP', 'MIKPARA450', 'MIKPACKF', 'MIKPACKTP', 'BF26-TEMP6-EXTRA']) {
    assert.equal(getIndependentPackIdentity({ sku, slug: INDEPENDENT_PACKS[0].slug }), undefined);
  }
  assert.equal(isPromotionProtectedItem({ sku: 'MIKPACKF' }), true);
  assert.equal(isPromotionProtectedItem({ sku: 'MIKPACKTP' }), true);
});

test('six packs strip original price, subscription/volume tiers and discount badges without changing final price', () => {
  for (const pack of INDEPENDENT_PACKS) {
    const original = {
      ...fixture(pack), originalPrice: 250, tieredDiscount: [{ minQuantity: 6, discount: 20 }],
      tieredDiscountConfig: [{ minQuantity: 6, discount: 20 }], volumeDiscount: { minQuantity: 3, discount: 25 },
      subscriptionAvailable: true, subscriptionDiscount: 20, badges: [{ text: '20% de descuento' }, { text: 'En promoción' }],
    };
    const item = applyEditorialOverrides(original);
    for (const key of ['originalPrice', 'tieredDiscount', 'tieredDiscountConfig', 'volumeDiscount', 'subscriptionAvailable', 'subscriptionDiscount']) assert.equal(key in item, false, key);
    assert.equal(item.price, pack.price);
    assert.deepEqual(item.badges, [{ text: 'En promoción' }]);
    assert.equal('image' in item, false);
    assert.equal('images' in item, false);
    const cartItem = normalizePromotionProtectedCartItem(original);
    assert.equal('originalPrice' in cartItem, false);
    assert.equal(cartItem.purchaseType, 'one-time');
    assert.equal(cartItem.selectedPackQuantity, null);
    assert.equal(original.originalPrice, 250);
  }
});

test('badge and whole-coupon veto use the strict generic field, not the six-SKU whitelist', () => {
  for (const promotion of [fixture(INDEPENDENT_PACKS[0]), { ...ordinary, sku: 'FUTURE-NON-BF-PRODUCT', inPromotion: true }]) {
    for (const cart of [[promotion, ordinary], [ordinary, promotion]]) {
      assert.equal(hasInPromotionItem(cart), true);
      assert.equal(getCouponDiscountAmount(cart, coupon, (item) => item.price), 0);
      assert.equal(cart.length, 2, 'coupon rejection must never remove the pack');
    }
    assert.deepEqual(applyEditorialOverrides({ ...promotion, badges: [] }).badges, [{ text: 'En promoción' }]);
  }
  for (const flag of [undefined, false, 'true', 'false', 1]) {
    assert.equal(hasInPromotionItem([{ ...ordinary, inPromotion: flag }]), false);
    assert.equal(getCouponDiscountAmount([{ ...ordinary, inPromotion: flag }], coupon, (item) => item.price), 1);
  }
  assert.equal(PROMOTION_COUPON_MESSAGE, 'Este código no se puede aplicar porque el pedido incluye productos en promoción.');
});

test('previous-harvest packs keep 2025/26 throughout names and dynamic SEO, never invent images', () => {
  for (const pack of INDEPENDENT_PACKS.filter((pack) => pack.harvest)) {
    const product = fixture(pack);
    assert.match(applyEditorialOverrides(product).name, /Cosecha 2025\/26/);
    assert.match(normalizePromotionProtectedCartItem(product).name, /Cosecha 2025\/26/);
    assert.match(buildProductMetadata(product, product.slug).title, /2025\/26/);
    const schema = buildProductStructuredData(product);
    assert.equal(schema.sku, pack.sku);
    assert.equal('gtin13' in schema, false);
    assert.equal('image' in schema, false);
    assert.match(schema.name, /2025\/26/);
    assert.equal(schema.offers.price, pack.price.toFixed(2));
    assert.equal('image' in applyEditorialOverrides(product), false);
  }
});

test('active hidden product resolves only from direct authoritative API, not catalogue or fallback', async () => {
  for (const pack of INDEPENDENT_PACKS) {
    const product = fixture(pack);
    const fetchImpl = async (url) => {
      assert.match(url, new RegExp(`/api/products/${pack.slug}\\?lang=es$`));
      return response(product);
    };
    assert.equal(await loadProductDetail({ slug: product.slug, apiUrl: 'http://local-test', fetchImpl }), product);
    assert.equal(isListedProduct(product), false);
    assert.equal(isListedProduct({ ...product, visibleInStore: true }), true, 'no whitelist altering visibility filter');
    assert.equal(isPublicFallbackProduct({ ...product, visibleInStore: true }), false);
    assert.equal(await loadProductDetail({ slug: product.slug, apiUrl: 'http://local-test', fallbackProducts: [{ ...product, visibleInStore: true }], fetchImpl: async () => { throw new Error('offline'); } }), null);
    for (const status of [403, 404]) assert.equal(await loadProductDetail({ slug: product.slug, apiUrl: 'http://local-test', fetchImpl: async () => response(product, status) }), null);
    assert.equal(await loadProductDetail({ slug: product.slug, apiUrl: 'http://local-test', fetchImpl: async () => response({ ...product, active: false }) }), null);
  }
  const publicProduct = { ...ordinary, active: true };
  assert.equal(await loadProductDetail({ slug: ordinary.slug, apiUrl: 'http://local-test', fallbackProducts: [publicProduct], fetchImpl: async () => { throw new Error('offline'); } }), publicProduct);
  assert.equal(await loadProductDetail({ slug: ordinary.slug, apiUrl: 'http://local-test', fallbackProducts: [publicProduct], fetchImpl: async () => response(null, 404) }), null);
});

test('stored inPromotion flags and derived fields cannot spoof either true or false', async () => {
  for (const flag of [true, false, 'false']) {
    const saved = { ...fixture(INDEPENDENT_PACKS[0]), inPromotion: flag, in_promotion: false, promotionValidated: true, promotionValidationPending: false, badges: [{ text: 'Fake badge' }] };
    const loaded = loadStoredCart({ getItem: () => JSON.stringify([saved]) });
    for (const key of ['inPromotion', 'in_promotion', 'promotionValidated', 'promotionValidationPending', 'badges']) assert.equal(key in loaded[0], false, key);
    const flags = await reviewCartPromotions({ cart: loaded, apiUrl: 'http://local-test', fetchImpl: async () => response(fixture(INDEPENDENT_PACKS[0])) });
    assert.deepEqual(flags, [{ inPromotion: true }]);
    assert.equal(withoutStoredPromotionFields(saved).quantity, 1);
  }
  const item = fixture(INDEPENDENT_PACKS[0]);
  const flags = await reviewCartPromotions({ cart: [item], apiUrl: 'http://local-test', fetchImpl: async () => response({ ...item, inPromotion: false }) });
  assert.deepEqual(flags, [{ inPromotion: false }], 'persisted true may not override catalogue false');
});

test('cart review fails closed on inactive, unavailable, conflicting identifiers and missing slugs, without removing lines', async () => {
  const item = fixture(INDEPENDENT_PACKS[0]);
  for (const fetchImpl of [
    async () => response({ ...item, active: false }), async () => response(item, 404),
    async () => response({ ...item, sku: 'SPOOFED' }), async () => response({ ...item, id: 999 }),
    async () => { throw new Error('offline'); },
  ]) await assert.rejects(reviewCartPromotions({ cart: [item], apiUrl: 'http://local-test', fetchImpl }));
  await assert.rejects(reviewCartPromotions({ cart: [{ ...item, slug: '' }], apiUrl: 'http://local-test', fetchImpl: async () => response(item) }));
  assert.equal(item.quantity, 1);
  assert.deepEqual(getCouponItemReferences([item]), [{ id: item.id, sku: item.sku, slug: item.slug, quantity: 1 }]);
  assert.notEqual(getCartReferenceKey([item]), getCartReferenceKey([{ ...item, quantity: 2 }]));
});

test('UI blocks stale coupons before payment, shows exact shared message, and admin flag stays generic', async () => {
  const [context, drawer, checkout, editor, seo, hook] = await Promise.all([
    read('src/context/CartContext.jsx'), read('src/components/cart/CartDrawer.jsx'), read('src/pages/Checkout.jsx'),
    read('src/components/admin/ProductEditor.jsx'), read('src/components/ProductSeo.jsx'), read('src/hooks/useProducts.js'),
  ]);
  assert.match(context, /const appliedDiscount = hasOrderCouponBlockingItem\(cart\) \|\| !promotionReviewReady \? null : savedDiscount/);
  assert.match(context, /setAppliedDiscount\(null\);\s*setDiscountCode\(''\)/);
  assert.match(context, /items: getCouponItemReferences\(reviewedCart\)/);
  assert.match(context, /JSON.stringify\(cart.map\(withoutStoredPromotionFields\)\)/);
  for (const ui of [drawer, checkout]) assert.match(ui, /couponMessage && <p role="alert"/);
  assert.match(checkout, /if \(!promotionReviewReady\)/);
  assert.match(checkout, /disabled=\{loading \|\| !promotionReviewReady\}/);
  assert.match(editor, /inPromotion: false/);
  assert.match(editor, /inPromotion: data.inPromotion === true/);
  assert.match(editor, /field: 'inPromotion', label: 'En promoción'/);
  assert.match(seo, /isHiddenProduct\(product\) \? 'noindex, nofollow'/);
  assert.match(hook, /data.products.filter\(isListedProduct\)/);
  assert.match(hook, /localProducts.filter\(isPublicFallbackProduct\)/);
});

test('existing sitemap contains only 23 routes and no draft pack static files are produced', async () => {
  const sitemap = await read('public/sitemap.xml');
  assert.equal([...sitemap.matchAll(/<loc>/g)].length, 23);
  const dist = process.env.FRONTEND_BUILD_OUTDIR;
  for (const pack of INDEPENDENT_PACKS) {
    assert.equal(sitemap.includes(`/producto/${pack.slug}<`), false);
    if (dist) for (const path of [`producto/${pack.slug}.html`, `producto/${pack.slug}/index.html`]) {
      await assert.rejects(access(resolve(dist, path)), { code: 'ENOENT' });
    }
  }
});
