import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Leaf, Droplet, Gift } from 'lucide-react';

const NuestrasJoyas = () => {
  const collections = [
    {
      id: 'paraguayo',
      name: 'Paraguayo en Almíbar',
      tagline: 'La Joya de Alcarràs',
      icon: <Sparkles className="text-secondary" size={48} />,
      description: 'El melocotón plano que conquistó nuestros corazones hace más de un siglo. Cultivado en Alcarràs, seleccionado a mano, cocido con paciencia y envasado con amor.',
      features: [
        'Melocot\u00f3n plano de Alcarr\u00e0s',
        'Cosecha manual en punto \u00f3ptimo',
        'Pelado y deshuesado a mano',
        'Cocci\u00f3n milim\u00e9trica',
        'Sin conservantes ni colorantes',
        'Vegano y sin gluten'
      ],
      story: 'En 1920, nuestra familia descubrió el paraguayo en los campos de Alcarràs. Su sabor dulce, su textura perfecta y su forma única nos enamoraron. Desde entonces, cada verano esperamos con ansias la cosecha para crear esta joya que es mucho más que una conserva: es un pedazo de nuestra historia.',
      uses: 'Perfecto solo, con yogur, en postres o como acompañamiento de quesos. Un bocado de verano en cualquier época del año.'
    },
    {
      id: 'aceites',
      name: 'Aceites de Oliva Virgen Extra',
      tagline: 'El Oro Líquido de Córdoba',
      icon: <Droplet className="text-secondary" size={48} />,
      description: 'Tres variedades, tres personalidades, un mismo compromiso con la excelencia. Nuestros aceites son el resultado de generaciones de conocimiento y pasión por el olivo.',
      features: [
        'Cosecha manual de aceitunas',
        'Prensado en frío',
        'Sin filtrar para máximo sabor',
        'Tres variedades: Arbequina, Picual, Hojiblanca',
        'Certificación ecológica'
      ],
      story: 'Los olivares de Córdoba son nuestro segundo hogar. Árboles centenarios que han visto pasar generaciones, que producen aceitunas de una calidad excepcional. Cada variedad tiene su momento, su carácter, su historia. Y todas comparten nuestra obsesión por la calidad.',
      uses: 'Nuestro Temprano, sin filtrar para ensaladas, verduras. El ecol\u00f3gico para guisos potentes. Nuestro convencional para todo tipo de platos.'
    },
    {
      id: 'temprano',
      name: 'Aceite Temprano',
      tagline: 'Para Paladares Valientes',
      icon: <Leaf className="text-secondary" size={48} />,
      description: 'No es para todos. Y nos encanta. Este aceite de cosecha temprana, elaborado con aceitunas verdes, es intenso, picante, con un frutado verde que explota en boca.',
      features: [
        'Aceitunas verdes recogidas antes de madurar',
        'Intensidad máxima',
        'Picante y amargo equilibrados',
        'Edición limitada',
        'Para verdaderos amantes del AOVE'
      ],
      story: 'El Temprano nació de una obsesión: capturar la esencia más pura del olivo. Recoger las aceitunas cuando aún están verdes, cuando tienen más polifenoles, más aromas, más vida. El resultado es un aceite que no deja indiferente. O lo amas o lo odias. Nosotros lo amamos.',
      uses: 'Tostadas de pan, pescados crudos, carpaccios, ensaladas. Donde quieras un golpe de sabor auténtico.'
    },
    {
      id: 'packs',
      name: 'Packs Degustación',
      tagline: 'El Regalo Perfecto',
      icon: <Gift className="text-secondary" size={48} />,
      description: 'Combina nuestras joyas en packs cuidadosamente seleccionados. El regalo perfecto para quien aprecia lo auténtico, lo artesanal, lo hecho con amor.',
      features: [
        'Combinaciones exclusivas',
        'Presentación premium',
        'Tarjeta con historia de cada producto',
        'Ideal para regalar',
        'Envío cuidado'
      ],
      story: 'Creamos estos packs pensando en aquellos que quieren descubrir nuestra historia completa. Cada pack cuenta una parte de nuestro viaje, de nuestra tierra, de nuestra familia. Es la manera perfecta de compartir lo que amamos.',
      uses: 'Regala tradición, regala calidad, regala historia. O date el capricho de descubrir todas nuestras joyas.'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-b from-secondary/20 to-white flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkNGUxNTciIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLThjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4 relative z-10"
        >
          <Sparkles className="mx-auto text-secondary mb-4" size={60} />
          <h1 className="text-5xl md:text-7xl font-script text-primary mb-6">
            Nuestras Joyas
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 max-w-3xl mx-auto">
            No son solo productos. Son 200 años de tradición en cada frasco
          </p>
        </motion.div>
      </section>

      {/* Introducción */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-primary mb-6">
              Cada Producto es una Joya
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Las llamamos "joyas" porque así las tratamos. Con el mismo cuidado que 
              un joyero talla un diamante, nosotros elaboramos cada producto. Seleccionando 
              la mejor materia prima, aplicando técnicas ancestrales, dedicando el tiempo 
              necesario para alcanzar la perfección.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              No producimos en masa. No buscamos cantidad. Buscamos calidad, autenticidad, 
              excelencia. Cada joya que sale de nuestro obrador es única, especial, digna 
              de llevar nuestro nombre.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Colecciones */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-24">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                {/* Imagen placeholder */}
                <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-accent/30 to-secondary/30 rounded-2xl flex items-center justify-center overflow-hidden">
                      <div className="text-center p-8">
                        {collection.icon}
                        <p className="text-primary/50 mt-4">
                          [Imagen de {collection.name}]
                        </p>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 bg-secondary text-primary px-6 py-2 rounded-full font-bold shadow-lg">
                      {collection.tagline}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <h3 className="text-4xl font-bold text-primary mb-4">
                    {collection.name}
                  </h3>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {collection.description}
                  </p>

                  {/* Características */}
                  <div className="mb-6">
                    <h4 className="font-bold text-primary mb-3">Características:</h4>
                    <ul className="space-y-2">
                      {collection.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2">
                          <span className="text-secondary mt-1">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Historia */}
                  <div className="bg-accent/10 p-6 rounded-lg mb-6">
                    <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                      <Sparkles size={20} className="text-secondary" />
                      La Historia
                    </h4>
                    <p className="text-gray-700 italic leading-relaxed">
                      {collection.story}
                    </p>
                  </div>

                  {/* Usos */}
                  <div className="mb-6">
                    <h4 className="font-bold text-primary mb-2">Cómo Disfrutarlo:</h4>
                    <p className="text-gray-700">{collection.uses}</p>
                  </div>

                  {/* CTA */}
                  <Link
                    to="/tienda"
                    className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                  >
                    Ver en la Tienda →
                  </Link>
                </div>
              </div>

              {/* Separador */}
              {index < collections.length - 1 && (
                <div className="mt-24 border-t border-gray-200"></div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Por qué son especiales */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-8">
                ¿Qué Hace Especiales a Nuestras Joyas?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 text-left">
                {[
                  {
                    title: "Origen Único",
                    text: "De Alcarràs y Córdoba. Terroirs únicos que no se pueden replicar."
                  },
                  {
                    title: "Elaboración Artesanal",
                    text: "Hechas a mano, con tiempo, sin prisas. Como se hacía hace 200 años."
                  },
                  {
                    title: "Ingredientes Naturales",
                    text: "Sin aditivos, sin conservantes, sin mentiras. Solo lo que ves en la etiqueta."
                  },
                  {
                    title: "Tradición Familiar",
                    text: "Recetas transmitidas de generación en generación. Secretos de familia."
                  },
                  {
                    title: "Calidad Premium",
                    text: "Solo la mejor fruta, en su punto perfecto. El 60% se descarta."
                  },
                  {
                    title: "Alma y Pasión",
                    text: "Cada joya lleva nuestra historia, nuestro amor, nuestra vida."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white/10 p-6 rounded-lg"
                  >
                    <h3 className="text-xl font-bold text-secondary mb-3">{item.title}</h3>
                    <p className="text-white/90">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Descubre Todas Nuestras Joyas
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Cada una cuenta una historia. Cada una lleva un pedazo de nuestra alma. 
            ¿Cuál será tu favorita?
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/tienda"
              className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
            >
              Ir a la Tienda
            </Link>
            <Link
              to="/recetario"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Ver Recetas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NuestrasJoyas;

