// Catálogo oficial de productos de Mikel's Earth
export const products = [
  {
    id: 1,
    name: "Paraguayo en Almíbar",
    slug: "paraguayo-almibar",
    description: "Melocotón plano cultivado en Alcarrás y preparado a mano. Sin aditivos artificiales, 100% natural y vegano.",
    longDescription: "Nuestro paraguayo en almíbar es el producto estrella de Mikel's Earth. Cultivado en los campos de Alcarrás, cada fruta es seleccionada cuidadosamente y preparada siguiendo métodos artesanales transmitidos de generación en generación. El proceso de elaboración respeta los tiempos naturales de la fruta, conservando su sabor auténtico y propiedades nutritivas. Sin conservantes, sin colorantes, solo fruta de calidad y almíbar natural.",
    price: 8.50,
    priceSubscription: 7.50,
    currency: "EUR",
    image: "/images/paraguayo-almibar.jpg",
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
    subscriptionDiscount: 12,
    subscriptionFrequencies: [
      { value: "weekly", label: "Semanal", discount: 15 },
      { value: "biweekly", label: "Quincenal", discount: 12 },
      { value: "monthly", label: "Mensual", discount: 10 }
    ]
  },
  {
    id: 2,
    name: "Nectarina en Almíbar",
    slug: "nectarina-almibar",
    description: "Nectarina cultivada en Alcarrás y preparada a mano. Sin aditivos artificiales, 100% natural y vegano.",
    longDescription: "Nuestra nectarina en almíbar captura la esencia del verano mediterráneo. Cultivada en los campos de Alcarrás, cada fruta es seleccionada en su punto óptimo de maduración y preparada siguiendo métodos artesanales. El proceso de elaboración respeta los tiempos naturales de la fruta, conservando su sabor auténtico y propiedades nutritivas. Sin conservantes, sin colorantes, solo fruta de calidad y almíbar natural.",
    price: 8.50, // Precio temporal (pendiente de confirmar)
    priceSubscription: 7.50, // Precio suscripción temporal (pendiente de confirmar)
    currency: "EUR",
    image: "/images/nectarina-almibar.jpg",
    category: "Conservas",
    tags: ["Vegano", "Sin Gluten", "Artesanal", "Local"],
    stock: 0, // Pendiente de stock
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
    subscriptionDiscount: 12, // Temporal - Pendiente de confirmar
    subscriptionFrequencies: [
      { value: "weekly", label: "Semanal", discount: 15 },
      { value: "biweekly", label: "Quincenal", discount: 12 },
      { value: "monthly", label: "Mensual", discount: 10 }
    ]
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
    image: "/images/aceite-equilibrado.jpg",
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Versátil"],
    stock: 35,
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra",
    nutritionalInfo: {
      calories: "884 kcal/100ml",
      carbs: "0g",
      protein: "0g",
      fat: "100g",
      saturated: "14g"
    },
    subscriptionAvailable: true,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "bimonthly", label: "Bimensual", discount: 8 }
    ]
  },
  {
    id: 4,
    name: "Aceite de Oliva Virgen Extra Ecológico Mikel's Fruit",
    slug: "aceite-oliva-ecologico",
    description: "Aceite de oliva virgen extra ecológico premiado. Intenso, robusto y con carácter.",
    longDescription: "Nuestro aceite ecológico es para los amantes de los sabores intensos. Con un perfil más robusto y un toque picante característico, este aceite es perfecto para guisos, carnes y platos que requieren un aceite con personalidad. Rico en polifenoles y antioxidantes naturales, es uno de los aceites más estables y saludables del mercado. Premiado por su calidad excepcional.",
    price: 13.50,
    priceSubscription: 12.00,
    currency: "EUR",
    image: "/images/aceite-ecologico.jpg",
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Ecológico", "Premiado", "Alto en Polifenoles"],
    stock: 28,
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra ecológico 100%",
    nutritionalInfo: {
      calories: "884 kcal/100ml",
      carbs: "0g",
      protein: "0g",
      fat: "100g",
      saturated: "14g"
    },
    subscriptionAvailable: true,
    subscriptionDiscount: 11,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 11 },
      { value: "bimonthly", label: "Bimensual", discount: 9 }
    ],
    featured: true,
    award: "Premiado"
  },
  {
    id: 5,
    name: "Pack Mermelada & Aceites Premium",
    slug: "pack-mermelada-aceites",
    description: "Pack premium con paraguayo en almíbar y nuestros dos aceites de oliva virgen extra.",
    longDescription: "¿Quieres probar lo mejor de Mikel's Earth? Este pack premium incluye nuestro paraguayo en almíbar estrella y nuestros dos aceites de oliva virgen extra: el equilibrado y el ecológico premiado. Una combinación perfecta que te permitirá descubrir los sabores únicos de nuestros productos artesanales. También es un regalo perfecto para los amantes de la gastronomía de calidad.",
    price: 28.00,
    priceSubscription: null,
    currency: "EUR",
    image: "/images/pack-productos.jpg",
    category: "Packs",
    tags: ["Vegano", "Sin Gluten", "Regalo", "Premium", "Degustación"],
    stock: 20,
    weight: "1720g (720g + 500ml + 500ml)",
    ingredients: "Paraguayo en almíbar (720g), Aceite de oliva virgen extra equilibrado (500ml), Aceite de oliva virgen extra ecológico (500ml)",
    nutritionalInfo: {
      calories: "Variable según producto",
      carbs: "Variable",
      protein: "Variable",
      fat: "Variable",
      saturated: "Variable"
    },
    subscriptionAvailable: false,
    subscriptionFrequencies: []
  },
  {
    id: 6,
    name: "Aceite de Oliva Virgen Extra Temprano 500ml sin filtrar",
    slug: "aceite-temprano-sin-filtrar",
    description: "Aceite de oliva virgen extra sin filtrar, único en su categoría. Sabor extremadamente afrutado con aromas a hierba recién cortada.",
    longDescription: "Nuestro aceite temprano sin filtrar es una edición limitada que captura la esencia más pura del olivo. Elaborado con aceitunas verdes de cosecha temprana, este aceite virgen extra sin filtrar es único en su categoría. Su sabor extremadamente afrutado, con intensos aromas a hierba recién cortada y su color verde intenso, lo convierten en una experiencia sensorial única. Ideal para tomar solo, acompañado con verduras, ensaladas... y darle el toque 'temprano' a tus platos.",
    price: 14.90,
    priceSubscription: null,
    currency: "EUR",
    image: "/images/aceite-temprano-estuche.jpeg",
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Sin Filtrar", "Edición Limitada", "Premium", "Regalo"],
    stock: 15,
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra 100% sin filtrar",
    nutritionalInfo: {
      calories: "884 kcal/100ml",
      carbs: "0g",
      protein: "0g",
      fat: "100g",
      saturated: "14g"
    },
    subscriptionAvailable: false,
    subscriptionFrequencies: [],
    featured: true,
    freeShipping: true,
    limitedEdition: true
  },
  {
    id: 7,
    name: "Mermelada de Paraguayo Artesanal",
    slug: "mermelada-paraguayo",
    description: "Mermelada artesanal con 60% de fruta. 3 veces más fruta que la industria en general. Sin pectinas artificiales ni conservantes.",
    longDescription: "Elaborada con la misma fruta que utilizamos para nuestro paraguayo en almíbar, esta mermelada artesanal captura todo el sabor del verano en un frasco. Con un 60% de fruta (el doble que las mermeladas industriales), sin pectinas artificiales ni conservantes. El resultado es una mermelada de textura suave y sabor intenso que te transportará a los campos de Alcarràs con cada cucharada. 3 veces más fruta que la industria en general.",
    price: 6.50,
    priceSubscription: 5.80,
    currency: "EUR",
    image: "/images/mermelada-paraguayo.jpg",
    category: "Conservas",
    tags: ["Vegano", "Sin Gluten", "Artesanal", "Local", "Alto en Fruta"],
    stock: 30,
    weight: "250g",
    ingredients: "Paraguayo (60%), zumo de limón (0.5%)",
    nutritionalInfo: {
      calories: "177 kcal",
      carbs: "46g",
      protein: "1g",
      fat: "0.1g",
      fiber: "1.5g"
    },
    subscriptionAvailable: true,
    subscriptionDiscount: 10,
    subscriptionFrequencies: [
      { value: "weekly", label: "Semanal", discount: 12 },
      { value: "biweekly", label: "Quincenal", discount: 10 },
      { value: "monthly", label: "Mensual", discount: 8 }
    ],
    claims: ["60% de fruta", "3 veces más fruta que la industria", "Sin conservantes", "Sin colorantes", "Sin espesantes"]
  },
  {
    id: 8,
    name: "Aceite de Oliva Virgen Extra 5L (Caja de 3 unidades)",
    slug: "aceite-5l-caja-3",
    description: "Caja de 3 garrafas de 5 litros de aceite virgen extra de baja acidez. Variedades Picual, Hojiblanca y Arbequina. Ideal para uso cotidiano.",
    longDescription: "Caja de 3 unidades de 5 litros de Aceite Virgen Extra de baja acidez, de las variedades Picual, Hojiblanca y Arbequina. Ideal para uso cotidiano en tu cocina. Nosotros lo utilizamos a diario para todo tipo de recetas. ¿Y tú te animas? Con la compra de 1 caja (3 unidades) no pagas el envío. Formato económico perfecto para familias y uso intensivo en cocina.",
    price: 90.00,
    priceSubscription: null,
    originalPrice: 95.00,
    currency: "EUR",
    image: "/images/aceite-5l-garrafa.jpeg",
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Formato Familiar", "Uso Cotidiano"],
    stock: 10,
    weight: "15L (3 x 5L)",
    ingredients: "Aceite de oliva virgen extra 100% (variedades Picual, Hojiblanca y Arbequina)",
    nutritionalInfo: {
      calories: "884 kcal/100ml",
      carbs: "0g",
      protein: "0g",
      fat: "100g",
      saturated: "14g"
    },
    subscriptionAvailable: false,
    subscriptionFrequencies: [],
    freeShipping: true,
    discount: 5
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
    image: "/images/estuche-extra-1.jpg",
    images: [
      "/images/estuche-extra-1.jpg",
      "/images/estuche-extra-2.jpg",
      "/images/estuche-eco-1.jpg",
      "/images/estuche-eco-2.jpg",
      "/images/estuche-temprano-1.jpg",
      "/images/estuche-temprano-2.jpg"
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
      { id: "extra", name: "Extra Virgin", description: "Diseño crema con ilustración del mas y olivos" },
      { id: "eco", name: "Ecológico", description: "Diseño crema con ilustración de la Seu Vella de Lleida" },
      { id: "temprano", name: "Temprano", description: "Diseño verde oscuro minimalista" }
    ],
    claims: ["3 diseños disponibles", "Presentación premium", "Perfecto para regalo", "No incluye aceite"]
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
  "Presentación"
];

