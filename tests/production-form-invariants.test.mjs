import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Original production hashes remain fixed. Only block A's exact additive VIP
// storage and the associated test-harness/thanks-render delta are normalized.
const fixture = JSON.parse(await readFile(new URL('./fixtures/production-form-invariants.json', import.meta.url), 'utf8'));
for (const [path, expected] of Object.entries(fixture.files)) {
  test(`production invariant preserves ${path} with only the authorized VIP proof-contract delta`, async () => {
    const bytes = await readFile(new URL(`../${path}`, import.meta.url));
    if (path === 'src/pages/VipLanding.jsx' || path === 'tests/form-protection.test.mjs') {
      const original = execFileSync('git', ['show', `${fixture.productionCommit}:${path}`]);
      assert.equal(createHash(fixture.algorithm).update(original).digest('hex'), expected, 'Original snapshot is unchanged');
      let allowed = original.toString();
      if (path === 'src/pages/VipLanding.jsx') {
        allowed = allowed.replace("import useVipPageview from '../hooks/useVipPageview';\n", "import useVipPageview from '../hooks/useVipPageview';\nimport { storeVipConversionProof } from '../utils/vipMetaConversion';\n")
          .replace("      window.sessionStorage.setItem(`mikels:vip-signup:${signupId}`, '1');\n", "      window.sessionStorage.setItem(`mikels:vip-signup:${signupId}`, '1');\n      storeVipConversionProof(signupId, data.conversion, response.status);\n");
      } else {
        allowed = allowed.replace("const extract = source =>", "const currentThanks = await readFile(new URL('../src/pages/VipThanks.jsx', import.meta.url), 'utf8');\nconst extract = source =>")
          .replace("    window: { sessionStorage:", "    storeVipConversionProof() { return false; }, // Existing fixture intentionally has no conversion proof.\n    window: { sessionStorage:")
          .replace("'src/components/VipCountdown.jsx', 'src/pages/VipThanks.jsx'", "'src/components/VipCountdown.jsx'")
          .replace("  assert.equal(clock, '');\n", "  assert.equal(clock, '');\n  // Block A explicitly replaces only the thank-you tracking logic, not its JSX.\n  const thanksBase = execFileSync('git', ['show', '446ed95fbfe4a05725646ed7040b38cf430c8283:src/pages/VipThanks.jsx'], { encoding: 'utf8' });\n  const render = source => source.slice(source.indexOf('\\n  return (\\n'));\n  assert.equal(render(currentThanks), render(thanksBase));\n");
      }
      assert.equal(bytes.toString(), allowed, 'No change outside the exact VIP contract/harness adaptation');
      return;
    }
    const actual = createHash(fixture.algorithm).update(bytes).digest('hex');
    assert.equal(actual, expected, `Unrelated form changes versus production ${fixture.productionCommit}`);
  });
}
