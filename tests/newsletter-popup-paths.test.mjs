import assert from 'node:assert/strict';
import test from 'node:test';
import { isNewsletterPopupAllowedPath } from '../src/utils/newsletterPopupPaths.js';

test('newsletter popup is limited to editorial and brand pages', () => {
  for (const path of ['/blog', '/blog/aceite-temprano', '/la-familia', '/nuestra-tierra', '/recetario']) {
    assert.equal(isNewsletterPopupAllowedPath(path), true, `${path} should be eligible`);
  }
  for (const path of ['/', '/tienda', '/producto/paraguayo-almibar', '/carrito', '/checkout', '/opiniones']) {
    assert.equal(isNewsletterPopupAllowedPath(path), false, `${path} should be excluded`);
  }
});
