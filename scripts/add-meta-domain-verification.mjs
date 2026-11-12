import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const META_DOMAIN_VERIFICATION = 'ngao3k56ffueqtfoxy152yffrmxqvy';
export const META_DOMAIN_TAG = `<meta name="facebook-domain-verification" content="${META_DOMAIN_VERIFICATION}" />`;

export async function addMetaDomainVerification(outDir) {
  // Run after static SEO generation: only the homepage receives this ownership tag.
  // In particular, /vip and /vip/gracias keep their generated HTML unchanged.
  const homepage = resolve(outDir, 'index.html');
  const html = await readFile(homepage, 'utf8');
  if (html.includes(META_DOMAIN_TAG)) return;
  if (!html.includes('</head>')) throw new Error('Homepage has no closing head tag');
  await writeFile(homepage, html.replace('</head>', `    ${META_DOMAIN_TAG}\n  </head>`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await addMetaDomainVerification(process.env.FRONTEND_BUILD_OUTDIR || 'dist');
}
