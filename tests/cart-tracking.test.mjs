import assert from 'node:assert/strict';
import test from 'node:test';
import { getCartEventUnitPrice } from '../src/utils/cartTracking.js';

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
  const quantity = 6;
  const unitPrice = getCartEventUnitPrice(temprano, quantity);

  assert.equal(unitPrice, 15.75);
  assert.equal(Number((unitPrice * quantity).toFixed(2)), 94.50);
});
