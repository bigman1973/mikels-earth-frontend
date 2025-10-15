import Hero from '../components/common/Hero';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Welcome section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Bienvenido a Mikel's Earth
            </h2>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Desde 1819, nuestra familia cultiva la tierra en Lleida con pasión y un profundo respeto por la naturaleza, 
                ofreciendo productos naturales de la más alta calidad. En Mikel's Earth, creemos firmemente en la importancia 
                de una alimentación saludable, sostenible y auténtica.
              </p>
              
              <p>
                Por eso, elaboramos nuestros productos siguiendo métodos artesanales que respetan el medio ambiente y 
                fomentan la agricultura sostenible.
              </p>
              
              <p>
                Nuestros productos estrella, como el <strong>Paraguayo en almíbar</strong> —un melocotón plano cultivado 
                en Alcarrás y preparado a mano— y nuestro <strong>aceite de oliva virgen extra</strong> de variedades 
                Arbequina, Picual y Hojiblanca, reflejan la tradición y el saber hacer de generaciones. Cada frasco y 
                cada botella es fruto de un proceso cuidadoso, pensado para conservar el sabor natural y las propiedades 
                nutritivas de la fruta y el aceite.
              </p>
              
              <p>
                En Mikel's Earth no solo vendemos productos, compartimos una tradición familiar y un compromiso con la 
                calidad y la transparencia.
              </p>
              
              <p>
                Queremos que disfrutes de alimentos auténticos, sin aditivos, aptos para veganos y elaborados con 
                ingredientes locales seleccionados.
              </p>
              
              <p className="text-lg font-semibold text-primary mt-6">
                ¡Bienvenido a la tradición, la salud y el sabor de Mikel!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image gallery section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative h-64 bg-gray-300 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-semibold">
                Tradición Familiar
              </div>
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative h-64 bg-gray-300 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-semibold">
                Agricultura Sostenible
              </div>
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative h-64 bg-gray-300 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-semibold">
                Productos Naturales
              </div>
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social commitment section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-primary mb-6">
              Compromiso Social
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Cada compra que realizas aquí no solo te acerca a productos artesanales, naturales y de máxima calidad, 
              sino que también contribuye directamente a la <strong>Fondation Agonlinhossouyetokandji</strong>. 
              Gracias a tu apoyo, ayudamos a impulsar proyectos sociales y educativos que generan un impacto positivo 
              y duradero.
            </p>
            <p className="text-primary font-semibold mt-4">
              Gracias por confiar en nosotros y por formar parte de este compromiso social.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

