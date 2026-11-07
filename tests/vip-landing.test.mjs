import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { VIP_ACCESS_START, PUBLIC_ACCESS_START } from '../src/config/vipSchedule.js';
import { renderVipSignup } from './helpers/vip-extraction.mjs';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = async (relativePath) => readFile(join(root, relativePath), 'utf8').then(async source => relativePath === 'src/pages/VipLanding.jsx' ? source + await readFile(join(root, 'src/components/VipSignup.jsx'), 'utf8') : source);

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
  assert.match(countdown, /import \{ VIP_ACCESS_START \} from '\.\.\/config\/vipSchedule'/);
  assert.match(countdown, /aria-label="Cuenta atrás para el acceso VIP"/);
  assert.doesNotMatch(countdown, /PUBLIC_ACCESS_START|2026-11-27/);
  assert.doesNotMatch(landing, /carousel|autoplay|video/i);
});

test('VIP and public reference times are 09:00 Madrid and exactly 24 hours apart', async () => {
  assert.equal(new Date(VIP_ACCESS_START).toISOString(), '2026-11-26T08:00:00.000Z');
  assert.equal(new Date(PUBLIC_ACCESS_START).toISOString(), '2026-11-27T08:00:00.000Z');
  assert.equal(PUBLIC_ACCESS_START - VIP_ACCESS_START, 24 * 60 * 60 * 1000);

  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  assert.equal(format.format(VIP_ACCESS_START), '26/11/2026, 09:00:00');
  assert.equal(format.format(PUBLIC_ACCESS_START), '27/11/2026, 09:00:00');

  const countdown = await read('src/components/VipCountdown.jsx');
  const getTimeLeft = countdown.match(/const getTimeLeft = \(\) => \{[\s\S]*?\n\};/)?.[0];
  assert.ok(getTimeLeft);
  const at = (now) => JSON.parse(JSON.stringify(runInNewContext(`${getTimeLeft}\ngetTimeLeft();`, {
    VIP_ACCESS_START, Date: { now: () => now },
  })));
  assert.deepEqual(at(VIP_ACCESS_START - 1000), { days: 0, hours: 0, minutes: 0, seconds: 1 });
  assert.deepEqual(at(VIP_ACCESS_START), { days: 0, hours: 0, minutes: 0, seconds: 0 });
  assert.deepEqual(at(PUBLIC_ACCESS_START), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test('VIP landing uses the literal gift promise without synonyms and keeps the new-harvest price below the form', async () => {
  const landing = await read('src/pages/VipLanding.jsx');
  const access = 'Entras en la lista y el 26 de noviembre compras un día antes que nadie.';
  const offer = 'Acceso 24 horas antes de que la oferta se abra al público, y un tarro de nuestra mermelada de regalo con cualquier pack del Black Friday. Hasta agotar existencias.';
  const price = 'El Temprano de la cosecha 2026/27 mantiene su precio de 19,90 €.';
  const copyBlock = landing.match(/<p\b[^>]*>\s*(<span className="block">[\s\S]*?<\/span>)\s*<\/p>/)?.[1];

  assert.ok(copyBlock, 'The existing copy block must contain two separate display lines');
  assert.deepEqual(
    [...copyBlock.matchAll(/<span className="block">([^<]+)<\/span>/g)].map((match) => match[1]),
    [access, offer],
  );
  assert.doesNotMatch(copyBlock, /c[oó]digo|cup[oó]n|descuento|mitad de precio|antes\s*\/\s*ahora/i);
  assert.doesNotMatch(copyBlock, /mermelada de (?:paraguayo|nectarina)|2025\/26|OLIVE JAPAN/i);
  assert.equal(landing.split(access).length - 1, 1);
  assert.equal(landing.split(offer).length - 1, 1);
  assert.ok(landing.includes(price));
  assert.equal(landing.split(price).length - 1, 1);
  assert.match(await renderVipSignup(), /<\/form>\s*<p class="[^"]*text-sm[^"]*">\s*El Temprano de la cosecha 2026\/27 mantiene su precio de 19,90 €\.\s*<\/p>/);
  assert.doesNotMatch(landing, /Recibirás acceso 24 horas antes que el resto|tu código de descuento por correo/);
});

test('default VIP SSR retains original optional name, countdown, unchecked explicit consent and no compact copy', async () => {
  const html = await renderVipSignup();
  assert.match(html, /Acceso anticipado al Black Friday de Mikel&#x27;s, solo para la lista VIP\./);
  assert.match(html, /Entras en la lista y el 26 de noviembre compras un día antes que nadie\./);
  assert.match(html, /Acceso 24 horas antes de que la oferta se abra al público, y un tarro de nuestra mermelada de regalo con cualquier pack del Black Friday\. Hasta agotar existencias\./);
  assert.match(html, /Nombre <span[^>]*>\(opcional\)<\/span>/);
  const name = html.match(/<input[^>]*id="vip-first-name"[^>]*>/)?.[0];
  assert.ok(name); assert.match(name, /name="first_name"/); assert.match(name, /autoComplete="given-name"/);
  assert.match(name, /maxLength="120"/); assert.doesNotMatch(name, /required/);
  const consent = html.match(/<input[^>]*id="vip-marketing-consent"[^>]*>/)?.[0];
  assert.ok(consent); assert.match(consent, /type="checkbox"/); assert.match(consent, /required/);
  assert.doesNotMatch(consent, /checked/);
  assert.match(html, /aria-label="Cuenta atrás para el acceso VIP"/);
  for (const unit of ['días', 'horas', 'minutos', 'segundos']) assert.ok(html.includes(`>${unit}</p>`), unit);
  assert.match(html, /href="\/politica-privacidad"/);
  assert.match(html, />Quiero entrar en la lista VIP<\/button>/);
  assert.doesNotMatch(html, /HASTA EL|\d+(?:[.,]\d+)?\s*%|QUIERO ENTRAR EN LA LISTA|El 26 de noviembre, un día antes que nadie\.|Y un tarro de mermelada de regalo con cualquier pack\./);
});

test('VIP signup keeps mandatory explicit consent, exact privacy link and base request contract without captcha', async () => {
  const landing = await read('src/pages/VipLanding.jsx');

  assert.match(landing, /\[marketingConsent, setMarketingConsent\] = useState\(false\)/);
  assert.match(landing, /if \(!marketingConsent\) \{\s*setStatus\([\s\S]*?\);\s*return;\s*\}/);
  assert.match(landing, /id="vip-marketing-consent"\s*type="checkbox"\s*checked=\{marketingConsent\}[\s\S]*?required/);
  assert.match(landing, /Acepto recibir comunicaciones comerciales de Mikel&apos;s Fruit y he leído la\{' '\}/);
  assert.match(landing, /<Link to="\/politica-privacidad" className="font-medium text-\[#7f1d2d\] underline underline-offset-2">política de privacidad<\/Link>\./);
  assert.match(landing, /method: 'POST'/);
  assert.match(landing, /headers: \{ 'Content-Type': 'application\/json' \}/);
  assert.match(landing, /body: JSON\.stringify\(\{\s*email,\s*first_name: firstName,\s*marketing_consent: true,\s*website,\s*\}\)/);
  assert.match(landing, /if \(!response\.ok \|\| !data\.success \|\| !data\.signup_id\)/);
  assert.match(landing, /disabled=\{isSubmitting\}/);
  assert.doesNotMatch(landing, /captcha|turnstile|trackMetaLead|trackGA4GenerateLead|x-forwarded-for|client_ip|ip_address/i);
});

test('VIP confirmation has the exact combined message without a repeated headline or old follow-up', async () => {
  const thanks = await read('src/pages/VipThanks.jsx');
  const message = thanks.match(/<h1\b[^>]*>([^<]+)<\/h1>\s*<p\b[^>]*>([^<]+)<\/p>/);

  assert.ok(message);
  assert.equal(`${message[1]} ${message[2]}`, 'Ya estás dentro. Revisa tu correo.');
  assert.equal(thanks.split('Ya estás dentro.').length - 1, 1);
  assert.doesNotMatch(thanks, /Te escribiremos el 26 de noviembre con tu acceso|Te escribiremos antes de que se abra el Black Friday para el resto/);
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
  assert.match(landing, /storeVipConversionProof\(signupId, data\.conversion, response\.status\)/);
  assert.match(thanks, /watchMetaVipSignupConfirmation\(signupId, API_URL\)/);
  assert.doesNotMatch(thanks, /trackMetaLead|vip-\$\{signupId\}/);
  assert.match(thanks, /trackGA4GenerateLead\(\)/);
  assert.match(thanks, /mikels:ga4-vip-lead:/);
  assert.match(thanks, /mikels:vip-signup:/);
  assert.match(thanks, /content="noindex, nofollow"/);
  assert.match(meta, /track\('Lead'/);
  assert.match(meta, /fbq\('trackCustom', 'VIPSignupConfirmed'/);
  assert.match(analytics, /track\('generate_lead'/);
});
