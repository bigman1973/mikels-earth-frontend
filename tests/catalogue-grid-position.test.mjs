import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { sortCatalogueProducts, getCataloguePosition, positionOnlyPayload } from '../src/utils/cataloguePosition.js';
import { INDEPENDENT_PACKS } from '../src/utils/independentPacks.js';
import { products } from '../src/data/products.js';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';
import { isListedProduct } from '../src/utils/productAccess.js';
import { formatEuro } from '../src/utils/formatMoney.js';
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const order = ['BF26-TEMP6', 'BF26-ECO6', 'BF26-PARA3', 'BF26-TEMP12', 'BF26-PARA6', 'BF26-5L3', 'MIKVET500'];
const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');
const bundle = async (entry) => (await build({
  entryPoints: [new URL('../' + entry, import.meta.url).pathname], bundle: true,
  platform: 'node', format: 'cjs', write: false, jsx: 'automatic', define: { 'import.meta.env': '{}' },
  external: ['react', 'react/jsx-runtime', 'react-router-dom', 'react-i18next', 'framer-motion', 'lucide-react', '../../context/CartContext', '../../context/AdminAuthContext'],
})).outputFiles[0].text;
const cardBundle = await bundle('src/components/products/ProductCard.jsx');
const editorBundle = await bundle('src/components/admin/ProductEditor.jsx');
const jsx = (type, props) => ({ type, props: props || {} });
const nodes = (root) => root == null ? [] : Array.isArray(root) ? root.flatMap(nodes) : typeof root !== 'object' ? [] : [root, ...nodes(root.props?.children)];
const text = (root) => root == null ? '' : Array.isArray(root) ? root.map(text).join(' ') : typeof root !== 'object' ? String(root) : text(root.props?.children);
const runtime = (code, react = {}, authFetch = () => {}) => {
  const exports = {};
  const context = vm.createContext({
    exports, module: { exports }, console, setTimeout, clearTimeout,
    require: (name) => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
      if (name === 'react-router-dom') return { Link: 'a' };
      if (name === 'react-i18next') return { useTranslation: () => ({ t: (key, fallback) => fallback || key }) };
      if (name === 'framer-motion') return { motion: { article: 'article' } };
      if (name === 'lucide-react') return { ShoppingCart: 'svg', Tag: 'svg' };
      if (name.includes('CartContext')) return { useCart: () => ({ addToCart() {}, setIsCartOpen() {} }) };
      if (name.includes('AdminAuthContext')) return { useAdminAuth: () => ({ authFetch }) };
      throw new Error('Unexpected external: ' + name);
    },
  });
  vm.runInContext(code, context);
  return context.module.exports.default;
};
const ProductCard = runtime(cardBundle);
const ordinary = { id: 1, sku: 'GENERIC-ORDINARY', slug: 'generic-ordinary', name: 'Producto genérico', price: 10, available: true, inPromotion: false };
const fixturePack = (pack, index) => ({ ...pack, name: pack.name || 'Pack autorizado ' + pack.sku, id: 50 - index, displayOrder: order.indexOf(pack.sku) + 1, inPromotion: true, available: true, active: true, visibleInStore: true });

test('exact seven-item order comes from positions, not SKU, followed by stable rest', () => {
  const fixtures = [...INDEPENDENT_PACKS.map(fixturePack), { ...ordinary, sku: 'MIKVET500', displayOrder: 7, id: 99 },
    { ...ordinary, sku: 'REST-100', displayOrder: 100, id: 2 }, { ...ordinary, sku: 'UNRANKED', id: 3 }];
  const shuffled = fixtures.toReversed();
  const copy = [...shuffled];
  assert.deepEqual(sortCatalogueProducts(shuffled).map((p) => p.sku), [...order, 'REST-100', 'UNRANKED']);
  assert.deepEqual(shuffled, copy, 'never mutates hook/API arrays');
  const arbitrary = [{ id: 9, sku: 'FUTURE', displayOrder: 1 }, { id: 8, sku: 'BF26-TEMP6', displayOrder: 10 }];
  assert.equal(sortCatalogueProducts(arbitrary)[0].sku, 'FUTURE', 'no hardcoded campaign ranking');
  assert.deepEqual(sortCatalogueProducts(arbitrary.filter((p) => p.id === 8)).map((p) => p.sku), ['BF26-TEMP6']);
});

test('missing/null/zero/invalid positions follow positive ranks and equal ranks tie by ID', () => {
  const input = [{ id: 8, displayOrder: 0 }, { id: 7, displayOrder: null }, { id: 6 }, { id: 5, displayOrder: -1 },
    { id: 4, displayOrder: '1' }, { id: 3, displayOrder: 4 }, { id: 2, displayOrder: 4 }, { id: 1, displayOrder: 200 }];
  assert.deepEqual(sortCatalogueProducts(input).map((p) => p.id), [2, 3, 1, 4, 5, 6, 7, 8]);
  assert.deepEqual(sortCatalogueProducts([{ name: 'b' }, { name: 'a' }]).map((p) => p.name), ['b', 'a']);
  for (const value of [undefined, null, 0, -1, '1', 1.1, true, 2147483648]) assert.equal(getCataloguePosition({ displayOrder: value }), null);
});

test('positions never make an inactive/hidden product public and local fallback publishes none of the six', () => {
  for (const pack of INDEPENDENT_PACKS) {
    assert.equal(isListedProduct({ ...fixturePack(pack, 0), active: false }), false);
    assert.equal(isListedProduct({ ...fixturePack(pack, 0), visibleInStore: false }), false);
    assert.equal(products.some((p) => p.sku === pack.sku), false);
  }
});

test('real card badge uses strict generic promotion flag, never SKU or persisted badge text', () => {
  const staleBadgeTexts = ['BLACK FRIDAY · PACK', 'BLACK FRIDAY · 26'];
  for (const sku of ['FUTURE-PROMO-NOT-BF', 'BF26-TEMP6', 'MIKVET500']) {
    for (const flag of [false, undefined, null, 'true', 1]) {
      for (const staleText of staleBadgeTexts) {
        const card = ProductCard({ product: { ...ordinary, sku, inPromotion: flag, badges: [{ text: staleText }] } });
        assert.doesNotMatch(text(card), /BLACK FRIDAY/, sku + ':' + flag + ':' + staleText);
      }
    }
    for (const badges of [undefined, [{ text: 'ANTES 999 €' }], ...staleBadgeTexts.map((value) => [{ text: value }])]) {
      const image = '/images/products/generic-ordinary.webp';
      const card = ProductCard({ product: { ...ordinary, sku, image, inPromotion: true, badges } });
      const badgeNodes = nodes(card).filter((n) => n.type === 'span' && text(n) === 'BLACK FRIDAY · 26');
      assert.equal(badgeNodes.length, 1, 'exact new label once when strict flag is true');
      assert.equal(card.props.children.includes(badgeNodes[0]), true, 'badge remains separate from the image/link');
      assert.equal(badgeNodes[0].props.style?.fontFamily, undefined, 'no inline font override');
      assert.doesNotMatch(badgeNodes[0].props.className, /font-(?:sans|serif|mono|\[)/, 'inherit existing Montserrat font');
      assert.doesNotMatch(text(card), /BLACK FRIDAY · PACK/);
      assert.deepEqual(nodes(card).filter((n) => n.type === 'img').map((n) => n.props.src), [image], 'product image remains unchanged, never a badge image');
    }
  }
});

test('disabled promotion skips both stale badge literals and preserves the next ordinary badge', () => {
  for (const staleText of ['BLACK FRIDAY · PACK', 'BLACK FRIDAY · 26', 'black friday·pack', 'black friday·26']) {
    const card = ProductCard({ product: { ...ordinary, inPromotion: false, badges: [{ text: staleText }, { text: 'Destacado' }] } });
    assert.doesNotMatch(text(card), /BLACK FRIDAY/i);
    assert.equal(nodes(card).filter((n) => n.type === 'span' && text(n) === 'Destacado').length, 1);
  }
  const card = ProductCard({ product: { ...ordinary, inPromotion: false, badges: [{ text: 'BLACK FRIDAY · PACK' }, { text: 'BLACK FRIDAY · 26' }, { text: 'Destacado' }] } });
  assert.doesNotMatch(text(card), /BLACK FRIDAY/);
  assert.equal(nodes(card).filter((n) => n.type === 'span' && text(n) === 'Destacado').length, 1);
});

test('all six real cards show literal badge, approved price and full harvest names without rebates', () => {
  for (const [index, pack] of INDEPENDENT_PACKS.entries()) {
    const product = applyEditorialOverrides({ ...fixturePack(pack, index), originalPrice: 999, badges: [{ text: '-50 %' }, { text: 'Antes 999 € / ahora 10 €' }] });
    const card = ProductCard({ product });
    const cardText = text(card);
    assert.match(cardText, /BLACK FRIDAY · 26/);
    assert.equal(cardText.includes(formatEuro(pack.price)), true, 'preserve exact approved pack price');
    assert.doesNotMatch(cardText, /%|antes|ahora|rebaja|descuento|oferta|999/i);
    assert.equal(nodes(card).some((n) => n.type === 's' || n.type === 'del'), false);
    if (pack.harvest) {
      const heading = nodes(card).find((n) => n.type === 'h3');
      assert.equal(text(heading), pack.name);
      assert.doesNotMatch(heading.props.className, /line-clamp/);
    }
  }
  const current = ProductCard({ product: applyEditorialOverrides({ ...ordinary, sku: 'MIKVET500', slug: 'aceite-temprano-sin-filtrar' }) });
  assert.match(text(nodes(current).find((n) => n.type === 'h3')), /2026\/27/);
  assert.doesNotMatch(text(current), /BLACK FRIDAY/);
});

test('position parser sends only integer or null, without implicit zero/coercion', () => {
  assert.deepEqual(positionOnlyPayload('7'), { displayOrder: 7 });
  assert.deepEqual(positionOnlyPayload(''), { displayOrder: null });
  for (const value of ['0', '-1', '1.5', '1e2', ' ', '3x', '2147483648', true]) assert.throws(() => positionOnlyPayload(value));
});

const editorHarness = async ({ detail = {}, fallback = {}, detailFails = false } = {}) => {
  const slots = [], effects = [], calls = [];
  let index = 0, dirty = true, tree;
  const react = {
    useState: (initial) => { const slot = index++; if (!(slot in slots)) slots[slot] = typeof initial === 'function' ? initial() : initial; return [slots[slot], (value) => { slots[slot] = typeof value === 'function' ? value(slots[slot]) : value; dirty = true; }]; },
    useRef: (initial) => { const slot = index++; if (!(slot in slots)) slots[slot] = { current: initial }; return slots[slot]; },
    useEffect: (fn, deps) => { const slot = index++; if (!slots[slot] || deps.some((dep, i) => dep !== slots[slot][i])) { slots[slot] = deps; effects.push(fn); } },
  };
  const base = { ...ordinary, id: 42, category: 'Packs', stock: 12, active: false, visibleInStore: false };
  const product = { ...base, ...fallback };
  const Editor = runtime(editorBundle, react, async (url, options = {}) => {
    calls.push({ url, options });
    if (!options.method && detailFails) throw new Error('local failure');
    return { ok: true, json: async () => options.method ? { success: true } : { ...base, ...detail } };
  });
  const render = () => {
    for (let i = 0; dirty && i < 20; i++) { index = 0; dirty = false; tree = Editor({ product, onSaved() {}, onClose() {} }); while (effects.length) effects.shift()(); }
    assert.equal(dirty, false);
    return tree;
  };
  const flush = async () => { for (let i = 0; i < 5; i++) { render(); await new Promise((done) => setImmediate(done)); } return render(); };
  await flush();
  const button = (label) => nodes(render()).find((n) => n.type === 'button' && text(n).includes(label));
  button('Detalles').props.onClick(); render();
  return { render, flush, calls, button, input: () => nodes(render()).find((n) => n.props.id === 'catalogue-position') };
};

test('real editor saves position-only partial payload and clear-null, never flags/price/stock', async () => {
  const harness = await editorHarness({ detail: { displayOrder: 7 } });
  assert.equal(harness.input().props.value, '7');
  assert.equal(harness.button('Guardar solo posición').props.disabled, true);
  for (const [input, expected] of [['3', 3], ['', null]]) {
    harness.input().props.onChange({ target: { value: input } }); harness.render();
    await harness.button('Guardar solo posición').props.onClick(); await harness.flush();
    const write = harness.calls.at(-1);
    assert.equal(write.options.method, 'PUT');
    assert.match(write.url, /\/api\/admin\/web-products\/42$/);
    assert.deepEqual(JSON.parse(write.options.body), { displayOrder: expected });
  }
});

test('real editor rejects invalid positions and does not silently truncate fractions', async () => {
  const harness = await editorHarness({ detail: { displayOrder: 7 } });
  for (const value of ['0', '-1', '2.5', '2abc', '1e3']) {
    harness.input().props.onChange({ target: { value } }); harness.render();
    await harness.button('Guardar solo posición').props.onClick(); await harness.flush();
    assert.match(text(harness.render()), /entero positivo/);
  }
  assert.equal(harness.calls.filter((c) => c.options.method).length, 0);
});

test('real editor omits unchanged or unknown schema positions from general save and disables unknown edit', async () => {
  for (const options of [{ detail: {} }, { detail: { displayOrder: 7 } }, { detailFails: true, fallback: {} }]) {
    const harness = await editorHarness(options);
    if (!options.detail?.displayOrder) {
      assert.equal(harness.input().props.disabled, true);
      assert.equal(harness.button('Guardar solo posición').props.disabled, true);
    }
    await harness.button('Guardar cambios').props.onClick(); await harness.flush();
    const payload = JSON.parse(harness.calls.at(-1).options.body);
    assert.equal('displayOrder' in payload, false, 'no guessed default from unknown schemas/unchanged legacy data');
    assert.equal(payload.active, false);
    assert.equal(payload.visibleInStore, false);
  }
});

test('hook and default grid consume generic position order, not a campaign SKU list', async () => {
  const hook = await read('src/hooks/useProducts.js');
  const grid = await read('src/pages/Products.jsx');
  assert.match(hook, /sortCatalogueProducts\(data.products.filter\(isListedProduct\)/);
  assert.match(grid, /sortCatalogueProducts\(filteredProducts\)/);
  for (const source of [hook, grid, await read('src/utils/cataloguePosition.js')]) assert.doesNotMatch(source, /BF26-|MIKVET500/);
});
