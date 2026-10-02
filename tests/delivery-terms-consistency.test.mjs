import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (relativePath) => readFile(join(root, relativePath), 'utf8');

const DELIVERY_TRANSIT = 'El transporte tarda entre 24 y 72 horas en España peninsular y Portugal, y puede ser superior en Baleares.';
const DELIVERY_NOTICE = 'Envío gratuito en península, Portugal y Baleares. En Baleares, pedido mínimo de 59 €. No enviamos a Canarias, Ceuta ni Melilla.';

test('terms section 7 reflects the published delivery policy without the superseded copy', async () => {
  const terms = await read('src/pages/Terms.jsx');

  for (const expected of [
    'Enviamos a España peninsular, Baleares y Portugal. No realizamos envíos a Canarias, Ceuta ni Melilla.',
    'Gastos de envío',
    'El envío es gratuito en España peninsular, Baleares y Portugal.',
    'En los envíos a Baleares, el importe mínimo del pedido es de 59 €.',
    'Plazo de entrega',
    'Preparamos su pedido en 1-2 días laborables.',
    DELIVERY_TRANSIT,
    'Recibirá un correo con el número de seguimiento cuando su pedido salga de nuestro almacén.',
    'Productos por reserva',
    'Algunos productos de temporada se ofrecen por reserva: se abonan en el momento de la compra y se envían en la fecha indicada en la ficha del producto, que se muestra siempre antes de finalizar la compra.',
  ]) {
    assert.match(terms, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.doesNotMatch(terms, /máximo 72 horas laborables desde la confirmación del pedido/);
  assert.doesNotMatch(terms, /gastos de envío se calculan según el peso y el destino/);
});

test('product pages surface the same delivery timing and destination notice', async () => {
  const [detail, spanish, english] = await Promise.all([
    read('src/pages/ProductDetail.jsx'),
    read('src/i18n/locales/es.json').then(JSON.parse),
    read('src/i18n/locales/en.json').then(JSON.parse),
  ]);

  assert.match(detail, /t\('product_detail\.shipping_time'\)/);
  assert.equal(
    spanish.product_detail.shipping_time,
    `Preparamos tu pedido en 1-2 días laborables. ${DELIVERY_TRANSIT}`,
  );
  assert.equal(english.product_detail.shipping_time, spanish.product_detail.shipping_time);
  assert.equal(spanish.delivery.notice, DELIVERY_NOTICE);
});
