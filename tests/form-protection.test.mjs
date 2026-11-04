import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { getPhoneValidationMessage, getRateLimitMessage, normalizeFormEmail } from '../src/utils/formProtection.js';

const vipSource = await readFile(new URL('../src/pages/VipLanding.jsx', import.meta.url), 'utf8');
const contactSource = await readFile(new URL('../src/pages/Contact.jsx', import.meta.url), 'utf8');
const response = (status, data, headers = {}) => new Response(JSON.stringify(data), { status, headers });
const event = () => ({ preventDefault() {}, currentTarget: { elements: { email: { validity: { typeMismatch: false } } } } });
const extract = (source) => source.match(/const handleSubmit = async[\s\S]*?\n  };/)[0];

function vip(overrides = {}) {
  const state = { status: null, requests: [], navigations: [], storage: [], busy: [], submittingRef: { current: false } };
  const context = {
    email: ' O.Q.A.S.I.W+VIP@GMAIL.COM ', firstName: 'Ana', website: '', marketingConsent: true,
    normalizeFormEmail, getRateLimitMessage,
    submittingRef: state.submittingRef,
    setStatus: status => { state.status = status; },
    setIsSubmitting: busy => state.busy.push(busy),
    navigate: (...args) => state.navigations.push(args),
    window: { sessionStorage: { setItem: (...args) => state.storage.push(args) } },
    API_URL: 'https://forms.invalid',
    fetch: async (url, init) => {
      state.requests.push({ url, body: JSON.parse(init.body) });
      return response(201, { success: true, signup_id: 'confirmed-1' });
    },
    ...overrides,
  };
  state.context = context;
  state.submit = runInNewContext(`${extract(vipSource)}\nhandleSubmit;`, context);
  return state;
}

function contact(overrides = {}) {
  const state = { error: '', submitted: false, requests: [], resets: [], busy: [], timers: [], submittingRef: { current: false } };
  const context = {
    formData: { name: 'Ana', email: ' O.Q.A.S.I.W@GMAIL.COM ', phone: '', message: 'Consulta', company: '' },
    formStartTime: 123456789,
    normalizeFormEmail, getRateLimitMessage, getPhoneValidationMessage,
    submittingRef: state.submittingRef,
    setErrorMessage: error => { state.error = error; },
    setSubmitted: submitted => { state.submitted = submitted; },
    setFormData: data => state.resets.push(data),
    setLoading: busy => state.busy.push(busy),
    setTimeout: (fn, delay) => state.timers.push({ fn, delay }),
    fetch: async (url, init) => {
      state.requests.push({ url, body: JSON.parse(init.body) });
      return response(200, { success: true });
    },
    ...overrides,
  };
  state.context = context;
  const handler = extract(contactSource).replace(/const API_URL = import.meta.env.VITE_API_URL \|\| '[^']+';/, "const API_URL = 'https://forms.invalid';");
  state.submit = runInNewContext(`${handler}\nhandleSubmit;`, context);
  return state;
}

const silentSuccess = { success: true, message: 'Solicitud recibida correctamente.' };

test('form email trims and lowercases but preserves Gmail dots, plus tags and original delivery domain', () => {
  assert.equal(normalizeFormEmail(' O.Q.A.S.I.W+VIP@GMAIL.COM '), 'o.q.a.s.i.w+vip@gmail.com');
  assert.equal(normalizeFormEmail(' A.B@GoogleMail.com '), 'a.b@googlemail.com');
  assert.equal(normalizeFormEmail(' A.B@EXAMPLE.COM '), 'a.b@example.com');
});

test('contact phone rejects exactly ten unprefixed digits including punctuation', () => {
  for (const phone of ['6123456789', '612 345 6789', '(612) 345-6789', '612.345.6789']) {
    assert.match(getPhoneValidationMessage(phone), /diez dígitos.*prefijo internacional/);
  }
});

test('contact phone allows empty, Spanish nine digits and explicit plus or 00 international prefixes', () => {
  for (const phone of ['', ' ', '612345678', '612 345 678', '+1 212 555 1234', '001 212 555 1234', '+34 612345678', '0012345678']) {
    assert.equal(getPhoneValidationMessage(phone), '', phone);
  }
});

test('Retry-After supports seconds, HTTP-date, singular and missing or malformed fallback', () => {
  const now = Date.parse('2026-11-04T21:00:00Z');
  assert.match(getRateLimitMessage('3600', now), /60 minutos/);
  assert.match(getRateLimitMessage('1', now), /1 minuto /);
  assert.match(getRateLimitMessage('Wed, 04 Nov 2026 21:02:00 GMT', now), /2 minutos/);
  for (const value of [null, '', 'not-a-date', '0', '-2', 'Wed, 04 Nov 2026 20:00:00 GMT']) {
    assert.match(getRateLimitMessage(value, now), /Espera un poco/);
  }
});

test('VIP real success includes empty website, preserves consent and name, normalizes only delivery email', async () => {
  const state = vip();
  await state.submit(event());
  assert.deepEqual(state.requests[0].body, { email: 'o.q.a.s.i.w+vip@gmail.com', first_name: 'Ana', marketing_consent: true, website: '' });
  assert.equal(state.navigations[0][0], '/vip/gracias?signup=confirmed-1');
  assert.deepEqual(state.storage, [['mikels:vip-signup:confirmed-1', '1']]);
  assert.deepEqual(state.busy, [true, false]);
});

test('VIP checked consent is mandatory and invalid or empty email sends zero requests', async () => {
  const denied = vip({ marketingConsent: false });
  await denied.submit(event());
  assert.equal(denied.requests.length, 0);
  assert.match(denied.status.message, /Debes aceptar/);
  const empty = vip({ email: ' ' });
  await empty.submit(event());
  assert.equal(empty.requests.length, 0);
  const invalid = vip();
  const invalidEvent = event();
  invalidEvent.currentTarget.elements.email.validity.typeMismatch = true;
  await invalid.submit(invalidEvent);
  assert.equal(invalid.requests.length, 0);
  assert.match(invalid.status.message, /correo electrónico válido/);
});

test('VIP filled website is sent and generic 200 silently shows thanks without signup conversion marker', async () => {
  let body;
  const state = vip({ website: 'https://bot.invalid', fetch: async (_url, init) => {
    body = JSON.parse(init.body);
    return response(200, silentSuccess);
  } });
  await state.submit(event());
  assert.equal(body.website, 'https://bot.invalid');
  assert.equal(state.navigations[0][0], '/vip/gracias');
  assert.equal(state.storage.length, 0);
  assert.equal(state.status.message, '');
});

test('VIP duplicate generic 200 uses the same silent thanks with no synthetic signup id', async () => {
  const state = vip({ fetch: async () => response(200, silentSuccess) });
  await state.submit(event());
  assert.equal(state.navigations[0][0], '/vip/gracias');
  assert.equal(state.storage.length, 0);
});

test('VIP four mocked submissions accept exactly first three and fourth 429 shows Retry-After without replay', async () => {
  let attempts = 0;
  const state = vip({ fetch: async () => ++attempts <= 3
    ? response(201, { success: true, signup_id: `mock-${attempts}` })
    : response(429, { success: false, error: 'rate_limited' }, { 'Retry-After': '3600' }) });
  for (let i = 0; i < 4; i++) await state.submit(event());
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(attempts, 4);
  assert.equal(state.navigations.length, 3);
  assert.match(state.status.message, /60 minutos/);
  assert.equal(state.submittingRef.current, false);
});

test('VIP network failure or malformed 200 never claims signup success', async () => {
  for (const fetch of [async () => { throw new TypeError('Failed to fetch'); }, async () => new Response('invalid-json', { status: 200 })]) {
    const state = vip({ fetch });
    await state.submit(event());
    assert.equal(state.navigations.length, 0);
    assert.equal(state.storage.length, 0);
    assert.equal(state.status.type, 'error');
    assert.ok(state.status.message);
  }
});

test('VIP pending submit lock prevents concurrent double-click API calls and then unlocks', async () => {
  let attempts = 0;
  let finish;
  const state = vip({ fetch: async () => { attempts++; return new Promise(resolve => { finish = resolve; }); } });
  const first = state.submit(event());
  await state.submit(event());
  assert.equal(attempts, 1);
  finish(response(201, { success: true, signup_id: 'one' }));
  await first;
  assert.equal(state.submittingRef.current, false);
});

test('contact honeypot reuses company and _hp, preserves original _ts and all legitimate message fields', async () => {
  const state = contact();
  state.context.formData.company = 'bot-company';
  await state.submit(event());
  assert.deepEqual(state.requests[0].body, {
    name: 'Ana', email: 'o.q.a.s.i.w@gmail.com', phone: '', message: 'Consulta', company: 'bot-company', _hp: 'bot-company', _ts: 123456789,
  });
  assert.equal(state.submitted, true);
  assert.equal(state.resets[0].company, '');
  assert.equal(state.timers[0].delay, 5000);
});

test('contact ten-digit rejection shows reason, preserves form values and makes zero API submissions', async () => {
  const state = contact();
  state.context.formData.phone = '6123456789';
  await state.submit(event());
  assert.match(state.error, /prefijo internacional/);
  assert.equal(state.requests.length, 0);
  assert.equal(state.resets.length, 0);
  assert.equal(state.context.formData.phone, '6123456789');
  assert.equal(state.submitted, false);
});

test('contact empty, Spanish nine-digit and international phones each make one accepted mocked request', async () => {
  for (const phone of ['', '612345678', '+1 2125551234', '001 2125551234']) {
    const state = contact();
    state.context.formData.phone = phone;
    await state.submit(event());
    assert.equal(state.requests.length, 1);
    assert.equal(state.requests[0].body.phone, phone);
    assert.equal(state.submitted, true);
  }
});

test('contact filled honeypot generic 200 has identical normal success UI and no bot warning', async () => {
  const state = contact({ fetch: async () => response(200, silentSuccess) });
  state.context.formData.company = 'bot-company';
  await state.submit(event());
  assert.equal(state.submitted, true);
  assert.equal(state.error, '');
});

test('contact four mocked submissions accept first three and fourth 429 preserves values without automatic retry', async () => {
  let attempts = 0;
  const state = contact({ fetch: async () => ++attempts <= 3
    ? response(200, { success: true })
    : response(429, { success: false, error: 'rate_limited' }, { 'Retry-After': '3600' }) });
  for (let i = 0; i < 4; i++) await state.submit(event());
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(attempts, 4);
  assert.equal(state.resets.length, 3);
  assert.equal(state.submitted, false);
  assert.equal(state.context.formData.message, 'Consulta');
  assert.match(state.error, /60 minutos/);
});

test('contact network or HTTP 500 failure never shows success and does not clear form', async () => {
  for (const fetch of [async () => { throw new TypeError('Failed to fetch'); }, async () => response(500, {})]) {
    const state = contact({ fetch });
    await state.submit(event());
    assert.equal(state.submitted, false);
    assert.equal(state.resets.length, 0);
    assert.ok(state.error);
    assert.equal(state.submittingRef.current, false);
  }
});

test('contact pending submit lock prevents concurrent duplicate requests and clears after response', async () => {
  let attempts = 0;
  let finish;
  const state = contact({ fetch: async () => { attempts++; return new Promise(resolve => { finish = resolve; }); } });
  const first = state.submit(event());
  await state.submit(event());
  assert.equal(attempts, 1);
  finish(response(200, { success: true }));
  await first;
  assert.equal(state.submittingRef.current, false);
});

test('form DOM source retains explicit consent/privacy binding and hidden traps with no VIP phone UI or new consent timestamps', () => {
  for (const source of [vipSource, contactSource]) {
    assert.match(source, /aria-hidden="true"/);
    assert.match(source, /tabIndex=\{-1\}/);
    assert.match(source, /autoComplete="off"/);
    assert.doesNotMatch(source, /captcha|turnstile|x-forwarded-for|consent_timestamp|consent_at/i);
  }
  assert.match(vipSource, /htmlFor="vip-website"/);
  assert.match(vipSource, /name="website"/);
  assert.match(vipSource, /htmlFor="vip-marketing-consent"/);
  assert.match(vipSource, /checked=\{marketingConsent\}/);
  assert.match(vipSource, /to="\/politica-privacidad"/);
  assert.doesNotMatch(vipSource, /type="tel"|name="phone"/);
  assert.match(contactSource, /htmlFor="company"/);
  assert.match(contactSource, /_hp: formData.company/);
  assert.match(contactSource, /_ts: formStartTime/);
});

test('VIP and contact 503 unavailable show a friendly temporary error with no success or automatic retry', async () => {
  let vipAttempts = 0;
  const vipState = vip({ fetch: async () => { vipAttempts++; return response(503, { success: false, error: 'form_unavailable' }); } });
  await vipState.submit(event());
  assert.match(vipState.status.message, /no está disponible temporalmente/);
  assert.equal(vipState.navigations.length, 0);
  assert.equal(vipState.storage.length, 0);
  assert.equal(vipAttempts, 1);
  let contactAttempts = 0;
  const contactState = contact({ fetch: async () => { contactAttempts++; return response(503, { success: false, error: 'form_unavailable' }); } });
  await contactState.submit(event());
  assert.match(contactState.error, /no está disponible temporalmente/);
  assert.equal(contactState.submitted, false);
  assert.equal(contactState.resets.length, 0);
  assert.equal(contactAttempts, 1);
});

test('contact server invalid_phone 400 retains submitted fields and displays returned validation reason', async () => {
  const state = contact({ fetch: async () => response(400, { success: false, code: 'invalid_phone', error: 'Incluye el prefijo internacional del teléfono.' }) });
  await state.submit(event());
  assert.match(state.error, /prefijo internacional/);
  assert.equal(state.submitted, false);
  assert.equal(state.resets.length, 0);
});
