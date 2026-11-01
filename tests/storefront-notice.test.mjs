import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (relativePath) => readFile(join(root, relativePath), 'utf8');

test('ProductDetail places a safe storefront notice before the product title', async () => {
  const detail = await read('src/pages/ProductDetail.jsx');
  const noticeIndex = detail.indexOf('{storefrontNotice && (');
  const titleIndex = detail.indexOf('<h1 className="text-3xl md:text-4xl font-medium text-primary mb-2">');

  assert.ok(noticeIndex >= 0, 'ProductDetail debe renderizar storefrontNotice cuando exista');
  assert.ok(titleIndex >= 0, 'ProductDetail debe contener el título del producto');
  assert.ok(noticeIndex < titleIndex, 'el aviso debe aparecer antes del título del producto');
  assert.match(detail, /<Link\s+to="\/producto\/aceite-temprano-sin-filtrar"/);
  assert.match(detail, /\{storefrontNoticeLinkText\}/);
  assert.doesNotMatch(detail, /dangerouslySetInnerHTML/);
});
