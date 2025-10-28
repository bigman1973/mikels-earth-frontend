import { motion } from 'framer-motion';

const LaFamilia = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-b from-primary/10 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-script text-primary mb-6">
            La Familia
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 max-w-3xl mx-auto">
            Más de 200 años cultivando la tierra con pasión, respeto y amor
          </p>
        </motion.div>
      </section>

      {/* Historia Principal */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-primary mb-8">
              Una Historia que Comenzó en 1819
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                Cuando nuestra familia plantó el primer árbol en las tierras de Lleida en 1819, 
                no sabíamos que estábamos sembrando algo mucho más grande que un árbol. 
                Estábamos plantando una tradición, un legado que atravesaría generaciones 
                y que hoy, más de dos siglos después, sigue vivo en cada frasco que sale de nuestro obrador.
              </p>

              <p>
                Han pasado siete generaciones desde entonces. Siete generaciones de manos 
                que han tocado la misma tierra, que han recogido la misma fruta, que han 
                guardado los mismos secretos de elaboración. Cada generación ha añadido 
                su propio capítulo a esta historia, pero todas han compartido la misma 
                filosofía: el respeto absoluto por la naturaleza y la búsqueda incansable 
                de la calidad.
              </p>

              <p>
                No somos una gran corporación. Somos una familia. Y como toda familia, 
                tenemos nuestras tradiciones, nuestros rituales, nuestras recetas que 
                pasan de padres a hijos en susurros en la cocina, en gestos aprendidos 
                desde la infancia. Cuando pruebas nuestro paraguayo en almíbar o nuestro 
                aceite temprano, no estás comprando un producto. Estás probando un pedazo 
                de nuestra historia.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-accent/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            Nuestro Viaje a Través del Tiempo
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                year: "1819",
                title: "Los Primeros Pasos",
                text: "1819 comienza a cultivar las tierras en Alcarr\u00e0s, Lleida. La pasi\u00f3n por la tierra y el trabajo artesanal se convierte en el ADN de nuestra familia."
              },
              {
                year: "1920",
                title: "El Descubrimiento del Paraguayo",
                text: "El obrador familiar se alz\u00f3 con el mas, donde pasaban los veranos y transformaban los frutos a conserva para pasar el invierno. La cuarta generaci\u00f3n descubre el melocot\u00f3n plano en Alcarr\u00e0s."
              },
              {
                year: "1975",
                title: "El Obrador Familiar",
                text: "La quinta generaci\u00f3n descubre el melocot\u00f3n plano en Alcarr\u00e0s. Construimos nuestro obrador, donde cada frasco se llena a mano. La tradici\u00f3n se encuentra con la dedicaci\u00f3n para crear productos \u00fanicos."
              },
              {
                year: "2010",
                title: "Compromiso Sostenible",
                text: "Adoptamos prácticas de agricultura sostenible y certificaciones ecológicas. La tierra que nos ha dado tanto merece nuestro máximo respeto."
              },
              {
                year: "2024",
                title: "Mikel's Earth",
                text: "La séptima generación toma las riendas. Jordi Giró continúa el legado familiar, compartiendo nuestra historia con el mundo a través de productos que honran más de 200 años de tradición."
              }
            ].map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-8 items-start"
              >
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-3xl font-bold text-secondary">{milestone.year}</span>
                </div>
                <div className="flex-grow bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold text-primary mb-3">{milestone.title}</h3>
                  <p className="text-gray-700">{milestone.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores Familiares */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            Los Valores que Nos Definen
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Tradición",
                icon: "🌿",
                text: "Más de 200 años de conocimiento transmitido de generación en generación. Cada receta, cada técnica, es un tesoro familiar que guardamos con orgullo."
              },
              {
                title: "Calidad",
                icon: "⭐",
                text: "No hay atajos en la excelencia. Seleccionamos cada fruta a mano, cocinamos sin prisas, envasamos con cuidado. La calidad no se negocia."
              },
              {
                title: "Autenticidad",
                icon: "❤️",
                text: "Somos quienes somos. Una familia de Lleida que ama su tierra y sus productos. Sin artificios, sin aditivos, sin mentiras. Solo autenticidad."
              },
              {
                title: "Sostenibilidad",
                icon: "🌍",
                text: "La tierra nos ha alimentado durante siete generaciones. Es nuestra responsabilidad cuidarla para las próximas siete. Agricultura sostenible, siempre."
              },
              {
                title: "Transparencia",
                icon: "👁️",
                text: "Abrimos las puertas de nuestro obrador. Mostramos nuestro proceso. No tenemos nada que ocultar, porque hacemos las cosas bien."
              },
              {
                title: "Pasión",
                icon: "🔥",
                text: "Esto no es solo un negocio. Es nuestra vida, nuestra historia, nuestro legado. Cada producto lleva nuestra pasión en cada gota, en cada bocado."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-accent/20 p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-primary mb-3">{value.title}</h3>
                <p className="text-gray-700">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jordi - La Cara Actual */}
      <section className="py-16" style={{backgroundColor: 'var(--mikels-red)'}}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6" style={{color: 'var(--mikels-green)'}}>
                Jordi Giró - Séptima Generación
              </h2>
              <p className="text-xl mb-8 text-white">
                "Soy el guardián de un legado de más de 200 años. Cada día que voy 
                al campo, siento el peso de la responsabilidad y el orgullo de continuar 
                lo que mis ancestros comenzaron. Mi misión es simple: honrar su trabajo 
                haciendo productos que ellos estarían orgullosos de probar."
              </p>
              <p className="text-lg text-white">
                Desde Alcarràs y Córdoba, comparto nuestra historia con el mundo. 
                Porque creo que en un mundo de productos industriales y sin alma, 
                la gente merece saber que todavía existen familias como la nuestra, 
                que hacen las cosas bien, con tiempo, con amor, con tradición.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Forma Parte de Nuestra Historia
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Cuando eliges Mikel's Earth, no solo compras un producto. 
            Te conviertes en parte de una tradición de más de 200 años. 
            Te unes a una familia que cree en la calidad, la autenticidad y el respeto por la tierra.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/tienda"
              className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
            >
              Descubre Nuestros Productos
            </a>
            <a
              href="/el-obrador"
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

export default LaFamilia;

