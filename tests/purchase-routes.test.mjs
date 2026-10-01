import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { SPA_SHELL_ROUTES, shouldRenderSpaShell } from '../src/utils/spaRoutes.js';

test('direct purchase-flow routes receive the React shell instead of a platform 404', async () => {
  for (const path of ['/carrito', '/checkout', '/order-success', '/subscription-success', '/horeca']) {
    assert.equal(SPA_SHELL_ROUTES.has(path), true, `${path} must be a SPA-shell route`);
    assert.equal(shouldRenderSpaShell(path), true, `${path} must render the SPA shell`);
  }
  assert.equal(shouldRenderSpaShell('/tienda'), false);
  assert.equal(shouldRenderSpaShell('/producto/paraguayo-almibar'), false);
});

test('the cart URL opens the existing side-panel without redirecting the customer', async () => {
  const [cartRoute, app] = await Promise.all([
    readFile(new URL('../src/pages/CartRoute.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(cartRoute, /useEffect\(\(\) => \{\s*setIsCartOpen\(true\);/);
  assert.match(app, /<Route path="\/carrito" element=\{<CartRoute \/>\}/);
});
