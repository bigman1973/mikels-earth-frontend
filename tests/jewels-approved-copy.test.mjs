import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const expected = {
  paraguayo_name: 'Paraguayo en Almíbar',
  paraguayo_tagline: 'Pelado a mano, pieza a pieza',
  paraguayo_description: 'Paraguayo entero en almíbar ligero. Cuatro ingredientes: fruta, agua, azúcar y zumo de limón.',
  temprano_name: 'Aceite Temprano',
  temprano_tagline: 'Cosecha verde, sin filtrar',
  temprano_reservation_badge: 'RESERVA · COSECHA 2026/27',
  temprano_description: 'Aceituna recogida antes de tiempo. Menos aceite por kilo y más carácter: verde, con cuerpo y ligeramente picante.',
  packs_name: 'Pack Degustación',
  packs_tagline: 'Mermelada y cuatro aceites',
  packs_description: 'Una mermelada de paraguayo y cuatro miniaturas de aceite. Para probarlo todo, o para regalar.',
};

const locale = (name) => JSON.parse(readFileSync(resolve(process.cwd(), `src/i18n/locales/${name}.json`), 'utf8')).jewels;

test('Nuestras Joyas uses the approved product headings and descriptions', () => {
  const page = readFileSync(resolve(process.cwd(), 'src/pages/NuestrasJoyas.jsx'), 'utf8');

  for (const key of Object.keys(expected)) {
    assert.match(page, new RegExp(`jewels\\.${key}`));
  }
});

test('approved jewels copy remains Spanish in both locales pending translation review', () => {
  for (const language of ['es', 'en']) {
    const jewels = locale(language);
    for (const [key, value] of Object.entries(expected)) {
      assert.equal(jewels[key], value, `${language}: ${key}`);
    }
  }
});

test('each jewel routes directly to its approved product detail', () => {
  const page = readFileSync(resolve(process.cwd(), 'src/pages/NuestrasJoyas.jsx'), 'utf8');
  const expectedRoutes = [
    '/producto/paraguayo-almibar',
    '/producto/aceite-5l-caja-3',
    '/producto/aceite-temprano-sin-filtrar',
    '/producto/pack-mermelada-aceites',
  ];

  for (const route of expectedRoutes) {
    assert.match(page, new RegExp(`productPath: '${route}'`));
  }
  assert.match(page, /to=\{collection\.productPath\}/);
});
