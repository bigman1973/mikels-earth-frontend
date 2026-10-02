import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/pages/BlogAdmin.jsx', import.meta.url), 'utf8');

test('blog administration reuses the authenticated panel session', () => {
  assert.match(source, /localStorage\.getItem\('admin_token'\)/);
  assert.match(source, /https:\/\/api\.mikels\.es\/api\/blog/);
  assert.doesNotMatch(source, /blog_admin_token/);
  assert.doesNotMatch(source, /\/admin\/login`, \{/);
  assert.doesNotMatch(source, /handleLogin/);
});
