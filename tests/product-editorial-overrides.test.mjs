import assert from 'node:assert/strict';
import test from 'node:test';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';

test('shows the definitive award history only on ecological oil', () => {
  const ecological = applyEditorialOverrides({
    slug: 'aceite-oliva-ecologico',
    name: 'Aceite ecológico Premiado',
    description: 'Aceite ecológico',
    longDescription: 'Medalla de Oro en Japón & Nueva York. Aceite ecológico certificado.',
    nutritionalInfo: { coupage: 'Picual, Hojiblanca y Arbequina' },
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
  assert.equal(
    ecological.description,
    'Coupage de tres variedades de cultivo ecológico certificado: hojiblanca como principal, con picual y arbequina. Vegano, prensado en frío, sin gluten.',
  );
  assert.equal(ecological.nutritionalInfo.coupage, 'Hojiblanca (principal), Picual y Arbequina');
  assert.deepEqual(ecological.tags, ['Ecológico']);
  assert.match(
    ecological.longDescription,
    /\*\*Premiado cinco años seguidos\.\*\* Seis medallas en los dos concursos internacionales de referencia: oro en el NYIOOC de Nueva York en 2022 y 2024, y oro en OLIVE JAPAN de Tokio en 2025, más plata en 2022, 2023 y 2026\./,
  );
  assert.doesNotMatch(ecological.longDescription, /Japón & Nueva York/);
  assert.doesNotMatch(ecological.longDescription, /sabores más potentes y complejos que el convencional/i);
});

test('removes obsolete awards from the ecological gift pack', () => {
  const pack = applyEditorialOverrides({
    slug: 'pack-aceite-ecologico-premium-estuche-regalo',
    name: 'Pack Aceite Ecológico Premium',
    description: 'Medalla de Oro en Japón & Nueva York.',
    longDescription: 'Galardonado con Medalla de Oro en Olive Japan 2022 y 2025.',
    tags: ['Ecológico', 'Premiado'],
    badges: [{ text: 'MEDALLA DE ORO' }],
  });

  assert.equal(pack.description, 'Aceite de oliva virgen extra ecológico presentado en estuche de regalo.');
  assert.doesNotMatch(pack.longDescription, /medalla|premiad/i);
  assert.deepEqual(pack.badges, []);
});

test('publishes the 2026/27 Temprano harvest as a normal sale without prior-lot claims', () => {
  const earlyOil = applyEditorialOverrides({
    slug: 'aceite-temprano-sin-filtrar',
    name: 'Aceite temprano sin filtrar',
    description: 'Aceite temprano',
    longDescription: 'Texto anterior',
    badges: [{ text: 'PREMIADO' }],
    tieredDiscount: [
      { actualQuantity: 3, label: 'Pack de 3' },
      { actualQuantity: 6, label: 'Pack de 6', featured: true },
    ],
  });

  assert.deepEqual(earlyOil.badges, []);
  assert.equal(
    earlyOil.name,
    'Aceite de oliva virgen extra Temprano 2026/27 sin filtrar',
  );
  assert.equal(
    earlyOil.description,
    'AOVE Temprano 2026/27 sin filtrar, elaborado con aceituna verde.',
  );
  assert.equal(
    earlyOil.longDescription,
    'Cosecha 2026/27.\n\nElaborado con aceituna verde, recogida antes de madurar, en una sola pasada y sin filtrar. Da menos aceite por kilo; de ahí su perfil verde, con amargor y picor. Procede de nuestro olivar en la campiña cordobesa.',
  );
  assert.equal(earlyOil.award, null);
  assert.deepEqual(earlyOil.tags, ['Prensado en Frío', 'Sin Filtrar']);
  assert.equal(earlyOil.reservationOnly, false);
  assert.equal(earlyOil.reservationMessage, '');
  assert.equal(earlyOil.price, 19.90);
  assert.equal('tieredDiscount' in earlyOil, false);
  assert.equal('subscriptionDiscount' in earlyOil, false);
  assert.equal('subscriptionFrequencies' in earlyOil, false);
  assert.match(earlyOil.longDescription, /Cosecha 2026\/27\./);
  assert.doesNotMatch(earlyOil.longDescription, /reserva|analítica en curso|última semana de octubre/i);
  assert.doesNotMatch(earlyOil.longDescription, /olive japan|medalla|polifenol|antioxid|vitamina|oro|galardon|oleocanthal|per[oó]xido|acidez|569/i);
  assert.doesNotMatch(earlyOil.longDescription, /[Cc]antidad|[Úú]ltimas unidades|[Qq]uedan \d/);
  assert.doesNotMatch(earlyOil.longDescription, new RegExp(['16', ' de octubre'].join(''), 'i'));
});

test('normalizes legacy Temprano fallback data to the single 19.90 € bottle', () => {
  const earlyOil = applyEditorialOverrides({
    slug: 'aceite-temprano-sin-filtrar',
    name: 'Aceite temprano sin filtrar',
    description: 'Aceite temprano',
    longDescription: 'Texto anterior',
    originalPrice: 17.50,
    subscriptionAvailable: true,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [{ value: 'monthly', discount: 10 }],
    discoveryDiscount: 15,
    tieredDiscount: [
      { actualQuantity: 1, price: 17.50, fixedPack: true },
      { actualQuantity: 3, price: 49.90, fixedPack: true },
    ],
    tieredDiscountConfig: [
      { actualQuantity: 6, price: 94.50, fixedPack: true },
    ],
    volumeDiscount: { minQuantity: 3, discount: 10 },
    volumeDiscountConfig: { minQuantity: 6, discount: 15 },
  });

  assert.equal(earlyOil.price, 19.90);
  for (const key of [
    'originalPrice',
    'subscriptionAvailable',
    'subscriptionDiscount',
    'subscriptionFrequencies',
    'discoveryDiscount',
    'tieredDiscount',
    'tieredDiscountConfig',
    'volumeDiscount',
    'volumeDiscountConfig',
  ]) {
    assert.equal(key in earlyOil, false, `${key} must not survive the Temprano fallback`);
  }
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
