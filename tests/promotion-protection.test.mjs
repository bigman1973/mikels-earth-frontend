import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { products } from '../src/data/products.js';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';
import {
  getCouponDiscountAmount,
  hasPromotionProtectedItem,
  isPackCompletoPromotionProtectedItem,
  isPromotionProtectedItem,
  normalizePromotionProtectedCartItem,
} from '../src/utils/promotionProtection.js';

const read = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const unitPrice = (item) => item.price;
const coupon = { oneTimeDiscount: 10, subscriptionDiscount: 0 };
const cents = (amount) => Math.round(amount * 100);

test('the local Temprano fallback sells only the 19.90 € bottle without promotion metadata', () => {
  const temprano = products.find((product) => product.slug === 'aceite-temprano-sin-filtrar');

  assert.ok(temprano);
  assert.equal(temprano.sku, 'MIKVET500');
  assert.equal(temprano.price, 19.90);
  for (const key of [
    'tieredDiscount',
    'tieredDiscountConfig',
    'volumeDiscount',
    'volumeDiscountConfig',
    'subscriptionAvailable',
    'subscriptionDiscount',
    'subscriptionFrequencies',
    'discoveryDiscount',
    'discoveryDiscounts',
  ]) {
    assert.equal(key in temprano, false, `${key} must not be published for Temprano`);
  }
});

test('Temprano editorial normalization removes legacy packs and subscription discount metadata', () => {
  const temprano = applyEditorialOverrides({
    slug: 'aceite-temprano-sin-filtrar',
    name: 'Temprano antiguo',
    price: 17.50,
    subscriptionAvailable: true,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [{ value: 'monthly', discount: 10 }],
    discoveryDiscount: 15,
    tieredDiscount: [
      { actualQuantity: 3, price: 49.90, fixedPack: true },
      { actualQuantity: 6, price: 94.50, fixedPack: true },
      { actualQuantity: 12, price: 178.50, fixedPack: true },
    ],
  });

  assert.equal(temprano.price, 19.90);
  assert.equal('tieredDiscount' in temprano, false);
  assert.equal('subscriptionDiscount' in temprano, false);
  assert.equal('subscriptionFrequencies' in temprano, false);
  assert.equal('discoveryDiscount' in temprano, false);
});

test('ordinary carts retain coupon eligibility while Temprano and Pack Completo lines are protected', () => {
  const ordinaryLine = { slug: 'paraguayo-almibar', sku: 'MIKPARA450', price: 14.90, quantity: 2, purchaseType: 'one-time' };
  const tempranoBySlug = { slug: 'aceite-temprano-sin-filtrar', price: 17.50, quantity: 1, purchaseType: 'subscription' };
  const packCompletoBySku = { sku: 'MIKPACKF', price: 81.90, quantity: 1, purchaseType: 'one-time' };

  assert.equal(hasPromotionProtectedItem([ordinaryLine]), false);
  assert.equal(cents(getCouponDiscountAmount([ordinaryLine], coupon, unitPrice)), 298);

  assert.equal(isPromotionProtectedItem(tempranoBySlug), true);
  assert.equal(isPackCompletoPromotionProtectedItem(packCompletoBySku), true);
  assert.equal(hasPromotionProtectedItem([ordinaryLine, tempranoBySlug]), true);
  assert.equal(hasPromotionProtectedItem([packCompletoBySku]), true);
  assert.equal(getCouponDiscountAmount([tempranoBySlug], coupon, unitPrice), 0);
  assert.equal(getCouponDiscountAmount([packCompletoBySku], coupon, unitPrice), 0);
  assert.equal(cents(getCouponDiscountAmount([ordinaryLine, tempranoBySlug, packCompletoBySku], coupon, unitPrice)), 298);

  const normalizedTemprano = normalizePromotionProtectedCartItem(tempranoBySlug);
  assert.equal(normalizedTemprano.price, 19.90);
  assert.equal(normalizedTemprano.originalPrice, 19.90);
  assert.equal(normalizedTemprano.purchaseType, 'one-time');
  assert.equal(normalizedTemprano.subscriptionFrequency, null);
});

test('coupon UI remains available for ordinary carts and is hidden for protected lines', async () => {
  const [drawer, cartContext, checkout] = await Promise.all([
    read('src/components/cart/CartDrawer.jsx'),
    read('src/context/CartContext.jsx'),
    read('src/pages/Checkout.jsx'),
  ]);

  assert.match(drawer, /hasPromotionProtectedItem\(cart\)/);
  assert.match(drawer, /Este producto no participa en promociones ni cupones\./);
  assert.match(drawer, /hasProtectedPromotionLine \? \(/);
  assert.match(drawer, /: !appliedDiscount && \(/);
  assert.match(drawer, /¿Tienes un código\?/);
  assert.match(cartContext, /getCouponDiscountAmount\(cart, appliedDiscount, getItemPrice\)/);
  assert.match(checkout, /appliedDiscount && getDiscountAmount\(\) > 0/);
});
