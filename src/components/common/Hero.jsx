import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gray-800">
        {/* Placeholder para imagen de fondo de campos */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-9xl font-bold">
          CAMPOS
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-4"
      >
        <div className="bg-secondary/95 backdrop-blur-sm px-8 py-12 md:px-16 md:py-16 rounded-lg shadow-2xl max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-primary mb-6"
          >
            Productos naturales desde 1819
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-primary/80 text-lg mb-8"
          >
            Tradición familiar y agricultura sostenible
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              to="/productos"
              className="inline-block bg-primary text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl uppercase tracking-wide"
            >
              Nuestros Productos
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default Hero;

