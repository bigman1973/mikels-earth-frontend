import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LaFamilia = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-b from-primary/10 to-white flex items-center justify-center">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-script text-primary mb-6">
            {t('family.title', { defaultValue: 'La Familia' })}
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 max-w-3xl mx-auto">
            {t('family.subtitle', { defaultValue: 'Más de 200 años cultivando la tierra con pasión, respeto y amor' })}
          </p>
        </Motion.div>
      </section>

      {/* Video Section */}
      <section className="container mx-auto px-4 py-12">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%', height: 0 }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/1fDK7bQ9tKk?si=7u0jvwj11ziuOT-D"
              title="Mikel's Fruit - Nuestra Historia"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </Motion.div>
      </section>

      {/* Historia Principal */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-primary mb-8">
              {t('family.history_title', { defaultValue: 'Una Historia que Comenzó en 1819' })}
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>{t('family.history_p1')}</p>
              <p>{t('family.history_p2')}</p>
              <p>{t('family.history_p3')}</p>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-accent/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            {t('family.timeline_title', { defaultValue: 'Nuestro Viaje a Través del Tiempo' })}
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                year: "1819",
                title: "Los Primeros Pasos",
                text: "La familia empieza a cultivar en Alcarràs."
              },
              {
                year: "Años 1920",
                title: "La receta de casa",
                text: "En el mas, los veranos terminan con la fruta convertida en conserva para pasar el invierno."
              },
              {
                year: "Años 60-70",
                title: "El paraguayo en el Segrià",
                text: "El paraguayo llega al Segrià. La familia lo cultiva desde entonces."
              },
              {
                year: "2017",
                title: "Certificación Eco Garden",
                text: "Pioneros en obtener la certificación Eco Garden, una de las más exigentes para exportar a Asia. Hoy solo tres empresas españolas la tienen."
              },
              {
                year: "2024",
                title: "Mikel's Fruit",
                text: "Nace Mikel's Fruit: esa conserva de casa, para quien no la tiene."
              }
            ].map((milestone, index) => (
              <Motion.div
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
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores Familiares */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            {t('family.values_title', { defaultValue: 'Los Valores que Nos Definen' })}
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
                text: "La calidad guía nuestras decisiones. La calidad no se negocia."
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
                text: "Contamos la receta y los ingredientes de cada producto con claridad."
              },
              {
                title: "Pasión",
                icon: "🔥",
                text: "Esto no es solo un negocio. Es nuestra vida, nuestra historia, nuestro legado. Cada producto lleva nuestra pasión en cada gota, en cada bocado."
              }
            ].map((value, index) => (
              <Motion.div
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
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jordi - La Cara Actual */}
      <section className="py-16" style={{backgroundColor: 'var(--mikels-red)'}}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Imagen de Jordi */}
              <Motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 md:order-1"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="/images/jordi-mas.jpg" 
                    alt="Jordi Giró en el Mas" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <p className="text-white text-sm italic">
                      Jordi Giró en el mas familiar - "Mas del Quelet"
                    </p>
                  </div>
                </div>
              </Motion.div>

              {/* Texto */}
              <Motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-1 md:order-2"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{color: 'var(--mikels-green)'}}>
                  Jordi Giró
                </h2>
                <p className="text-2xl font-script mb-6 text-white">
                  {t('family.seventh_gen', { defaultValue: 'Séptima Generación' })}
                </p>
                <p className="text-xl mb-6 text-white leading-relaxed">
                  "{t('family.jordi_quote')}"
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  {t('family.jordi_text')}
                </p>
              </Motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            {t('family.cta_title', { defaultValue: 'Forma Parte de Nuestra Historia' })}
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {t('family.cta_text')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/tienda"
              className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
            >
              {t('family.cta_products', { defaultValue: 'Descubre Nuestros Productos' })}
            </a>
            <a
              href="/como-se-hace"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              {t('family.cta_workshop', { defaultValue: 'Cómo se hace' })}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LaFamilia;
