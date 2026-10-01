import assert from 'node:assert/strict';
import test from 'node:test';
import { formatEuro } from '../src/utils/formatMoney.js';

test('formatEuro presents storefront prices with a decimal comma and euro sign', () => {
  assert.equal(formatEuro(17.15), '17,15 €');
  assert.equal(formatEuro('39.09'), '39,09 €');
  assert.equal(formatEuro(0), '0,00 €');
});
