import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/data/products.js';
import { normalizePromotionProtectedProduct } from '../src/utils/promotionProtection.js';

for (const [slug, price] of [['aceite-5l-caja-3', 43], ['paraguayo-almibar', 17.15]]) {
  test(`protected fallback ${slug} keeps the current full master price`, () => {
    const source = products.find((product) => product.slug === slug);
    assert.ok(source);
    assert.equal(source.price, price);
    const normalized = normalizePromotionProtectedProduct(source);
    assert.equal(normalized.price, price);
    assert.equal(normalized.subscriptionDiscount, undefined);
    assert.equal(normalized.tieredDiscount, undefined);
    assert.equal(normalized.volumeDiscount, undefined);
  });
}

test('private Black Friday packs are not inserted in the public fallback catalogue', () => {
  const draftSKUs = new Set(['BF26-TEMP6', 'BF26-TEMP12', 'BF26-ECO6', 'BF26-PARA3', 'BF26-PARA6', 'BF26-5L3']);
  assert.equal(products.some((product) => draftSKUs.has(product.sku)), false);
  assert.equal(products.some((product) => product.sku === 'MIKBIO19BF12'), false);
  assert.equal(products.some((product) => product.slug?.startsWith('black-friday-')), false);
});
