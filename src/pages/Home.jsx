import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Heart, Leaf, Award, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Newsletter from '../components/common/Newsletter';
import ReviewCarousel from '../components/ReviewCarousel';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      <Helmet>
        <title>{t('home.seo_title')}</title>
        <meta name="description" content={t('home.seo_description')} />
      </Helmet>
      {/* Hero Section - Inmersivo */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo con olivos: recurso LCP prioritario y responsive */}
        <picture className="absolute inset-0">
          <source media="(max-width: 640px)" srcSet="/images/hero-olivos-640.webp" />
          <img
            src="/images/hero-olivos-1000.webp"
            srcSet="/images/hero-olivos-640.webp 640w, /images/hero-olivos-1000.webp 1000w"
            sizes="100vw"
            width="1000"
            height="1000"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
          {/* Overlay oscuro para mejorar legibilidad */}
          <span className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </picture>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div>
              <h1 className="text-6xl md:text-8xl font-script text-white mb-6 leading-tight drop-shadow-2xl">
                {t('home.hero_title_1')}<br />{t('home.hero_title_2')}
              </h1>
              <p className="text-2xl md:text-3xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                {t('home.hero_subtitle')}
              </p>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-lg">
                {t('home.hero_text')}
              </p>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  to="/la-familia"
                  className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                >
                  {t('home.hero_cta_history')}
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/nuestras-joyas"
                  className="bg-secondary text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-secondary/90 transition-colors"
                >
                  {t('home.hero_cta_jewels')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" aria-hidden="true">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1.5 h-1.5 bg-primary/50 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Manifiesto */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-primary mb-8">
                {t('home.manifesto_title')}
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                <p className="text-xl leading-relaxed">
                  {t('home.manifesto_p1')}
                </p>
                <p className="text-xl leading-relaxed">
                  {t('home.manifesto_p2')}
                </p>
                <p className="text-xl leading-relaxed font-semibold text-primary">
                  {t('home.manifesto_p3')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="py-20 bg-gradient-to-b from-accent/10 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-primary text-center mb-16">
            {t('home.pillars_title')}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Heart className="text-secondary" size={48} />,
                title: t('home.pillar_tradition_title'),
                text: t('home.pillar_tradition_text'),
                link: "/la-familia"
              },
              {
                icon: <Leaf className="text-secondary" size={48} />,
                title: t('home.pillar_terroir_title'),
                text: t('home.pillar_terroir_text'),
                link: "/nuestra-tierra"
              },
              {
                icon: <Award className="text-secondary" size={48} />,
                title: t('home.pillar_craft_title'),
                text: t('home.pillar_craft_text'),
                link: "/el-obrador"
              },
              {
                icon: <Users className="text-secondary" size={48} />,
                title: t('home.pillar_transparency_title'),
                text: t('home.pillar_transparency_text'),
                link: "/experiencias"
              }
            ].map((pillar, index) => (
              <div key={index}>
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
                    {t('home.discover_more')}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6">
                {t('home.jewels_title')}
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                {t('home.jewels_subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: t('home.product_paraguayo'),
                  tagline: t('home.product_paraguayo_tagline'),
                  description: t('home.product_paraguayo_desc'),
                  image: "/images/products/paraguayo-almibar-hero.jpg"
                },
                {
                  name: t('home.product_temprano'),
                  tagline: t('home.product_temprano_tagline'),
                  description: t('home.product_temprano_desc'),
                  image: "/images/aceite-temprano.jpg"
                },
                {
                  name: t('home.product_pack'),
                  tagline: t('home.product_pack_tagline'),
                  description: t('home.product_pack_desc'),
                  image: "/images/pack-degustacion.jpg"
                }
              ].map((product, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-b from-accent/20 to-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden group"
                >
                  <div className="h-64 overflow-hidden flex items-center justify-center">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      width="640"
                      height="640"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 sm:p-8">
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
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg px-3 text-center text-primary font-bold hover:bg-primary/5 hover:text-secondary transition-colors"
                  >
                    {t('home.discover_more')}
                  </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/tienda"
                className="inline-block bg-secondary text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-secondary/90 transition-colors"
              >
                {t('home.view_shop')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compromiso Social */}
      <section className="py-14 sm:py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">
                {t('home.commitment_title')}
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('home.commitment_p1') }} />
              <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed mb-8">
                {t('home.commitment_p2')}
              </p>
              <div className="bg-white/10 p-5 sm:p-8 rounded-xl inline-block">
                <p className="text-3xl font-script text-secondary mb-2">
                  {t('home.commitment_quote')}
                </p>
                <p className="text-white/70">{t('home.commitment_author')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <ReviewCarousel />

      {/* Newsletter */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <Newsletter variant="inline" />
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-white to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6">
                {t('home.cta_title')}
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-12 leading-relaxed">
                {t('home.cta_subtitle')}
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-primary mb-2">{t('home.cta_visit_title')}</h3>
                  <p className="text-gray-700 mb-4">{t('home.cta_visit_text')}</p>
                  <Link to="/experiencias" className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-secondary font-semibold hover:bg-secondary/10">
                    {t('home.cta_visit_link')}
                  </Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-primary mb-2">{t('home.cta_shop_title')}</h3>
                  <p className="text-gray-700 mb-4">{t('home.cta_shop_text')}</p>
                  <Link to="/tienda" className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-secondary font-semibold hover:bg-secondary/10">
                    {t('home.cta_shop_link')}
                  </Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-primary mb-2">{t('home.cta_follow_title')}</h3>
                  <p className="text-gray-700 mb-4">{t('home.cta_follow_text')}</p>
                  <a 
                    href="https://www.instagram.com/mikelsearth" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-secondary font-semibold hover:bg-secondary/10"
                  >
                    {t('home.cta_follow_link')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
