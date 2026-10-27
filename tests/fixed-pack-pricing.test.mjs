import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getFixedPackForQuantity,
  getFixedPackOptions,
  getFixedPackPrice,
  getFixedPackUnitPrice,
  resolveScheduledSinglePrice,
} from '../src/utils/fixedPackPricing.js';

const temprano = {
  price: 19.90,
  tieredDiscount: [
    { actualQuantity: 1, label: '1 botella 500 ml', reservationPrice: 17.50, regularPrice: 19.90, priceEndsAt: '2026-10-26T22:59:59Z' },
    { actualQuantity: 3, label: 'Pack de 3', reservationPrice: 49.90, regularPrice: 56.70, priceEndsAt: '2026-10-26T22:59:59Z', featured: true },
    { actualQuantity: 6, label: 'Pack de 6', reservationPrice: 94.50, regularPrice: 107.40, priceEndsAt: '2026-10-26T22:59:59Z' },
    { actualQuantity: 12, label: 'Caja de 12', reservationPrice: 178.50, regularPrice: 202.80, priceEndsAt: '2026-10-26T22:59:59Z' },
  ],
};

test('shows the four fixed packs in ascending quantity', () => {
  assert.deepEqual(getFixedPackOptions(temprano).map((tier) => tier.actualQuantity), [1, 3, 6, 12]);
});

test('marks only the pack of three as recommended', () => {
  assert.deepEqual(
    getFixedPackOptions(temprano).filter((tier) => tier.featured).map((tier) => tier.actualQuantity),
    [3],
  );
});

test('uses the scheduled active price through 26 October Madrid and switches after the UTC deadline', () => {
  const reservationNow = Date.parse('2026-10-26T22:59:59Z');
  const regularNow = Date.parse('2026-10-26T23:00:00Z');
  assert.deepEqual(
    getFixedPackOptions(temprano).map((tier) => getFixedPackPrice(tier, reservationNow)),
    [17.50, 49.90, 94.50, 178.50],
  );
  assert.deepEqual(
    getFixedPackOptions(temprano).map((tier) => getFixedPackPrice(tier, regularNow)),
    [19.90, 56.70, 107.40, 202.80],
  );
  assert.equal(resolveScheduledSinglePrice(temprano, regularNow), 19.90);
});

test('uses a published normal fixed-pack price without a reservation marker', () => {
  const normalSale = {
    price: 19.90,
    tieredDiscount: [
      { actualQuantity: 1, price: 19.90, fixedPack: true },
      { actualQuantity: 3, price: 56.70, fixedPack: true },
      { actualQuantity: 6, price: 107.40, fixedPack: true },
      { actualQuantity: 12, price: 202.80, fixedPack: true },
    ],
  };

  assert.deepEqual(
    getFixedPackOptions(normalSale).map((tier) => getFixedPackPrice(tier)),
    [19.90, 56.70, 107.40, 202.80],
  );
  assert.equal(resolveScheduledSinglePrice(normalSale), 19.90);
});

test('pack price per bottle never rises with a larger fixed pack', () => {
  const now = Date.parse('2026-10-14T10:00:00Z');
  const unitPrices = getFixedPackOptions(temprano).map((tier) => getFixedPackUnitPrice(tier, now));
  assert.deepEqual(unitPrices.map((value) => Math.round(value * 10000)), [175000, 166333, 157500, 148750]);
  assert.ok(unitPrices.every((value, index) => index === 0 || value < unitPrices[index - 1]));
  assert.equal(getFixedPackForQuantity(temprano, 4), null);
});
