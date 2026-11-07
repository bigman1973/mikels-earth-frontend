import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import test from 'node:test';
import { chromium } from '/home/ubuntu/work/farmsplanet-web/node_modules/playwright-core/index.mjs';
import { VIP_ACCESS_START } from '../src/config/vipSchedule.js';
import { compiledModule } from './helpers/vip-conversion-harness.mjs';

const { build } = createRequire(import.meta.resolve('vite'))('esbuild');
const root = resolve(new URL('..', import.meta.url).pathname);
const origin = 'https://offline.invalid';
const key = 'mikels:bf26-top-band-dismissed';
const changeEvent = 'mikels:bf26-top-band-change';
const screenshots = process.env.BF26_BAND_SCREENSHOT_DIR || '/home/ubuntu/banda-chapa-bf26-2026-11-07/local-captures';
const headline = 'Black Friday el 26 de noviembre · hasta el 50 % de descuento';
const invitation = 'Entra en la lista y compra un día antes → mikels.es/vip';
const bandSelector = 'aside[aria-label="Black Friday 2026"]';
const closeLabel = 'Cerrar banda de Black Friday';
const normalize = value => value.replace(/\s+/g, ' ').trim();
const appSource = await readFile(join(root, 'src/App.jsx'), 'utf8');
// Include every registered public route, including aliases and parameter routes.
const publicSource = appSource.slice(appSource.indexOf('{/* ====== TIENDA PÚBLICA'));
const publicPaths = [...new Set([...publicSource.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map(([, path]) => path === '*' ? '/ruta-publica-desconocida' : path.replace(/:[^/]+/g, 'fixture'))
  .filter(path => !path.startsWith('/admin') && !['/vip', '/vip/gracias'].includes(path))
  .concat(['/checkout', '/carrito', '/politica-privacidad', '/legal', '/pago', '/administer', '/vip/otra']))];
const excludedPaths = ['/vip', '/vip/', '/vip///', '/vip/gracias', '/vip/gracias/', '/vip/gracias///', '/admin', '/admin/', '/admin/login', '/admin/blog/', '/admin/vip/embudo'];
const popupLocal = {
  'mikels:vip-popup-dismissed:2026': '1',
  'mikels:vip-known:2026': '1',
  mikels_newsletter_popup_v2: JSON.stringify({ shownAt: 1794000000000, expiresAt: 1796592000000 }),
};
const popupSession = { 'mikels:vip-signup:42': '1', 'mikels:vip-conversion-proof:42': '{"fixture":true}' };

const storage = (seed = {}) => {
  const values = new Map(Object.entries(seed));
  return { values, getItem: name => values.get(name) ?? null, setItem: (name, value) => values.set(name, String(value)) };
};
async function policy({ local = {}, session = {}, blocked = false, writeBlocked = false, noWindow = false } = {}) {
  const localStorage = storage(local); const sessionStorage = storage(session); const events = [];
  if (writeBlocked) localStorage.setItem = () => { throw new Error('storage writes blocked'); };
  const window = { localStorage, sessionStorage, dispatchEvent: event => { events.push(event.type); return true; } };
  if (blocked === 'getter') Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage access blocked'); } });
  else if (blocked) localStorage.getItem = () => { throw new Error('storage reads blocked'); };
  const api = await compiledModule('src/utils/blackFridayTopBand.js', { '../config/vipSchedule.js': { VIP_ACCESS_START } }, noWindow ? { Event } : { window, Event });
  return { api, localStorage, sessionStorage, events };
}

test('top-band utility uses the exact VIP boundary and excludes only VIP/thanks/admin, with App masthead integration', async () => {
  const { api } = await policy();
  assert.equal(VIP_ACCESS_START, Date.parse('2026-11-26T08:00:00Z'));
  for (const time of [Date.parse('2026-11-25T08:00:00Z'), VIP_ACCESS_START - 1]) assert.equal(api.isTopBandBeforeAccess(time), true);
  for (const time of [VIP_ACCESS_START, VIP_ACCESS_START + 1, NaN, Infinity, -Infinity, '2026-11-25']) assert.equal(api.isTopBandBeforeAccess(time), false, String(time));
  assert.equal(api.isTopBandAllowedPath(), true);
  for (const path of publicPaths) {
    assert.equal(api.isTopBandAllowedPath(path), true, path);
    assert.equal(api.isTopBandAllowedPath(`${path === '/' ? '' : path}/`), true, `${path}/`);
  }
  for (const path of excludedPaths) assert.equal(api.isTopBandAllowedPath(path), false, path);
  assert.ok(publicPaths.includes('/checkout') && publicPaths.includes('/carrito') && publicPaths.includes('/politica-privacidad'));
  assert.match(appSource, /import PublicMasthead from ['"]\.\/components\/layout\/PublicMasthead['"]/);
  assert.match(publicSource, /<PublicMasthead\s*\/>/);
  assert.doesNotMatch(publicSource, /<Header\s*\/>/);
});

test('top-band dismissal is a separate boolean preference, preserves popup markers, and fails closed for malformed/unreadable storage', async () => {
  const fresh = await policy();
  assert.equal(fresh.api.BF26_TOP_BAND_DISMISSED_KEY, key);
  assert.equal(fresh.api.BF26_TOP_BAND_CHANGE_EVENT, changeEvent);
  assert.equal(fresh.api.isTopBandDismissed(), false);
  for (const [name, value] of Object.entries(popupLocal)) assert.equal((await policy({ local: { [name]: value } })).api.isTopBandDismissed(), false, name);
  assert.equal((await policy({ session: popupSession })).api.isTopBandDismissed(), false);
  const seeded = await policy({ local: popupLocal, session: popupSession });
  seeded.api.dismissTopBand();
  assert.equal(seeded.api.isTopBandDismissed(), true);
  assert.deepEqual(Object.fromEntries(seeded.localStorage.values), { ...popupLocal, [key]: '1' });
  assert.deepEqual(Object.fromEntries(seeded.sessionStorage.values), popupSession);
  assert.deepEqual(seeded.events, [changeEvent]);
  assert.doesNotMatch(seeded.localStorage.getItem(key), /email|@|token|ip|customer/i);
  for (const marker of ['1', '', '0', 'false', 'null', 'not-json', '{broken', '{"email":"fixture@example.invalid"}']) {
    assert.equal((await policy({ local: { [key]: marker } })).api.isTopBandDismissed(), true, marker);
  }
  for (const blocked of [true, 'getter']) assert.equal((await policy({ blocked })).api.isTopBandDismissed(), true);
  const unwritable = await policy({ writeBlocked: true });
  assert.doesNotThrow(() => unwritable.api.dismissTopBand());
  assert.equal(unwritable.localStorage.getItem(key), null);
  assert.equal(unwritable.api.isTopBandDismissed(), true, 'Memory fallback persists when a write fails');
  const ssr = await policy({ noWindow: true });
  assert.equal(ssr.api.isTopBandDismissed(), false);
  assert.doesNotThrow(() => ssr.api.dismissTopBand());
  assert.equal(ssr.api.isTopBandDismissed(), true);
});

test('local Chromium top band with real React StrictMode, compiled CSS, local Montserrat and zero external traffic', async t => {
  const spanish = JSON.parse(await readFile(join(root, 'src/i18n/locales/es.json'), 'utf8'));
  const english = JSON.parse(await readFile(join(root, 'src/i18n/locales/en.json'), 'utf8'));
  const bundle = await build({
    stdin: { resolveDir: root, loader: 'jsx', contents: `
      import React, { useEffect } from 'react';
      import { createRoot } from 'react-dom/client';
      import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
      import PublicMasthead from './src/components/layout/PublicMasthead.jsx';
      function Shell() {
        const navigate = useNavigate(); const location = useLocation();
        window.go = navigate;
        useEffect(() => { window.currentRoute = location.pathname + location.search; }, [location]);
        useEffect(() => { window.strictModeEffects = (window.strictModeEffects || 0) + 1; }, []);
        return <div className="flex flex-col min-h-screen"><PublicMasthead />
          <main className="flex-grow" style={{ minHeight: 2600 }}><h1>Contenido de prueba local</h1><button id="outside">Contenido público</button></main>
        </div>;
      }
      const root = createRoot(document.getElementById('root')); let serial = 0;
      window.mount = path => root.render(<React.StrictMode><MemoryRouter key={++serial} initialEntries={[path]}><Shell /></MemoryRouter></React.StrictMode>);
      window.unmount = () => root.render(null);
    ` }, bundle: true, format: 'iife', write: false, jsx: 'automatic', loader: { '.png': 'dataurl' },
    define: { 'import.meta.env': JSON.stringify({ VITE_API_URL: origin }) },
    plugins: [{ name: 'offline-masthead-context', setup(b) {
      b.onResolve({ filter: /context\/CartContext/ }, () => ({ path: 'cart', namespace: 'mock' }));
      b.onResolve({ filter: /^react-i18next$/ }, () => ({ path: 'translation', namespace: 'mock' }));
      b.onLoad({ filter: /./, namespace: 'mock' }, args => ({ loader: 'js', resolveDir: root, contents: args.path === 'cart'
        ? 'export const useCart = () => ({ getCartCount: () => 2, toggleCart: () => { window.cartToggleCalls = (window.cartToggleCalls || 0) + 1; } });'
        : `import { useSyncExternalStore } from 'react';
          const labels = ${JSON.stringify({ es: spanish, en: english })}; let language = 'es'; const listeners = new Set();
          const i18n = { get language() { return language; }, get resolvedLanguage() { return language; }, changeLanguage(next) { language = next; listeners.forEach(fn => fn()); return Promise.resolve(); } };
          const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn); };
          export const useTranslation = () => { useSyncExternalStore(subscribe, () => language, () => language); return { i18n, t: key => key.split('.').reduce((v,k) => v?.[k], labels[language]) || key }; };` }));
    } }],
  });
  const script = bundle.outputFiles[0].text;
  const cssDir = join(process.env.FRONTEND_BUILD_OUTDIR || join(root, 'dist'), 'assets');
  const cssFiles = (await readdir(cssDir)).filter(file => file.endsWith('.css')).sort();
  assert.ok(cssFiles.length > 0, `Real compiled CSS is required; build first and set FRONTEND_BUILD_OUTDIR (${cssDir})`);
  const css = (await Promise.all(cssFiles.map(file => readFile(join(cssDir, file), 'utf8')))).join('\n');
  assert.ok(css.trim(), 'Empty CSS cannot bypass the layout regressions');
  const font = await readFile(join(root, 'public/fonts/montserrat-latin-normal.woff2'));
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true,
    args: ['--no-sandbox', '--disable-background-networking', '--disable-component-update', '--disable-sync'] });
  const contexts = []; const unexpected = []; const requests = []; const errors = [];
  const band = page => page.locator(bandSelector);
  const absent = page => band(page).waitFor({ state: 'detached' });
  const visible = page => band(page).waitFor({ state: 'visible' });
  const attach = page => { page.setDefaultTimeout(7000); page.on('pageerror', error => errors.push(error.message)); };
  async function hydrate(page, path = '/') {
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
    await page.evaluate(path => window.mount(path), path);
    await page.waitForFunction(path => window.currentRoute === path, path);
    await page.evaluate(() => document.fonts.ready);
  }
  async function setup({ mobile = false, path = '/', time = VIP_ACCESS_START - 86400000, local = {}, session = {}, blocked = false, writeBlocked = false } = {}) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1080 }, isMobile: mobile, hasTouch: mobile });
    contexts.push(context);
    await context.route('**/*', async route => {
      const request = route.request(); const url = request.url(); requests.push({ url, method: request.method() });
      if (url === `${origin}/ui` && request.method() === 'GET') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Band local regression</title></head><body><div id="root"></div></body></html>' });
      if (url === `${origin}/fonts/montserrat-latin-normal.woff2` && request.method() === 'GET') return route.fulfill({ status: 200, contentType: 'font/woff2', body: font });
      unexpected.push({ url, method: request.method() });
      return route.abort('blockedbyclient');
    });
    const page = await context.newPage(); attach(page);
    await page.goto(`${origin}/ui`);
    await page.clock.install({ time }); await page.clock.pauseAt(time);
    await page.evaluate(({ local, session, blocked, writeBlocked, key }) => {
      for (const [name, value] of Object.entries(local)) localStorage.setItem(name, value);
      for (const [name, value] of Object.entries(session)) sessionStorage.setItem(name, value);
      if (blocked === 'getter') Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('storage access blocked'); } });
      else if (blocked) Storage.prototype.getItem = function () { throw new Error('storage reads blocked'); };
      if (writeBlocked) {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function (name, value) { if (name === key) throw new Error('storage writes blocked'); return original.call(this, name, value); };
      }
    }, { local, session, blocked, writeBlocked, key });
    await hydrate(page, path);
    assert.equal(await page.evaluate(() => window.strictModeEffects), 2, 'The real StrictMode replays mount effects');
    return { context, page };
  }
  async function go(page, path) {
    await page.evaluate(path => window.go(path), path);
    await page.waitForFunction(path => window.currentRoute === path, path);
  }
  const dump = page => page.evaluate(() => ({ local: Object.fromEntries(Object.entries(localStorage)), session: Object.fromEntries(Object.entries(sessionStorage)) }));
  async function geometry(page, label) {
    const result = await page.evaluate(selector => {
      const rect = node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
      const band = document.querySelector(selector); const header = document.querySelector('[data-public-masthead] header');
      return { viewport: { width: innerWidth, height: innerHeight }, scroll: { x: scrollX, y: scrollY },
        documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        masthead: rect(document.querySelector('[data-public-masthead]')), band: rect(band), header: rect(header),
        headline: rect(band.querySelector('p')), link: rect(band.querySelector('a')), close: rect(band.querySelector('button')),
        font: getComputedStyle(band.querySelector('p')).fontFamily,
        fontLoaded: document.fonts.check('600 13px Montserrat'),
        logoLoaded: header.querySelector('img').complete && header.querySelector('img').naturalWidth > 0 };
    }, bandSelector);
    assert.ok(result.documentWidth <= result.viewport.width, `${label}: no document horizontal overflow ${JSON.stringify(result)}`);
    assert.equal(result.scroll.x, 0, `${label}: no horizontal scrolling`);
    assert.ok(Math.abs(result.band.y) <= 0.5, `${label}: band remains at y=0`);
    assert.ok(Math.abs(result.header.y - result.band.bottom) <= 0.5, `${label}: header starts exactly below band, without overlap`);
    assert.ok(result.close.width >= 44 && result.close.height >= 44, `${label}: close has a minimum 44px hit target`);
    for (const name of ['band', 'header', 'headline', 'link', 'close']) {
      const r = result[name];
      assert.ok(r.width > 0 && r.height > 0 && r.x >= -0.5 && r.right <= result.viewport.width + 0.5, `${label}: ${name} fits viewport`);
    }
    assert.match(result.font, /Montserrat/); assert.equal(result.fontLoaded, true); assert.equal(result.logoLoaded, true);
    return result;
  }
  try {
    await t.test('390x844 and 1440px layouts have exact accessible copy, 44px close, sticky non-overlapping header and a working mobile menu', async () => {
      await mkdir(screenshots, { recursive: true });
      const captures = [];
      for (const mobile of [true, false]) {
        const { page } = await setup({ mobile }); await visible(page);
        const label = mobile ? 'mobile' : 'desktop';
        assert.equal(await band(page).getByText(headline, { exact: true }).count(), 1);
        const link = band(page).getByRole('link', { name: invitation, exact: true });
        assert.equal(normalize(await link.innerText()), invitation);
        assert.equal(await link.getAttribute('href'), '/vip');
        assert.equal(await band(page).getAttribute('lang'), 'es');
        assert.equal(await band(page).getByRole('button', { name: closeLabel, exact: true }).count(), 1);
        assert.equal(await page.getByRole('dialog').count(), 0, 'Band does not become a modal or trap focus');
        await link.focus(); await page.keyboard.press('Tab');
        assert.equal(await band(page).getByRole('button', { name: closeLabel }).evaluate(node => node === document.activeElement), true);
        captures.push({ label, initial: await geometry(page, label) });
        await page.screenshot({ path: join(screenshots, `bf26-top-band-${label}.png`) });
        await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 1000); });
        await page.waitForFunction(() => window.scrollY >= 1000);
        captures.at(-1).scrolled = await geometry(page, `${label}/scrolled`);
        await page.screenshot({ path: join(screenshots, `bf26-top-band-${label}-scrolled.png`) });
        await page.getByRole('button', { name: 'Carrito', exact: true }).click();
        assert.equal(await page.evaluate(() => window.cartToggleCalls), 1);
        if (mobile) {
          assert.deepEqual(page.viewportSize(), { width: 390, height: 844 });
          const menu = page.getByRole('button', { name: 'Menú', exact: true });
          assert.equal(await menu.getAttribute('aria-expanded'), 'false');
          await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
          const navigation = page.getByRole('navigation', { name: 'Navegación móvil', exact: true });
          await navigation.waitFor(); await geometry(page, 'mobile/menu-open');
          await page.screenshot({ path: join(screenshots, 'bf26-top-band-mobile-menu.png') });
          await navigation.getByRole('link', { name: spanish.nav.shop, exact: true }).click();
          await page.waitForFunction(() => window.currentRoute === '/tienda');
          assert.equal(await menu.getAttribute('aria-expanded'), 'false');
          assert.equal(await navigation.count(), 0); await visible(page);
          await menu.click(); await menu.click(); assert.equal(await navigation.count(), 0);
        } else assert.equal(await page.getByRole('navigation', { name: 'Navegación principal', exact: true }).isVisible(), true);
      }
      await writeFile(join(screenshots, 'bf26-top-band-geometry.json'), `${JSON.stringify({ cssDir, cssFiles, captures }, null, 2)}\n`);
    });

    await t.test('close stores only the band boolean, survives remount/reload/new document and preserves all popup keys; failed writes retain memory suppression', async () => {
      const { page, context } = await setup({ local: popupLocal, session: popupSession }); await visible(page);
      const before = await dump(page);
      await band(page).getByRole('button', { name: closeLabel }).click(); await absent(page);
      assert.deepEqual(await dump(page), { local: { ...before.local, [key]: '1' }, session: before.session });
      await go(page, '/checkout'); await absent(page);
      await page.evaluate(() => window.mount('/tienda')); await page.waitForFunction(() => window.currentRoute === '/tienda'); await absent(page);
      await page.evaluate(() => { window.oldDocumentProbe = true; });
      await page.reload(); assert.equal(await page.evaluate(() => window.oldDocumentProbe), undefined, 'Reload really creates a new document');
      await hydrate(page); await absent(page);
      assert.deepEqual(await dump(page), { local: { ...before.local, [key]: '1' }, session: before.session });
      const fresh = await context.newPage(); attach(fresh); await fresh.goto(`${origin}/ui`); await hydrate(fresh, '/blog'); await absent(fresh);
      assert.equal(await fresh.evaluate(key => localStorage.getItem(key), key), '1');
      const failed = await setup({ writeBlocked: true }); await visible(failed.page);
      await band(failed.page).getByRole('button', { name: closeLabel }).click(); await absent(failed.page);
      assert.equal(await failed.page.evaluate(key => localStorage.getItem(key), key), null);
      await failed.page.evaluate(() => window.mount('/carrito')); await failed.page.waitForFunction(() => window.currentRoute === '/carrito'); await absent(failed.page);
    });

    await t.test('malformed/empty dismissal markers and unreadable storage suppress on real mounts, while unrelated popup preferences do not', async () => {
      for (const marker of ['', 'false', '{broken']) {
        const { page } = await setup({ local: { [key]: marker, ...popupLocal } }); await absent(page);
        await go(page, '/carrito'); await absent(page);
        assert.equal(await page.evaluate(key => localStorage.getItem(key), key), marker, 'Malformed markers are not rewritten');
      }
      for (const blocked of [true, 'getter']) {
        const { page } = await setup({ blocked }); await absent(page); await go(page, '/politica-privacidad'); await absent(page);
      }
      const independent = await setup({ local: popupLocal, session: popupSession }); await visible(independent.page);
      assert.deepEqual(await dump(independent.page), { local: popupLocal, session: popupSession });
    });

    await t.test('live timer retires at the exact millisecond; focus and visibility resynchronize suspended time; exact/after mounts stay hidden', async () => {
      const { page } = await setup({ time: VIP_ACCESS_START - 1000 }); await visible(page);
      await page.clock.fastForward(999); assert.equal(await band(page).count(), 1);
      await page.clock.fastForward(1); await absent(page);
      assert.equal(await page.evaluate(() => Date.now()), VIP_ACCESS_START);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), key), null, 'Expiry is not a user dismissal');
      for (const event of ['focus', 'visibilitychange']) {
        const s = await setup({ time: VIP_ACCESS_START - 1000 }); await visible(s.page);
        await s.page.clock.setSystemTime(VIP_ACCESS_START);
        await s.page.evaluate(event => (event === 'visibilitychange' ? document : window).dispatchEvent(new Event(event)), event);
        await absent(s.page);
      }
      for (const time of [VIP_ACCESS_START, VIP_ACCESS_START + 1]) { const s = await setup({ time }); await absent(s.page); }
    });

    await t.test('native cross-tab storage dismissal hides an already visible second tab and suppresses later documents', async () => {
      const { page, context } = await setup(); await visible(page);
      const other = await context.newPage(); attach(other); await other.goto(`${origin}/ui`);
      await other.evaluate(() => { window.storageEvents = []; window.addEventListener('storage', event => window.storageEvents.push({ key: event.key, newValue: event.newValue, local: event.storageArea === localStorage })); });
      await hydrate(other, '/checkout'); await visible(other);
      await band(page).getByRole('button', { name: closeLabel }).click(); await absent(page); await absent(other);
      await other.waitForFunction(key => window.storageEvents.some(event => event.key === key), key);
      assert.deepEqual(await other.evaluate(() => window.storageEvents), [{ key, newValue: '1', local: true }]);
      await go(other, '/politica-privacidad'); await absent(other);
      const later = await context.newPage(); attach(later); await later.goto(`${origin}/ui`); await hydrate(later, '/carrito'); await absent(later);
    });

    await t.test('all public routes retain the band, VIP/thanks/admin and slash variants suppress it, and actual /vip link navigation can go back', async () => {
      const { page } = await setup(); await visible(page);
      await band(page).getByRole('link', { name: invitation, exact: true }).click();
      await page.waitForFunction(() => window.currentRoute === '/vip'); await absent(page);
      await page.evaluate(() => window.go(-1)); await page.waitForFunction(() => window.currentRoute === '/'); await visible(page);
      for (const path of excludedPaths) { await go(page, path); await absent(page); }
      for (const path of publicPaths) { await go(page, path); await visible(page); assert.equal(await band(page).count(), 1, path); }
      await go(page, '/vip/gracias/?signup=42'); await absent(page);
      await go(page, '/checkout'); await visible(page);
      assert.deepEqual(await dump(page), { local: {}, session: {} }, 'Routing neither closes the band permanently nor touches popup preferences');
    });
    assert.deepEqual(unexpected, [], 'Every browser request is intercepted; no production, analytics, provider or unmocked asset traffic');
    assert.ok(requests.some(request => request.url === `${origin}/fonts/montserrat-latin-normal.woff2`), 'The real local font was requested');
    assert.ok(requests.every(request => request.method === 'GET'), 'No mutations or signup calls are made by this masthead harness');
    assert.deepEqual(errors, [], 'No real React runtime errors');
  } finally {
    for (const context of contexts) await context.close();
    await browser.close();
  }
});
