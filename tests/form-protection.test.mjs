import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { getPhoneValidationMessage } from '../src/utils/formProtection.js';

const vipSource = await readFile(new URL('../src/pages/VipLanding.jsx', import.meta.url), 'utf8');
const contactSource = await readFile(new URL('../src/pages/Contact.jsx', import.meta.url), 'utf8');
const currentThanks = await readFile(new URL('../src/pages/VipThanks.jsx', import.meta.url), 'utf8');
const extract = source => source.match(/const handleSubmit = async[\s\S]*?\n  };/)[0];
const event = () => ({ preventDefault() {} });

function vip(overrides = {}) {
  const state = { requests: [], storage: [], navigations: [], status: null };
  const context = {
    email: 'fixture@example.invalid', firstName: 'Prueba', marketingConsent: true, website: '',
    API_URL: 'https://forms.invalid', setStatus: value => { state.status = value; }, setIsSubmitting() {},
    navigate: (...args) => state.navigations.push(args),
    storeVipConversionProof() { return false; }, // Existing fixture intentionally has no conversion proof.
    window: { sessionStorage: { setItem: (...args) => state.storage.push(args) } },
    fetch: async (_url, init) => {
      state.requests.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ success: true, signup_id: 42 }), { status: 201 });
    }, ...overrides,
  };
  state.submit = runInNewContext(`${extract(vipSource)}\nhandleSubmit;`, context);
  return state;
}

function contact(phone, company = '') {
  const state = { requests: [], alerts: [], resets: [], submitted: false };
  const context = {
    formData: { name: 'Prueba', email: 'fixture@example.invalid', phone, company, message: 'Consulta de prueba' },
    formStartTime: 12345, getPhoneValidationMessage, alert: value => state.alerts.push(value),
    setLoading() {}, setSubmitted: value => { state.submitted = value; },
    setFormData: value => state.resets.push(value), setTimeout() {}, console,
    fetch: async (_url, init) => {
      state.requests.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    },
  };
  const handler = extract(contactSource).replace(/const API_URL = import.meta.env.VITE_API_URL \|\| '[^']+';/, "const API_URL = 'https://forms.invalid';");
  state.submit = runInNewContext(`${handler}\nhandleSubmit;`, context);
  return state;
}

test('optional phone rejects ten unprefixed digits including punctuation', () => {
  for (const phone of ['6123456789', '612 345 6789', '(612) 345-6789', '612.345.6789']) {
    assert.match(getPhoneValidationMessage(phone), /diez dígitos.*prefijo internacional/);
  }
});

test('optional phone accepts empty, Spanish nine digits and international prefixes', () => {
  for (const phone of ['', ' ', '612345678', '612 345 678', '+34612345678', '0034612345678', '0012345678']) {
    assert.equal(getPhoneValidationMessage(phone), '');
  }
});

test('VIP successful submit preserves name, email, explicit consent and honeypot', async () => {
  const state = vip();
  await state.submit(event());
  assert.deepEqual(state.requests[0], { email: 'fixture@example.invalid', first_name: 'Prueba', marketing_consent: true, website: '' });
  assert.equal(state.navigations[0][0], '/vip/gracias?signup=42');
  assert.deepEqual(state.storage, [['mikels:vip-signup:42', '1']]);
});

test('VIP unchecked consent sends nothing', async () => {
  const state = vip({ marketingConsent: false });
  await state.submit(event());
  assert.equal(state.requests.length, 0);
  assert.match(state.status.message, /Debes aceptar/);
});

test('VIP honeypot neutral response shows thanks without conversion marker', async () => {
  let body;
  const state = vip({ website: 'trap', fetch: async (_url, init) => {
    body = JSON.parse(init.body);
    return new Response(JSON.stringify({ success: true, message: 'Solicitud recibida correctamente.' }), { status: 200 });
  } });
  await state.submit(event());
  assert.equal(body.website, 'trap');
  assert.equal(state.navigations[0][0], '/vip/gracias');
  assert.equal(state.storage.length, 0);
  assert.equal(state.status.message, '');
});

test('contact invalid phone never fetches and preserves form values', async () => {
  const state = contact('6123456789');
  await state.submit(event());
  assert.equal(state.requests.length, 0);
  assert.equal(state.resets.length, 0);
  assert.match(state.alerts[0], /prefijo internacional/);
});

test('contact accepted optional phones retain all fields and reset the honeypot', async () => {
  for (const phone of ['', '612345678', '+1 2125551234', '0012125551234']) {
    const state = contact(phone, 'trap');
    await state.submit(event());
    assert.equal(state.requests.length, 1);
    assert.equal(state.requests[0].phone, phone);
    assert.equal(state.requests[0]._hp, 'trap');
    assert.equal(state.requests[0]._ts, 12345);
    assert.equal(state.resets[0].company, '');
    assert.equal(state.submitted, true);
  }
});

test('VIP approved copy, noindex, consent checkbox and privacy binding unchanged from safe production', () => {
  const base = execFileSync('git', ['show', '446ed95fbfe4a05725646ed7040b38cf430c8283:src/pages/VipLanding.jsx'], { encoding: 'utf8' });
  for (const [start, end] of [['      <Helmet>', '          <form'], ['            <label className="flex items-start', '            {status.message'], ['          <p className="mt-3', 'export default']]) {
    const section = source => source.slice(source.indexOf(start), source.indexOf(end));
    assert.equal(section(vipSource), section(base));
  }
  const clock = execFileSync('git', ['diff', '446ed95fbfe4a05725646ed7040b38cf430c8283', '--', 'src/components/VipCountdown.jsx'], { encoding: 'utf8' });
  assert.equal(clock, '');
  // Block A explicitly replaces only the thank-you tracking logic, not its JSX.
  const thanksBase = execFileSync('git', ['show', '446ed95fbfe4a05725646ed7040b38cf430c8283:src/pages/VipThanks.jsx'], { encoding: 'utf8' });
  const render = source => source.slice(source.indexOf('\n  return (\n'));
  assert.equal(render(currentThanks), render(thanksBase));
  assert.match(vipSource, /aria-hidden="true"/);
  assert.match(vipSource, /tabIndex=\{-1\}/);
  assert.match(vipSource, /autoComplete="off"/);
  assert.doesNotMatch(vipSource, /type="tel"|name="phone"/);
});
