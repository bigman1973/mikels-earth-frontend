import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const publicControlFiles = [
  'src/components/common/Newsletter.jsx',
  'src/pages/Home.jsx',
  'src/pages/LaFamilia.jsx',
  'src/pages/NuestraTierra.jsx',
  'src/pages/NuestrasJoyas.jsx',
  'src/pages/Recetario.jsx',
];

const opaqueSecondaryWithDarkText = /bg-secondary(?!\/)[^"'`\n]*text-(?:primary|gray-[5-9]|\[#1a1a1a\])/;
const opaqueBlackWithDarkText = /(?:bg-black|bg-\[#1a1a1a\])(?!\/)[^"'`\n]*text-(?:primary|gray-[5-9]|\[#1a1a1a\])/;

test('opaque dark public controls always use white text', async () => {
  const failures = [];

  for (const relativePath of publicControlFiles) {
    const source = await readFile(join(root, relativePath), 'utf8');
    if (opaqueSecondaryWithDarkText.test(source) || opaqueBlackWithDarkText.test(source)) {
      failures.push(relativePath);
    }
  }

  assert.deepEqual(failures, [], `Dark public controls with non-white text: ${failures.join(', ')}`);
});
