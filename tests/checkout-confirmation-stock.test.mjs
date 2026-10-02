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
  const page = await read('src/pages/OrderSuccess.jsx');
  for (const requiredDetail of [
    'order.order_number',
    'order.items',
    'order.total',
    'shipping_address',
    'confirmation_sent',
  ]) {
    assert.match(page, new RegExp(requiredDetail.replace('.', '\\.')));
  }
  assert.match(page, /formatEuro/);
  assert.match(page, /order_pending/);
  assert.match(page, /Estamos comprobando tu pedido/);
  assert.match(page, /sessionData\.confirmation_sent/);
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
