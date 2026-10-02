import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getVolumeDiscountPercent,
  getVolumeDiscountedLineTotal,
  getVolumeDiscountedUnitPrice,
} from '../src/utils/volumePricing.js';

const temprano = {
  price: 17.15,
  tieredDiscountConfig: [
    { minQuantity: 2, discount: 0, label: 'Pack Dúo' },
    { minQuantity: 12, discount: 15, label: '1 caja' },
    { minQuantity: 24, discount: 20, label: '2 cajas' },
    { minQuantity: 36, discount: 25, label: '4 cajas' },
  ],
};

const cents = (value) => Math.round(value * 100);

test('uses the configured quantity tiers for the same totals checkout validates', () => {
  for (const [quantity, expectedDiscount, expectedTotalCents] of [
    [2, 0, 3430],
    [12, 15, 17493],
    [24, 20, 32928],
    [36, 25, 46305],
  ]) {
    assert.equal(getVolumeDiscountPercent(temprano, quantity), expectedDiscount);
    assert.equal(cents(getVolumeDiscountedLineTotal(temprano, quantity)), expectedTotalCents);
  }
});

test('retains fractional-cent precision before a line total is rounded to cents', () => {
  assert.equal(getVolumeDiscountedUnitPrice(temprano, 12), 14.5775);
  assert.equal(cents(getVolumeDiscountedLineTotal(temprano, 12)), 17493);
});
