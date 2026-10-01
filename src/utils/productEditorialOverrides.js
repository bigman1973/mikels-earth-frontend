const replaceLegacyBrand = (value) => (
  typeof value === 'string'
    ? value.replaceAll("Mikel's Earth", "Mikel's Fruit").replaceAll('Mikels Earth', "Mikel's Fruit")
    : value
);

const stripDecorativeEmoji = (value) => (
  typeof value === 'string'
    ? value
      .replace(/\p{Extended_Pictographic}\uFE0F?/gu, '')
      .replace(/\u200D/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
    : value
);

const isIncompleteAwardBadge = (text) => (
  /MEDALLA DE ORO|PREMIADO/i.test(text || '')
  && !/\b(?:19|20)\d{2}\b/.test(text || '')
);

export const applyEditorialOverrides = (product, language = 'es') => {
  const normalizedProduct = {
    ...product,
    name: stripDecorativeEmoji(replaceLegacyBrand(product.name)),
    description: stripDecorativeEmoji(replaceLegacyBrand(product.description)),
    longDescription: stripDecorativeEmoji(replaceLegacyBrand(product.longDescription)),
    tags: (product.tags || []).map(stripDecorativeEmoji),
    claims: (product.claims || []).map(stripDecorativeEmoji),
    badges: (product.badges || [])
      .map((badge) => ({ ...badge, text: stripDecorativeEmoji(badge?.text) }))
      // The award remains approved in principle, but its competition and year
      // must accompany it before it can be published.
      .filter((badge) => !isIncompleteAwardBadge(badge.text)),
  };

  if (product.slug === 'paraguayo-almibar') {
    const isEnglish = language === 'en';

    return {
      ...normalizedProduct,
      description: isEnglish
        ? 'Flat peach grown in Segrià, hand-peeled piece by piece. No preservatives or colourings.'
        : 'Paraguayo cultivado en el Segrià, pelado a mano, pieza a pieza. Sin conservantes, sin colorantes.',
      longDescription: isEnglish
        ? 'Flat peach in syrup grown in Segrià. It is hand-peeled, piece by piece, so the fruit reaches the jar with its shape, texture and flavour. No preservatives or colourings.'
        : 'Paraguayo en almíbar cultivado en el Segrià. Se pela a mano, pieza a pieza, para que la fruta llegue al tarro con su forma, textura y sabor. Sin conservantes, sin colorantes.',
      ingredients: isEnglish
        ? 'Hand-peeled flat peach, water, sugar, lemon juice'
        : 'Paraguayo pelado, agua, azúcar, zumo de limón',
      badges: (normalizedProduct.badges || []).map((badge) => (
        badge?.text === 'ÚNICO EN EL MUNDO'
          ? { ...badge, text: 'Pelado a mano, pieza a pieza', textKey: 'peeled_by_hand' }
          : badge
      )),
    };
  }

  if (product.slug === 'mermelada-paraguayo') {
    const isEnglish = language === 'en';

    return {
      ...normalizedProduct,
      description: isEnglish
        ? 'Three jars of flat peach jam with 60% fruit. Only flat peach, water, sugar and lemon. No preservatives or colourings.'
        : 'Tres tarros de mermelada de paraguayo con un 60 % de fruta. Solo paraguayo, agua, azúcar y limón. Sin conservantes ni colorantes.',
      longDescription: isEnglish
        ? 'Flat peach, water, sugar and natural lemon juice.\n\n60% fruit. Only four ingredients. No preservatives or colourings.\n\nPack of three 250 g jars in a cardboard case.'
        : 'Paraguayo, agua, azúcar y zumo de limón natural.\n\n60 % de fruta. Solo cuatro ingredientes. Sin conservantes ni colorantes.\n\nPack de tres tarros de 250 g, en estuche de cartón.',
    };
  }

  if (product.slug === 'pack-fruta-premium') {
    return {
      ...normalizedProduct,
      longDescription: normalizedProduct.longDescription
        ?.replace(
          '60% de fruta (3 veces más que la industria). Solo 4 ingredientes: paraguayo, agua, azúcar y zumo de limón natural. Sin conservantes, sin colorantes, sin espesantes.',
          '60 % de fruta. Solo cuatro ingredientes: paraguayo, agua, azúcar y zumo de limón natural. Sin conservantes ni colorantes.'
        )
        ?.replace(
          '60% fruit (3 times more than the industry). Only 4 ingredients: flat peach, water, sugar and natural lemon juice. No preservatives, colourings or thickeners.',
          '60% fruit. Only four ingredients: flat peach, water, sugar and natural lemon juice. No preservatives or colourings.'
        ),
    };
  }

  if (product.slug === 'aceite-temprano-sin-filtrar') {
    const isEnglish = language === 'en';
    const approvedAwardLine = '**Medalla de Plata en OLIVE JAPAN 2026**, el concurso internacional de aceite de oliva de Tokio, en su primera participación.';

    return {
      ...normalizedProduct,
      longDescription: isEnglish
        ? `First-harvest, unfiltered extra virgin olive oil. Green, fresh and slightly peppery, cold-pressed and ideal for salads, toast and carpaccios.\n\n${approvedAwardLine}`
        : `Aceite de oliva virgen extra de primera cosecha, sin filtrar. De perfil verde, fresco y ligeramente picante, prensado en frío e ideal para ensaladas, tostadas y carpaccios.\n\n${approvedAwardLine}`,
      badges: [{
        text: 'Medalla de Plata · OLIVE JAPAN 2026',
        detailOnly: true,
      }],
      tieredDiscount: (normalizedProduct.tieredDiscount || []).map((tier) => {
        const sanitizedTier = { ...tier };
        delete sanitizedTier.description;
        return sanitizedTier;
      }),
    };
  }

  if (product.slug === 'pack-temprano-premium') {
    const isEnglish = language === 'en';

    return {
      ...normalizedProduct,
      longDescription: isEnglish
        ? '**Early-harvest oil, without filters**\n\nA premium gift set with a 500 ml bottle of first-harvest, unfiltered extra virgin olive oil and its premium case.\n\n**Oil profile:**\n- Green, fresh and slightly peppery\n- Cold-pressed\n- Ideal for salads, toast and carpaccios\n\nA limited seasonal edition for those who enjoy authentic olive oil.'
        : '**Aceite temprano, sin filtros**\n\nUn estuche de regalo con una botella de 500 ml de aceite de oliva virgen extra de primera cosecha, sin filtrar, y su estuche premium.\n\n**Perfil del aceite:**\n- Verde, fresco y ligeramente picante\n- Prensado en frío\n- Ideal para ensaladas, tostadas y carpaccios\n\nUna edición limitada de temporada para quienes disfrutan de un aceite auténtico.',
      claims: (normalizedProduct.claims || []).filter((claim) => !/antioxid|polifenol/i.test(claim)),
    };
  }

  if (product.slug === 'pack-aceite-ecologico-premium-estuche-regalo') {
    return {
      ...normalizedProduct,
      description: 'Aceite de oliva virgen extra ecológico presentado en estuche de regalo.',
      longDescription: 'Incluye una botella de 500 ml de aceite de oliva virgen extra ecológico y un estuche de regalo con la Seu Vella de Lleida. Vegano, sin gluten y prensado en frío.',
      tags: (normalizedProduct.tags || []).filter((tag) => !/polifenol|antioxid|premiado/i.test(tag)),
      badges: [],
    };
  }

  if (product.slug === 'aceite-oliva-ecologico') {
    const approvedDescription = 'Coupage de tres variedades de cultivo ecológico certificado: hojiblanca como principal, con picual y arbequina. Vegano, prensado en frío, sin gluten.';
    const approvedAwardLine = '**Premiado cinco años seguidos.** Seis medallas en los dos concursos internacionales de referencia: oro en el NYIOOC de Nueva York en 2022 y 2024, y oro en OLIVE JAPAN de Tokio en 2025, más plata en 2022, 2023 y 2026.';

    return {
      ...normalizedProduct,
      name: normalizedProduct.name.replace(/\s+Premiado\b/gi, '').replace(/\s{2,}/g, ' ').trim(),
      description: approvedDescription,
      nutritionalInfo: {
        ...normalizedProduct.nutritionalInfo,
        coupage: 'Hojiblanca (principal), Picual y Arbequina',
      },
      tags: (normalizedProduct.tags || []).filter((tag) => !/polifenol|antioxid|premiado/i.test(tag)),
      badges: [{
        text: 'Medalla de Oro · OLIVE JAPAN 2025',
        detailOnly: true,
      }],
      longDescription: `${approvedDescription}\n\n${approvedAwardLine}`,
    };
  }

  if (product.slug !== 'aceite-5l-caja-3') return normalizedProduct;

  return {
    ...normalizedProduct,
    description: 'Garrafa de 5 litros de aceite de oliva virgen extra de baja acidez. Variedades Picual, Hojiblanca y Arbequina, de nuestros olivares de Córdoba y Lleida. Prensado en frío.',
    longDescription: 'Garrafa de 5 litros de aceite de oliva virgen extra de baja acidez. Variedades Picual, Hojiblanca y Arbequina, de nuestros olivares de Córdoba y Lleida. Prensado en frío. **8,60 €/litro.** El aceite del día a día: para el sofrito, para la plancha y para aliñar.',
    claims: (normalizedProduct.claims || []).filter(
      (claim) => claim !== 'Solo 6.60€/litro' && claim !== 'Compra 3+ y ahorra 9%',
    ),
  };
};
