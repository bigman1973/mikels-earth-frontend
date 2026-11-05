import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Generated from the locally available production commit, not the integrated
// catalogue branch. No Git command or remote access is needed to run this test.
const fixture = JSON.parse(await readFile(new URL('./fixtures/production-form-invariants.json', import.meta.url), 'utf8'));
for (const [path, expected] of Object.entries(fixture.files)) {
  test(`catalogue release preserves production ${path} byte-for-byte`, async () => {
    const actual = createHash(fixture.algorithm).update(await readFile(new URL(`../${path}`, import.meta.url))).digest('hex');
    assert.equal(actual, expected, `Unrelated form changes versus production ${fixture.productionCommit}`);
  });
}
