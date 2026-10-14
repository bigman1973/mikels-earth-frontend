import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCartEventPricing,
  getCartEventUnitPrice,
} from '../src/utils/cartTracking.js';

const temprano = {
  price: 17.50,
  tieredDiscountConfig: [
    { actualQuantity: 1, fixedPack: true, price: 17.50, reservationPriceActive: true },
    { actualQuantity: 3, fixedPack: true, price: 49.90, reservationPriceActive: true },
    { actualQuantity: 6, fixedPack: true, price: 94.50, reservationPriceActive: true },
    { actualQuantity: 12, fixedPack: true, price: 178.50, reservationPriceActive: true },
  ],
};

test('cart events report the effective closed-pack value', () => {
  const pricing = getCartEventPricing(temprano, 3);

  assert.equal(pricing.quantity, 3);
  assert.equal(pricing.unitPrice, 16.633333);
  assert.equal(pricing.value, 49.90);
  assert.equal(Number((pricing.unitPrice * pricing.quantity).toFixed(2)), pricing.value);
  assert.equal(getCartEventUnitPrice(temprano, 6), 15.75);
});
