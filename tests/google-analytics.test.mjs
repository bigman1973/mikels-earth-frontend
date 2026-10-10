import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (relativePath) => readFile(join(root, relativePath), 'utf8');

test('GA4 requires explicit Cookiebot statistics consent and an environment ID', async () => {
  const [analytics, component, env] = await Promise.all([
    read('src/utils/googleAnalytics.js'),
    read('src/components/GoogleAnalytics.jsx'),
    read('.env.example'),
  ]);

  assert.match(analytics, /VITE_GA_MEASUREMENT_ID/);
  assert.match(analytics, /consent\?\.method === 'explicit'/);
  assert.match(analytics, /consent\?\.statistics === true/);
  assert.match(analytics, /googletagmanager\.com\/gtag\/js/);
  assert.match(analytics, /analytics_storage: 'denied'/);
  assert.match(analytics, /analytics_storage: 'granted'/);
  assert.match(component, /registerGA4ConsentListeners/);
  assert.match(env, /^VITE_GA_MEASUREMENT_ID=$/m);
});

test('GA4 ecommerce events use the web SKU and the saved receipt', async () => {
  const [analytics, cart, checkout, product, success, app] = await Promise.all([
    read('src/utils/googleAnalytics.js'),
    read('src/context/CartContext.jsx'),
    read('src/pages/Checkout.jsx'),
    read('src/pages/ProductDetail.jsx'),
    read('src/pages/OrderSuccess.jsx'),
    read('src/App.jsx'),
  ]);

  for (const eventName of ['view_item', 'add_to_cart', 'begin_checkout', 'purchase']) {
    assert.ok(analytics.includes(`track('${eventName}'`));
  }
  assert.match(analytics, /item_id: itemId/);
  assert.match(analytics, /transaction_id: transactionId/);
  assert.match(cart, /trackGA4AddToCart\(product, eventQuantity\)/);
  assert.match(checkout, /trackGA4BeginCheckout\(cart, getCartTotal\(\), getItemPrice\)/);
  assert.match(product, /trackGA4ViewItem\(product\)/);
  assert.match(success, /trackGA4Purchase\(receipt\)/);
  assert.match(app, /<GoogleAnalytics\s*\/>/);
});
