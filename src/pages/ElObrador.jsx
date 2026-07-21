import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock, Hand, Eye, Award, CheckCircle, Heart } from 'lucide-react';

const ElObrador = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/obrador-1975-hero.jpg)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4 relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-script text-white mb-6 drop-shadow-2xl">
            {t('workshop.hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-lg mb-8">
            {t('workshop.hero_subtitle')}
          </p>
          <p className="text-sm md:text-base text-white/80 italic drop-shadow-md">
            {t('workshop.hero_caption')}
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
              {t('workshop.intro_title')}
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>{t('workshop.intro_p1')}</p>
              <p>{t('workshop.intro_p2')}</p>
              <p className="font-semibold text-primary">{t('workshop.intro_p3')}</p>
              <p>{t('workshop.intro_p4')}</p>
              <p>{t('workshop.intro_p5')}</p>
              <p>{t('workshop.intro_p6')}</p>
              <p className="font-semibold text-primary">{t('workshop.intro_p7')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Proceso Paso a Paso */}
      <section className="bg-accent/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            {t('workshop.process_title')}
          </h2>
          
          <div className="max-w-5xl mx-auto space-y-16">
            {[
              {
                step: "01",
                title: t('workshop.step1_title'),
                subtitle: t('workshop.step1_subtitle'),
                icon: <Hand className="text-secondary" size={48} />,
                image: "/images/cosechamanual.jpg",
                content: [
                  t('workshop.step1_p1'),
                  t('workshop.step1_p2'),
                  t('workshop.step1_p3')
                ],
                highlight: t('workshop.step1_highlight')
              },
              {
                step: "02",
                title: t('workshop.step2_title'),
                subtitle: t('workshop.step2_subtitle'),
                icon: <Clock className="text-secondary" size={48} />,
                image: "/images/Elaboracionartesanal.webp",
                content: [
                  t('workshop.step2_p1'),
                  t('workshop.step2_p2'),
                  t('workshop.step2_p3'),
                  t('workshop.step2_p4'),
                  t('workshop.step2_p5'),
                  t('workshop.step2_p6')
                ],
                highlight: t('workshop.step2_highlight')
              },
              {
                step: "03",
                title: t('workshop.step3_title'),
                subtitle: t('workshop.step3_subtitle'),
                icon: <Eye className="text-secondary" size={48} />,
                image: "/images/ElEnvasadounoauno.webp",
                content: [
                  t('workshop.step3_p1'),
                  t('workshop.step3_p2'),
                  t('workshop.step3_p3')
                ],
                highlight: t('workshop.step3_highlight')
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
                    <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src={process.image} 
                        alt={process.title}
                        className="w-full h-full object-cover"
                      />
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
              {t('workshop.not_found_title')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                t('workshop.not_1'), t('workshop.not_2'), t('workshop.not_3'),
                t('workshop.not_4'), t('workshop.not_5'), t('workshop.not_6'),
                t('workshop.not_7'), t('workshop.not_8'), t('workshop.not_9'),
                t('workshop.not_10')
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
                {t('workshop.guarantee_title')}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: <Award className="text-secondary" size={40} />, title: t('workshop.g1_title'), text: t('workshop.g1_text') },
                  { icon: <Heart className="text-secondary" size={40} />, title: t('workshop.g2_title'), text: t('workshop.g2_text') },
                  { icon: <Eye className="text-secondary" size={40} />, title: t('workshop.g3_title'), text: t('workshop.g3_text') },
                  { icon: <CheckCircle className="text-secondary" size={40} />, title: t('workshop.g4_title'), text: t('workshop.g4_text') },
                  { icon: <Hand className="text-secondary" size={40} />, title: t('workshop.g5_title'), text: t('workshop.g5_text') },
                  { icon: <Clock className="text-secondary" size={40} />, title: t('workshop.g6_title'), text: t('workshop.g6_text') }
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
                {t('workshop.worth_title')}
              </h2>
              <p className="text-xl mb-6 text-white/90 leading-relaxed">
                {t('workshop.worth_p1')}
              </p>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                {t('workshop.worth_p2')}
              </p>
              <p className="text-lg text-white/80 leading-relaxed mb-8">
                {t('workshop.worth_p3')}
              </p>
              <div className="bg-white/10 p-6 rounded-lg">
                <p className="text-2xl font-script text-secondary">
                  "{t('workshop.worth_quote')}"
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
            {t('workshop.cta_title')}
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {t('workshop.cta_text')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/tienda"
              className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
            >
              {t('workshop.cta_products')}
            </a>
            <a
              href="/experiencias"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              {t('workshop.cta_visit')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ElObrador;
