import assert from 'node:assert/strict';
import test from 'node:test';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';

test('shows the detailed Olive Japan award only on ecological oil', () => {
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
    /Medalla de Oro en OLIVE JAPAN 2025 y Medalla de Plata en 2026, el concurso internacional de aceite de oliva de Tokio\./,
  );
  assert.doesNotMatch(ecological.longDescription, /Japón & Nueva York/);
});

test('removes decorative emoji and incomplete awards from other product metadata', () => {
  const product = applyEditorialOverrides({
    slug: 'otro-producto',
    name: 'Producto',
    description: 'Descripción',
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
});
