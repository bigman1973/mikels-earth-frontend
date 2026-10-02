import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (relativePath) => readFile(join(root, relativePath), 'utf8');

test('routes both confirmation paths to the real confirmation component', async () => {
  const [app, middleware] = await Promise.all([
    read('src/App.jsx'),
    read('middleware.js'),
  ]);

  assert.match(app, /path="\/order-success" element={<OrderSuccess\s*\/>}/);
  assert.match(app, /path="\/pedido-confirmado" element={<OrderSuccess\s*\/>}/);
  assert.match(app, /path="\/carrito" element={<CartRoute\s*\/>}/);
  assert.match(middleware, /\['\/pedido-confirmado', '\/order-success'\]/);
  assert.match(middleware, /destination\.search = requestUrl\.search/);
  assert.match(middleware, /shouldRenderSpaShell\(pathname\)/);
  const routePolicy = await read('src/utils/spaRoutes.js');
  for (const route of ['/carrito', '/checkout', '/order-success', '/pedido-confirmado']) {
    assert.match(routePolicy, new RegExp(`'${route}'`));
  }
});

test('confirmation page renders persisted order details and confirmation notice', async () => {
  const [page, receipt] = await Promise.all([
    read('src/pages/OrderSuccess.jsx'),
    read('src/components/orders/OrderReceipt.jsx'),
  ]);
  assert.match(page, /sessionData\?\.order\?\.receipt/);
  assert.match(page, /<OrderReceipt receipt=\{receipt\}>/);
  assert.doesNotMatch(page, /formatEuro|toFixed\(/);
  for (const detail of ['receipt.order_number', 'receipt.lines', 'total_display', 'shipping.lines', 'confirmation.sent']) {
    assert.match(receipt, new RegExp(detail.replace('.', '\\.')));
  }
  assert.match(page, /order_pending/);
  assert.match(page, /Estamos comprobando tu pedido/);
});

test('confirmation clears the cart only after a saved paid receipt is available', async () => {
  const [page, cart] = await Promise.all([
    read('src/pages/OrderSuccess.jsx'),
    read('src/context/CartContext.jsx'),
  ]);
  assert.match(page, /const receipt = sessionData\?\.order\?\.receipt/);
  assert.match(page, /if \(!sessionId \|\| !receipt \|\| clearedSessionRef\.current === sessionId\) return/);
  assert.match(page, /clearPaidOrderCart\(\)/);
  assert.match(cart, /const clearPaidOrderCart = \(\) =>/);
  assert.match(cart, /clearStoredCart\(window\.localStorage\)/);
});

test('stock controls retain a backend-enforced checkout boundary', async () => {
  const [cart, detail, card] = await Promise.all([
    read('src/context/CartContext.jsx'),
    read('src/pages/ProductDetail.jsx'),
    read('src/components/products/ProductCard.jsx'),
  ]);

  assert.match(cart, /Math\.min\(\s*sellableStock/);
  assert.match(cart, /stock: sellableStock/);
  assert.match(detail, /max=\{availableStock\}/);
  assert.match(detail, /product\.soldOut \|\| availableStock < 1/);
  assert.match(card, /const isSoldOut = product\.soldOut \|\| Number\(product\.stock \|\| 0\) < 1/);
});

test('reservation purchase surfaces use the saved reservation contract', async () => {
  const [detail, card, cart, emailTemplate] = await Promise.all([
    read('src/pages/ProductDetail.jsx'),
    read('src/components/products/ProductCard.jsx'),
    read('src/components/cart/CartDrawer.jsx'),
    read('../..//plantilla_ficha_pedido_klaviyo_2026-10-02.html'),
  ]);

  assert.match(detail, /product\.reservationOnly === true/);
  assert.match(detail, /Quedan \{availableStock\} de \{product\.reservationStockTotal \|\| 1080\}/);
  assert.match(detail, /isReservation \? 'Reservar'/);
  assert.match(card, /product\.reservationOnly \? 'Reservar'/);
  assert.match(cart, /Caja de 12: pagas 11 y recibes 12/);
  assert.match(emailTemplate, /event\.Receipt\.heading/);
});
