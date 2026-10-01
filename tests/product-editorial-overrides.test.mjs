import assert from 'node:assert/strict';
import test from 'node:test';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';

test('shows the definitive award history only on ecological oil', () => {
  const ecological = applyEditorialOverrides({
    slug: 'aceite-oliva-ecologico',
    name: 'Aceite ecológico Premiado',
    description: 'Aceite ecológico',
    longDescription: 'Medalla de Oro en Japón & Nueva York. Aceite ecológico certificado.',
    tags: ['Ecológico', 'Premiado'],
    badges: [
      { text: '🏅 MEDALLA DE ORO' },
      { text: 'PREMIADO' },
    ],
  });

  assert.deepEqual(ecological.badges, [{
    text: 'Medalla de Oro · OLIVE JAPAN 2025',
    detailOnly: true,
  }]);
  assert.equal(ecological.name, 'Aceite ecológico');
  assert.deepEqual(ecological.tags, ['Ecológico']);
  assert.match(
    ecological.longDescription,
    /\*\*Premiado cinco años seguidos\.\*\* Seis medallas en los dos concursos internacionales de referencia: oro en el NYIOOC de Nueva York en 2022 y 2024, y oro en OLIVE JAPAN de Tokio en 2025, más plata en 2023, 2022 y 2026\./,
  );
  assert.doesNotMatch(ecological.longDescription, /Japón & Nueva York/);
});

test('shows the Olive Japan 2026 silver medal only on early unfiltered oil', () => {
  const earlyOil = applyEditorialOverrides({
    slug: 'aceite-temprano-sin-filtrar',
    name: 'Aceite temprano sin filtrar',
    description: 'Aceite temprano',
    longDescription: 'Texto anterior',
    badges: [{ text: 'PREMIADO' }],
  });

  assert.deepEqual(earlyOil.badges, [{
    text: 'Medalla de Plata · OLIVE JAPAN 2026',
    detailOnly: true,
  }]);
  assert.match(
    earlyOil.longDescription,
    /\*\*Medalla de Plata en OLIVE JAPAN 2026\*\*, el concurso internacional de aceite de oliva de Tokio, en su primera participación\./,
  );
});

test('removes decorative emoji and incomplete awards from other product metadata', () => {
  const product = applyEditorialOverrides({
    slug: 'otro-producto',
    name: 'Producto',
    description: '🌿 Descripción',
    longDescription: '✨ Texto de producto',
    tags: ['🌿 Vegano'],
    claims: ['✨ Producción limitada'],
    badges: [
      { text: '🎁 REGALO PREMIUM' },
      { text: '🏅 MEDALLA DE ORO' },
      { text: 'PREMIADO' },
    ],
  });

  assert.deepEqual(product.tags, ['Vegano']);
  assert.deepEqual(product.claims, ['Producción limitada']);
  assert.deepEqual(product.badges, [{ text: 'REGALO PREMIUM' }]);
  assert.equal(product.description, 'Descripción');
  assert.equal(product.longDescription, 'Texto de producto');
});
