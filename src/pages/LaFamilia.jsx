import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import familyConservaCasa from '../assets/family-conserva-casa.jpg';

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

      {/* Conserva familiar de verano: contexto histórico, no producto comercial */}
      <section className="bg-accent/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <Motion.figure
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <img
                src={familyConservaCasa}
                alt={t('family.home_preserve_photo_alt')}
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="px-5 py-4 text-sm italic text-gray-700">
                {t('family.home_preserve_caption')}
              </figcaption>
            </Motion.figure>

            <Motion.blockquote
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="border-l-4 border-secondary pl-6 md:pl-8"
            >
              <p className="font-script text-4xl leading-tight text-primary md:text-5xl">
                {t('family.home_preserve_quote')}
              </p>
              <footer className="mt-6 text-base font-semibold text-gray-700">
                {t('family.home_preserve_author')}
              </footer>
            </Motion.blockquote>
          </div>
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

      {/* Hechos verificables */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'De dónde viene',
                text: 'La fruta, del Segrià. El aceite, de nuestros olivos en la campiña cordobesa. Son dos sitios distintos y lo decimos, porque no es lo mismo una cosa que la otra.',
              },
              {
                title: 'Qué lleva',
                text: 'Paraguayo, agua, azúcar y zumo de limón. Eso es todo. El limón es lo que hace que la conserva aguante: no hacen falta conservantes ni colorantes.',
              },
              {
                title: 'Quién lo hace',
                text: 'El aceite es nuestro, de principio a fin. La conserva la hace un productor que la elabora igual que se hace en casa: pelada a mano, pieza a pieza. Lo buscamos durante mucho tiempo, porque a máquina la fruta se deshace y casi nadie la envasa entera.',
              },
              {
                title: 'Lo que está certificado',
                text: 'Aceite ecológico con certificación. Y desde 2017, certificación Eco Garden, una de las más exigentes para exportar a Asia: solo tres empresas españolas la tienen.',
              },
              {
                title: 'Cuánto hay',
                text: 'Una temporada al año y una cantidad limitada. Cuando se acaba, hay que esperar a la cosecha siguiente. No aspiramos a estar en todas partes.',
              },
              {
                title: 'Desde cuándo',
                text: 'Las escrituras de la tierra que trabajamos datan de 1819. Siete generaciones después, la familia sigue en Alcarràs.',
              },
            ].map((value, index) => (
              <Motion.article
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="border-t-2 border-primary bg-[#f5efe4] p-6"
              >
                <h2 className="text-xl font-semibold text-[#1a1a1a]">{value.title}</h2>
                <p className="mt-4 leading-7 text-[#1a1a1a]">{value.text}</p>
              </Motion.article>
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
                <blockquote className="mb-6 text-2xl leading-tight text-white md:text-3xl">
                  {t('family.jordi_quote')}
                </blockquote>
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
