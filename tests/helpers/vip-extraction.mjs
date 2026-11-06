import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const root = new URL('../..', import.meta.url);
export const readVipSource = async () => (await readFile(new URL('src/pages/VipLanding.jsx', root), 'utf8'))
  + (await readFile(new URL('src/components/VipSignup.jsx', root), 'utf8'));
export async function assertVipExtraction() {
  const original = execFileSync('git', ['show', '719a5be0641c3ba3c2345f099be32e7c96facfea:src/pages/VipLanding.jsx'], { encoding: 'utf8' });
  const component = await readFile(new URL('src/components/VipSignup.jsx', root), 'utf8');
  const card = source => source.slice(source.indexOf('        <div className="rounded-2xl'), source.indexOf('\n      </section>') < 0 ? source.indexOf('\n  );') : source.indexOf('\n      </section>'));
  assert.equal(card(component), card(original), 'VIP copy, markup and classes are literally identical');
  const logic = source => source.slice(source.indexOf('  const navigate'), source.indexOf('  return ('));
  let expected = logic(original)
    .replace('  const [isSubmitting, setIsSubmitting] = useState(false);', '  const [isSubmitting, setIsSubmitting] = useState(false);\n  const submittingRef = useRef(false);')
    .replace('    event.preventDefault();', '    event.preventDefault();\n    if (submittingRef.current) return;')
    .replace('    setIsSubmitting(true);', '    submittingRef.current = true;\n    setIsSubmitting(true);')
    .replace("      window.sessionStorage.setItem(`mikels:vip-signup:${signupId}`, '1');", "      try { window.sessionStorage.setItem(`mikels:vip-signup:${signupId}`, '1'); } catch { /* An accepted signup must still reach confirmation. */ }\n      markKnownVipSignup();")
    .replace('      setIsSubmitting(false);', '      submittingRef.current = false;\n      setIsSubmitting(false);');
  assert.equal(logic(component), expected, 'Only request lock and non-PII suppression marker delta');
  const wrapper = await readFile(new URL('src/pages/VipLanding.jsx', root), 'utf8');
  const helmet = source => source.match(/      <Helmet>[\s\S]*?      <\/Helmet>/)[0];
  assert.equal(helmet(wrapper), helmet(original));
  assert.match(wrapper, /useVipPageview\(\)/);
  assert.match(wrapper, /<VipSignup \/>/);
  assert.match(wrapper, /<main className="bg-\[#f5efe4\] py-10 sm:py-16">/);
  assert.match(wrapper, /<section className="mx-auto max-w-xl px-4 sm:px-6">/);
}
