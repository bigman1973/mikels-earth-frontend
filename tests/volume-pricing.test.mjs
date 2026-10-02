import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getVolumeDiscountPercent,
  getVolumeDiscountedLineTotal,
  getVolumeDiscountedUnitPrice,
} from '../src/utils/volumePricing.js';

const temprano = {
  price: 19.90,
  tieredDiscountConfig: [
    { minQuantity: 12, label: 'Caja de 12', bundleQuantity: 12, paidQuantity: 11 },
  ],
};

const cents = (value) => Math.round(value * 100);

test('uses the exact reservation-box totals checkout validates', () => {
  for (const [quantity, expectedTotalCents] of [
    [2, 3980],
    [12, 21890],
    [24, 43780],
    [36, 65670],
  ]) {
    assert.equal(getVolumeDiscountPercent(temprano, quantity), 0);
    assert.equal(cents(getVolumeDiscountedLineTotal(temprano, quantity)), expectedTotalCents);
  }
});

test('charges eleven exact bottles for every full reservation case', () => {
  assert.equal(getVolumeDiscountedUnitPrice(temprano, 12), 18.2417);
  assert.equal(cents(getVolumeDiscountedLineTotal(temprano, 12)), 21890);
  assert.equal(cents(getVolumeDiscountedLineTotal(temprano, 13)), 23880);
});
