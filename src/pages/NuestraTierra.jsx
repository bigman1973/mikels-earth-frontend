import { motion } from 'framer-motion';
import { MapPin, Sun, Droplets, Wind, Leaf, Heart } from 'lucide-react';

const NuestraTierra = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo de la finca La Moncloa */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/finca-moncloa-hero.jpg)'
          }}
        >
          {/* Overlay para mejorar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4 relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="text-white drop-shadow-lg" size={40} />
            <h1 className="text-5xl md:text-7xl font-script text-white drop-shadow-2xl">
              Nuestra Tierra
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-lg">
            Alcarràs y Córdoba: donde el terroir se convierte en sabor
          </p>
        </motion.div>
      </section>

      {/* Introducción */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary mb-6">
              El Terroir: Mucho Más que un Lugar
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Los franceses tienen una palabra para ello: <em>terroir</em>. Es esa combinación 
              mágica de suelo, clima, altitud y tradición que hace que un producto sea único, 
              irrepetible, imposible de replicar en otro lugar. Nuestro terroir es Alcarràs 
              y Córdoba. Y es lo que hace que nuestros productos sean especiales.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Alcarràs Section */}
      <section className="bg-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-primary mb-8 text-center">
                Alcarràs: La Cuna del Paraguayo
              </h2>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg text-gray-700">
                    Alcarràs no es solo un pueblo de Lleida. Es <strong>el lugar</strong> donde 
                    el paraguayo alcanza su máxima expresión. Aquí, en estas tierras del Segrià, 
                    el melocotón plano encuentra las condiciones perfectas para desarrollar ese 
                    sabor dulce, intenso y aromático que lo hace único.
                  </p>
                  
                  <p className="text-lg text-gray-700">
                    El clima continental de la zona, con veranos calurosos e inviernos fríos, 
                    estresa la fruta de la manera justa. Las diferencias térmicas entre el día 
                    y la noche concentran los azúcares. El suelo arcilloso retiene la humedad 
                    necesaria. Y el sol del Mediterráneo hace el resto.
                  </p>
                  
                  <p className="text-lg text-gray-700">
                    Pero hay algo más. Hay generaciones de agricultores que conocen cada árbol, 
                    cada rincón de sus campos. Que saben cuándo recoger la fruta, ni un día antes 
                    ni un día después. Ese conocimiento no se compra. Se hereda.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-bold text-primary mb-6">Características del Terroir</h3>
                  <div className="space-y-4">
                    {[
                      { icon: <Sun className="text-secondary" />, label: "Clima", value: "Continental mediterráneo" },
                      { icon: <Droplets className="text-secondary" />, label: "Precipitación", value: "400-500mm anuales" },
                      { icon: <Wind className="text-secondary" />, label: "Temperatura", value: "Amplitud térmica ideal" },
                      { icon: <Leaf className="text-secondary" />, label: "Suelo", value: "Arcilloso-calcáreo" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-shrink-0">{item.icon}</div>
                        <div className="flex-grow">
                          <div className="font-semibold text-primary">{item.label}</div>
                          <div className="text-gray-600">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Córdoba Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-primary mb-8 text-center">
              Córdoba: El Reino del Olivo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-primary text-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-6">El Aceite de Oliva Perfecto</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-secondary mb-2">Arbequina</div>
                    <p className="text-white/90">Suave, afrutada, con notas de almendra. Perfecta para ensaladas y pescados.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary mb-2">Picual</div>
                    <p className="text-white/90">Intensa, picante, con carácter. Ideal para guisos y carnes.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary mb-2">Hojiblanca</div>
                    <p className="text-white/90">Equilibrada, versátil, elegante. La joya de la corona.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-lg text-gray-700">
                  Córdoba es sinónimo de aceite de oliva. Aquí, en el corazón de Andalucía, 
                  nuestros olivares se extienden hasta donde alcanza la vista. Árboles centenarios 
                  que han visto pasar generaciones, que han resistido sequías y heladas, que 
                  producen aceitunas de una calidad excepcional.
                </p>
                
                <p className="text-lg text-gray-700">
                  Trabajamos con tres variedades en la finca de la Moncloa: Arbequina, Picual y Hojiblanca. Cada una 
                  con su personalidad, su carácter, su momento perfecto de cosecha. Y todas 
                  con algo en común: se recogen a mano, se prensan en frío, se embotellan 
                  sin filtrar para preservar todos sus aromas y propiedades.
                </p>
                
                <div className="bg-secondary/20 p-6 rounded-lg border-l-4 border-secondary">
                  <p className="text-primary font-semibold mb-2">El Temprano</p>
                  <p className="text-gray-700">
                    Nuestro aceite "Temprano" es especial. Se elabora con aceitunas verdes, 
                    recogidas antes de su maduración completa. El resultado es un aceite 
                    intenso, picante, con un frutado verde que explota en boca. No es para 
                    todos los paladares. Es para los que buscan autenticidad.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sostenibilidad */}
      <section className="bg-gradient-to-b from-secondary/10 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <Heart className="mx-auto text-secondary mb-4" size={48} />
              <h2 className="text-4xl font-bold text-primary mb-6">
                Agricultura Sostenible: Nuestro Compromiso
              </h2>
              <p className="text-xl text-gray-700">
                La tierra nos ha dado todo. Es nuestra responsabilidad cuidarla.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Agricultura Ecológica",
                  text: "Sin pesticidas químicos, sin fertilizantes sintéticos. Solo métodos naturales que respetan el equilibrio del ecosistema."
                },
                {
                  title: "Gestión del Agua",
                  text: "Sistemas de riego por goteo que optimizan cada gota. El agua es un tesoro en el Mediterráneo, y la tratamos como tal."
                },
                {
                  title: "Biodiversidad",
                  text: "Mantenemos setos naturales, plantas autóctonas y espacios para la fauna local. Un campo sano es un campo vivo."
                },
                {
                  title: "Energía Renovable",
                  text: "Paneles solares en nuestro obrador. El sol que madura nuestras frutas también alimenta nuestras máquinas."
                },
                {
                  title: "Cero Residuos",
                  text: "Todo se aprovecha. Los restos de poda se compostan, los subproductos se reutilizan. Nada se desperdicia."
                },
                {
                  title: "Certificaciones",
                  text: "Agricultura ecológica certificada. Porque no basta con decirlo, hay que demostrarlo."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                  <p className="text-gray-700">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <blockquote className="text-2xl md:text-3xl font-script mb-6">
              "La tierra no es nuestra herencia de nuestros padres, 
              sino un préstamo de nuestros hijos"
            </blockquote>
            <p className="text-lg text-white/80">
              Este proverbio indígena guía cada decisión que tomamos. 
              Porque queremos que nuestros nietos, y los nietos de nuestros nietos, 
              puedan seguir cultivando estas tierras con el mismo amor y respeto que nosotros.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Prueba el Sabor de Nuestra Tierra
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Cada producto de Mikel's Earth lleva el sabor único de Alcarràs y Córdoba. 
            Un sabor que no se puede replicar, porque nace de un terroir único.
          </p>
          <a
            href="/nuestras-joyas"
            className="inline-block bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
          >
            Descubre Nuestras Joyas
          </a>
        </div>
      </section>
    </div>
  );
};

export default NuestraTierra;

