import { motion } from 'framer-motion';
import { Clock, Hand, Eye, Award, CheckCircle, Heart } from 'lucide-react';

const ElObrador = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-b from-primary/10 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-script text-primary mb-6">
            El Obrador
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 max-w-3xl mx-auto">
            Donde el tiempo se detiene y la artesanía cobra vida
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
              Transparencia Total: De la Masía al Mundo
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Todo comenzó en nuestra masía. Entre muros de piedra centenarios, nuestras manos creaban cada receta, llenaban cada frasco. No era un negocio. Era una pasión.
              </p>
              <p>
                Cuando la demanda creció, nos enfrentamos a una decisión: ¿industrializarnos o mantener nuestra esencia?
              </p>
              <p className="font-semibold text-primary">
                Elegimos el camino difícil.
              </p>
              <p>
                En un mundo donde los alimentos se producen en fábricas gigantes, donde las máquinas han reemplazado a las manos, donde la velocidad importa más que la calidad... nosotros buscamos artesanos que compartieran nuestra filosofía.
              </p>
              <p>
                Hoy trabajamos con un obrador pequeño, como el nuestro. Un proceso lento, como siempre lo fue. Manos expertas que tocan cada frasco, como nosotros lo hacíamos.
              </p>
              <p>
                Nuestras recetas siguen siendo las mismas. Los ingredientes, seleccionados con el mismo criterio. El proceso, supervisado con la misma obsesión por la calidad.
              </p>
              <p className="font-semibold text-primary">
                Hemos crecido sin traicionar nuestros orígenes. Porque la masía no era solo un lugar. Era una promesa. Y esa promesa sigue viva en cada frasco.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Proceso Paso a Paso */}
      <section className="bg-accent/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            El Viaje de la Fruta: Del Árbol al Frasco
          </h2>
          
          <div className="max-w-5xl mx-auto space-y-16">
            {[
              {
                step: "01",
                title: "La Cosecha Manual",
                subtitle: "El Ojo Experto que Ninguna Máquina Puede Replicar",
                icon: <Hand className="text-secondary" size={48} />,
                content: [
                  "Cada fruta es seleccionada a mano en su punto óptimo de maduración. No antes, cuando aún le falta sabor. No después, cuando ya ha perdido textura. Justo en el momento perfecto.",
                  "Nuestros recolectores conocen cada árbol. Saben cuáles maduran primero, cuáles necesitan más tiempo. Es un conocimiento que se adquiere con años, con experiencia, con pasión.",
                  "Durante la recolecci\u00f3n, seleccionamos el fruto. Y esa diferencia se nota en cada bocado."
                ],
                highlight: "Solo el 60% de la fruta pasa nuestro control de calidad"
              },
              {
                step: "02",
                title: "La Elaboración Artesanal",
                subtitle: "Cocciones Lentas, Sin Prisas, Sin Atajos",
                icon: <Clock className="text-secondary" size={48} />,
                content: [
                  "En nuestro obrador, el tiempo se detiene. Las ollas hierven a fuego lento. El almíbar se cocina durante horas, removiéndose con paciencia, esperando el punto exacto.",
                  "No usamos espesantes. No añadimos conservantes. No aceleramos el proceso. Solo fruta, un poco de azúcar, y el saber hacer de generaciones.",
                  "El resultado es un producto que sabe a fruta de verdad. Porque es fruta de verdad."
                ],
                highlight: "Hasta 6 horas de cocción para algunas recetas"
              },
              {
                step: "03",
                title: "El Envasado Uno a Uno",
                subtitle: "Nuestra Firma Personal en Cada Producto",
                icon: <Eye className="text-secondary" size={48} />,
                content: [
                  "Cada frasco es llenado a mano. Cada tapa se cierra manualmente. Cada etiqueta se coloca con cuidado.",
                  "Es nuestro sello de garantía. Nuestra firma personal. Cuando recibes un producto de Mikel's Earth, sabes que pasó por nuestras manos, que lo revisamos, que está perfecto.",
                  "Podríamos automatizar este proceso. Sería más rápido, más barato. Pero perderíamos el control, la calidad, el alma."
                ],
                highlight: "Cada frasco es inspeccionado visualmente antes de salir"
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-6xl font-bold text-secondary/20">{process.step}</span>
                        {process.icon}
                      </div>
                      <h3 className="text-3xl font-bold text-primary mb-2">{process.title}</h3>
                      <p className="text-lg text-secondary font-semibold mb-6">{process.subtitle}</p>
                      
                      <div className="space-y-4">
                        {process.content.map((paragraph, pIndex) => (
                          <p key={pIndex} className="text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-secondary/10 rounded-lg border-l-4 border-secondary">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="text-secondary flex-shrink-0 mt-1" size={20} />
                          <p className="font-semibold text-primary">{process.highlight}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${index % 2 === 1 ? 'md:order-1' : ''} flex items-center justify-center`}>
                    <div className="w-full h-64 bg-gradient-to-br from-accent/30 to-secondary/30 rounded-lg flex items-center justify-center">
                      <p className="text-primary/50 text-center px-4">
                        [Espacio para imagen/video del proceso]
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lo que NO hacemos */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-primary text-center mb-12">
              Lo que NO Encontrarás en Nuestros Productos
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Conservantes artificiales",
                "Colorantes químicos",
                "Espesantes sintéticos",
                "Aromas artificiales",
                "Azúcares refinados en exceso",
                "Aceites hidrogenados",
                "Ingredientes transgénicos",
                "Procesos industriales",
                "Prisas ni atajos",
                "Mentiras en la etiqueta"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3 bg-red-50 p-4 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✕
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lo que SÍ hacemos */}
      <section className="bg-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-primary text-center mb-12">
                Lo que SÍ Garantizamos
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Award className="text-secondary" size={40} />,
                    title: "Calidad Premium",
                    text: "Solo la mejor fruta, en su punto perfecto, seleccionada a mano."
                  },
                  {
                    icon: <Heart className="text-secondary" size={40} />,
                    title: "Elaboración Artesanal",
                    text: "Recetas tradicionales, cocciones lentas, sin prisas ni atajos."
                  },
                  {
                    icon: <Eye className="text-secondary" size={40} />,
                    title: "Transparencia Total",
                    text: "Sabes exactamente qué llevas. Cada ingrediente está en la etiqueta."
                  },
                  {
                    icon: <CheckCircle className="text-secondary" size={40} />,
                    title: "Sin Aditivos",
                    text: "Solo ingredientes naturales. Nada que no reconocerías en tu cocina."
                  },
                  {
                    icon: <Hand className="text-secondary" size={40} />,
                    title: "Hecho a Mano",
                    text: "Cada frasco pasa por nuestras manos. Es nuestro sello personal."
                  },
                  {
                    icon: <Clock className="text-secondary" size={40} />,
                    title: "Tradición Viva",
                    text: "Más de 200 años de saber hacer en cada producto."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-center mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                    <p className="text-gray-700">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Por qué vale la pena */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-6">
                ¿Por Qué Nuestros Productos Cuestan Más?
              </h2>
              <p className="text-xl mb-6 text-white/90 leading-relaxed">
                Es una pregunta justa. Y la respuesta es simple: porque hacemos las cosas bien.
              </p>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                Seleccionar cada fruta a mano lleva tiempo. Cocinar sin prisas es más caro. 
                Envasar uno a uno requiere más personal. Usar solo ingredientes naturales 
                cuesta más que usar químicos baratos.
              </p>
              <p className="text-lg text-white/80 leading-relaxed mb-8">
                Pero el resultado es un producto que sabe de verdad. Que es saludable de verdad. 
                Que honra la tradición de verdad. Y eso, creemos, vale cada céntimo.
              </p>
              <div className="bg-white/10 p-6 rounded-lg">
                <p className="text-2xl font-script text-secondary">
                  "No competimos en precio. Competimos en calidad, en autenticidad, en alma."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Prueba la Diferencia de lo Artesanal
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Una vez que pruebes un producto hecho con este cuidado, con esta dedicación, 
            con este amor... no querrás volver a los productos industriales.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/tienda"
              className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
            >
              Ver Nuestros Productos
            </a>
            <a
              href="/experiencias"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Visita Nuestro Obrador
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ElObrador;

