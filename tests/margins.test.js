import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateMargins } from '../src/utils/margins.js';

test('uses the supplied 10% master tax to derive the commercial base', () => {
  const margin = calculateMargins({
    priceWithVat: 19.90,
    cost: 6.73,
    vatRate: 0.10,
    shippingCost: 0,
    preparationCost: 0,
  });

  assert.ok(margin);
  assert.equal(Number(margin.baseWithoutVat.toFixed(2)), 18.09);
  assert.equal(Number(margin.grossAmount.toFixed(2)), 11.36);
});

test('does not silently treat missing or mixed IVA as 4%', () => {
  const missingTax = calculateMargins({
    priceWithVat: 19.90,
    cost: 6.73,
    vatRate: null,
  });
  const mixedTax = calculateMargins({
    priceWithVat: 94.20,
    cost: 38.13,
    vatRate: undefined,
  });

  assert.equal(missingTax, null);
  assert.equal(mixedTax, null);
});
