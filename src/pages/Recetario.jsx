import { motion } from 'framer-motion';
import { ChefHat, Clock, Users, Flame } from 'lucide-react';

const Recetario = () => {
  const recipes = [
    {
      id: 'tostadas-temprano',
      name: 'Tostadas con Aceite Temprano',
      category: 'Desayuno',
      difficulty: 'Fácil',
      time: '5 min',
      servings: '2',
      image: '/images/pan-tomate.png',
      description: 'La manera más simple y deliciosa de disfrutar nuestro aceite Temprano. Un desayuno que te transporta al Mediterráneo.',
      ingredients: [
        '2 rebanadas de pan de masa madre',
        '2 cucharadas de Aceite Temprano',
        '1 tomate maduro',
        'Sal en escamas',
        'Ajo (opcional)'
      ],
      steps: [
        'Tuesta el pan hasta que esté crujiente',
        'Frota el ajo en el pan caliente (opcional)',
        'Ralla el tomate sobre el pan',
        'Rocía generosamente con el Aceite Temprano',
        'Espolvorea sal en escamas',
        'Disfruta inmediatamente'
      ],
      tips: 'El Temprano es intenso. Si prefieres algo más suave, usa nuestro Arbequina. El pan debe estar caliente para que absorba bien el aceite.'
    },
    {
      id: 'ensalada-paraguayo',
      name: 'Ensalada de Paraguayo y Burrata',
      category: 'Entrante',
      difficulty: 'Fácil',
      time: '15 min',
      servings: '4',
      image: '/images/ensalada-paraguayo.png',
      description: 'Una combinación sorprendente que equilibra lo dulce del paraguayo con la cremosidad de la burrata. Perfecta para verano.',
      ingredients: [
        '1 frasco de Paraguayo en Almíbar',
        '2 bolas de burrata',
        'Rúcula fresca',
        'Aceite Arbequina',
        'Vinagre balsámico',
        'Nueces tostadas',
        'Sal y pimienta'
      ],
      steps: [
        'Escurre los paraguayos y córtalos en cuartos',
        'Dispón la rúcula en una fuente',
        'Coloca la burrata en el centro',
        'Distribuye los paraguayos alrededor',
        'Esparce las nueces tostadas',
        'Aliña con aceite Arbequina y vinagre balsámico',
        'Salpimienta al gusto'
      ],
      tips: 'Guarda un poco del almíbar del paraguayo y mézclalo con el vinagre balsámico para un aliño único. La burrata debe estar a temperatura ambiente.'
    },
    {
      id: 'carpaccio-temprano',
      name: 'Carpaccio de Ternera con Temprano',
      category: 'Entrante',
      difficulty: 'Media',
      time: '20 min',
      servings: '4',
      image: '/images/carpaccio.jpg',
      description: 'El Temprano eleva el carpaccio a otro nivel. Su intensidad complementa perfectamente la carne cruda.',
      ingredients: [
        '400g de solomillo de ternera',
        'Aceite Temprano',
        'Parmesano en lascas',
        'Rúcula',
        'Zumo de limón',
        'Sal en escamas',
        'Pimienta negra recién molida'
      ],
      steps: [
        'Congela la carne 30 minutos para facilitar el corte',
        'Corta láminas finas con un cuchillo bien afilado',
        'Dispón las láminas en un plato frío',
        'Rocía generosamente con Aceite Temprano',
        'Añade zumo de limón',
        'Decora con rúcula y parmesano',
        'Salpimienta y sirve inmediatamente'
      ],
      tips: 'La carne debe ser de máxima calidad. El Temprano aporta el picante y el frutado verde que hacen brillar este plato.'
    },
    {
      id: 'postre-paraguayo',
      name: 'Paraguayo Caramelizado con Helado',
      category: 'Postre',
      difficulty: 'Fácil',
      time: '10 min',
      servings: '4',
      image: '/images/postre-paraguayo.png',
      description: 'Un postre simple pero espectacular. El calor carameliza el almíbar y el contraste con el helado es mágico.',
      ingredients: [
        '1 frasco de Paraguayo en Almíbar',
        'Helado de vainilla',
        'Azúcar moreno',
        'Canela en polvo',
        'Menta fresca'
      ],
      steps: [
        'Escurre los paraguayos (guarda el almíbar)',
        'Colócalos en una sartén caliente',
        'Espolvorea azúcar moreno',
        'Carameliza 2-3 minutos por lado',
        'Sirve calientes sobre helado de vainilla',
        'Rocía con el almíbar',
        'Decora con canela y menta'
      ],
      tips: 'El contraste caliente-frío es clave. Sirve inmediatamente. Puedes flamear con un poco de brandy para un toque espectacular.'
    },
    {
        id: 'pasta-picual',
      name: 'Pasta Aglio e Olio con Ecológico',
      category: 'Principal',
      difficulty: 'Fácil',
      time: '20 min',
      servings: '4',
      image: '/images/pasta-aglio.png',
      description: 'La receta italiana m\u00e1s simple, elevada con nuestro ecol\u00f3gico. Cuando menos es m\u00e1s.',
      ingredients: [
        '400g de espaguetis',
        '6 dientes de ajo',
        '100ml de Aceite Ecol\u00f3gico',
        'Guindilla seca',
        'Perejil fresco',
        'Sal',
        'Parmesano (opcional)'
      ],
      steps: [
        'Cuece la pasta al dente',
        'Lamina el ajo finamente',
        'Calienta el aceite ecol\u00f3gico a fuego bajo',
        'Dora el ajo sin que se queme',
        'Añade la guindilla',
        'Mezcla con la pasta y agua de cocción',
        'Espolvorea perejil y sirve'
      ],
      tips: 'Nuestro ecol\u00f3gico aporta el picante perfecto. No dejes que el ajo se queme o amargar\u00e1. El agua de cocci\u00f3n emulsiona el aceite creando una salsa cremosa.'
    },
    {
      id: 'yogur-paraguayo',
      name: 'Yogur con Paraguayo y Granola',
      category: 'Desayuno',
      difficulty: 'Muy Fácil',
      time: '5 min',
      servings: '1',
      image: '/images/yogur-paraguayo.png',
      description: 'Un desayuno saludable y delicioso. El paraguayo añade dulzor natural sin azúcares añadidos.',
      ingredients: [
        'Yogur griego natural',
        '2-3 mitades de Paraguayo en Almíbar',
        'Granola casera',
        'Miel (opcional)',
        'Frutos secos'
      ],
      steps: [
        'Coloca el yogur en un bol',
        'Corta el paraguayo en trozos',
        'Dispón sobre el yogur',
        'Añade la granola',
        'Esparce frutos secos',
        'Rocía con miel si deseas'
      ],
      tips: 'El almíbar del paraguayo puede sustituir la miel. Perfecto para un desayuno rápido pero nutritivo.'
    }
  ];

  const categories = ['Todos', 'Desayuno', 'Entrante', 'Principal', 'Postre'];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-b from-secondary/20 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <ChefHat className="mx-auto text-secondary mb-4" size={60} />
          <h1 className="text-5xl md:text-7xl font-script text-primary mb-6">
            Recetario
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 max-w-3xl mx-auto">
            Inspírate con nuestras recetas y descubre nuevas formas de disfrutar nuestras joyas
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
              Cocina con Nuestras Joyas
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Nuestros productos no son solo para comer directamente del frasco. 
              Son ingredientes versátiles que pueden transformar platos simples en 
              experiencias gastronómicas memorables.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Aquí compartimos algunas de nuestras recetas favoritas. Algunas son 
              tradicionales de nuestra familia, otras son creaciones modernas. 
              Todas tienen algo en común: resaltan la calidad de nuestros productos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Recetas Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer group"
              >
                {/* Imagen */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-secondary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {recipe.category}
                    </span>
                    <span className="text-gray-500 text-sm">{recipe.difficulty}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                    {recipe.name}
                  </h3>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{recipe.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{recipe.servings}</span>
                    </div>
                  </div>

                  {/* Expandible - Ingredientes y Pasos */}
                  <details className="group/details">
                    <summary className="cursor-pointer text-secondary font-semibold hover:text-secondary/80 transition-colors">
                      Ver Receta Completa →
                    </summary>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Ingredientes */}
                      <div>
                        <h4 className="font-bold text-primary mb-2">Ingredientes:</h4>
                        <ul className="space-y-1">
                          {recipe.ingredients.map((ing, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-secondary">•</span>
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pasos */}
                      <div>
                        <h4 className="font-bold text-primary mb-2">Preparación:</h4>
                        <ol className="space-y-2">
                          {recipe.steps.map((step, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex gap-2">
                              <span className="flex-shrink-0 w-5 h-5 bg-secondary text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Tips */}
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                          <Flame size={16} className="text-secondary" />
                          Consejo del Chef:
                        </h4>
                        <p className="text-sm text-gray-700 italic">{recipe.tips}</p>
                      </div>
                    </div>
                  </details>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Maridajes */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-center mb-12">
                Guía de Maridajes
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    product: 'Aceite Arbequina',
                    pairings: ['Ensaladas', 'Pescados blancos', 'Verduras al vapor', 'Postres']
                  },
                  {
                    product: 'Aceite Picual',
                    pairings: ['Carnes rojas', 'Guisos', 'Legumbres', 'Tostadas']
                  },
                  {
                    product: 'Aceite Temprano',
                    pairings: ['Carpaccios', 'Pescado crudo', 'Tostadas', 'Gazpacho']
                  },
                  {
                    product: 'Paraguayo',
                    pairings: ['Yogur', 'Helados', 'Quesos', 'Ensaladas']
                  },
                  {
                    product: 'Hojiblanca',
                    pairings: ['Pasta', 'Arroces', 'Sopas', 'Aliños']
                  },
                  {
                    product: 'Mermeladas',
                    pairings: ['Quesos', 'Tostadas', 'Yogur', 'Repostería']
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
                    <h3 className="text-xl font-bold text-secondary mb-4">{item.product}</h3>
                    <ul className="space-y-2">
                      {item.pairings.map((pairing, pIdx) => (
                        <li key={pIdx} className="flex items-center gap-2 text-white/90">
                          <span className="text-secondary">✓</span>
                          {pairing}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            ¿Tienes una Receta con Nuestros Productos?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Nos encantaría conocerla. Comparte tus creaciones con nosotros en 
            redes sociales usando #MikelsEarthRecetas
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/tienda"
              className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
            >
              Comprar Productos
            </a>
            <a
              href="https://www.instagram.com/mikelsearth"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Síguenos en Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recetario;

