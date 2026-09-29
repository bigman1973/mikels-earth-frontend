import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), 'utf8');

const [popup, app, spanish] = await Promise.all([
  read('./src/components/NewsletterPopup.jsx'),
  read('./src/App.jsx'),
  read('./src/i18n/locales/es.json'),
]);

test('newsletter popup waits for a resolved Cookiebot response', () => {
  assert.match(popup, /consentApi\?\.hasResponse === true/);
  assert.match(popup, /window\.addEventListener\('CookiebotOnConsentReady'/);
  assert.match(popup, /CookiebotOnConsentReady/);
  assert.match(popup, /CookiebotOnAccept/);
  assert.match(popup, /CookiebotOnDecline/);
  assert.match(popup, /25_000/);
  assert.match(popup, /window\.scrollY \/ maxScroll >= 0\.5/);
});

test('newsletter popup persists dismissal for thirty days and excludes checkout paths', () => {
  assert.match(popup, /30 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(popup, /new Set\(\['\/carrito', '\/checkout'\]\)/);
  assert.match(popup, /localStorage\.setItem\(POPUP_STORAGE_KEY/);
  assert.doesNotMatch(popup, /fixed inset-0 bg-black/);
  assert.match(popup, /sm:max-w-\[360px\]/);
});

test('newsletter popup requires privacy consent and submits separate consent choices', () => {
  assert.match(popup, /name="privacyPolicyAccepted"/);
  assert.match(popup, /required/);
  assert.match(popup, /name="whatsappMarketingAccepted"/);
  assert.match(popup, /privacy_policy_accepted: formData\.privacyPolicyAccepted/);
  assert.match(popup, /whatsapp_marketing_accepted: formData\.whatsappMarketingAccepted/);
  assert.match(popup, /source: 'popup'/);
  assert.match(popup, /to="\/politica-privacidad"/);
});

test('legacy floating newsletter modal is not mounted', () => {
  assert.doesNotMatch(app, /FloatingNewsletterButton/);
  assert.doesNotMatch(app, /DeferredMarketingWidgets/);
});

test('Spanish newsletter labels preserve the approved privacy and WhatsApp text', () => {
  const labels = JSON.parse(spanish).newsletter_popup;
  assert.equal(labels.phone_help, 'Opcional. Lo usamos para avisarte de tu pedido y de novedades por WhatsApp.');
  assert.equal(`${labels.privacy_prefix} ${labels.privacy_link}`, 'He leído y acepto la política de privacidad');
  assert.equal(labels.whatsapp_consent, 'Quiero recibir novedades y ofertas por WhatsApp');
});
