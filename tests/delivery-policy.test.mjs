import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { BALEARES_MINIMUM_ORDER, deliveryEligibility } from '../src/utils/deliveryPolicy.js';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (relativePath) => readFile(join(root, relativePath), 'utf8');

const notice = 'Envío gratuito en península, Portugal y Baleares. En Baleares, pedido mínimo de 59 €. No enviamos a Canarias, Ceuta ni Melilla.';

test('delivery policy allows peninsular Spain and Portugal', () => {
  assert.deepEqual(
    deliveryEligibility({ country: 'España', postalCode: '25003', orderTotal: 1 }),
    { eligible: true, countryCode: 'ES' },
  );
  assert.deepEqual(
    deliveryEligibility({ country: 'Portugal', postalCode: '4000-001', orderTotal: 1 }),
    { eligible: true, countryCode: 'PT' },
  );
});

test('delivery policy blocks unserved Spanish prefixes and France', () => {
  for (const postalCode of ['35001', '38001', '51001', '52001']) {
    const result = deliveryEligibility({ country: 'España', postalCode, orderTotal: 100 });
    assert.equal(result.eligible, false);
    assert.equal(result.code, 'DESTINATION_NOT_SERVED');
  }
  assert.equal(
    deliveryEligibility({ country: 'Francia', postalCode: '75001', orderTotal: 100 }).code,
    'DESTINATION_NOT_SERVED',
  );
});

test('Baleares only becomes eligible from the published final order minimum', () => {
  assert.equal(BALEARES_MINIMUM_ORDER, 59);
  assert.equal(
    deliveryEligibility({ country: 'España', postalCode: '07001', orderTotal: 58.99 }).code,
    'BALEARES_MINIMUM_ORDER',
  );
  assert.deepEqual(
    deliveryEligibility({ country: 'España', postalCode: '07001', orderTotal: 59 }).eligible,
    true,
  );
});

test('the exact notice is shown before checkout in product, cart and checkout views', async () => {
  const [detail, cart, checkout, spanish, english] = await Promise.all([
    read('src/pages/ProductDetail.jsx'),
    read('src/components/cart/CartDrawer.jsx'),
    read('src/pages/Checkout.jsx'),
    read('src/i18n/locales/es.json').then(JSON.parse),
    read('src/i18n/locales/en.json').then(JSON.parse),
  ]);

  for (const source of [detail, cart, checkout]) assert.match(source, /t\('delivery\.notice'\)/);
  assert.equal(spanish.delivery.notice, notice);
  assert.equal(english.delivery.notice, notice);
  assert.match(checkout, /deliveryEligibility\(/);
  assert.match(checkout, /<option value="España">/);
  assert.match(checkout, /<option value="Portugal">Portugal<\/option>/);
  assert.doesNotMatch(checkout, /<option value="Francia">/);
});
