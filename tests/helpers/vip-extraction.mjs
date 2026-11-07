import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Link, MemoryRouter, useNavigate } from 'react-router-dom';
import { transformWithEsbuild } from 'vite';
import { compiledModule } from './vip-conversion-harness.mjs';
import { VIP_ACCESS_START } from '../../src/config/vipSchedule.js';
const root = new URL('../..', import.meta.url);
const baselineCommit = 'b9e22a5fa08db1e2d680b51d842ecaf38936c615';
const fixedDate = class extends Date { static now() { return Date.parse('2026-11-06T09:00:00Z'); } };
export const readVipSource = async () => (await readFile(new URL('src/pages/VipLanding.jsx', root), 'utf8'))
  + (await readFile(new URL('src/components/VipSignup.jsx', root), 'utf8'));

// Render the real original/default card with real React and the real countdown.
// Freeze only time, and fail immediately if SSR tries to perform any mutation.
export async function renderVipSignup(props = {}, source) {
  source ??= await readFile(new URL('src/components/VipSignup.jsx', root), 'utf8');
  const rejectMutation = () => { throw new Error('VIP SSR must not fetch, track, navigate or mutate storage'); };
  const countdown = (await compiledModule('src/components/VipCountdown.jsx', {
    react: React, '../config/vipSchedule': { VIP_ACCESS_START },
  }, { React, Date: fixedDate, fetch: rejectMutation })).default;
  const imports = {
    react: React,
    'react-router-dom': { Link, useNavigate },
    './VipCountdown': countdown,
    '../config/api': { API_URL: 'https://offline.invalid' },
    '../utils/vipMetaConversion': { storeVipConversionProof: rejectMutation },
    '../utils/marketingPopup': { markKnownVipSignup: rejectMutation },
  };
  const code = (await transformWithEsbuild(source, 'VipSignup.jsx', {
    loader: 'jsx', format: 'cjs', jsx: 'transform',
  })).code;
  const module = { exports: {} };
  runInNewContext(code, {
    module, exports: module.exports, React, Date: fixedDate, fetch: rejectMutation,
    require: name => { assert.ok(name in imports, `Unexpected signup import ${name}`); return imports[name]; },
  });
  return renderToString(React.createElement(MemoryRouter, { initialEntries: ['/vip'] },
    React.createElement(module.exports.default, props)));
}

export async function assertVipExtraction() {
  const original = execFileSync('git', ['show', '719a5be0641c3ba3c2345f099be32e7c96facfea:src/pages/VipLanding.jsx'], { encoding: 'utf8' });
  const baseline = execFileSync('git', ['show', `${baselineCommit}:src/components/VipSignup.jsx`], { encoding: 'utf8' });
  const component = await readFile(new URL('src/components/VipSignup.jsx', root), 'utf8');
  const card = source => source.slice(source.indexOf('        <div className="rounded-2xl'), source.indexOf('\n      </section>') < 0 ? source.indexOf('\n  );') : source.indexOf('\n      </section>'));
  assert.equal(card(baseline), card(original), 'The fixed pre-compact card still matches the original production card literally');
  const originalDOM = await renderVipSignup({}, baseline);
  assert.equal(await renderVipSignup(), originalDOM, 'Default /vip DOM, copy, markup, fields, countdown and classes remain byte-identical');
  assert.equal(await renderVipSignup({ compact: false, popupHeader: 'NOT FOR /vip', submitLabel: 'NOT FOR /vip', footerText: 'NOT FOR /vip' }), originalDOM,
    'Explicit compact=false must ignore all popup-only copy props');
  const logic = source => source.slice(source.indexOf('  const navigate'), source.indexOf('  return ('));
  let expected = logic(original)
    .replace('  const [isSubmitting, setIsSubmitting] = useState(false);', '  const [isSubmitting, setIsSubmitting] = useState(false);\n  const submittingRef = useRef(false);')
    .replace('    event.preventDefault();', '    event.preventDefault();\n    if (submittingRef.current) return;')
    .replace('    setIsSubmitting(true);', '    submittingRef.current = true;\n    setIsSubmitting(true);')
    .replace("      window.sessionStorage.setItem(`mikels:vip-signup:${signupId}`, '1');", "      try { window.sessionStorage.setItem(`mikels:vip-signup:${signupId}`, '1'); } catch { /* An accepted signup must still reach confirmation. */ }\n      markKnownVipSignup();")
    .replace('      setIsSubmitting(false);', '      submittingRef.current = false;\n      setIsSubmitting(false);');
  assert.equal(logic(component), expected, 'Only request lock and non-PII suppression marker delta; compact presentation changes no state or submit logic');
  assert.equal(logic(component), logic(baseline), 'The pre-compact signup state and handler are byte-identical');
  const wrapper = await readFile(new URL('src/pages/VipLanding.jsx', root), 'utf8');
  const helmet = source => source.match(/      <Helmet>[\s\S]*?      <\/Helmet>/)[0];
  assert.equal(helmet(wrapper), helmet(original));
  assert.match(wrapper, /useVipPageview\(\)/);
  assert.match(wrapper, /<VipSignup \/>/);
  assert.match(wrapper, /<main className="bg-\[#f5efe4\] py-10 sm:py-16">/);
  assert.match(wrapper, /<section className="mx-auto max-w-xl px-4 sm:px-6">/);
}
