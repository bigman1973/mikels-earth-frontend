import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  getVolumeDiscountPercent,
  getVolumeDiscountedLineTotal,
  getVolumeDiscountedUnitPrice,
} from '../src/utils/volumePricing.js';

const temprano = {
  price: 17.50,
  tieredDiscountConfig: [
    { minQuantity: 1, actualQuantity: 1, label: '1 botella 500 ml', reservationPrice: 17.50, regularPrice: 19.90, priceEndsAt: '2026-10-25T22:59:59Z' },
    { minQuantity: 3, actualQuantity: 3, label: 'Pack de 3', reservationPrice: 49.90, regularPrice: 56.70, priceEndsAt: '2026-10-25T22:59:59Z' },
    { minQuantity: 6, actualQuantity: 6, label: 'Pack de 6', reservationPrice: 94.50, regularPrice: 107.40, priceEndsAt: '2026-10-25T22:59:59Z' },
    { minQuantity: 12, actualQuantity: 12, label: 'Caja de 12', reservationPrice: 178.50, regularPrice: 202.80, priceEndsAt: '2026-10-25T22:59:59Z' },
  ],
};

const cents = (value) => Math.round(value * 100);

test('uses the exact closed-pack totals checkout validates', () => {
  for (const [quantity, expectedTotalCents] of [
    [1, 1750],
    [3, 4990],
    [6, 9450],
    [12, 17850],
  ]) {
    assert.equal(getVolumeDiscountPercent(temprano, quantity), 0);
    assert.equal(cents(getVolumeDiscountedLineTotal(temprano, quantity)), expectedTotalCents);
  }
});

test('makes a larger reservation pack progressively cheaper per bottle', () => {
  assert.equal(getVolumeDiscountedUnitPrice(temprano, 3), 16.6333);
  assert.equal(getVolumeDiscountedUnitPrice(temprano, 6), 15.75);
  assert.equal(getVolumeDiscountedUnitPrice(temprano, 12), 14.875);
  assert.equal(cents(getVolumeDiscountedLineTotal(temprano, 12)), 17850);
});

test('labels the reservation choices as fixed packs, not a volume discount', () => {
  const detail = readFileSync(new URL('../src/pages/ProductDetail.jsx', import.meta.url), 'utf8');
  const spanish = readFileSync(new URL('../src/i18n/locales/es.json', import.meta.url), 'utf8');

  assert.match(detail, /Elige tu reserva/);
  assert.match(detail, /Los packs tienen precio cerrado/);
  assert.match(detail, /getFixedPackOptions/);
  assert.match(spanish, /"unit": "unidad"/);
});
