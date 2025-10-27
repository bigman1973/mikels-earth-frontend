import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Leaf, Award, Users } from 'lucide-react';
import Newsletter from '../components/common/Newsletter';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section - Inmersivo */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-white to-accent/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzZDI4MTciIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-script text-primary mb-6 leading-tight">
                Más de 200 Años<br />Cultivando Tradición
              </h1>
              <p className="text-2xl md:text-3xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Desde 1819, siete generaciones han cuidado la misma tierra, 
                guardado los mismos secretos, compartido la misma pasión.
              </p>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                No somos una marca. Somos una familia de Lleida que hace las cosas 
                como se hacían antes: con tiempo, con manos, con alma.
              </p>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  to="/la-familia"
                  className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                >
                  Nuestra Historia
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/nuestras-joyas"
                  className="bg-secondary text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-secondary/90 transition-colors"
                >
                  Descubre Nuestras Joyas
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-primary/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Manifiesto */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-5xl font-bold text-primary mb-8">
                Por Qué Hacemos lo que Hacemos
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                <p className="text-xl leading-relaxed">
                  En un mundo donde todo se produce en masa, donde las máquinas han 
                  reemplazado a las manos, donde la velocidad importa más que la calidad... 
                  nosotros elegimos un camino diferente.
                </p>
                <p className="text-xl leading-relaxed">
                  Elegimos la lentitud. Elegimos la artesanía. Elegimos hacer las cosas 
                  bien, aunque cueste más, aunque tarde más, aunque sea más difícil.
                </p>
                <p className="text-xl leading-relaxed font-semibold text-primary">
                  Porque creemos que hay cosas que no se pueden automatizar. 
                  Como el amor por la tierra. Como el respeto por la tradición. 
                  Como el orgullo de poner tu nombre en un producto.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="py-20 bg-gradient-to-b from-accent/10 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-primary text-center mb-16">
            Los Pilares de Mikel's Earth
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Heart className="text-secondary" size={48} />,
                title: "Tradición Familiar",
                text: "7 generaciones desde 1819. Cada receta es un tesoro que pasa de padres a hijos.",
                link: "/la-familia"
              },
              {
                icon: <Leaf className="text-secondary" size={48} />,
                title: "Terroir Único",
                text: "Alcarràs y Córdoba. Tierras que dan sabores imposibles de replicar.",
                link: "/nuestra-tierra"
              },
              {
                icon: <Award className="text-secondary" size={48} />,
                title: "Artesanía Pura",
                text: "Hecho a mano, sin prisas, sin atajos. Como se hacía hace 200 años.",
                link: "/el-obrador"
              },
              {
                icon: <Users className="text-secondary" size={48} />,
                title: "Transparencia Total",
                text: "Abrimos nuestras puertas. Ven a ver cómo trabajamos.",
                link: "/experiencias"
              }
            ].map((pillar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={pillar.link}
                  className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 h-full"
                >
                  <div className="flex justify-center mb-6">
                    {pillar.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4 text-center">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-700 text-center leading-relaxed mb-4">
                    {pillar.text}
                  </p>
                  <div className="text-center text-secondary font-semibold">
                    Descubre más →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-primary mb-6">
                Nuestras Joyas
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Cada producto es una joya. Elaborado con dedicación, envasado con cuidado, 
                creado para honrar más de 200 años de tradición.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Paraguayo en Almíbar",
                  tagline: "La Joya de Alcarràs",
                  description: "El melocotón plano que nos enamoró hace más de un siglo. Dulce, aromático, perfecto.",
                  image: "/images/products/mermelada-paraguayo.jpg"
                },
                {
                  name: "Aceite Temprano",
                  tagline: "Para Paladares Valientes",
                  description: "Intenso, picante, con carácter. Elaborado con aceitunas verdes de cosecha temprana.",
                  image: "/images/products/aceite-temprano-hero.jpg"
                },
                {
                  name: "Pack Degustación",
                  tagline: "El Regalo Perfecto",
                  description: "Descubre toda nuestra historia en un pack cuidadosamente seleccionado.",
                  image: "/images/products/pack-productos.jpg"
                }
              ].map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-b from-accent/20 to-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden group"
                >
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8">
                  <h3 className="text-2xl font-bold text-primary mb-2 text-center">
                    {product.name}
                  </h3>
                  <p className="text-secondary font-semibold text-center mb-4">
                    {product.tagline}
                  </p>
                  <p className="text-gray-700 text-center mb-6">
                    {product.description}
                  </p>
                  <Link
                    to="/nuestras-joyas"
                    className="block text-center text-primary font-bold hover:text-secondary transition-colors"
                  >
                    Descubre más →
                  </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/tienda"
                className="inline-block bg-secondary text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-secondary/90 transition-colors"
              >
                Ver Toda la Tienda
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compromiso Social */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold mb-8">
                Nuestro Compromiso va Más Allá
              </h2>
              <p className="text-2xl mb-8 text-white/90 leading-relaxed">
                Parte de nuestros beneficios van destinados a causas que nos llenan el corazón. 
                Colaboramos con <strong>Ileris</strong>, un centro de personas especiales que nos ayudan 
                a empaquetar nuestros productos con dedicación y cariño. También apoyamos a la 
                <strong> Fundación Agonlinhossouyetokandji</strong> en Benín, que trabaja incansablemente 
                para mejorar la vida de niños huérfanos y ancianos.
              </p>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Porque creemos que el éxito solo tiene sentido si se comparte. Porque la tierra nos ha 
                dado mucho, y es hora de devolver. Cada producto que compras ayuda a construir un mundo 
                más justo y solidario.
              </p>
              <div className="bg-white/10 p-8 rounded-lg inline-block">
                <p className="text-3xl font-script text-secondary mb-2">
                  "Hacer el bien es parte de nuestro ADN"
                </p>
                <p className="text-white/70">Jordi Giró, 7ª Generación</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Newsletter variant="inline" />
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-b from-white to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold text-primary mb-6">
                Forma Parte de Nuestra Historia
              </h2>
              <p className="text-2xl text-gray-700 mb-12 leading-relaxed">
                Cuando eliges Mikel's Earth, no solo compras un producto. 
                Te unes a una tradición de más de 200 años. Te conviertes en 
                parte de una familia que cree en hacer las cosas bien.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-primary mb-2">Visítanos</h3>
                  <p className="text-gray-700 mb-4">Descubre nuestro obrador y vive la experiencia</p>
                  <Link to="/experiencias" className="text-secondary font-semibold">
                    Reserva tu visita →
                  </Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-primary mb-2">Compra Online</h3>
                  <p className="text-gray-700 mb-4">Recibe nuestras joyas en tu casa</p>
                  <Link to="/tienda" className="text-secondary font-semibold">
                    Ir a la tienda →
                  </Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-primary mb-2">Síguenos</h3>
                  <p className="text-gray-700 mb-4">Únete a nuestra comunidad</p>
                  <a 
                    href="https://www.instagram.com/mikelsearth" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-secondary font-semibold"
                  >
                    @mikelsearth →
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

