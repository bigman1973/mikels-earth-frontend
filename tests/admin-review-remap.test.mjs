import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pagePath = new URL('../src/pages/admin/AdminReviewRemap.jsx', import.meta.url);
const appPath = new URL('../src/App.jsx', import.meta.url);
const layoutPath = new URL('../src/components/admin/AdminLayout.jsx', import.meta.url);

test('admin review remap reads and writes only the protected remap endpoints', async () => {
  const page = await readFile(pagePath, 'utf8');
  assert.match(page, /api\/admin\/reviews\/verified/);
  assert.match(page, /api\/admin\/reviews\/remap-products/);
  assert.match(page, /expected_slug/);
  assert.match(page, /target_slug/);
  assert.match(page, /No se cambiarán texto, puntuación, estado ni verificación/);
  assert.doesNotMatch(page, /customer_email|review\.comment/);
});

test('admin review remap is reachable only through the admin application', async () => {
  const [app, layout] = await Promise.all([
    readFile(appPath, 'utf8'),
    readFile(layoutPath, 'utf8'),
  ]);
  assert.match(app, /path="\/admin\/resenas"/);
  assert.match(layout, /path: '\/admin\/resenas'/);
});
