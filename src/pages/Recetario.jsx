import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ChefHat, Clock, Users, Flame } from 'lucide-react';

const Recetario = () => {
  const { t, i18n } = useTranslation();

  const recipeIds = [
    'tostadas_temprano',
    'ensalada_paraguayo',
    'carpaccio_temprano',
    'postre_paraguayo',
    'pasta_picual',
    'yogur_paraguayo'
  ];

  const recipeImages = {
    tostadas_temprano: '/images/pan-tomate.webp',
    ensalada_paraguayo: '/images/ensalada-paraguayo.webp',
    carpaccio_temprano: '/images/carpaccio.jpg',
    postre_paraguayo: '/images/postre-paraguayo.webp',
    pasta_picual: '/images/pasta-aglio.webp',
    yogur_paraguayo: '/images/yogur-paraguayo.webp'
  };

  const recipeTimes = {
    tostadas_temprano: '5 min',
    ensalada_paraguayo: '15 min',
    carpaccio_temprano: '20 min',
    postre_paraguayo: '10 min',
    pasta_picual: '20 min',
    yogur_paraguayo: '5 min'
  };

  const recipeServings = {
    tostadas_temprano: '2',
    ensalada_paraguayo: '4',
    carpaccio_temprano: '4',
    postre_paraguayo: '4',
    pasta_picual: '4',
    yogur_paraguayo: '1'
  };

  const pairingKeys = ['arbequina', 'picual', 'temprano', 'paraguayo', 'hojiblanca', 'mermeladas'];

  const categoryMap = {
    'Desayuno': 'breakfast',
    'Entrante': 'starter',
    'Principal': 'main',
    'Postre': 'dessert',
    'Breakfast': 'breakfast',
    'Starter': 'starter',
    'Main': 'main',
    'Dessert': 'dessert'
  };

  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'breakfast', 'starter', 'main', 'dessert'];

  const getRecipeCategory = (id) => {
    const cat = t(`recipes_data.${id}.category`);
    return categoryMap[cat] || cat.toLowerCase();
  };

  const filteredRecipes = selectedCategory === 'all'
    ? recipeIds
    : recipeIds.filter(id => getRecipeCategory(id) === selectedCategory);

  return (
    <div className="bg-white">
      <Helmet>
        <title>{t('recipes.seo_title')}</title>
        <meta name="description" content={t('recipes_data.hero_subtitle')} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-b from-secondary/20 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <ChefHat className="mx-auto text-secondary mb-4" size={60} />
          <h1 className="text-5xl md:text-7xl font-script text-primary mb-6">
            {t('recipes_data.hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 max-w-3xl mx-auto">
            {t('recipes_data.hero_subtitle')}
          </p>
        </motion.div>
      </section>

      {/* Introduction */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-primary mb-6">
              {t('recipes_data.intro_title')}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              {t('recipes_data.intro_p1')}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('recipes_data.intro_p2')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-secondary text-primary'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`recipes_data.categories.${cat}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((id, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer group"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={recipeImages[id]}
                    alt={t(`recipes_data.${id}.name`)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-secondary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {t(`recipes_data.${id}.category`)}
                    </span>
                    <span className="text-gray-500 text-sm">{t(`recipes_data.${id}.difficulty`)}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                    {t(`recipes_data.${id}.name`)}
                  </h3>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {t(`recipes_data.${id}.description`)}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{recipeTimes[id]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{recipeServings[id]}</span>
                    </div>
                  </div>

                  {/* Expandable - Ingredients and Steps */}
                  <details className="group/details">
                    <summary className="cursor-pointer text-secondary font-semibold hover:text-secondary/80 transition-colors">
                      {t('recipes_data.view_full_recipe')}
                    </summary>

                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Ingredients */}
                      <div>
                        <h4 className="font-bold text-primary mb-2">{t('recipes.ingredients')}:</h4>
                        <ul className="space-y-1">
                          {(t(`recipes_data.${id}.ingredients`, { returnObjects: true }) || []).map((ing, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-secondary">•</span>
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="font-bold text-primary mb-2">{t('recipes.preparation')}:</h4>
                        <ol className="space-y-2">
                          {(t(`recipes_data.${id}.steps`, { returnObjects: true }) || []).map((step, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex gap-2">
                              <span className="flex-shrink-0 w-5 h-5 bg-secondary text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Tips */}
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                          <Flame size={16} className="text-secondary" />
                          {t('recipes_data.chef_tip')}
                        </h4>
                        <p className="text-sm text-gray-700 italic">{t(`recipes_data.${id}.tips`)}</p>
                      </div>
                    </div>
                  </details>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pairings */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-center mb-12">
                {t('recipes_data.pairings_title')}
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {pairingKeys.map((key, index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white/10 p-6 rounded-lg"
                  >
                    <h3 className="text-xl font-bold text-secondary mb-4">
                      {t(`pairings.${key}.product`)}
                    </h3>
                    <ul className="space-y-2">
                      {(t(`pairings.${key}.items`, { returnObjects: true }) || []).map((item, pIdx) => (
                        <li key={pIdx} className="flex items-center gap-2 text-white/90">
                          <span className="text-secondary">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            {t('recipes_data.cta_title')}
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {t('recipes_data.cta_text')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/tienda"
              className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
            >
              {t('recipes_data.cta_shop')}
            </a>
            <a
              href="https://www.instagram.com/mikelsearth"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              {t('recipes_data.cta_instagram')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recetario;
