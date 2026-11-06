import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { compiledModule } from './helpers/vip-conversion-harness.mjs';
import { assertVipExtraction } from './helpers/vip-extraction.mjs';
import { VIP_ACCESS_START } from '../src/config/vipSchedule.js';
const storage = () => {
  const map = new Map();
  return { map, get length() { return map.size; }, key: i => [...map.keys()][i] ?? null,
    getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) };
};
async function policy() {
  const localStorage = storage(); const sessionStorage = storage(); const events = [];
  const window = { localStorage, sessionStorage, dispatchEvent: event => events.push(event.type) };
  const api = await compiledModule('src/utils/marketingPopup.js', {
    '../config/vipSchedule.js': { VIP_ACCESS_START },
  }, { window, Event });
  return { api, window, events };
}
test('VIP card is extracted literally with only the authorized single-request lock and boolean marker', assertVipExtraction);
test('VIP entry expires at exact 26 November 09:00 Madrid, not the 25th, with no access gate changes', async () => {
  const { api } = await policy();
  assert.equal(api.isVipPopupBeforeAccess(Date.parse('2026-11-25T08:00:00Z')), true);
  assert.equal(api.isVipPopupBeforeAccess(VIP_ACCESS_START - 1), true);
  for (const value of [VIP_ACCESS_START, VIP_ACCESS_START + 1, NaN, Infinity]) assert.equal(api.isVipPopupBeforeAccess(value), false);
  const popup = await readFile(new URL('../src/components/VipEntryPopup.jsx', import.meta.url), 'utf8');
  assert.match(popup, /VIP_ACCESS_START - Date.now\(\)/);
  assert.match(popup, /visibilitychange/); assert.match(popup, /addEventListener\('focus'/);
  assert.doesNotMatch(popup, /2026-11-25|PUBLIC_ACCESS_START/);
});
test('VIP route allowlist includes store/editorial and excludes sensitive, unknown and nested routes', async () => {
  const { api } = await policy();
  for (const path of ['/', '/tienda', '/tienda/', '/productos', '/producto/aceite', '/blog', '/blog/articulo', '/recetario', '/nuestra-tierra', '/la-familia', '/opiniones']) assert.equal(api.isVipPopupAllowedPath(path), true, path);
  for (const path of ['/vip', '/vip/', '/vip/gracias', '/vip/gracias/', '/admin', '/admin/login', '/admin/blog', '/checkout', '/checkout/pago', '/pago', '/carrito', '/recuperar-carrito/token', '/order-success', '/pedido-confirmado', '/subscription-success', '/suscripcion-exitosa', '/politica-privacidad', '/terminos', '/legal', '/garantia-satisfaccion', '/contacto', '/horeca', '/no-existe', '/blog/article/nested']) assert.equal(api.isVipPopupAllowedPath(path), false, path);
});
test('persistent dismissal, known signup and pre-existing session signup markers suppress VIP without PII', async () => {
  for (const action of ['dismiss', 'known', 'legacy', 'persistent']) {
    const { api, window } = await policy(); assert.equal(api.isVipPopupSuppressed(), false);
    if (action === 'dismiss') api.dismissVipPopup();
    if (action === 'known') api.markKnownVipSignup();
    if (action === 'legacy') window.sessionStorage.setItem('mikels:vip-signup:42', '1');
    if (action === 'persistent') window.localStorage.setItem(api.VIP_POPUP_DISMISSED_KEY, '1');
    assert.equal(api.isVipPopupSuppressed(), true);
    assert.doesNotMatch(JSON.stringify([...window.localStorage.map]), /email|@|token|ip_address|first_name/);
  }
});
test('unreadable storage fails closed; memory marker survives writes failing', async () => {
  const { api, window } = await policy();
  window.localStorage.getItem = () => { throw new Error('blocked'); };
  assert.equal(api.isVipPopupSuppressed(), true);
  window.localStorage.setItem = () => { throw new Error('blocked'); };
  assert.doesNotThrow(() => api.dismissVipPopup()); assert.doesNotThrow(() => api.markKnownVipSignup());
  assert.equal(api.isVipPopupSuppressed(), true);
});
test('coordinator never grants two popup owners; release cannot unlock another owner', async () => {
  const { api, events } = await policy();
  assert.equal(api.claimMarketingPopup('vip'), true);
  assert.equal(api.claimMarketingPopup('newsletter'), false);
  api.releaseMarketingPopup('newsletter'); assert.equal(api.getMarketingPopupOwner(), 'vip');
  api.releaseMarketingPopup('vip'); assert.equal(api.claimMarketingPopup('newsletter'), true);
  assert.equal(api.claimMarketingPopup('vip'), false); assert.equal(events.length, 3);
});
test('exit intent is only a mouse leaving the top viewport, never internal, side, bottom or touch heuristics', async () => {
  const { api } = await policy();
  assert.equal(api.isDesktopTopExit({ relatedTarget: null, clientY: 0, clientX: 300 }, 1000), true);
  assert.equal(api.isDesktopTopExit({ relatedTarget: null, clientY: -1, clientX: 300 }, 1000), true);
  for (const event of [{ relatedTarget: {}, clientY: 0, clientX: 300 }, { relatedTarget: null, clientY: 300, clientX: 0 }, { relatedTarget: null, clientY: 900, clientX: 300 }, { relatedTarget: null, clientY: 0, clientX: -1 }, { relatedTarget: null, clientY: 0, clientX: 1001 }]) assert.equal(api.isDesktopTopExit(event, 1000), false);
  const source = await readFile(new URL('../src/components/NewsletterPopup.jsx', import.meta.url), 'utf8');
  assert.match(source, /matchMedia\('\(hover: hover\) and \(pointer: fine\)'\)/);
  assert.doesNotMatch(source, /25_000|window\.scrollY|popstate|beforeunload|touchstart|touchend|visibilitychange/);
});
test('newsletter submit handler and original route restrictions remain byte-identical to production', async () => {
  const original = execFileSync('git', ['show', '719a5be0641c3ba3c2345f099be32e7c96facfea:src/components/NewsletterPopup.jsx'], { encoding: 'utf8' });
  const current = await readFile(new URL('../src/components/NewsletterPopup.jsx', import.meta.url), 'utf8');
  const handler = source => source.slice(source.indexOf('  const handleSubmit'), source.indexOf('\n  if (!allowedContext)'));
  assert.equal(handler(current), handler(original));
  const routes = execFileSync('git', ['show', '719a5be0641c3ba3c2345f099be32e7c96facfea:src/utils/newsletterPopupPaths.js'], { encoding: 'utf8' });
  assert.equal(await readFile(new URL('../src/utils/newsletterPopupPaths.js', import.meta.url), 'utf8'), routes);
});
