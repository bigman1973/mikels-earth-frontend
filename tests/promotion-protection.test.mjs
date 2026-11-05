import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { products } from '../src/data/products.js';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';
import {
  getCouponDiscountAmount,
  hasCouponEligibleItem,
  hasPromotionProtectedItem,
  isPackCompletoPromotionProtectedItem,
  isPromotionProtectedItem,
  normalizePromotionProtectedCartItem,
  normalizePromotionProtectedProduct,
} from '../src/utils/promotionProtection.js';
import { getFixedPackOptions, resolveScheduledSinglePrice } from '../src/utils/fixedPackPricing.js';
import {
  getApplicableVolumeTier,
  getVolumeDiscountedLineTotal,
  getVolumeDiscountedUnitPrice,
} from '../src/utils/volumePricing.js';
import { getCartEventPricing } from '../src/utils/cartTracking.js';

const read = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const unitPrice = (item) => item.price;
const coupon = { oneTimeDiscount: 10, subscriptionDiscount: 20 };
const cents = (amount) => Math.round(amount * 100);
const promotionKeys = [
  'tieredDiscount', 'tieredDiscountConfig', 'volumeDiscount', 'volumeDiscountConfig',
  'subscriptionAvailable', 'subscriptionDiscount', 'subscriptionFrequencies',
  'discoveryDiscount', 'discoveryDiscounts',
];
const protectedSingles = [
  { sku: 'MIKVET500', slug: 'aceite-temprano-sin-filtrar', price: 19.90 },
  { sku: 'MIKVE5LP', slug: 'aceite-5l-caja-3', price: 43 },
  { sku: 'MIKPARA450', slug: 'paraguayo-almibar', price: 17.15 },
];
const legacyPromotions = {
  subscriptionAvailable: true,
  subscriptionDiscount: 10,
  subscriptionFrequencies: [{ value: 'monthly', discount: 10 }],
  discoveryDiscount: 15,
  discoveryDiscounts: [{ discount: 15 }],
  tieredDiscount: [{ actualQuantity: 3, price: 20, fixedPack: true }],
  tieredDiscountConfig: [{ minQuantity: 3, discount: 20, bundleQuantity: 12, paidQuantity: 11 }],
  volumeDiscount: { minQuantity: 3, discount: 20 },
  volumeDiscountConfig: { minQuantity: 3, discount: 20 },
};

const assertNoPromotions = (item) => {
  for (const key of promotionKeys) assert.equal(key in item, false, `${key} must not survive for ${item.sku || item.slug}`);
};

test('the local Temprano fallback sells only the 19.90 € bottle without promotion metadata', () => {
  const temprano = products.find((product) => product.slug === 'aceite-temprano-sin-filtrar');
  assert.ok(temprano);
  assert.equal(temprano.sku, 'MIKVET500');
  assert.equal(temprano.price, 19.90);
  assertNoPromotions(temprano);
});

test('each current single SKU is protected by SKU or by a legacy slug, at every quantity', () => {
  for (const single of protectedSingles) {
    for (const identity of [{ sku: single.sku }, { slug: single.slug }]) {
      for (const quantity of [1, 2, 3, 6, 12]) {
        const item = { ...identity, price: single.price, quantity, purchaseType: 'one-time', ...legacyPromotions };
        assert.equal(isPromotionProtectedItem(item), true);
        assert.equal(getCouponDiscountAmount([item], coupon, unitPrice), 0);
        assert.equal(hasCouponEligibleItem([item]), false);
        assert.equal(getApplicableVolumeTier(item, quantity), null);
        assert.deepEqual(getFixedPackOptions(item), []);
        assert.equal(getVolumeDiscountedUnitPrice(item, quantity), single.price);
        assert.equal(cents(getVolumeDiscountedLineTotal(item, quantity)), cents(single.price * quantity));
        assert.equal(resolveScheduledSinglePrice(item), single.price);
      }
    }
  }
});

test('SKU matching is exact, normalized, and authoritative over a reused legacy slug', () => {
  assert.equal(isPromotionProtectedItem({ sku: ' mikve5lp ' }), true);
  assert.equal(isPromotionProtectedItem({ sku: 'MIKVET500R' }), false);
  assert.equal(isPromotionProtectedItem({ sku: 'MIKPARA450BF3', slug: 'paraguayo-almibar' }), false);
  assert.equal(isPromotionProtectedItem({ sku: 'OTHER', slug: 'aceite-5l-caja-3' }), false);
});

test('editorial normalization strips old promotions without changing normal price or product data', () => {
  for (const single of protectedSingles) {
    const original = {
      ...single, ...legacyPromotions, name: 'Producto',
      originalPrice: 99, available: true, soldOut: false, visibleInStore: true,
      weight: 'unidad', nutritionalInfo: { test: 'unchanged' }, images: ['local.jpg'],
    };
    const normalized = applyEditorialOverrides(original);
    assertNoPromotions(normalized);
    assert.equal('originalPrice' in normalized, false);
    assert.equal(normalized.price, single.price);
    assert.equal(normalized.available, true);
    assert.equal(normalized.soldOut, false);
    assert.equal(normalized.visibleInStore, true);
    assert.equal(normalized.weight, original.weight);
    assert.deepEqual(normalized.images, original.images);
    assert.deepEqual(normalized.nutritionalInfo, original.nutritionalInfo);
    assert.equal(original.subscriptionAvailable, true, 'must not mutate catalogue input');
  }
});

test('Temprano editorial normalization retains the previously approved single 19.90 € sale', () => {
  const temprano = applyEditorialOverrides({
    slug: 'aceite-temprano-sin-filtrar', name: 'Temprano antiguo', price: 17.50,
    ...legacyPromotions,
  });
  assert.equal(temprano.price, 19.90);
  assertNoPromotions(temprano);
});

test('all local protected fallbacks are sanitized at the existing editorial boundary without altering fallback prices', () => {
  for (const single of protectedSingles) {
    const original = products.find((product) => product.slug === single.slug);
    assert.ok(original);
    const normalized = applyEditorialOverrides(original);
    assertNoPromotions(normalized);
    assert.equal(normalized.price, original.price);
  }
});

test('persisted protected subscriptions recover their saved full price and ordinary quantities remain editable', () => {
  for (const single of protectedSingles) {
    const stale = {
      ...single, ...legacyPromotions, price: single.price * 0.90, originalPrice: single.price,
      quantity: 3, purchaseType: 'subscription', subscriptionFrequency: 'monthly',
      selectedPackQuantity: 3, selectedVariant: 'normal',
    };
    const normalized = normalizePromotionProtectedCartItem(stale);
    assertNoPromotions(normalized);
    assert.equal(normalized.price, single.price);
    assert.equal(normalized.originalPrice, single.price);
    assert.equal(normalized.purchaseType, 'one-time');
    assert.equal(normalized.subscriptionFrequency, null);
    assert.equal(normalized.selectedPackQuantity, null);
    assert.equal(normalized.quantity, 3);
    assert.equal(normalized.selectedVariant, 'normal');
    assert.deepEqual(normalizePromotionProtectedCartItem(normalized), normalized);
    assert.equal(getVolumeDiscountedUnitPrice(stale, 3), single.price);
  }
});

test('Pack Completo and explicit protected mixed-pack compositions retain their full normal price', () => {
  const items = [
    { sku: 'MIKPACKF' }, { slug: 'pack-navidad-completo' },
    ...protectedSingles.map(({ sku }) => ({ sku: `MIXED-${sku}`, couponProtectedCompositionSkus: [sku] })),
  ];
  for (const identity of items) {
    const item = { ...identity, price: 81.90, quantity: 1, purchaseType: 'one-time', ...legacyPromotions };
    assert.equal(isPromotionProtectedItem(item), true);
    assert.equal(getCouponDiscountAmount([item], coupon, unitPrice), 0);
    assertNoPromotions(normalizePromotionProtectedProduct(item));
    assert.equal(normalizePromotionProtectedCartItem(item).price, 81.90);
    assert.deepEqual(getFixedPackOptions(item), []);
    assert.equal(getVolumeDiscountedUnitPrice(item, 3), 81.90);
  }
  assert.equal(isPackCompletoPromotionProtectedItem({ sku: 'MIKPACKF' }), true);
  const ordinaryPack = { sku: 'NORMAL-PACK', couponProtectedCompositionSkus: ['MIKBIO19'], price: 50, quantity: 1 };
  assert.equal(isPromotionProtectedItem(ordinaryPack), false);
  assert.equal(getCouponDiscountAmount([ordinaryPack], coupon, unitPrice), 5);
});

test('authorized independent BF pack identities remain unprotected even with protected base components', () => {
  for (const sku of ['MIKVE5LPBF3', 'MIKBIO19BF6', 'MIKPARA450BF3', 'MIKPARA450BF6']) {
    const item = {
      sku, name: 'Independent draft fixture', price: 96.75, quantity: 1, purchaseType: 'one-time',
      couponProtectedCompositionSkus: ['MIKVE5LP', 'MIKPARA450'], ...legacyPromotions,
    };
    assert.equal(isPromotionProtectedItem(item), false);
    assert.equal(normalizePromotionProtectedCartItem(item), item);
    assert.equal(normalizePromotionProtectedProduct(item), item);
    assert.equal(getCouponDiscountAmount([item], coupon, unitPrice), 9.675);
    assert.equal(getFixedPackOptions(item).length, 0, 'percentage fixtures are not fixed packs');
    assert.equal(applyEditorialOverrides(item).subscriptionDiscount, 10);
    assert.equal(products.some((product) => product.sku === sku), false, 'tests must not publish draft products in the fallback');
  }
});

test('authorized BF packs keep their own independent closed price, not a tier on the base SKU', () => {
  const draftFixture = {
    sku: 'MIKVE5LPBF3', price: 96.75, quantity: 1,
    couponProtectedCompositionSkus: ['MIKVE5LP'],
    tieredDiscountConfig: [{ actualQuantity: 1, price: 96.75, fixedPack: true }],
  };
  assert.equal(getFixedPackOptions(draftFixture).length, 1);
  assert.equal(getVolumeDiscountedLineTotal(draftFixture, 1), 96.75);
  assert.equal(getVolumeDiscountedLineTotal({ sku: 'MIKVE5LP', price: 43 }, 3), 129);
});

test('protected add-ons are sanitized independently and ordinary gift cases stay eligible', () => {
  const ordinaryAddon = { sku: 'MIKESTTEM', slug: 'estuche-regalo-temprano', price: 5, quantity: 1, ...legacyPromotions };
  const protectedAddon = { sku: 'MIKPARA450', price: 17.15, ...legacyPromotions };
  const parent = applyEditorialOverrides({
    sku: 'MIKBIO19', name: 'Aceite', price: 19.90,
    addons: [
      { productSlug: 'paraguayo-almibar', label: 'Tarro', product: protectedAddon },
      { productSlug: ordinaryAddon.slug, label: 'Estuche', product: ordinaryAddon },
    ],
  });
  assertNoPromotions(parent.addons[0].product);
  assert.equal(parent.addons[0].product.price, 17.15);
  assert.equal(parent.addons[1].product, ordinaryAddon);
  const protectedParent = normalizePromotionProtectedProduct({ ...protectedSingles[0], addons: parent.addons });
  assert.equal(isPromotionProtectedItem(protectedParent.addons[1].product), false);
  assert.equal(getCouponDiscountAmount([ordinaryAddon], coupon, unitPrice), 0.5);
  assert.equal(protectedAddon.subscriptionDiscount, 10, 'must not mutate nested inputs');
});

test('mixed carts veto the entire coupon, irrespective of insertion order or pre-applied coupon', () => {
  const ordinary = { sku: 'MIKBIO19', price: 19.90, quantity: 2, purchaseType: 'one-time' };
  const subscription = { sku: 'ORDINARY-SUB', price: 10, quantity: 1, purchaseType: 'subscription' };
  const protectedLines = protectedSingles.map((single) => ({ ...single, quantity: 1, purchaseType: 'one-time' }));
  const pack = { sku: 'MIKPACKF', price: 81.90, quantity: 1 };
  for (const cart of [[ordinary, subscription, ...protectedLines, pack], [pack, ...protectedLines, subscription, ordinary]]) {
    assert.equal(hasPromotionProtectedItem(cart), true);
    assert.equal(hasCouponEligibleItem(cart), false);
    assert.equal(getCouponDiscountAmount(cart, coupon, unitPrice), 0);
  }
  assert.equal(getCouponDiscountAmount([...protectedLines, pack], coupon, unitPrice), 0);
  assert.equal(hasCouponEligibleItem([]), false);
  assert.equal(hasCouponEligibleItem(null), false);
  assert.equal(hasPromotionProtectedItem(null), false);
});

test('add-to-cart tracking reports full-price units, never a base-SKU pack discount', () => {
  for (const single of protectedSingles) {
    const pricing = getCartEventPricing({ ...single, ...legacyPromotions }, 3);
    assert.equal(pricing.quantity, 3);
    assert.equal(pricing.unitPrice, single.price);
    assert.equal(cents(pricing.value), cents(single.price * 3));
  }
});

test('cart UI shows the complete coupon veto inline and the shared context protects all entry points', async () => {
  const [drawer, cartContext, checkout] = await Promise.all([
    read('src/components/cart/CartDrawer.jsx'), read('src/context/CartContext.jsx'), read('src/pages/Checkout.jsx'),
  ]);
  assert.match(drawer, /hasCouponEligibleItem\(cart\)/);
  assert.match(drawer, /getDiscountAmount,/);
  assert.match(drawer, /couponError &&/);
  assert.match(drawer, /role="alert"[^>]*>\{couponError\}/);
  assert.match(drawer, /hasEligiblePromotionLine && !appliedDiscount &&/);
  assert.doesNotMatch(drawer, /El cupón solo se aplica a los demás productos\./);
  assert.match(drawer, /¿Tienes un código\?/);
  assert.match(cartContext, /isPromotionProtectedItem\(cartProduct\) \? 'one-time' : purchaseType/);
  assert.match(cartContext, /if \(!hasCouponEligibleItem\(cart\)\)/);
  assert.match(cartContext, /getCouponDiscountAmount\(cart, appliedDiscount, getItemPrice\)/);
  assert.match(checkout, /appliedDiscount && getDiscountAmount\(\) > 0/);
});
