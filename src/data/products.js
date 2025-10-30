// Catálogo oficial de productos de Mikel's Earth
export const products = [
  {
    id: 1,
    name: "Paraguayo en Almíbar",
    slug: "paraguayo-almibar",
    description: "Melocotón plano cultivado en Alcarràs y preparado a mano. Sin aditivos artificiales, 100% natural y vegano.",
    longDescription: "Nuestro paraguayo en almíbar es el producto estrella de Mikel's Earth. Cultivado en los campos de Alcarràs, cada fruta es seleccionada cuidadosamente y preparada siguiendo métodos artesanales transmitidos de generación en generación. El proceso de elaboración respeta los tiempos naturales de la fruta, conservando su sabor auténtico y propiedades nutritivas. Sin conservantes, sin colorantes, solo fruta de calidad y almíbar natural.",
    price: 14.90,
    priceSubscription: 13.71,
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
    subscriptionAvailable: true,
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
    id: 2,
    name: "Nectarina en Almíbar",
    slug: "nectarina-almibar",
    description: "El melocotón sin complejos: piel lisa, sabor intenso, carácter definido. Cultivada en Alcarràs, seleccionada en su momento de máxima expresión.",
    longDescription: "La nectarina es el melocotón sin complejos: piel lisa, sabor intenso, carácter definido.\n\nCultivada en los campos de Alcarràs, cada fruta es seleccionada en su momento de máxima expresión. Cuando el dulzor y la acidez se equilibran a la perfección.\n\nEl proceso de elaboración respeta los tiempos naturales de la fruta. Sin prisas, sin atajos. El resultado: una nectarina que conserva su textura firme y su sabor auténtico.\n\nSin conservantes. Sin colorantes. Solo fruta de verdad y almíbar natural.",
    price: 14.90,
    priceSubscription: 13.71,
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
    subscriptionAvailable: true,
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
    description: "Aceite de oliva virgen extra equilibrado. Versátil y perfecto para todo tipo de platos.",
    longDescription: "Nuestro aceite de oliva virgen extra equilibrado es el todoterreno de la cocina. Con un perfil organoléptico balanceado entre suavidad e intensidad, es perfecto tanto para cocinar como para aliñar. Prensado en frío para preservar todas sus propiedades antioxidantes y su perfil excepcional. Ideal para el uso diario en cualquier preparación culinaria.",
    price: 10.00,
    priceSubscription: 9.00,
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
    stock: 35,
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
    subscriptionAvailable: true,
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
    priceSubscription: 12.15,
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
    stock: 28,
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
    subscriptionAvailable: true,
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
    description: "Pack premium con paraguayo en almíbar y nuestros dos aceites de oliva virgen extra.",
    longDescription: "¿Quieres probar lo mejor de Mikel's Earth? Este pack premium incluye mermelada de paraguayo artesanal (250g) y 4 botellas de aceite de oliva virgen extra (14ml cada una) para que descubras nuestros diferentes perfiles de sabor. Una combinación perfecta que te permitirá descubrir los sabores únicos de nuestros productos artesanales. También es un regalo perfecto para los amantes de la gastronomía de calidad.",
    price: 9.00,
    priceSubscription: 8.10,
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
    subscriptionAvailable: true,
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
    id: 6,
    name: "Aceite de Oliva Virgen Extra Temprano 500ml sin filtrar",
    slug: "aceite-temprano-sin-filtrar",
    description: "Aceitunas recolectadas en su momento verde. Sin filtrar. Verde intenso, ligeramente picante, con ese amargor noble que indica frescura y calidad.",
    longDescription: "Aceitunas recolectadas en su momento verde, cuando concentran hasta tres veces más polifenoles y antioxidantes.\n\nSin filtrar. Conserva todos sus compuestos beneficiosos: alto contenido en polifenoles, vitamina E y antioxidantes naturales.\n\nVerde intenso, ligeramente picante, con ese amargor noble que indica frescura y calidad. Prensado en frío.\n\nIdeal en crudo: ensaladas, tostadas, carpaccios.\n\nUn aceite que no se disculpa por ser auténtico.",
    price: 14.90,
    priceSubscription: 13.41,
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
    subscriptionAvailable: true,
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
        variantId: "temprano",
        label: "Añadir Estuche Regalo Premium Temprano"
      }
    ],
    featured: true,
    freeShipping: true,
    limitedEdition: true
  },
  {
    id: 7,
    name: "Mermelada de Paraguayo Artesanal",
    slug: "mermelada-paraguayo",
    description: "4 ingredientes. Punto. Sin conservantes. Sin colorantes. Sin espesantes. 60% de fruta, 3 veces más que la industria.",
    longDescription: "Paraguayo (melocotón plano), agua, azúcar, zumo de limón natural.\n\n4 ingredientes. Punto.\n\nSin conservantes. Sin colorantes. Sin espesantes.\n\nElaborada con la misma fruta que utilizamos para nuestro paraguayo en almíbar, esta mermelada artesanal captura todo el sabor del verano en un frasco. Con un 60% de fruta (3 veces más que la industria en general), el resultado es una mermelada de textura suave y sabor intenso que te transportará a los campos de Alcarràs con cada cucharada.",
    price: 6.50,
    priceSubscription: 5.98,
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
    subscriptionAvailable: true,
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
    id: 8,
    name: "Aceite de Oliva Virgen Extra 5L (Caja de 3 unidades)",
    slug: "aceite-5l-caja-3",
    description: "Caja de 3 garrafas de 5 litros de aceite virgen extra de baja acidez. Variedades Picual, Hojiblanca y Arbequina. Solo 6€/litro con envío gratis.",
    longDescription: "El formato más económico para familias que aman el buen aceite. Caja de 3 garrafas de 5 litros de Aceite de Oliva Virgen Extra de baja acidez, procedente de nuestros olivares de Córdoba y Lleida. Variedades Picual, Hojiblanca y Arbequina cuidadosamente seleccionadas y prensadas en frío. Este es el aceite que usamos a diario en nuestra cocina familiar para todo tipo de recetas: desde un sofrito hasta aliñar una ensalada. Su equilibrio perfecto entre sabor y suavidad lo hace ideal para el uso cotidiano. Con la compra de 1 caja (3 unidades) el envío es totalmente gratuito. Formato ahorro perfecto para familias, restaurantes y uso intensivo en cocina.",
    price: 90.00,
    priceSubscription: 81.00,
    originalPrice: 95.00,
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
    weight: "15L (3 x 5L)",
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
    subscriptionAvailable: true,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "quarterly", label: "Trimestral", discount: 8 },
      { value: "biannual", label: "Semestral", discount: 7 }
    ],
    freeShipping: true,
    discount: 5,
    claims: ["Solo 6€/litro", "Envío gratis", "15 litros en total", "Formato ahorro", "De nuestros olivares de Córdoba y Lleida"],
    badges: [
      { text: "Más Vendido", color: "bg-red-600" },
      { text: "Directo del Campo", color: "bg-green-600" }
    ]
  },
  {
    id: 9,
    name: "Estuche de Regalo Premium",
    slug: "estuche-regalo",
    description: "Estuche cilíndrico premium para presentar tu aceite como un auténtico regalo. Disponible en 3 diseños: Extra, Ecológico y Temprano.",
    longDescription: "Transforma tu aceite en un regalo inolvidable con nuestro estuche premium. Diseñado con ilustraciones exclusivas que cuentan nuestra historia: el mas familiar, los olivos centenarios y la Seu Vella de Lleida. Cada estuche es una obra de arte que protege y realza la presentación de nuestros aceites. Perfecto para ocasiones especiales, regalos corporativos o simplemente para dar ese toque de distinción que merece un producto artesanal. Disponible en tres diseños: Extra Virgin (crema con olivos), Ecológico (crema con Seu Vella) y Temprano (verde oscuro minimalista). **Importante: El estuche se vende vacío, sin aceite.**",
    price: 5.00,
    priceSubscription: null,
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
    id: 10,
    name: "Pack Navidad Completo Mikel's Earth",
    slug: "pack-navidad-completo",
    description: "El regalo perfecto para Navidad. Incluye toda nuestra gama de productos: conservas, aceites premium y estuches de regalo. Ahorra 20%.",
    longDescription: "Sorprende esta Navidad con el pack más completo de Mikel's Earth. Una selección cuidadosamente elegida que reúne lo mejor de nuestra tradición familiar: nuestro icónico Paraguayo en Almíbar, la Mermelada Artesanal con 60% de fruta, y nuestra exclusiva colección de aceites premium (Equilibrado, Ecológico Premiado y Temprano sin filtrar). Todo presentado en elegantes estuches de regalo que cuentan nuestra historia. Un regalo que transmite calidad, tradición y amor por lo artesanal. **Especial Navidad: 20% de descuento** sobre el precio individual de los productos.",
    price: 54.90,
    priceSubscription: null,
    originalPrice: 68.40,
    currency: "EUR",
    image: "/images/pack-productos.jpg",
    category: "Packs",
    tags: ["Vegano", "Sin Gluten", "Regalo", "Premium", "Navidad", "Pack Completo"],
    stock: 15,
    weight: "2470g (720g + 250g + 500ml x3 + 3 estuches)",
    ingredients: "Paraguayo en almíbar (720g), Mermelada de paraguayo (250g), Aceite equilibrado (500ml), Aceite ecológico (500ml), Aceite temprano (500ml), 3 estuches de regalo premium",
    nutritionalInfo: {
      calories: "Variable según producto",
      carbs: "Variable",
      protein: "Variable",
      fat: "Variable",
      saturated: "Variable"
    },
    subscriptionAvailable: false,
    subscriptionFrequencies: [],
    freeShipping: true,
    discount: 20,
    featured: true,
    specialOccasion: "Navidad",
    includes: [
      "1x Paraguayo en Almíbar (720g) - 8.50€",
      "1x Mermelada de Paraguayo Artesanal (250g) - 6.50€",
      "1x Aceite de Oliva Equilibrado (500ml) - 10.00€",
      "1x Aceite de Oliva Ecológico Premiado (500ml) - 13.50€",
      "1x Aceite de Oliva Temprano sin filtrar (500ml) - 14.90€",
      "3x Estuches de Regalo Premium - 15.00€"
    ],
    claims: ["20% de descuento", "Envío gratuito", "Edición especial Navidad", "Incluye 3 estuches premium", "Ahorra 13.50€"]
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

