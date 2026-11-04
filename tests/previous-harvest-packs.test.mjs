import test from 'node:test';
import assert from 'node:assert/strict';
import { getFixedPackForQuantity, getFixedPackOptions, getFixedPackPrice, getFixedPackUnitPrice } from '../src/utils/fixedPackPricing.js';

const previousHarvest = {
  sku: 'MIKVET5002526',
  slug: 'aceite-temprano-sin-filtrar-cosecha-2025-26',
  price: 59.70,
  tieredDiscount: [
    { actualQuantity: 6, label: 'Pack de 6 botellas de 500 ml', price: 59.70 },
    { actualQuantity: 12, label: 'Caja de 12 botellas de 500 ml', price: 119.40 },
  ],
};

test('previous harvest has only closed packs of six and twelve with their authorised prices', () => {
  const options = getFixedPackOptions(previousHarvest);
  assert.deepEqual(options.map((tier) => tier.actualQuantity), [6, 12]);
  assert.deepEqual(options.map((tier) => getFixedPackPrice(tier)), [59.70, 119.40]);
  assert.deepEqual(options.map((tier) => Math.round(getFixedPackUnitPrice(tier) * 100)), [995, 995]);
  assert.equal(getFixedPackForQuantity(previousHarvest, 1), null);
  assert.equal(getFixedPackForQuantity(previousHarvest, 3), null);
  assert.equal(getFixedPackForQuantity(previousHarvest, 7), null);
});
