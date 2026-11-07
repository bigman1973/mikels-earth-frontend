import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import test from 'node:test';
import { chromium } from '/home/ubuntu/work/farmsplanet-web/node_modules/playwright-core/index.mjs';
import { VIP_ACCESS_START } from '../src/config/vipSchedule.js';
import { NONINDEX_STATIC_ROUTE_SEO } from '../src/seo/metadata.js';
const { build } = createRequire(import.meta.resolve('vite'))('esbuild');
const root = resolve(new URL('..', import.meta.url).pathname);
const evidence = process.env.BLOCK_C_EVIDENCE || '/home/ubuntu/continuacion-autorizada-06-noviembre/bloque-c';
const spanish = JSON.parse(await readFile(join(root, 'src/i18n/locales/es.json'), 'utf8'));
const bundle = await build({
  stdin: { resolveDir: root, loader: 'jsx', contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
    import { HelmetProvider } from 'react-helmet-async';
    import VipEntryPopup from './src/components/VipEntryPopup.jsx';
    import NewsletterPopup from './src/components/NewsletterPopup.jsx';
    import VipLanding from './src/pages/VipLanding.jsx';
    import VipThanks from './src/pages/VipThanks.jsx';
    function Shell() {
      const navigate = useNavigate(); const location = useLocation();
      window.go = navigate; window.currentRoute = location.pathname + location.search;
      return <><button id="outside">Contenido de prueba local</button>
        <Routes><Route path="/vip" element={<VipLanding/>}/><Route path="/vip/gracias" element={<VipThanks/>}/></Routes>
        <VipEntryPopup/><NewsletterPopup/></>;
    }
    const root = createRoot(document.getElementById('root')); let serial = 0;
    window.mount = path => root.render(<React.StrictMode><HelmetProvider><MemoryRouter key={++serial} initialEntries={[path]}><Shell/></MemoryRouter></HelmetProvider></React.StrictMode>);
    window.unmount = () => root.render(null);
  ` }, bundle: true, format: 'iife', write: false, jsx: 'automatic',
  define: { 'import.meta.env': JSON.stringify({ VITE_API_URL: 'https://offline.invalid' }) },
  plugins: [{ name: 'offline-context', setup(b) {
    b.onResolve({ filter: /context\/CartContext/ }, () => ({ path: 'cart', namespace: 'mock' }));
    b.onResolve({ filter: /^react-i18next$/ }, () => ({ path: 'translation', namespace: 'mock' }));
    b.onLoad({ filter: /./, namespace: 'mock' }, args => ({ loader: 'js', contents: args.path === 'cart'
      ? 'export const useCart = () => ({ isCartOpen: window.mockCartOpen === true });'
      : `const labels = ${JSON.stringify(spanish)}; export const useTranslation = () => ({ t: key => key.split('.').reduce((v,k) => v?.[k], labels) || key });` }));
  } }],
});
const script = bundle.outputFiles[0].text;
const cssDir = join(process.env.FRONTEND_BUILD_OUTDIR || join(root, 'dist'), 'assets');
const cssFiles = (await readdir(cssDir)).filter(file => file.endsWith('.css')).sort();
assert.ok(cssFiles.length > 0, `Real compiled CSS is required; run the offline build and set FRONTEND_BUILD_OUTDIR (${cssDir})`);
const css = (await Promise.all(cssFiles.map(file => readFile(join(cssDir, file), 'utf8')))).join('\n');
assert.ok(css.trim(), 'Empty CSS must not bypass the mobile layout regression');
const compactSubmitLabel = 'QUIERO ENTRAR EN LA LISTA';
const originalSubmitLabel = 'Quiero entrar en la lista VIP';

async function assertMobileFitsWithoutScroll(page) {
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const rect = node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
    const selectors = {
      email: '#vip-email', checkbox: '#vip-marketing-consent', consent: 'label[for="vip-marketing-consent"]',
      submit: 'button[type="submit"]', close: 'button:not([type="submit"])', footer: 'form + p',
    };
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      windowScroll: { x: window.scrollX, y: window.scrollY },
      dialog: { ...rect(dialog), scrollTop: dialog.scrollTop, scrollHeight: dialog.scrollHeight, clientHeight: dialog.clientHeight },
      controls: Object.fromEntries(Object.entries(selectors).map(([name, selector]) => {
        const node = dialog.querySelector(selector);
        if (!node) throw new Error(`Missing mobile control: ${name}`);
        return [name, rect(node)];
      })),
    };
  });
  assert.deepEqual(geometry.viewport, { width: 390, height: 844 });
  assert.deepEqual(geometry.windowScroll, { x: 0, y: 0 }, 'Loading must not scroll the page');
  assert.equal(geometry.dialog.scrollTop, 0, 'Initial focus must not scroll the dialog');
  assert.ok(geometry.dialog.scrollHeight <= geometry.dialog.clientHeight, 'All compact content must fit without a dialog scrollbar');
  const inside = (r, bounds, label) => {
    assert.ok(r.width > 0 && r.height > 0, `${label} has a rendered rectangle`);
    assert.ok(r.x >= bounds.x && r.y >= bounds.y && r.right <= bounds.right && r.bottom <= bounds.bottom,
      `${label} must be entirely inside bounds: ${JSON.stringify({ rect: r, bounds })}`);
  };
  inside(geometry.dialog, { x: 0, y: 0, right: 390, bottom: 844 }, 'dialog/viewport');
  for (const [name, rect] of Object.entries(geometry.controls)) {
    inside(rect, { x: 0, y: 0, right: 390, bottom: 844 }, `${name}/viewport`);
    inside(rect, geometry.dialog, `${name}/dialog`);
  }
  assert.equal(await page.locator('#vip-marketing-consent').isChecked(), false);
  return geometry;
}

test('local browser VIP entry and exit-intent runtime with real React StrictMode, zero provider traffic', async t => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-background-networking', '--disable-component-update', '--disable-sync'] });
  const allUnexpected = []; const allErrors = []; const contexts = []; const remoteMutationAttempts = [];
  async function setup({ path = '/', time = Date.parse('2026-11-06T09:00:00Z'), resolved = true, mobile = false, seed = null } = {}) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1080 }, isMobile: mobile, hasTouch: mobile }); contexts.push(context);
    const page = await context.newPage(); page.setDefaultTimeout(7000);
    page.on('pageerror', e => allErrors.push(e.message));
    const calls = []; const config = { status: 201, body: { success: true, signup_id: 42 }, release: null };
    await context.route('**/*', async route => {
      const req = route.request(); const url = req.url();
      if (url === 'https://offline.invalid/ui') {
        // Match the actual generated VIP static head; SSR and extraction tests
        // separately verify Helmet markup. Store routes retain no popup robots.
        const spec = NONINDEX_STATIC_ROUTE_SEO[path];
        const robots = spec ? `<meta name="robots" content="${spec.robots}">` : '';
        return route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width, initial-scale=1">${robots}<title>UI local</title></head><body><div id="root"></div></body></html>` });
      }
      if (url === 'https://offline.invalid/fonts/montserrat-latin-normal.woff2') return route.fulfill({ status: 200, contentType: 'font/woff2', body: await readFile(join(root, 'public/fonts/montserrat-latin-normal.woff2')) });
      if (url === 'https://offline.invalid/api/vip/signup' || url === 'https://offline.invalid/api/newsletter/subscribe') {
        calls.push({ url, method: req.method(), body: req.postDataJSON() });
        if (config.release) await config.release;
        return route.fulfill({ status: config.status, contentType: 'application/json', body: JSON.stringify(config.body) });
      }
      if (url === 'https://offline.invalid/api/vip/pageview') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method())) remoteMutationAttempts.push({ url, method: req.method() });
      allUnexpected.push(url); await route.abort('blockedbyclient');
    });
    await page.goto('https://offline.invalid/ui');
    await page.clock.install({ time });
    await page.clock.pauseAt(time);
    await page.evaluate(({ resolved, seed }) => {
      window.Cookiebot = { hasResponse: resolved, consent: { method: 'explicit', statistics: false, marketing: false } };
      window.metaCalls = []; window.gaCalls = []; window.fbq = (...a) => window.metaCalls.push(a); window.gtag = (...a) => window.gaCalls.push(a);
      if (seed === 'closed') localStorage.setItem('mikels:vip-popup-dismissed:2026', '1');
      if (seed === 'known') localStorage.setItem('mikels:vip-known:2026', '1');
      if (seed === 'legacy') sessionStorage.setItem('mikels:vip-signup:42', '1');
      if (seed === 'newsletter') { localStorage.setItem('mikels:vip-popup-dismissed:2026', '1'); localStorage.setItem('mikels_newsletter_popup_v2', JSON.stringify({ expiresAt: Date.now() + 100000 })); }
    }, { resolved, seed });
    await page.addStyleTag({ content: css }); await page.addScriptTag({ content: script });
    await page.evaluate(path => window.mount(path), path);
    await page.waitForFunction(() => window.currentRoute !== undefined);
    return { page, context, calls, config };
  }
  const exit = page => page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 200, clientY: 0, relatedTarget: null })));
  const count = page => page.getByRole('dialog').count();
  const close = async page => { await page.getByRole('button', { name: 'Cerrar', exact: true }).click(); await page.waitForFunction(() => !document.querySelector('[role="dialog"]')); };
  try {
    await t.test('entry waits for Cookiebot response, but rejection does not auto-check signup consent; no double popup', async () => {
      const { page, calls } = await setup({ path: '/blog', resolved: false });
      assert.equal(await count(page), 0); await exit(page); assert.equal(await count(page), 0);
      await page.evaluate(() => { window.Cookiebot.hasResponse = true; window.dispatchEvent(new Event('CookiebotOnDecline')); });
      await page.getByRole('dialog').waitFor(); assert.equal(await page.locator('#vip-marketing-consent').isChecked(), false);
      await exit(page); assert.equal(await count(page), 1); assert.equal(await page.locator('#newsletter-email').count(), 0); assert.equal(calls.length, 0);
      assert.equal(await page.locator('meta[name="robots"]').count(), 0, 'Popup must not noindex the store');
      await close(page); await page.evaluate(() => window.mount('/blog')); assert.equal(await count(page), 0);
    });
    await t.test('simultaneous consent callbacks and manual newsletter request cannot beat the VIP owner', async () => {
      const { page, calls } = await setup({ path: '/blog', resolved: false });
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('mikels:open-newsletter-popup'));
        window.Cookiebot.hasResponse = true;
        for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('CookiebotOnAccept'));
        window.dispatchEvent(new CustomEvent('mikels:open-newsletter-popup'));
      });
      await page.getByRole('dialog').waitFor();
      assert.equal(await count(page), 1); assert.equal(await page.locator('#newsletter-email').count(), 0);
      assert.equal(calls.length, 0);
      await close(page); assert.equal(await page.locator('#newsletter-email').count(), 0);
      await exit(page); await page.locator('#newsletter-email').waitFor(); assert.equal(await count(page), 0);
    });
    await t.test('entry close visible, Escape, focus trapped, disclosure link route suppressed and screenshots desktop/mobile', async () => {
      const { page } = await setup({ resolved: false });
      await page.locator('#outside').focus();
      await page.evaluate(() => { window.Cookiebot.hasResponse = true; window.dispatchEvent(new Event('CookiebotOnDecline')); });
      await page.getByRole('dialog').waitFor();
      await mkdir(evidence, { recursive: true }); await page.screenshot({ path: join(evidence, 'vip-entry-desktop.png'), fullPage: true });
      assert.equal(await page.getByRole('heading', { name: 'HASTA EL 50 % DE DESCUENTO', exact: true }).count(), 1);
      for (const copy of ['El 26 de noviembre, un día antes que nadie.', 'Y un tarro de mermelada de regalo con cualquier pack.', 'Hasta agotar existencias.']) {
        assert.equal(await page.getByRole('dialog').getByText(copy, { exact: true }).count(), 1, copy);
      }
      assert.equal(await page.getByRole('button', { name: compactSubmitLabel, exact: true }).count(), 1);
      assert.equal(await page.locator('#vip-first-name').count(), 0);
      assert.equal(await page.locator('[aria-label="Cuenta atrás para el acceso VIP"]').count(), 0);
      assert.equal(await page.getByText('El Temprano de la cosecha 2026/27 mantiene su precio de 19,90 €.', { exact: true }).count(), 0);
      await page.locator('#vip-email').focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab');
      assert.equal(await page.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement)), true);
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement)), true, 'Tab never escapes the modal');
      }
      await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
      await page.evaluate(() => window.go('/tienda')); assert.equal(await count(page), 0);
      const m = await setup({ mobile: true }); await m.page.getByRole('dialog').waitFor();
      const geometry = await assertMobileFitsWithoutScroll(m.page);
      await writeFile(join(evidence, 'vip-entry-mobile-geometry.json'), `${JSON.stringify({ cssDir, cssFiles, ...geometry }, null, 2)}\n`);
      await m.page.screenshot({ path: join(evidence, 'vip-entry-mobile.png'), fullPage: true });
      assert.equal(await m.page.locator('#vip-email').isVisible(), true);
      assert.equal(await m.page.locator('#vip-marketing-consent').isVisible(), true);
      assert.equal(await m.page.locator('#vip-marketing-consent').isChecked(), false);
      assert.equal(await m.page.getByRole('button', { name: compactSubmitLabel, exact: true }).isVisible(), true);
      assert.equal(await m.page.getByRole('button', { name: 'Cerrar', exact: true }).isVisible(), true);
      await m.page.screenshot({ path: join(evidence, 'vip-entry-mobile-consent.png'), fullPage: true });
      await m.page.getByRole('link', { name: 'política de privacidad' }).click(); await m.page.waitForFunction(() => window.currentRoute === '/politica-privacidad'); assert.equal(await count(m.page), 0);
    });
    await t.test('persistent close, known signup and original session markers suppress across mounts', async () => {
      for (const seed of ['closed', 'known', 'legacy']) {
        const { page } = await setup({ seed }); assert.equal(await count(page), 0);
        await page.evaluate(() => window.go('/tienda')); assert.equal(await count(page), 0);
      }
    });
    await t.test('sensitive routes, cart drawer and /vip preserve original page/noindex and never entry', async () => {
      for (const path of ['/vip', '/vip/gracias', '/vip/', '/vip/gracias/', '/admin/login', '/admin/blog', '/checkout', '/carrito', '/pago', '/politica-privacidad', '/terminos', '/legal', '/pedido-confirmado', '/recuperar-carrito/local', '/no-existe']) {
        const { page } = await setup({ path }); assert.equal(await count(page), 0, path); await exit(page); assert.equal(await count(page), 0, path);
        if (path === '/vip' || path === '/vip/gracias') { await page.clock.runFor(30); assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow'); }
      }
      const { page } = await setup({ path: '/checkout' });
      await page.evaluate(() => { window.mockCartOpen = true; window.go('/tienda'); }); assert.equal(await count(page), 0);
      await page.evaluate(() => { window.mockCartOpen = false; window.go('/'); }); await page.getByRole('dialog').waitFor();
    });
    await t.test('/vip original DOM keeps exact copy, optional name, old CTA/price and the live countdown without short popup copy', async () => {
      const time = Date.parse('2026-11-06T09:00:00Z');
      const { page, calls } = await setup({ path: '/vip', time, mobile: true });
      await page.getByRole('heading', { name: "Acceso anticipado al Black Friday de Mikel's, solo para la lista VIP.", exact: true }).waitFor();
      for (const copy of [
        'Black Friday 2026',
        'Entras en la lista y el 26 de noviembre compras un día antes que nadie.',
        'Acceso 24 horas antes de que la oferta se abra al público, y un tarro de nuestra mermelada de regalo con cualquier pack del Black Friday. Hasta agotar existencias.',
        'El Temprano de la cosecha 2026/27 mantiene su precio de 19,90 €.',
      ]) assert.equal(await page.getByText(copy, { exact: true }).count(), 1, copy);
      assert.equal(await page.getByRole('button', { name: originalSubmitLabel, exact: true }).count(), 1);
      assert.equal(await page.getByRole('button', { name: compactSubmitLabel, exact: true }).count(), 0);
      assert.equal(await page.locator('label[for="vip-first-name"]').innerText(), 'Nombre (opcional)');
      assert.equal(await page.locator('#vip-first-name').count(), 1);
      assert.equal(await page.locator('#vip-first-name').getAttribute('autocomplete'), 'given-name');
      assert.equal(await page.locator('#vip-first-name').getAttribute('maxlength'), '120');
      assert.equal(await page.locator('#vip-first-name').getAttribute('required'), null);
      assert.equal(await page.locator('#vip-email').getAttribute('placeholder'), null);
      assert.equal(await page.locator('#vip-marketing-consent').isChecked(), false);
      assert.equal(await page.locator('#vip-marketing-consent').getAttribute('required'), '');
      assert.equal(await page.locator('form + p').innerText(), 'El Temprano de la cosecha 2026/27 mantiene su precio de 19,90 €.');
      const text = await page.locator('body').innerText();
      assert.doesNotMatch(text, /HASTA EL|\d+(?:[.,]\d+)?\s*%|QUIERO ENTRAR EN LA LISTA|El 26 de noviembre, un día antes que nadie\.|Y un tarro de mermelada de regalo con cualquier pack\./);
      const countdown = page.locator('[aria-label="Cuenta atrás para el acceso VIP"]');
      assert.equal(await countdown.count(), 1);
      const expectedUnits = now => {
        const remaining = Math.max(0, VIP_ACCESS_START - now);
        const values = [Math.floor(remaining / 86400000), Math.floor(remaining % 86400000 / 3600000), Math.floor(remaining % 3600000 / 60000), Math.floor(remaining % 60000 / 1000)];
        const labels = [['día', 'días'], ['hora', 'horas'], ['minuto', 'minutos'], ['segundo', 'segundos']];
        return values.map((value, i) => `${String(value).padStart(2, '0')} ${labels[i][value === 1 ? 0 : 1]}`);
      };
      const units = () => countdown.locator(':scope > div').evaluateAll(nodes => nodes.map(node => [...node.querySelectorAll('p')].map(p => p.textContent.trim()).join(' ')));
      assert.deepEqual(await units(), expectedUnits(time));
      await page.clock.runFor(1000);
      assert.deepEqual(await units(), expectedUnits(time + 1000), 'Original countdown still ticks each second');
      assert.equal(await count(page), 0); assert.equal(calls.length, 0);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
    });
    await t.test('exact time boundary auto-retires an already open popup and rejects fresh mounts at/after access', async () => {
      const { page } = await setup({ time: VIP_ACCESS_START - 1000 }); await page.getByRole('dialog').waitFor();
      await page.clock.fastForward(999); assert.equal(await count(page), 1);
      await page.clock.fastForward(1); await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
      for (const time of [VIP_ACCESS_START, VIP_ACCESS_START + 1]) { const s = await setup({ time }); assert.equal(await count(s.page), 0); }
    });
    await t.test('shared VIP consent rejects unchecked; concurrent submit issues one request; 201/200 accepted reach same thanks', async () => {
      for (const [path, status] of [['/', 201], ['/', 200], ['/vip', 201], ['/vip', 200]]) {
        const compact = path === '/';
        const { page, calls, config } = await setup({ path, mobile: compact }); await page.locator('#vip-email').waitFor();
        if (compact) await assertMobileFitsWithoutScroll(page);
        assert.equal(await page.getByRole('button', { name: compact ? compactSubmitLabel : originalSubmitLabel, exact: true }).count(), 1);
        assert.equal(await page.locator('#vip-marketing-consent').isChecked(), false, 'Cookiebot rejection is not signup consent');
        assert.equal(await page.locator('#vip-website').getAttribute('name'), 'website');
        assert.equal(await page.locator('#vip-website').getAttribute('tabindex'), '-1');
        assert.equal(await page.locator('#vip-website').getAttribute('autocomplete'), 'off');
        assert.equal(await page.locator('#vip-website').locator('..').getAttribute('aria-hidden'), 'true');
        await page.locator('#vip-email').fill('local-fixture@example.invalid');
        await page.locator('form').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
        await page.getByRole('alert').waitFor(); assert.equal(calls.length, 0);
        if (compact) assert.equal(await page.locator('#vip-first-name').count(), 0);
        else await page.locator('#vip-first-name').fill('Prueba local');
        await page.locator('#vip-marketing-consent').check();
        let release; config.status = status; config.release = new Promise(resolve => { release = resolve; });
        await page.locator('form').evaluate(form => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
        await page.waitForFunction(() => document.querySelector('button[type="submit"]')?.disabled === true);
        assert.equal(await page.getByRole('button', { name: 'Guardando…' }).isDisabled(), true);
        await new Promise(resolve => setTimeout(resolve, 30)); assert.equal(calls.length, 1);
        assert.deepEqual(calls[0], { url: 'https://offline.invalid/api/vip/signup', method: 'POST', body: { email: 'local-fixture@example.invalid', first_name: compact ? '' : 'Prueba local', marketing_consent: true, website: '' } });
        release(); await page.getByRole('heading', { name: 'Ya estás dentro.' }).waitFor();
        assert.equal(await page.evaluate(() => window.currentRoute), '/vip/gracias?signup=42');
        assert.equal(await page.evaluate(() => localStorage.getItem('mikels:vip-known:2026')), '1');
        assert.equal(await page.evaluate(() => window.metaCalls.length + window.gaCalls.length), 0);
        assert.deepEqual(remoteMutationAttempts, [], 'Only intercepted local mock POSTs; zero remote mutations');
        await page.evaluate(() => window.go('/')); assert.equal(await count(page), 0);
      }
    });
    await t.test('honeypot neutral has no marker, refusal/technical/malformed permit retry but no false confirmation', async () => {
      for (const [status, body] of [[200, { success: true }], [400, { success: false, error: 'Rechazado' }], [500, { success: false }], [201, { success: false }]]) {
        const { page, config, calls } = await setup(); await page.getByRole('dialog').waitFor(); config.status = status; config.body = body;
        await page.locator('#vip-email').fill('local-fixture@example.invalid'); await page.locator('#vip-marketing-consent').check();
        await page.locator('#vip-website').evaluate(input => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'trap'); input.dispatchEvent(new Event('input', { bubbles: true })); });
        await page.getByRole('button', { name: compactSubmitLabel, exact: true }).click();
        if (status === 200) { await page.getByRole('heading', { name: 'Ya estás dentro.' }).waitFor(); assert.equal(await page.evaluate(() => window.currentRoute), '/vip/gracias'); }
        else { await page.getByRole('alert').waitFor(); assert.equal(await page.getByRole('button', { name: compactSubmitLabel, exact: true }).isEnabled(), true); }
        assert.equal(calls.length, 1); assert.equal(calls[0].body.website, 'trap');
        assert.equal(calls[0].body.first_name, ''); assert.equal(calls[0].body.marketing_consent, true);
        assert.equal(await page.evaluate(() => localStorage.getItem('mikels:vip-known:2026')), null);
        assert.equal(await page.evaluate(() => sessionStorage.getItem('mikels:vip-signup:42')), null);
        assert.equal(await page.evaluate(() => window.metaCalls.length + window.gaCalls.length), 0);
      }
    });
    await t.test('newsletter auto exposure only on real desktop top exit, never timer/scroll/internal/side/mobile; original TTL and request', async () => {
      const { page, calls, config } = await setup({ path: '/blog', seed: 'closed' });
      await page.clock.fastForward(30000); await page.evaluate(() => window.dispatchEvent(new Event('scroll'))); assert.equal(await page.locator('#newsletter-email').count(), 0);
      await page.evaluate(() => { document.dispatchEvent(new MouseEvent('mouseout', { clientY: 200, clientX: 0, relatedTarget: null })); document.dispatchEvent(new MouseEvent('mouseout', { clientY: 0, clientX: 200, relatedTarget: document.body })); });
      assert.equal(await page.locator('#newsletter-email').count(), 0);
      await exit(page); await page.locator('#newsletter-email').waitFor(); await page.clock.runFor(1000); assert.equal(await count(page), 0);
      await page.locator('#newsletter-email').fill('local-newsletter@example.invalid'); await page.locator('input[name="privacyPolicyAccepted"]').check();
      config.body = { success: true }; config.status = 200;
      await page.locator('button[type="submit"]').click(); await page.getByText(spanish.newsletter_popup.success, { exact: true }).waitFor();
      assert.deepEqual(calls[0].body, { email: 'local-newsletter@example.invalid', privacy_policy_accepted: true, whatsapp_marketing_accepted: false, source: 'popup' });
      await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('#newsletter-email'));
      await page.evaluate(() => window.mount('/blog')); await exit(page); assert.equal(await page.locator('#newsletter-email').count(), 0);
      const record = await page.evaluate(() => JSON.parse(localStorage.getItem('mikels_newsletter_popup_v2'))); assert.equal(record.expiresAt - record.shownAt, 30 * 24 * 60 * 60 * 1000);
      const mobile = await setup({ path: '/blog', seed: 'closed', mobile: true }); await exit(mobile.page); await mobile.page.clock.fastForward(30000); assert.equal(await mobile.page.locator('#newsletter-email').count(), 0);
      const store = await setup({ path: '/tienda', seed: 'closed' }); await exit(store.page); assert.equal(await store.page.locator('#newsletter-email').count(), 0);
    });
    await t.test('late Cookiebot and manual newsletter cannot create double popup; route transition clears owner', async () => {
      const { page } = await setup({ path: '/blog', resolved: false, seed: 'closed' });
      await page.evaluate(() => { window.dispatchEvent(new CustomEvent('mikels:open-newsletter-popup')); window.Cookiebot.hasResponse = true; window.dispatchEvent(new Event('CookiebotOnAccept')); });
      await page.locator('#newsletter-email').waitFor(); assert.equal(await count(page), 0);
      await page.evaluate(() => window.go('/checkout')); await page.waitForFunction(() => !document.querySelector('#newsletter-email'));
      assert.equal(await count(page), 0);
    });
    assert.deepEqual(allUnexpected, [], 'Every browser request must be explicitly local-mocked');
    assert.deepEqual(remoteMutationAttempts, [], 'Zero remote mutations to providers or production endpoints');
    assert.deepEqual(allErrors, [], 'No real React runtime errors');
  } finally { for (const context of contexts) await context.close(); await browser.close(); }
});
