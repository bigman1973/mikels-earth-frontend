import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkles, Leaf, Droplet, Gift } from 'lucide-react';

const NuestrasJoyas = () => {
  const { t } = useTranslation();
  const collections = [
    {
      id: 'paraguayo',
      name: t('jewels.paraguayo_name'),
      tagline: t('jewels.paraguayo_tagline'),
      icon: <Sparkles className="text-secondary" size={48} />,
      image: '/images/paraguayo-principal.webp',
      description: t('jewels.paraguayo_description'),
      features: [
        t('jewels.paraguayo_f1'),
        t('jewels.paraguayo_f2'),
        t('jewels.paraguayo_f3'),
        t('jewels.paraguayo_f4'),
        t('jewels.paraguayo_f5'),
        t('jewels.paraguayo_f6')
      ],
      story: t('jewels.paraguayo_story'),
      uses: t('jewels.paraguayo_uses')
    },
    {
      id: 'aceites',
      name: t('jewels.oils_name'),
      tagline: t('jewels.oils_tagline'),
      icon: <Droplet className="text-secondary" size={48} />,
      image: '/images/aceite-5l-portada.jpg',
      description: t('jewels.oils_description'),
      features: [
        t('jewels.oils_f1'),
        t('jewels.oils_f2'),
        t('jewels.oils_f3'),
        t('jewels.oils_f4'),
        t('jewels.oils_f5')
      ],
      story: t('jewels.oils_story'),
      uses: t('jewels.oils_uses')
    },
    {
      id: 'temprano',
      name: t('jewels.temprano_name'),
      tagline: t('jewels.temprano_tagline'),
      icon: <Leaf className="text-secondary" size={48} />,
      image: '/images/aceite-temprano-principal.jpeg',
      description: t('jewels.temprano_description'),
      features: [
        t('jewels.temprano_f1'),
        t('jewels.temprano_f2'),
        t('jewels.temprano_f3'),
        t('jewels.temprano_f4'),
        t('jewels.temprano_f5')
      ],
      story: t('jewels.temprano_story'),
      uses: t('jewels.temprano_uses')
    },
    {
      id: 'packs',
      name: t('jewels.packs_name'),
      tagline: t('jewels.packs_tagline'),
      icon: <Gift className="text-secondary" size={48} />,
      image: '/images/pack-degustacion-principal.jpeg',
      description: t('jewels.packs_description'),
      features: [
        t('jewels.packs_f1'),
        t('jewels.packs_f2'),
        t('jewels.packs_f3'),
        t('jewels.packs_f4'),
        t('jewels.packs_f5')
      ],
      story: t('jewels.packs_story'),
      uses: t('jewels.packs_uses')
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-b from-secondary/20 to-white flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkNGUxNTciIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLThjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4 relative z-10"
        >
          <Sparkles className="mx-auto text-secondary mb-4" size={60} />
          <h1 className="text-5xl md:text-7xl font-script text-primary mb-6">
            {t('jewels.hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 max-w-3xl mx-auto">
            {t('jewels.hero_subtitle')}
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
              {t('jewels.intro_title')}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              {t('jewels.intro_p1')}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('jewels.intro_p2')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Colecciones */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-24">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg group">
                      <img 
                        src={collection.image} 
                        alt={collection.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute -top-4 -right-4 bg-secondary text-primary px-6 py-2 rounded-full font-bold shadow-lg">
                      {collection.tagline}
                    </div>
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <h3 className="text-4xl font-bold text-primary mb-4">
                    {collection.name}
                  </h3>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {collection.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-bold text-primary mb-3">{t('jewels.features_label')}:</h4>
                    <ul className="space-y-2">
                      {collection.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2">
                          <span className="text-secondary mt-1">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-accent/10 p-6 rounded-lg mb-6">
                    <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                      <Sparkles size={20} className="text-secondary" />
                      {t('jewels.story_label')}
                    </h4>
                    <p className="text-gray-700 italic leading-relaxed">
                      {collection.story}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-primary mb-2">{t('jewels.uses_label')}:</h4>
                    <p className="text-gray-700">{collection.uses}</p>
                  </div>

                  <Link
                    to="/tienda"
                    className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                  >
                    {t('jewels.view_shop')} →
                  </Link>
                </div>
              </div>

              {index < collections.length - 1 && (
                <div className="mt-24 border-t border-gray-200"></div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Por qué son especiales */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-8">
                {t('jewels.special_title')}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 text-left">
                {[
                  { title: t('jewels.special_origin_title'), text: t('jewels.special_origin_text') },
                  { title: t('jewels.special_artisanal_title'), text: t('jewels.special_artisanal_text') },
                  { title: t('jewels.special_natural_title'), text: t('jewels.special_natural_text') },
                  { title: t('jewels.special_tradition_title'), text: t('jewels.special_tradition_text') },
                  { title: t('jewels.special_quality_title'), text: t('jewels.special_quality_text') },
                  { title: t('jewels.special_passion_title'), text: t('jewels.special_passion_text') }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white/10 p-6 rounded-lg"
                  >
                    <h3 className="text-xl font-bold text-secondary mb-3">{item.title}</h3>
                    <p className="text-white/90">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            {t('jewels.cta_title')}
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {t('jewels.cta_text')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/tienda"
              className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
            >
              {t('jewels.go_to_shop')}
            </Link>
            <Link
              to="/recetario"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              {t('jewels.view_recipes')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NuestrasJoyas;
