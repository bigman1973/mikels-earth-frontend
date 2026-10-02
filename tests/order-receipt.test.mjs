import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

const source = (relativePath) => readFile(resolve(root, relativePath), 'utf8');

test('order confirmation renders the saved receipt rather than recalculating it', async () => {
  const page = await source('src/pages/OrderSuccess.jsx');
  const receipt = await source('src/components/orders/OrderReceipt.jsx');

  assert.match(page, /<OrderReceipt receipt=\{receipt\}>/);
  assert.match(page, /sessionData\?\.order\?\.receipt/);
  assert.doesNotMatch(page, /toFixed\(/);
  assert.match(receipt, /subtotal_display/);
  assert.match(receipt, /shipping_display/);
  assert.match(receipt, /total_display/);
  assert.match(receipt, /IVA incluido/);
  assert.doesNotMatch(receipt, /tax_display/);
  assert.match(receipt, /GRATIS/);
  assert.match(receipt, /Teléfono:/);
  assert.match(receipt, /Datos de factura/);
  assert.match(receipt, /Recibirás la factura con el desglose de IVA en un correo aparte/);
  assert.match(receipt, /Te hemos enviado la confirmación/);
});

test('order confirmation shows a saved coupon reduction before shipping', async () => {
  const receipt = await source('src/components/orders/OrderReceipt.jsx');

  assert.match(receipt, /totals\.discount/);
  assert.match(receipt, /totals\.discount_label/);
  assert.match(receipt, /-\{totals\.discount_display\}/);
});
