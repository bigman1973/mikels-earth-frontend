import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), 'utf8');

const [contact, turnstile] = await Promise.all([
  read('./src/pages/Contact.jsx'),
  read('./src/components/Turnstile.jsx'),
]);

test('contact form requires a Turnstile token and sends it to the backend', () => {
  assert.match(contact, /import Turnstile from '..\/components\/Turnstile'/);
  assert.match(contact, /action="contact_form"/);
  assert.match(contact, /turnstile_token: turnstileToken/);
  assert.match(contact, /disabled=\{loading \|\| !turnstileToken\}/);
});

test('Turnstile uses explicit rendering and clears expired tokens', () => {
  assert.match(turnstile, /render=explicit/);
  assert.match(turnstile, /'expired-callback': \(\) => onVerify\(''\)/);
  assert.match(turnstile, /onError\?\.\('verification_failed'\)/);
});
