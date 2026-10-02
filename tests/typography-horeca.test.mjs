import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const readSource = (path) => readFileSync(resolve(process.cwd(), path), 'utf8');

test('the shared heading scale is light, upright, and spaced', () => {
  const css = readSource('src/App.css');

  assert.match(css, /h1, h2, h3, h4, h5, h6\s*\{[\s\S]*font-weight:\s*500 !important;[\s\S]*font-style:\s*normal;[\s\S]*letter-spacing:\s*0\.012em;/);
  assert.match(css, /h1, h2\s*\{\s*letter-spacing:\s*0\.02em;/);
  assert.doesNotMatch(css, /h1, h2, h3, h4, h5, h6\s*\{[\s\S]*font-weight:\s*700;/);
  assert.doesNotMatch(css, /h1, h2, h3, h4, h5, h6\s*\{[\s\S]*font-style:\s*italic;/);
});

test('Horeca uses the brand accent for badges and checklist markers', () => {
  const horeca = readSource('src/pages/Horeca.jsx');

  assert.match(horeca, /bg-primary text-white text-xs px-3 py-1 rounded-full mb-3/);
  assert.match(horeca, /RESERVA · COSECHA 2026\/27/);
  assert.doesNotMatch(horeca, /bg-red-600|from-orange-600|to-amber-600|text-green-600/);
  assert.equal((horeca.match(/text-primary flex-shrink-0/g) || []).length, 8);
});
