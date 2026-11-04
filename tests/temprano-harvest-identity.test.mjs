import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getTempranoHarvestIdentity, normalizeTempranoHarvestName } from '../src/utils/tempranoHarvestIdentity.js';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';
import { getProductSeoContent } from '../src/seo/metadata.js';
import { CART_STORAGE_KEY, loadStoredCart } from '../src/utils/cartStorage.js';
import { normalizeReservationSaleProduct } from '../src/utils/reservationSale.js';
import { normalizePromotionProtectedCartItem } from '../src/utils/promotionProtection.js';
import { getFixedPackForQuantity, getFixedPackOptions, getFixedPackPrice } from '../src/utils/fixedPackPricing.js';
import { getVolumeDiscountedUnitPrice } from '../src/utils/volumePricing.js';

const previous = {
  id: 2526,
  sku: 'MIKVET5002526',
  slug: 'aceite-temprano-sin-filtrar-cosecha-2025-26',
  name: 'Aceite temprano sin filtrar',
  price: 59.70,
  quantity: 6,
  purchaseType: 'one-time',
  selectedVariant: null,
  tieredDiscountConfig: [
    { actualQuantity: 6, label: 'Pack de 6 botellas de 500 ml', price: 59.70 },
    { actualQuantity: 12, label: 'Caja de 12 botellas de 500 ml', price: 119.40 },
  ],
};
const current = {
  id: 6,
  sku: 'MIKVET500',
  slug: 'aceite-temprano-sin-filtrar',
  name: 'Aceite temprano sin filtrar',
  price: 19.90,
  quantity: 1,
  purchaseType: 'one-time',
};
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

for (const [product, harvest] of [[previous, '2025/26'], [current, '2026/27']]) {
  test(`restores the full ${harvest} name using exact SKU or legacy slug without changing fields`, () => {
    const expected = harvest === '2025/26'
      ? 'Aceite de Oliva Virgen Extra Temprano sin filtrar · Cosecha 2025/26'
      : 'Aceite de oliva virgen extra Temprano 2026/27 sin filtrar';
    assert.deepEqual(normalizeTempranoHarvestName(product), { ...product, name: expected });
    const { sku: _sku, ...legacy } = product;
    assert.equal(normalizeTempranoHarvestName(legacy).name, expected);
    assert.equal(normalizeTempranoHarvestName({ sku: ` ${product.sku.toLowerCase()} ` }).name, expected);
    const normalized = normalizeTempranoHarvestName(product);
    assert.equal(normalizeTempranoHarvestName(normalized), normalized);
    assert.equal('image' in normalized, false);
    assert.equal('images' in normalized, false);
  });
}

test('explicit SKU wins over reused slug and no loose name, prefix, ID or variant match is allowed', () => {
  assert.equal(getTempranoHarvestIdentity({ ...previous, slug: current.slug }).sku, previous.sku);
  assert.equal(getTempranoHarvestIdentity({ ...current, slug: previous.slug }).sku, current.sku);
  for (const item of [
    { sku: 'MIKVET500R', slug: current.slug, name: 'Pack Temprano' },
    { sku: 'MIKVET5002526BF', slug: previous.slug, name: 'Pack BF' },
    { slug: `${previous.slug}-extra`, name: previous.name },
    { id: current.id, name: 'Temprano 2025/26', selectedVariant: '2025/26' },
    null,
  ]) {
    assert.equal(getTempranoHarvestIdentity(item), undefined);
    assert.equal(normalizeTempranoHarvestName(item), item);
  }
});

test('old editorial and SEO names keep the old harvest and never inherit new harvest content or image', () => {
  const product = { ...previous, active: false, visibleInStore: false, available: false,
    description: 'Descripción original 2025/26', longDescription: 'Texto original 2025/26' };
  const editorial = applyEditorialOverrides(product);
  const seo = getProductSeoContent(product);
  assert.equal(editorial.name, 'Aceite de Oliva Virgen Extra Temprano sin filtrar · Cosecha 2025/26');
  assert.equal(seo.name, editorial.name);
  for (const key of ['active', 'visibleInStore', 'available', 'price', 'sku', 'slug', 'selectedVariant', 'tieredDiscountConfig']) {
    assert.deepEqual(editorial[key], product[key], key);
  }
  assert.equal(editorial.description, product.description);
  assert.equal(editorial.longDescription, product.longDescription);
  assert.equal(seo.description, product.description);
  assert.equal(seo.longDescription, product.longDescription);
  assert.equal('image' in editorial, false);
  assert.equal('images' in editorial, false);
});

test('persisted legacy carts restore both full names without merging independent articles or repricing packs', () => {
  const stored = [previous, current];
  const cart = loadStoredCart({ getItem: (key) => key === CART_STORAGE_KEY ? JSON.stringify(stored) : null })
    .map(normalizeReservationSaleProduct)
    .map(normalizePromotionProtectedCartItem)
    .map(normalizeTempranoHarvestName);
  assert.equal(cart.length, 2);
  assert.match(cart[0].name, /2025\/26/);
  assert.match(cart[1].name, /2026\/27/);
  assert.equal(cart[0].sku, previous.sku);
  assert.equal(cart[1].sku, current.sku);
  assert.equal(cart[0].price, previous.price);
  assert.deepEqual(cart[0].tieredDiscountConfig, previous.tieredDiscountConfig);
  assert.equal(Math.round(getVolumeDiscountedUnitPrice(cart[0], 6) * 6 * 100), 5970);
  assert.equal(Math.round(getVolumeDiscountedUnitPrice(cart[0], 12) * 12 * 100), 11940);
  assert.equal(getVolumeDiscountedUnitPrice(cart[1], 1), 19.90);
});

test('old card default is its published six-bottle pack, not a unit or a new price', () => {
  const pack = getFixedPackOptions(previous)[0];
  assert.equal(pack.actualQuantity, 6);
  assert.equal(getFixedPackPrice(pack), 59.70);
  assert.equal(getFixedPackForQuantity(previous, 1), null);
  assert.deepEqual(getFixedPackOptions(current), []);
});

test('real UI preserves full harvest titles and the cart normalizes both entry paths', async () => {
  const [card, drawer, checkout, context, recovery, detail, stripe] = await Promise.all([
    read('src/components/products/ProductCard.jsx'), read('src/components/cart/CartDrawer.jsx'),
    read('src/pages/Checkout.jsx'), read('src/context/CartContext.jsx'),
    read('src/pages/RecoverCart.jsx'), read('src/pages/ProductDetail.jsx'), read('src/services/stripeService.js'),
  ]);
  for (const source of [card, drawer, detail]) {
    assert.match(source, /getTempranoHarvestIdentity\([\w]+\) \? 'whitespace-normal break-words' : 'line-clamp-2'/);
  }
  assert.match(card, /normalizeTempranoHarvestName\(product\)/);
  assert.match(card, /isPreviousHarvest \? getFixedPackOptions\(product\)\[0\] : null/);
  assert.match(card, /addToCart\(product, cardQuantity\)/);
  assert.match(card, /disabled=\{!cardQuantity\}/);
  assert.match(context, /\.map\(normalizeTempranoHarvestName\)/);
  assert.match(context, /const cartProduct = normalizeTempranoHarvestName\(/);
  assert.match(context, /getTempranoHarvestIdentity\(item\)\?\.sku === harvestIdentity.sku/);
  assert.match(recovery, /sku: item.sku \|\| ''/);
  assert.match(checkout, /<h3 className="whitespace-normal break-words font-semibold text-primary text-sm">\s*\{item.name\}/);
  assert.match(checkout, /name: item.name/);
  assert.match(stripe, /name: item.name/);
});
