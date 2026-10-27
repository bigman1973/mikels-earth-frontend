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
    { minQuantity: 1, actualQuantity: 1, label: '1 botella 500 ml', reservationPrice: 17.50, regularPrice: 19.90, priceEndsAt: '2026-10-26T22:59:59Z' },
    { minQuantity: 3, actualQuantity: 3, label: 'Pack de 3', reservationPrice: 49.90, regularPrice: 56.70, priceEndsAt: '2026-10-26T22:59:59Z' },
    { minQuantity: 6, actualQuantity: 6, label: 'Pack de 6', reservationPrice: 94.50, regularPrice: 107.40, priceEndsAt: '2026-10-26T22:59:59Z' },
    { minQuantity: 12, actualQuantity: 12, label: 'Caja de 12', reservationPrice: 178.50, regularPrice: 202.80, priceEndsAt: '2026-10-26T22:59:59Z' },
  ],
};

const cents = (value) => Math.round(value * 100);

test('uses the exact closed-pack totals checkout validates', () => {
  for (const [quantity, expectedTotalCents] of [
    [1, 1990],
    [3, 5670],
    [6, 10740],
    [12, 20280],
  ]) {
    assert.equal(getVolumeDiscountPercent(temprano, quantity), 0);
    assert.equal(cents(getVolumeDiscountedLineTotal(temprano, quantity)), expectedTotalCents);
  }
});

test('uses the normal price per bottle for each fixed pack after the reservation period', () => {
  assert.equal(getVolumeDiscountedUnitPrice(temprano, 3), 18.9);
  assert.equal(getVolumeDiscountedUnitPrice(temprano, 6), 17.9);
  assert.equal(getVolumeDiscountedUnitPrice(temprano, 12), 16.9);
  assert.equal(cents(getVolumeDiscountedLineTotal(temprano, 12)), 20280);
});

test('labels Temprano choices as fixed packs, not a volume discount', () => {
  const detail = readFileSync(new URL('../src/pages/ProductDetail.jsx', import.meta.url), 'utf8');
  const spanish = readFileSync(new URL('../src/i18n/locales/es.json', import.meta.url), 'utf8');

  assert.match(detail, /Elige tu pack/);
  assert.doesNotMatch(detail, /no se combinan con códigos de descuento/);
  assert.match(detail, /getFixedPackOptions/);
  assert.match(spanish, /"unit": "unidad"/);
});
