import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (relativePath) => readFile(join(root, relativePath), 'utf8');

test('Meta Pixel remains disabled without consent or a configured data set', async () => {
  const pixel = await read('src/utils/metaPixel.js');
  assert.match(pixel, /VITE_META_PIXEL_ID/);
  assert.match(pixel, /window\.Cookiebot\?\.consent\?\.marketing === true/);
  assert.match(pixel, /fbq\('consent', 'revoke'\)/);
  assert.match(pixel, /fbq\('consent', 'grant'\)/);
  assert.match(pixel, /CookiebotOnConsentReady/);
  assert.match(pixel, /CookiebotOnAccept/);
  assert.match(pixel, /CookiebotOnDecline/);
  assert.match(pixel, /connect\.facebook\.net\/en_US\/fbevents\.js/);
});

test('Meta browser events use SKU catalog identity and euro values', async () => {
  const [pixel, cart, checkout, product] = await Promise.all([
    read('src/utils/metaPixel.js'),
    read('src/context/CartContext.jsx'),
    read('src/pages/Checkout.jsx'),
    read('src/pages/ProductDetail.jsx'),
  ]);

  for (const name of ['ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase']) {
    assert.ok(pixel.includes(`track('${name}'`));
  }
  assert.match(pixel, /content_ids/);
  assert.match(pixel, /content_type: 'product'/);
  assert.match(pixel, /currency: 'EUR'/);
  assert.match(cart, /sku: product\.sku \|\| ''/);
  assert.match(cart, /trackMetaAddToCart\(product, eventQuantity\)/);
  assert.match(checkout, /trackMetaInitiateCheckout\(cart, getCartTotal\(\), getItemPrice\)/);
  assert.match(product, /trackMetaViewContent\(product\)/);
});

test('Purchase is emitted from the persisted receipt with the order number as event ID', async () => {
  const [pixel, success, receipt] = await Promise.all([
    read('src/utils/metaPixel.js'),
    read('src/pages/OrderSuccess.jsx'),
    read('../mikels-earth-backend-stock-integrity-preview/src/services/order_receipt.py'),
  ]);

  assert.match(success, /trackMetaPurchase\(receipt\)/);
  assert.match(pixel, /eventID: orderNumber/);
  assert.match(pixel, /mikels:meta-purchase:\$\{orderNumber\}/);
  assert.match(receipt, /"sku": str\(item\.get\("sku"\) or ""\)/);
});
