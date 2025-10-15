// Mock data de productos para Mikel's Earth
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
    subscriptionFrequencies: [
      { value: "weekly", label: "Semanal", discount: 15 },
      { value: "biweekly", label: "Quincenal", discount: 12 },
      { value: "monthly", label: "Mensual", discount: 10 }
    ]
  },
  {
    id: 2,
    name: "Aceite de Oliva Virgen Extra - Arbequina",
    slug: "aceite-oliva-arbequina",
    description: "Aceite de oliva virgen extra de variedad Arbequina. Suave, afrutado y perfecto para ensaladas.",
    longDescription: "Nuestro aceite de oliva virgen extra Arbequina se obtiene de aceitunas cultivadas en nuestros olivares de Lleida. La variedad Arbequina es conocida por su sabor suave y afrutado, con notas de almendra y manzana verde. Prensado en frío para preservar todas sus propiedades antioxidantes y su perfil organoléptico excepcional. Ideal para aliñar ensaladas, carpaccios y platos delicados.",
    price: 12.90,
    priceSubscription: 11.50,
    currency: "EUR",
    image: "/images/aceite-arbequina.jpg",
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "DOP"],
    stock: 32,
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra 100% Arbequina",
    nutritionalInfo: {
      calories: "884 kcal/100ml",
      carbs: "0g",
      protein: "0g",
      fat: "100g",
      saturated: "14g"
    },
    subscriptionAvailable: true,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "bimonthly", label: "Bimensual", discount: 8 }
    ]
  },
  {
    id: 3,
    name: "Aceite de Oliva Virgen Extra - Picual",
    slug: "aceite-oliva-picual",
    description: "Aceite de oliva virgen extra de variedad Picual. Intenso, robusto y con carácter.",
    longDescription: "El aceite Picual es para los amantes de los sabores intensos. Con un perfil más robusto y un toque picante característico, este aceite es perfecto para guisos, carnes y platos que requieren un aceite con personalidad. Rico en polifenoles y antioxidantes naturales, es uno de los aceites más estables y saludables del mercado.",
    price: 13.50,
    priceSubscription: 12.00,
    currency: "EUR",
    image: "/images/aceite-picual.jpg",
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Alto en Polifenoles"],
    stock: 28,
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra 100% Picual",
    nutritionalInfo: {
      calories: "884 kcal/100ml",
      carbs: "0g",
      protein: "0g",
      fat: "100g",
      saturated: "14g"
    },
    subscriptionAvailable: true,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "bimonthly", label: "Bimensual", discount: 8 }
    ]
  },
  {
    id: 4,
    name: "Aceite de Oliva Virgen Extra - Hojiblanca",
    slug: "aceite-oliva-hojiblanca",
    description: "Aceite de oliva virgen extra de variedad Hojiblanca. Equilibrado y versátil.",
    longDescription: "La variedad Hojiblanca ofrece un equilibrio perfecto entre suavidad e intensidad. Con notas herbáceas y un ligero amargor equilibrado, este aceite es extremadamente versátil en la cocina. Perfecto tanto para cocinar como para aliñar, es el aceite todoterreno que no puede faltar en tu despensa.",
    price: 13.20,
    priceSubscription: 11.80,
    currency: "EUR",
    image: "/images/aceite-hojiblanca.jpg",
    category: "Aceites",
    tags: ["Vegano", "Sin Gluten", "Prensado en Frío", "Versátil"],
    stock: 35,
    weight: "500ml",
    ingredients: "Aceite de oliva virgen extra 100% Hojiblanca",
    nutritionalInfo: {
      calories: "884 kcal/100ml",
      carbs: "0g",
      protein: "0g",
      fat: "100g",
      saturated: "14g"
    },
    subscriptionAvailable: true,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "bimonthly", label: "Bimensual", discount: 8 }
    ]
  },
  {
    id: 5,
    name: "Pack Degustación de Aceites",
    slug: "pack-degustacion-aceites",
    description: "Pack con las tres variedades de aceite de oliva virgen extra en formato 250ml cada uno.",
    longDescription: "¿No sabes cuál elegir? Este pack de degustación incluye nuestras tres variedades de aceite de oliva virgen extra: Arbequina, Picual y Hojiblanca. Cada botella de 250ml te permitirá descubrir los matices únicos de cada variedad y encontrar tu favorito. También es un regalo perfecto para los amantes de la gastronomía.",
    price: 28.00,
    priceSubscription: null,
    currency: "EUR",
    image: "/images/pack-aceites.jpg",
    category: "Packs",
    tags: ["Vegano", "Sin Gluten", "Regalo", "Degustación"],
    stock: 20,
    weight: "750ml (3x250ml)",
    ingredients: "Aceite de oliva virgen extra Arbequina, Picual y Hojiblanca",
    nutritionalInfo: {
      calories: "884 kcal/100ml",
      carbs: "0g",
      protein: "0g",
      fat: "100g",
      saturated: "14g"
    },
    subscriptionAvailable: false,
    subscriptionFrequencies: []
  },
  {
    id: 6,
    name: "Mermelada de Paraguayo Artesanal",
    slug: "mermelada-paraguayo",
    description: "Mermelada artesanal elaborada con paraguayos de Alcarrás. Perfecta para desayunos.",
    longDescription: "Elaborada con la misma fruta que utilizamos para nuestro paraguayo en almíbar, esta mermelada artesanal captura todo el sabor del verano en un frasco. Con un 65% de fruta y azúcar de caña, sin pectinas artificiales ni conservantes. El resultado es una mermelada de textura suave y sabor intenso que te transportará a los campos de Alcarrás con cada cucharada.",
    price: 6.50,
    priceSubscription: 5.80,
    currency: "EUR",
    image: "/images/mermelada-paraguayo.jpg",
    category: "Conservas",
    tags: ["Vegano", "Sin Gluten", "Artesanal", "Local"],
    stock: 38,
    weight: "350g",
    ingredients: "Paraguayo (65%), azúcar de caña, zumo de limón",
    nutritionalInfo: {
      calories: "250 kcal/100g",
      carbs: "62g",
      protein: "0.4g",
      fat: "0.1g",
      fiber: "1.5g"
    },
    subscriptionAvailable: true,
    subscriptionFrequencies: [
      { value: "monthly", label: "Mensual", discount: 10 },
      { value: "bimonthly", label: "Bimensual", discount: 8 }
    ]
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
  "DOP",
  "Alto en Polifenoles",
  "Versátil",
  "Regalo",
  "Degustación"
];

