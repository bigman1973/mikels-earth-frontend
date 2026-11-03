import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (relativePath) => readFile(join(root, relativePath), 'utf8');

test('VIP landing is a mobile-first, noindex signup without discount percentages', async () => {
  const [app, landing, countdown] = await Promise.all([
    read('src/App.jsx'),
    read('src/pages/VipLanding.jsx'),
    read('src/components/VipCountdown.jsx'),
  ]);

  assert.match(app, /path="\/vip\/gracias" element={<VipThanks \/>}/);
  assert.match(app, /path="\/vip" element={<VipLanding \/>}/);
  assert.match(landing, /content="noindex, nofollow"/);
  assert.match(landing, /Acceso anticipado al Black Friday de Mikel/);
  assert.match(landing, /id="vip-email"/);
  assert.match(landing, /id="vip-first-name"/);
  assert.match(landing, /id="vip-marketing-consent"/);
  assert.match(landing, /required/);
  assert.match(landing, /política de privacidad/);
  assert.match(landing, /Quiero entrar en la lista VIP/);
  assert.match(landing, /\/api\/vip\/signup/);
  assert.match(landing, /<VipCountdown \/>/);
  assert.match(countdown, /2026-11-26T00:00:00\+01:00/);
  assert.match(countdown, /aria-label="Cuenta atrás para el acceso VIP"/);
  assert.doesNotMatch(countdown, /2026-11-27/);
  assert.doesNotMatch(landing, /carousel|autoplay|video/i);
});

test('VIP landing uses the exact offer on two lines and the new-harvest price below the form', async () => {
  const landing = await read('src/pages/VipLanding.jsx');
  const access = 'Entras el 26 de noviembre, un día antes que nadie.';
  const offer = 'El Temprano de la cosecha 2025/26, a mitad de precio que la cosecha nueva.';
  const price = 'El Temprano de la cosecha 2026/27 mantiene su precio de 19,90 €.';
  const copyBlock = landing.match(/<p\b[^>]*>\s*(<span className="block">[\s\S]*?<\/span>)\s*<\/p>/)?.[1];

  assert.ok(copyBlock, 'The existing copy block must contain two separate display lines');
  assert.deepEqual(
    [...copyBlock.matchAll(/<span className="block">([^<]+)<\/span>/g)].map((match) => match[1]),
    [access, offer],
  );
  assert.ok(landing.includes(price));
  assert.equal(landing.split(price).length - 1, 1);
  assert.match(landing, /<\/form>\s*<p className="[^"]*text-sm[^"]*">\s*El Temprano de la cosecha 2026\/27 mantiene su precio de 19,90 €\.\s*<\/p>/);
  assert.doesNotMatch(landing, /Recibirás acceso 24 horas antes que el resto|tu código de descuento por correo/);
});

test('VIP confirmation has the exact combined message without a repeated headline or old follow-up', async () => {
  const thanks = await read('src/pages/VipThanks.jsx');
  const message = thanks.match(/<h1\b[^>]*>([^<]+)<\/h1>\s*<p\b[^>]*>([^<]+)<\/p>/);

  assert.ok(message);
  assert.equal(`${message[1]} ${message[2]}`, 'Ya estás dentro. Te escribiremos el 26 de noviembre con tu acceso.');
  assert.equal(thanks.split('Ya estás dentro.').length - 1, 1);
  assert.doesNotMatch(thanks, /Revisa tu correo|Te escribiremos antes de que se abra el Black Friday para el resto/);
});

test('VIP copy has no percentages, struck-through prices or availability counters', async () => {
  const sources = await Promise.all([
    read('src/pages/VipLanding.jsx'),
    read('src/pages/VipThanks.jsx'),
    read('src/components/VipCountdown.jsx'),
  ]);

  for (const source of sources) {
    assert.doesNotMatch(source, /\d+(?:[.,]\d+)?\s*%|por\s+ciento|porcentaje/i);
    assert.doesNotMatch(source, /<(?:s|del|strike)\b|line-through|text-decoration[^\n]*line-through/i);
    assert.doesNotMatch(source, /plazas|cupos|aforo/i);
  }
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
