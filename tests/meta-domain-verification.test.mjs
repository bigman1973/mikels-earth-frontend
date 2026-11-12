import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { addMetaDomainVerification, META_DOMAIN_TAG } from '../scripts/add-meta-domain-verification.mjs';

test('Meta domain verification only changes the generated homepage and is idempotent', async () => {
  const out = await mkdtemp(join(tmpdir(), 'mikels-meta-domain-'));
  const original = '<!doctype html><html><head><title>Mikel\'s Fruit</title></head><body>Original content</body></html>\n';
  const vip = '<html><head><meta name="robots" content="noindex, nofollow"></head><body>VIP unchanged</body></html>\n';
  try {
    await mkdir(join(out, 'vip', 'gracias'), { recursive: true });
    await writeFile(join(out, 'index.html'), original);
    await writeFile(join(out, 'vip', 'index.html'), vip);
    await writeFile(join(out, 'vip', 'gracias', 'index.html'), vip);
    await addMetaDomainVerification(out);
    const first = await readFile(join(out, 'index.html'), 'utf8');
    assert.equal(first, original.replace('</head>', `    ${META_DOMAIN_TAG}\n  </head>`));
    assert.equal(first.split(META_DOMAIN_TAG).length - 1, 1);
    await addMetaDomainVerification(out);
    assert.equal(await readFile(join(out, 'index.html'), 'utf8'), first);
    assert.equal(await readFile(join(out, 'vip', 'index.html'), 'utf8'), vip);
    assert.equal(await readFile(join(out, 'vip', 'gracias', 'index.html'), 'utf8'), vip);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});
