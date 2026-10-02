import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import {
  rememberScrollPosition,
  resetScrollPositions,
  scrollTargetForNavigation,
} from '../src/utils/navigationScroll.js';

const source = (path) => readFileSync(resolve(process.cwd(), path), 'utf8');

test('new route navigation starts at the top while browser history restores its saved position', () => {
  resetScrollPositions();
  rememberScrollPosition('shop-entry', { left: 0, top: 1840 });

  assert.deepEqual(scrollTargetForNavigation('PUSH', 'product-entry'), { left: 0, top: 0 });
  assert.deepEqual(scrollTargetForNavigation('REPLACE', 'checkout-entry'), { left: 0, top: 0 });
  assert.deepEqual(scrollTargetForNavigation('POP', 'shop-entry'), { left: 0, top: 1840 });
  assert.equal(scrollTargetForNavigation('POP', 'initial-entry'), null);
});

test('global scroll restoration records each location and uses manual browser restoration', () => {
  const component = source('src/components/ScrollRestoration.jsx');
  const app = source('src/App.jsx');

  assert.match(component, /useLocation\(\)/);
  assert.match(component, /useNavigationType\(\)/);
  assert.match(component, /window\.history\.scrollRestoration = 'manual'/);
  assert.match(component, /window\.scrollTo\(target\.left, target\.top\)/);
  assert.match(component, /rememberScrollPosition\(location\.key/);
  assert.match(app, /<ScrollRestoration\s*\/>/);
});

test('featured product calls to action open their matching product details', () => {
  const home = source('src/pages/Home.jsx');
  const featured = home.slice(home.indexOf('{/* Productos Destacados */}'), home.indexOf('{/* Compromiso Social */}'));

  for (const route of [
    '/producto/paraguayo-almibar',
    '/producto/aceite-temprano-sin-filtrar',
    '/producto/pack-mermelada-aceites',
  ]) {
    assert.match(featured, new RegExp(`link: '${route}'`));
  }

  assert.match(featured, /to=\{product\.link\}/);
  assert.doesNotMatch(featured, /to="\/nuestras-joyas"/);
});
