import assert from 'node:assert/strict';
import test from 'node:test';
import { CART_STORAGE_KEY, loadStoredCart } from '../src/utils/cartStorage.js';

const createStorage = (initialValue) => ({
  getItem: (key) => (key === CART_STORAGE_KEY ? initialValue : null),
});

test('loads a persisted cart before the first render', () => {
  const cart = [{ id: 6, name: 'Aceite', quantity: 1, price: 17.15 }];

  assert.deepEqual(
    loadStoredCart(createStorage(JSON.stringify(cart))),
    cart,
  );
});

test('returns an empty cart for absent, malformed, or non-array data', () => {
  assert.deepEqual(loadStoredCart(createStorage(null)), []);
  assert.deepEqual(loadStoredCart(createStorage('{invalid json')), []);
  assert.deepEqual(loadStoredCart(createStorage('{"id": 6}')), []);
});
