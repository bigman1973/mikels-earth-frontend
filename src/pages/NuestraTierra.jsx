import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sun, Droplets, Wind, Leaf } from 'lucide-react';

const NuestraTierra = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/finca-moncloa-hero.webp)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
        </div>
        
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4 relative z-10"
        >
          <h1 className="mb-4 text-5xl font-script text-white drop-shadow-2xl md:text-7xl">
            {t('land.hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-lg">
            {t('land.hero_subtitle')}
          </p>
        </Motion.div>
      </section>

      {/* Introducción */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary mb-6">
              {t('land.terroir_title')}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              {t('land.terroir_text')}
            </p>
          </Motion.div>
        </div>
      </section>

      {/* Alcarràs Section */}
      <section className="bg-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-primary mb-8 text-center">
                {t('land.alcarras_title')}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: t('land.alcarras_p1') }} />
                  <p className="text-lg text-gray-700">
                    {t('land.alcarras_p2')}
                  </p>
                  <p className="text-lg text-gray-700">
                    {t('land.alcarras_p3')}
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-bold text-primary mb-6">{t('land.terroir_characteristics')}</h3>
                  <div className="space-y-4">
                    {[
                      { icon: <Sun className="text-secondary" />, label: t('land.climate'), value: t('land.climate_value') },
                      { icon: <Droplets className="text-secondary" />, label: t('land.precipitation'), value: t('land.precipitation_value') },
                      { icon: <Wind className="text-secondary" />, label: t('land.temperature'), value: t('land.temperature_value') },
                      { icon: <Leaf className="text-secondary" />, label: t('land.soil'), value: t('land.soil_value') }
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
            </Motion.div>
          </div>
        </div>
      </section>

      {/* Córdoba Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-primary mb-8 text-center">
              {t('land.cordoba_title')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-primary text-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-6">{t('land.perfect_oil')}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-secondary mb-2">Arbequina</div>
                    <p className="text-white/90">{t('land.arbequina')}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary mb-2">Picual</div>
                    <p className="text-white/90">{t('land.picual')}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary mb-2">Hojiblanca</div>
                    <p className="text-white/90">{t('land.hojiblanca')}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-lg text-gray-700">
                  {t('land.cordoba_p1')}
                </p>
                <p className="text-lg text-gray-700">
                  {t('land.cordoba_p2')}
                </p>
                <div className="bg-secondary/20 p-6 rounded-lg border-l-4 border-secondary">
                  <p className="text-primary font-semibold mb-2">{t('land.temprano_title')}</p>
                  <p className="text-gray-700">
                    {t('land.temprano_text')}
                  </p>
                </div>
              </div>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* Evidencia verificable */}
      <section className="bg-gradient-to-b from-secondary/10 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-primary mb-6">
                {t('land.evidence_title')}
              </h2>
            </Motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                t('land.evidence_organic'),
                t('land.evidence_eco_garden'),
                t('land.evidence_pruning')
              ].map((text, index) => (
                <Motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <p className="text-gray-700 text-lg leading-relaxed">{text}</p>
                </Motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <blockquote className="text-2xl md:text-3xl font-script mb-6">
              "{t('land.quote')}"
            </blockquote>
            <p className="text-lg text-white/80">
              {t('land.quote_text')}
            </p>
          </Motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            {t('land.cta_title')}
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {t('land.cta_text')}
          </p>
          <a
            href="/nuestras-joyas"
            className="inline-block bg-secondary text-white px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
          >
            {t('land.cta_button')}
          </a>
        </div>
      </section>
    </div>
  );
};

export default NuestraTierra;
