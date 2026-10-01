import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_ROOT = join(ROOT, 'src');
const LOCALE_FILES = {
  es: join(SOURCE_ROOT, 'i18n', 'locales', 'es.json'),
  en: join(SOURCE_ROOT, 'i18n', 'locales', 'en.json'),
};

const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' && !Array.isArray(child)
    ? flatten(child, path)
    : [path];
});

const sourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(?:js|jsx|mjs)$/.test(entry.name) ? [target] : [];
  }));
  return nested.flat();
};

const literalTranslationKeys = async () => {
  const keys = new Map();
  const files = await sourceFiles(SOURCE_ROOT);
  const matcher = /\bt\(\s*['\"]([A-Za-z0-9_.-]+)['\"]/g;

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(matcher)) {
      const key = match[1];
      const references = keys.get(key) || [];
      references.push(relative(ROOT, file));
      keys.set(key, references);
    }
  }

  return keys;
};

test('every literal t() key used by the application exists in both locales', async () => {
  const [spanish, english, keys] = await Promise.all([
    readFile(LOCALE_FILES.es, 'utf8').then(JSON.parse).then(flatten).then((items) => new Set(items)),
    readFile(LOCALE_FILES.en, 'utf8').then(JSON.parse).then(flatten).then((items) => new Set(items)),
    literalTranslationKeys(),
  ]);

  const missing = [];
  for (const [key, references] of keys) {
    const absent = [];
    if (!spanish.has(key)) absent.push('es');
    if (!english.has(key)) absent.push('en');
    if (absent.length) missing.push(`${key} (${absent.join(', ')}; ${references.join(', ')})`);
  }

  assert.deepEqual(missing, [], `missing translation keys:\n${missing.join('\n')}`);
});
