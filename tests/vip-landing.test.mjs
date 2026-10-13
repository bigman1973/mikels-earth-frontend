import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (relativePath) => readFile(join(root, relativePath), 'utf8');

test('VIP landing is a mobile-first, noindex signup without a displayed discount', async () => {
  const [app, landing, countdown] = await Promise.all([
    read('src/App.jsx'),
    read('src/pages/VipLanding.jsx'),
    read('src/components/VipCountdown.jsx'),
  ]);

  assert.match(app, /path="\/vip\/gracias" element={<VipThanks \/>}/);
  assert.match(app, /path="\/vip" element={<VipLanding \/>}/);
  assert.match(landing, /content="noindex, nofollow"/);
  assert.match(landing, /Acceso anticipado al Black Friday de Mikel/);
  assert.match(landing, /acceso 24 horas antes que el resto/);
  assert.match(landing, /id="vip-email"/);
  assert.match(landing, /id="vip-first-name"/);
  assert.match(landing, /id="vip-marketing-consent"/);
  assert.match(landing, /required/);
  assert.match(landing, /política de privacidad/);
  assert.match(landing, /Quiero entrar en la lista VIP/);
  assert.match(landing, /\/api\/vip\/signup/);
  assert.match(countdown, /2026-11-27T00:00:00\+01:00/);
  assert.doesNotMatch(landing, /% de descuento/);
  assert.doesNotMatch(landing, /carousel|autoplay|video/i);
});

test('VIP conversion events happen only after a confirmed signup on the thank-you page', async () => {
  const [landing, thanks, meta, analytics] = await Promise.all([
    read('src/pages/VipLanding.jsx'),
    read('src/pages/VipThanks.jsx'),
    read('src/utils/metaPixel.js'),
    read('src/utils/googleAnalytics.js'),
  ]);

  assert.match(landing, /mikels:vip-signup:/);
  assert.match(landing, /navigate\(`\/vip\/gracias\?signup=/);
  assert.match(thanks, /trackMetaLead\(`vip-\$\{signupId\}`\)/);
  assert.match(thanks, /trackGA4GenerateLead\(\)/);
  assert.match(thanks, /mikels:vip-lead:/);
  assert.match(thanks, /mikels:vip-signup:/);
  assert.match(thanks, /content="noindex, nofollow"/);
  assert.match(meta, /track\('Lead'/);
  assert.match(analytics, /track\('generate_lead'/);
});
