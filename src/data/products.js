// Catálogo oficial de productos de Mikel's Earth
export const products = [
  {
    id: 8,
    name: "Aceite de Oliva Virgen Extra 5L",
    slug: "aceite-5l-caja-3",
    description: "Garrafa de 5 litros de aceite virgen extra de baja acidez. Variedades Picual, Hojiblanca y Arbequina. Compra 3 o más y ahorra 9% (30€/unidad). Envío gratis.",
    longDescription: "Aceite de Oliva Virgen Extra de baja acidez en formato de 5 litros, procedente de nuestros olivares de Córdoba y Lleida. Variedades Picual, Hojiblanca y Arbequina cuidadosamente seleccionadas y prensadas en frío. Este es el aceite que usamos a diario en nuestra cocina familiar para todo tipo de recetas: desde un sofrito hasta aliñar una ensalada. Su equilibrio perfecto entre sabor y suavidad lo hace ideal para el uso cotidiano.\n\nCompra 3 o más garrafas y obtén un 9% de descuento automático (30€ por garrafa en lugar de 33€). Envío gratuito. Formato ahorro perfecto para familias, restaurantes y uso intensivo en cocina.",
    price: 33.00,
    currency: "EUR",
    image: "/images/aceite-5l-portada.jpg",
    images: [
      "/images/aceite-5l-portada.jpg",
      "/images/aceite-5l-finca-principal.jpg",
      "/images/aceite-5l-lifestyle-1.jpg",
      "/images/aceite-5l-lifestyle-2.jpg",
      "/images/aceite-5l-lifestyle-3.jpg",
      "/images/aceite-5l-3-garrafas.jpg"
    ],
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Formato Familiar", "Uso Cotidiano"],
    stock: 10,
    weight: "5L",
    ingredients: "Aceite de oliva virgen extra 100% (variedades Picual, Hojiblanca y Arbequina)",
    nutritionalInfo: {
      ingredientes: "Aceite de oliva virgen extra 100%",
      coupage: "Picual, Hojiblanca y Arbequina",
      perfilSabor: {
        frutado: "Intenso",
        amargo: "Medio",
        picante: "Medio"
      },
      idealPara: [
        "Aliñar ensaladas y verduras",
        "Sofritos y guisos",
        "Carnes y pescados a la plancha",
        "Uso diario en cocina"
      ]
    },
    subscriptionAvailable: false,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "quarterly", label: "Trimestral", discount: 8 },
      { value: "biannual", label: "Semestral", discount: 7 }
    ],
    volumeDiscount: {
      minQuantity: 3,
      discount: 9.09
    },
    freeShipping: true,
    claims: ["Solo 6.60€/litro", "Envío gratis", "Compra 3+ y ahorra 9%", "Formato ahorro", "De nuestros olivares de Córdoba y Lleida"],
    badges: [
      { text: "Más Vendido", color: "bg-red-600" },
      { text: "Directo del Campo", color: "bg-green-600" }
    ]
  },
  {
    id: 1,
    name: "Paraguayo en Almíbar",
    slug: "paraguayo-almibar",
    description: "Melocotón plano cultivado en Alcarràs y preparado a mano. Sin aditivos artificiales, 100% natural y vegano.",
    longDescription: "Nuestro paraguayo en almíbar es el producto estrella de Mikel's Earth. Cultivado en los campos de Alcarràs, cada fruta es seleccionada cuidadosamente y preparada siguiendo métodos artesanales transmitidos de generación en generación. El proceso de elaboración respeta los tiempos naturales de la fruta, conservando su sabor auténtico y propiedades nutritivas. Sin conservantes, sin colorantes, solo fruta de calidad y almíbar natural.",
    price: 14.90,
    currency: "EUR",
    image: "/images/paraguayo-principal.png",
    images: [
      "/images/paraguayo-principal.png",
      "/images/paraguayo-terraza.png",
      "/images/paraguayo-mujer.png",
      "/images/paraguayo-cocina.png"
    ],
    category: "Conservas",
    tags: ["Vegano", "Sin Gluten", "Artesanal", "Local"],
    stock: 45,
    weight: "720g",
    ingredients: "Paraguayo (melocotón plano), agua, azúcar de caña",
    nutritionalInfo: {
      calories: "85 kcal",
      carbs: "21g",
      protein: "0.5g",
      fat: "0.1g",
      fiber: "1.2g"
    },
    subscriptionAvailable: false,
    subscriptionDiscount: 8,
    subscriptionFrequencies: [
      { value: "quarterly", label: "Trimestral", discount: 8 },
      { value: "biannual", label: "Semestral", discount: 7 }
    ],
    volumeDiscount: {
      minQuantity: 12,
      discount: 8
    },
    badges: [
      { text: "🌍 ÚNICO EN EL MUNDO", color: "bg-gradient-to-r from-blue-600 to-purple-600" }
    ]
  },
  {

    id: 6,
    name: "Aceite de Oliva Virgen Extra Temprano 500ml sin filtrar",
    slug: "aceite-temprano-sin-filtrar",
    description: "Aceitunas recolectadas en su momento verde. Sin filtrar. Verde intenso, ligeramente picante, con ese amargor noble que indica frescura y calidad.",
    longDescription: "Aceitunas recolectadas en su momento verde, cuando concentran hasta tres veces más polifenoles y antioxidantes.\n\nSin filtrar. Conserva todos sus compuestos beneficiosos: alto contenido en polifenoles, vitamina E y antioxidantes naturales.\n\nVerde intenso, ligeramente picante, con ese amargor noble que indica frescura y calidad. Prensado en frío.\n\nIdeal en crudo: ensaladas, tostadas, carpaccios.\n\nUn aceite que no se disculpa por ser auténtico.",
    price: 14.90,
    currency: "EUR",
    image: "/images/aceite-temprano-principal.jpeg",
    images: [
      "/images/aceite-temprano-principal.jpeg",
      "/images/aceite-temprano-estuche-blanco.png",
      "/images/aceite-temprano-lifestyle-ceo.png"
    ],
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Sin Filtrar", "Edición Limitada", "Premium", "Regalo"],
    stock: 15,
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra 100% sin filtrar",
    nutritionalInfo: {
      ingredientes: "Aceite de oliva virgen extra 100% sin filtrar",
      coupage: "Aceitunas verdes de cosecha temprana",
      perfilSabor: {
        frutado: "Extremadamente Intenso",
        amargo: "Noble",
        picante: "Ligero"
      },
      notasCata: "Hierba recién cortada, verde intenso, frescura extrema",
      idealPara: [
        "Ensaladas en crudo",
        "Tostadas y pan",
        "Carpaccios",
        "Platos que requieren frescura"
      ]
    },
    subscriptionAvailable: false,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "quarterly", label: "Trimestral", discount: 8 },
      { value: "biannual", label: "Semestral", discount: 7 }
    ],
    tieredDiscount: [
      { minQuantity: 2, discount: 0, label: "Pack Duo", actualQuantity: 2, freeShipping: true, description: "Incluye polifenoles para dos meses" },
      { minQuantity: 12, discount: 15, label: "1 caja", actualQuantity: 12 },
      { minQuantity: 24, discount: 20, label: "2 cajas", actualQuantity: 24 },
      { minQuantity: 36, discount: 25, label: "4 CAJAS (Pagas 3 + 1 GRATIS)", actualQuantity: 48 }
    ],
    addons: [
      {
        productSlug: "estuche-regalo",
        variantId: "temprano",
        label: "Añadir Estuche Regalo Premium Temprano"
      }
    ],
    featured: true,
    freeShipping: true,
    limitedEdition: true,
    badges: [
      { text: "📦 PACK DÚO", color: "bg-gradient-to-r from-green-600 to-emerald-600", action: "addPackDuo" },
      { text: "🎁 PROMOCIÓN: Hasta 25% dto", color: "bg-gradient-to-r from-red-600 to-pink-600" }
    ]
  },
  {

    id: 2,
    name: "Nectarina en Almíbar",
    slug: "nectarina-almibar",
    description: "El melocotón sin complejos: piel lisa, sabor intenso, carácter definido. Cultivada en Alcarràs, seleccionada en su momento de máxima expresión.",
    longDescription: "La nectarina es el melocotón sin complejos: piel lisa, sabor intenso, carácter definido.\n\nCultivada en los campos de Alcarràs, cada fruta es seleccionada en su momento de máxima expresión. Cuando el dulzor y la acidez se equilibran a la perfección.\n\nEl proceso de elaboración respeta los tiempos naturales de la fruta. Sin prisas, sin atajos. El resultado: una nectarina que conserva su textura firme y su sabor auténtico.\n\nSin conservantes. Sin colorantes. Solo fruta de verdad y almíbar natural.",
    price: 14.90,
    currency: "EUR",
    image: "/images/nectarina-principal.jpg",
    images: [
      "/images/nectarina-principal.jpg",
      "/images/nectarina-desayuno-1.png",
      "/images/nectarina-desayuno-2.png",
      "/images/nectarina-picnic.jpg"
    ],
    category: "Conservas",
    tags: ["Vegano", "Sin Gluten", "Artesanal", "Local"],
    stock: 0,
    weight: "720g",
    ingredients: "Nectarina, agua, azúcar de caña",
    nutritionalInfo: {
      calories: "85 kcal",
      carbs: "21g",
      protein: "0.5g",
      fat: "0.1g",
      fiber: "1.2g"
    },
    subscriptionAvailable: false,
    subscriptionDiscount: 8,
    subscriptionFrequencies: [
      { value: "quarterly", label: "Trimestral", discount: 8 },
      { value: "biannual", label: "Semestral", discount: 7 }
    ],
    volumeDiscount: {
      minQuantity: 12,
      discount: 8
    }
  },
  {

    id: 3,
    name: "Aceite de Oliva Virgen Extra Mikel's Fruit (Equilibrado)",
    slug: "aceite-oliva-equilibrado",
    soldOut: true,
    description: "Aceite de oliva virgen extra equilibrado. Versátil y perfecto para todo tipo de platos.",
    longDescription: "Nuestro aceite de oliva virgen extra equilibrado es el todoterreno de la cocina. Con un perfil organoléptico balanceado entre suavidad e intensidad, es perfecto tanto para cocinar como para aliñar. Prensado en frío para preservar todas sus propiedades antioxidantes y su perfil excepcional. Ideal para el uso diario en cualquier preparación culinaria.",
    price: 10.00,
    currency: "EUR",
    image: "/images/aceite-equilibrado-principal.png",
    images: [
      "/images/aceite-equilibrado-principal.png",
      "/images/aceite-equilibrado-caracteristicas.png",
      "/images/aceite-equilibrado-estuche.png",
      "/images/aceite-equilibrado-finca.jpg"
    ],
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Versátil"],
    stock: 50,
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra",
    nutritionalInfo: {
      ingredientes: "Aceite de oliva virgen extra 100%",
      coupage: "Hojiblanca y Picual",
      perfilSabor: {
        frutado: "Medio",
        amargo: "Suave",
        picante: "Suave"
      },
      idealPara: [
        "Aliñar ensaladas",
        "Cocinar todo tipo de platos",
        "Repostería",
        "Uso diario versátil"
      ]
    },
    subscriptionAvailable: false,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "quarterly", label: "Trimestral", discount: 8 },
      { value: "biannual", label: "Semestral", discount: 7 }
    ],
    volumeDiscount: {
      minQuantity: 12,
      discount: 10
    },
    addons: [
      {
        productSlug: "estuche-regalo",
        variantId: "extra-virgin",
        label: "Añadir Estuche Regalo Premium"
      }
    ]
  },
  {

    id: 4,
    name: "Aceite de Oliva Virgen Extra Ecológico Mikel's Fruit",
    slug: "aceite-oliva-ecologico",
    description: "Medalla de Oro en Japón & Nueva York. Coupage ecológico Picual, Hojiblanca y Arbequina. Reconocido internacionalmente por su intensidad excepcional y equilibrio perfecto.",
    longDescription: "Medalla de Oro en Japón & Nueva York.\n\nCoupage de variedades Picual, Hojiblanca y Arbequina de cultivo ecológico. Reconocido internacionalmente por su intensidad excepcional y equilibrio perfecto.\n\nEl cultivo orgánico concentra sabores más potentes y complejos que el convencional. El resultado: un aceite premiado que destaca en cada cata.\n\nIdeal para quienes buscan un aceite de autor, con personalidad y reconocimiento mundial.\n\nVegano, Prensado en Frío, Sin Gluten, Versátil.",
    price: 13.50,
    currency: "EUR",
    image: "/images/aceite-ecologico-principal.jpg",
    images: [
      "/images/aceite-ecologico-principal.jpg",
      "/images/aceite-ecologico-estuche-blanco.png",
      "/images/aceite-ecologico-lifestyle-terraza.png",
      "/images/aceite-ecologico-lifestyle-campo.png"
    ],
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Ecológico", "Premiado", "Alto en Polifenoles"],
    stock: 0,
    soldOut: true,
    soldOutMessage: "En cosecha - Disponible pronto",
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra ecológico 100%",
    nutritionalInfo: {
      ingredientes: "Aceite de oliva virgen extra ecológico 100%",
      coupage: "Picual, Hojiblanca y Arbequina",
      perfilSabor: {
        frutado: "Intenso",
        amargo: "Medio",
        picante: "Medio-Alto"
      },
      notasCata: "Herbáceo, tomate verde, almendra, equilibrado",
      idealPara: [
        "Guisos y estofados",
        "Carnes a la brasa",
        "Tostadas y pan",
        "Platos con personalidad"
      ]
    },
    subscriptionAvailable: false,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "quarterly", label: "Trimestral", discount: 8 },
      { value: "biannual", label: "Semestral", discount: 7 }
    ],
    volumeDiscount: {
      minQuantity: 12,
      discount: 10
    },
    addons: [
      {
        productSlug: "estuche-regalo",
        variantId: "eco",
        label: "Añadir Estuche Regalo Premium Eco"
      }
    ],
    featured: true,
    award: "Medalla de Oro - Japón & Nueva York",
    badges: [
      { text: "🏅 MEDALLA DE ORO", color: "bg-gradient-to-r from-yellow-500 to-yellow-600" },
      { text: "PREMIADO", color: "bg-gradient-to-r from-purple-600 to-purple-700" }
    ]
  },
  {

    id: 5,
    name: "Pack Degustación Premium",
    slug: "pack-mermelada-aceites",
    description: "Pack premium con mermelada de paraguayo artesanal y 4 botellas de aceite de oliva virgen extra para degustación.",
    longDescription: "¿Quieres probar lo mejor de Mikel's Earth? Este pack premium incluye mermelada de paraguayo artesanal (250g) y 4 botellas de aceite de oliva virgen extra (14ml cada una) para que descubras nuestros diferentes perfiles de sabor. Una combinación perfecta que te permitirá descubrir los sabores únicos de nuestros productos artesanales. También es un regalo perfecto para los amantes de la gastronomía de calidad.",
    price: 9.00,
    currency: "EUR",
    image: "/images/pack-degustacion-abierto.jpeg",
    images: [
      "/images/pack-degustacion-abierto.jpeg",
      "/images/pack-degustacion-principal.jpeg",
      "/images/pack-degustacion-caja.png",
      "/images/pack-degustacion-ceo.png"
    ],
    category: "Packs",
    tags: ["Vegano", "Sin Gluten", "Regalo", "Premium", "Degustación"],
    stock: 20,
    weight: "306g (250g mermelada + 56ml aceite)",
    ingredients: "Mermelada de paraguayo artesanal (250g), 4 botellas de aceite de oliva virgen extra (14ml cada una)",
    nutritionalInfo: {
      calories: "Variable según producto",
      carbs: "Variable",
      protein: "Variable",
      fat: "Variable",
      saturated: "Variable"
    },
    subscriptionAvailable: false,
    subscriptionFrequencies: [
      { value: 'monthly', label: 'Mensual', discount: 10 },
      { value: 'quarterly', label: 'Trimestral', discount: 8 },
      { value: 'semiannual', label: 'Semestral', discount: 7 }
    ],
    volumeDiscount: {
      minQuantity: 12,
      discount: 10
    },
    subscriptionTerms: {
      duration: 12,
      renewalPolicy: "Los precios se revisan anualmente. Al finalizar el periodo, podrás cancelar o renovar tu suscripción."
    }
  },
  {

    id: 7,
    name: "Mermelada de Paraguayo Artesanal",
    slug: "mermelada-paraguayo",
    description: "4 ingredientes. Punto. Sin conservantes. Sin colorantes. Sin espesantes. 60% de fruta, 3 veces más que la industria.",
    longDescription: "Paraguayo (melocotón plano), agua, azúcar, zumo de limón natural.\n\n4 ingredientes. Punto.\n\nSin conservantes. Sin colorantes. Sin espesantes.\n\nElaborada con la misma fruta que utilizamos para nuestro paraguayo en almíbar, esta mermelada artesanal captura todo el sabor del verano en un frasco. Con un 60% de fruta (3 veces más que la industria en general), el resultado es una mermelada de textura suave y sabor intenso que te transportará a los campos de Alcarràs con cada cucharada.",
    price: 6.50,
    currency: "EUR",
    image: "/images/mermelada-principal.png",
    images: [
      "/images/mermelada-principal.png",
      "/images/mermelada-desayuno.png",
      "/images/mermelada-lifestyle.png",
      "/images/mermelada-tarros.png"
    ],
    category: "Conservas",
    tags: ["Vegano", "Sin Gluten", "Artesanal", "Local", "Alto en Fruta"],
    stock: 30,
    weight: "250g",
    ingredients: "Paraguayo (melocotón plano), agua, azúcar, zumo de limón natural",
    nutritionalInfo: {
      calories: "154 kcal",
      carbs: "37g",
      protein: "0.6g",
      fat: "0.1g"
    },
    subscriptionAvailable: false,
    subscriptionDiscount: 8,
    subscriptionFrequencies: [
      { value: "quarterly", label: "Trimestral", discount: 8 },
      { value: "biannual", label: "Semestral", discount: 7 }
    ],
    volumeDiscount: {
      minQuantity: 12,
      discount: 8
    },
    claims: ["4 ingredientes naturales", "60% de fruta", "3 veces más fruta que la industria", "Sin conservantes", "Sin colorantes", "Sin espesantes"]
  },
  {

    id: 9,
    name: "Estuche de Regalo Premium",
    slug: "estuche-regalo",
    description: "Estuche cilíndrico premium para presentar tu aceite como un auténtico regalo. Disponible en 3 diseños: Extra, Ecológico y Temprano.",
    longDescription: "Transforma tu aceite en un regalo inolvidable con nuestro estuche premium. Diseñado con ilustraciones exclusivas que cuentan nuestra historia: el mas familiar, los olivos centenarios y la Seu Vella de Lleida. Cada estuche es una obra de arte que protege y realza la presentación de nuestros aceites. Perfecto para ocasiones especiales, regalos corporativos o simplemente para dar ese toque de distinción que merece un producto artesanal. Disponible en tres diseños: Extra Virgin (crema con olivos), Ecológico (crema con Seu Vella) y Temprano (verde oscuro minimalista). **Importante: El estuche se vende vacío, sin aceite.**",
    price: 5.00,
    currency: "EUR",
    image: "/images/estuche-eco-jardin.jpg",
    images: [
      "/images/estuche-eco-jardin.jpg",
      "/images/estuche-eco-fondo-blanco.jpg",
      "/images/estuche-extra-fondo-blanco.jpg",
      "/images/estuche-temprano-fondo-blanco.jpg",
      "/images/estuche-extra-cocina.jpg"
    ],
    category: "Packs",
    tags: ["Regalo", "Premium", "Presentación"],
    stock: 50,
    weight: "50g",
    ingredients: "Cartón reciclable de alta calidad",
    nutritionalInfo: null,
    subscriptionAvailable: false,
    subscriptionFrequencies: [],
    variants: [
      { 
        id: "extra", 
        name: "Extra Virgin", 
        description: "Diseño crema con ilustración del mas y olivos",
        image: "/images/estuche-extra-fondo-blanco.jpg"
      },
      { 
        id: "eco", 
        name: "Ecológico", 
        description: "Diseño crema con ilustración de la Seu Vella de Lleida",
        image: "/images/estuche-eco-fondo-blanco.jpg"
      },
      { 
        id: "temprano", 
        name: "Temprano", 
        description: "Diseño verde oscuro minimalista",
        image: "/images/estuche-temprano-fondo-blanco.jpg"
      }
    ],
    claims: ["3 diseños disponibles", "Presentación premium", "Perfecto para regalo", "No incluye aceite"]
  },
  {

    id: 11,
    name: "Pack Fruta Premium",
    slug: "pack-fruta-premium",
    description: "El regalo perfecto para los amantes de la fruta artesanal. Pack completo con paraguayo, nectarina y mermelada en estuche de madera premium.",
    longDescription: "**El sabor del verano en un estuche de madera premium**\n\n¿Buscas un regalo especial que transmita calidad y tradición? El Pack Fruta de Mikel's Earth es la elección perfecta.\n\n**CONTENIDO DEL PACK:**\n\n- **1x Paraguayo en Almíbar 720g** - Nuestro producto estrella. Melocotón plano cultivado en Alcarràs, seleccionado a mano y preparado siguiendo métodos artesanales de generación en generación.\n\n- **1x Nectarina en Almíbar 720g** - El melocotón sin complejos: piel lisa, sabor intenso, carácter definido. Cultivada en nuestros campos y seleccionada en su momento de máxima expresión.\n\n- **1x Mermelada de Paraguayo Artesanal 250g** - 60% de fruta (3 veces más que la industria). Solo 4 ingredientes: paraguayo, agua, azúcar y zumo de limón natural. Sin conservantes, sin colorantes, sin espesantes.\n\n- **Estuche de madera premium** - Presentación elegante y reutilizable, perfecta para regalo. Un detalle que marca la diferencia.\n\n**¿Por qué elegir este pack?**\n\n✨ **Fruta 100% artesanal** de nuestros campos de Alcarràs\n🎁 **Presentación premium** en estuche de madera\n❤️ **Sin aditivos artificiales** - Solo ingredientes naturales\n🌿 **Vegano y sin gluten** - Apto para todos\n🎄 **Regalo perfecto** para cualquier ocasión\n\n**Ahorro real**\n\nCuando compras los productos por separado pagas 36,30€. Con este pack, por solo 35€ recibes todo en un elegante estuche de madera que podrás reutilizar para siempre. ¡Ahorras 1,30€ y consigues el estuche gratis!\n\nUn regalo que transmite calidad, tradición y el amor por lo artesanal.",
    price: 35.00,
    originalPrice: 36.30,
    currency: "EUR",
    image: "/images/pack-fruta-principal.jpg",
    images: [
      "/images/pack-fruta-principal.jpg",
      "/images/pack-fruta-estuche.jpg",
      "/images/pack-fruta-lifestyle.jpg",
      "/images/pack-fruta-detalle.jpg"
    ],
    category: "Packs",
    tags: ["Vegano", "Sin Gluten", "Regalo", "Premium", "Artesanal"],
    stock: 20,
    weight: "1690g (720g + 720g + 250g)",
    ingredients: "Paraguayo en almíbar 720g, Nectarina en almíbar 720g, Mermelada de paraguayo 250g, Estuche de madera premium",
    nutritionalInfo: {
      calories: "Variable según producto",
      carbs: "Variable",
      protein: "Variable",
      fat: "Variable"
    },
    subscriptionAvailable: false,
    freeShipping: true,
    featured: true,
    includes: [
      "1x Paraguayo en Almíbar 720g (14,90€)",
      "1x Nectarina en Almíbar 720g (14,90€)",
      "1x Mermelada de Paraguayo 250g (6,50€)",
      "1x Estuche de madera premium reutilizable"
    ],
    claims: ["Estuche de madera incluido", "Fruta 100% artesanal", "Sin aditivos", "Regalo perfecto", "Ahorra 1,30€ + estuche gratis"],
    badges: [
      { text: "🎁 REGALO PREMIUM", color: "bg-gradient-to-r from-amber-600 to-orange-600" }
    ]
  },
  {

    id: 12,
    name: "Pack Temprano Premium",
    slug: "pack-temprano-premium",
    description: "Aceite temprano sin filtrar en estuche premium. El regalo perfecto para los amantes del aceite de calidad excepcional.",
    longDescription: "**El aceite que no se disculpa por ser auténtico**\n\nPara los que entienden de aceite. Para los que buscan algo más que lo ordinario. Para los que aprecian la autenticidad sin filtros.\n\n**CONTENIDO DEL PACK:**\n\n- **Aceite de Oliva Virgen Extra Temprano 500ml sin filtrar** - Aceitunas recolectadas en su momento verde, cuando concentran hasta tres veces más polifenoles y antioxidantes. Sin filtrar para conservar todos sus compuestos beneficiosos.\n\n- **Estuche Premium Temprano** - Presentación elegante y exclusiva que realza la calidad excepcional del aceite. Perfecto para regalo o para lucir en tu cocina.\n\n**Características del aceite:**\n\n🍂 **Cosecha temprana** - Aceitunas verdes en su punto óptimo\n🌿 **Sin filtrar** - Conserva todos sus antioxidantes naturales\n💚 **Verde intenso** - Color que indica frescura y calidad\n🔥 **Ligeramente picante** - Con ese amargor noble de los grandes aceites\n❄️ **Prensado en frío** - Para preservar todas sus propiedades\n\n**Perfil de sabor:**\n- Frutado: Extremadamente intenso\n- Amargo: Noble\n- Picante: Ligero\n- Notas: Hierba recién cortada, verde intenso, frescura extrema\n\n**Ideal para:**\n- Ensaladas en crudo\n- Tostadas y pan\n- Carpaccios\n- Platos que requieren frescura\n\n**¿Por qué este pack?**\n\nEste no es un aceite para cocinar. Es un aceite para disfrutar. Para saborear. Para apreciar cada matiz.\n\nEl estuche premium incluido convierte este aceite excepcional en un regalo memorable. Por solo 4,10€ adicionales, transformas una botella de aceite en una experiencia de regalo completa.\n\n**Edición limitada - Disponible solo en temporada**\n\nEl aceite temprano solo se produce una vez al año, cuando las aceitunas están en su momento verde perfecto. Una vez agotado, hay que esperar a la próxima cosecha.\n\nUn regalo para los que saben apreciar lo auténtico.",
    price: 19.00,
    originalPrice: 14.90,
    currency: "EUR",
    image: "/images/pack-temprano-principal.jpg",
    images: [
      "/images/pack-temprano-principal.jpg",
      "/images/pack-temprano-estuche.jpg",
      "/images/pack-temprano-lifestyle.jpg",
      "/images/aceite-temprano-principal.jpeg"
    ],
    category: "Packs",
    tags: ["Vegano", "Sin Gluten", "Regalo", "Premium", "Edición Limitada", "Sin Filtrar"],
    stock: 15,
    weight: "500ml",
    ingredients: "Aceite de Oliva Virgen Extra Temprano 500ml sin filtrar, Estuche premium temprano",
    nutritionalInfo: {
      ingredientes: "Aceite de oliva virgen extra 100% sin filtrar",
      coupage: "Aceitunas verdes de cosecha temprana",
      perfilSabor: {
        frutado: "Extremadamente Intenso",
        amargo: "Noble",
        picante: "Ligero"
      },
      notasCata: "Hierba recién cortada, verde intenso, frescura extrema",
      idealPara: [
        "Ensaladas en crudo",
        "Tostadas y pan",
        "Carpaccios",
        "Platos que requieren frescura"
      ]
    },
    subscriptionAvailable: false,
    freeShipping: true,
    featured: true,
    limitedEdition: true,
    includes: [
      "1x Aceite Temprano 500ml sin filtrar (14,90€)",
      "1x Estuche premium temprano exclusivo"
    ],
    claims: ["Estuche premium incluido", "Edición limitada", "Sin filtrar", "3x más antioxidantes", "Solo 4,10€ más por el estuche"],
    badges: [
      { text: "🍂 EDICIÓN TEMPRANO", color: "bg-gradient-to-r from-orange-600 to-amber-600" }
    ]
  },
  {

    id: 10,
    name: "Pack Navidad Completo Mikel's Earth",
    slug: "pack-navidad-completo",
    description: "El regalo perfecto para Navidad. Pack completo con aceites premium, conservas artesanales y estuche degustación.",
    longDescription: "Sorprende esta Navidad con el pack más completo de Mikel's Earth. Una selección cuidadosamente elegida que reúne lo mejor de nuestra tradición familiar.\n\n**CONTENIDO DETALLADO DEL PACK:**\n\n**Fuera del estuche:**\n- 1 × Aceite de Oliva Virgen Extra 5L (garrafa)\n- 1 × Aceite Temprano 500ml sin filtrar (con estuche verde oscuro)\n- 1 × Paraguayo en Almíbar 720g\n- 1 × Nectarina en Almíbar 720g\n\n**Dentro del estuche kraft de degustación:**\n- 1 × Mermelada de Paraguayo Artesanal 250g\n- 4 × Botellas de aceite 14ml (formato degustación para probar diferentes perfiles)\n\nUn regalo que transmite calidad, tradición y amor por lo artesanal. Perfecto para compartir en familia o regalar a los amantes de la gastronomía de calidad.",
    price: 81.90,
    originalPrice: null,
    currency: "EUR",
    image: "/images/pack-navidad-principal.jpg",
    images: [
      "/images/pack-navidad-principal.jpg",
      "/images/pack-navidad-exterior.jpg",
      "/images/pack-navidad-lifestyle.jpg",
      "/images/pack-navidad-cocina.jpg"
    ],
    category: "Packs",
    tags: ["Vegano", "Sin Gluten", "Regalo", "Premium", "Navidad", "Pack Completo"],
    stock: 15,
    weight: "7306g (5L + 500ml + 720g + 720g + 250g + 56ml)",
    ingredients: "Aceite 5L, Aceite Temprano 500ml, Paraguayo en almíbar 720g, Nectarina en almíbar 720g, Mermelada de paraguayo 250g, 4 botellas de aceite degustación 14ml, Estuche kraft premium",
    nutritionalInfo: {
      calories: "Variable según producto",
      carbs: "Variable",
      protein: "Variable",
      fat: "Variable",
      saturated: "Variable"
    },
    subscriptionAvailable: false,
    subscriptionFrequencies: [
      { value: 'monthly', label: 'Mensual', discount: 10 },
      { value: 'quarterly', label: 'Trimestral', discount: 8 },
      { value: 'semiannual', label: 'Semestral', discount: 7 }
    ],
    volumeDiscount: {
      minQuantity: 12,
      discount: 15
    },
    subscriptionTerms: {
      duration: 12,
      renewalPolicy: "Los precios se revisan anualmente. Al finalizar el periodo, podrás cancelar o renovar tu suscripción."
    },
    freeShipping: true,
    featured: true,
    specialOccasion: "Navidad",
    includes: [
      "1x Aceite de Oliva Virgen Extra 5L (garrafa)",
      "1x Aceite Temprano 500ml sin filtrar (con estuche)",
      "1x Paraguayo en Almíbar 720g",
      "1x Nectarina en Almíbar 720g",
      "1x Mermelada de Paraguayo 250g",
      "4x Botellas de aceite degustación 14ml",
      "1x Estuche kraft premium con historia de Mikel's"
    ],
    claims: ["Pack completo premium", "Envío gratuito", "Edición especial Navidad", "Incluye estuche degustación", "7 productos + estuche"],
    relatedProducts: ["pack-fruta-premium", "pack-temprano-premium"]
  }
];

export const categories = [
  { id: "all", name: "Todos", slug: "all" },
  { id: "conservas", name: "Conservas", slug: "conservas" },
  { id: "aceites", name: "Aceites", slug: "aceites" },
  { id: "packs", name: "Packs", slug: "packs" }
];

export const tags = [
  "Vegano",
  "Sin Gluten",
  "Artesanal",
  "Local",
  "Prensado en Frío",
  "Ecológico",
  "Premiado",
  "Alto en Polifenoles",
  "Versátil",
  "Regalo",
  "Premium",
  "Degustación",
  "Sin Filtrar",
  "Edición Limitada",
  "Alto en Fruta",
  "Formato Familiar",
  "Uso Cotidiano",
  "Presentación",
  "Navidad",
  "Pack Completo"
];

