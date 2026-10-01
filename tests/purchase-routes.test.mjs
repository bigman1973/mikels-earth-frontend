import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { SPA_SHELL_ROUTES, shouldRenderSpaShell } from '../src/utils/spaRoutes.js';

test('direct canonical purchase-flow routes receive the React shell instead of a platform 404', async () => {
  for (const path of ['/carrito', '/checkout', '/pedido-confirmado', '/suscripcion-exitosa', '/horeca']) {
    assert.equal(SPA_SHELL_ROUTES.has(path), true, `${path} must be a SPA-shell route`);
    assert.equal(shouldRenderSpaShell(path), true, `${path} must render the SPA shell`);
  }
  assert.equal(shouldRenderSpaShell('/tienda'), false);
  assert.equal(shouldRenderSpaShell('/producto/paraguayo-almibar'), false);
});

test('legacy English completion URLs redirect permanently to their Spanish canonical routes', async () => {
  const [app, middleware] = await Promise.all([
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../middleware.js', import.meta.url), 'utf8'),
  ]);

  assert.match(app, /<Route path="\/pedido-confirmado" element=\{<OrderSuccess \/>\}/);
  assert.match(app, /<Route path="\/suscripcion-exitosa" element=\{<SubscriptionSuccess \/>\}/);
  assert.match(middleware, /\['\/order-success', '\/pedido-confirmado'\]/);
  assert.match(middleware, /\['\/subscription-success', '\/suscripcion-exitosa'\]/);
  assert.match(middleware, /destination\.search = requestUrl\.search/);
});

test('the cart URL opens the existing side-panel without redirecting the customer', async () => {
  const [cartRoute, app] = await Promise.all([
    readFile(new URL('../src/pages/CartRoute.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(cartRoute, /useEffect\(\(\) => \{\s*setIsCartOpen\(true\);/);
  assert.match(app, /<Route path="\/carrito" element=\{<CartRoute \/>\}/);
});
