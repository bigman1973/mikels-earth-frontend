import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';

const CONTENT = {
  es: {
    eyebrow: 'Paraguayo en almíbar',
    title: 'Cómo se hace',
    intro: 'Una conserva de fruta hecha con cuatro ingredientes y el tiempo que necesita.',
    sections: [
      {
        title: 'Doscientos años en la misma tierra',
        paragraphs: [
          'La familia cultiva estas tierras desde 1819. Los árboles siguen ahí, en el Segrià, y siguen dando fruta cada verano igual que entonces.',
          'No somos una empresa que descubrió el campo. Somos una familia de agricultores que un día decidió meter en un tarro lo que llevaba toda la vida comiendo en casa.',
        ],
      },
      {
        title: 'La receta es de casa',
        paragraphs: [
          'Cuando llega el paraguayo, en casa se hace conserva. Se ha hecho siempre: se pela la fruta a mano, se cuece despacio, y los tarros duran hasta el invierno.',
          'Son unos pocos tarros, para la familia. Pero de ahí salió todo: la receta, el punto de cocción, la manera de tratar una fruta que se rompe si la miras fuerte.',
          "Mikel's Fruit existe para que esa conserva no se quede en la cocina de casa.",
        ],
      },
      {
        title: 'El pelado a mano',
        paragraphs: [
          'El paraguayo es delicado. Pelarlo a máquina lo destroza: sale deshecho, y lo que llega al tarro es puré. Por eso casi nadie lo envasa entero, y por eso este producto es difícil de encontrar.',
          'Se pela a mano, pieza a pieza. Es lento y es caro. Es también la única forma de que la fruta llegue al tarro con su forma, su textura y su sabor intactos.',
        ],
        highlight: 'Se pela a mano, pieza a pieza.',
      },
      {
        title: 'Cuatro ingredientes',
        paragraphs: [
          'Paraguayo pelado, agua, azúcar y zumo de limón. Esa es la lista completa.',
          'El limón no está por casualidad: es lo que se ha usado siempre para que la conserva aguante y la fruta no se oscurezca. Hace el trabajo que en otros tarros hacen los conservantes.',
          'No hay más porque no hace falta más. Cuando la fruta es buena y está en su punto, lo demás sobra.',
        ],
        ingredients: ['Sin conservantes.', 'Sin colorantes.', 'Nada que no tengas ya en la cocina.'],
      },
      {
        title: 'Por qué cuesta más',
        paragraphs: [
          'Es una pregunta justa.',
          'Pelar a mano lleva horas. Cocer despacio ocupa más tiempo que cocer deprisa. Trabajar con fruta de temporada obliga a hacerlo cuando toca, no cuando conviene.',
          'Nada de eso es gratis y va en el precio. A cambio, lo que abres en enero sabe a la fruta que se recogió en julio.',
        ],
      },
    ],
    cta: 'Ver nuestros productos',
    imageAlt: 'Paraguayo en almíbar de Mikel’s Fruit',
  },
  en: {
    eyebrow: 'Flat peach in syrup',
    title: 'How it is made',
    intro: 'A fruit preserve made with four ingredients and the time it needs.',
    sections: [
      {
        title: 'Two hundred years on the same land',
        paragraphs: [
          'The family has farmed this land since 1819. The trees are still there, in El Segrià, and they still bear fruit every summer just as they did then.',
          'We are not a company that discovered the countryside. We are a family of farmers who one day decided to put in a jar what they had been eating at home all their lives.',
        ],
      },
      {
        title: 'The recipe comes from home',
        paragraphs: [
          'When flat peaches arrive, preserves are made at home. It has always been done this way: the fruit is peeled by hand, cooked slowly, and the jars last until winter.',
          'They are just a few jars for the family. But everything came from there: the recipe, the cooking point, and the way to treat a fruit that breaks if you look at it too hard.',
          "Mikel's Fruit exists so that this preserve does not stay in the family kitchen.",
        ],
      },
      {
        title: 'Hand peeling',
        paragraphs: [
          'Flat peaches are delicate. Machine peeling destroys them: they come out broken and what reaches the jar is purée. That is why almost nobody packs them whole, and why this product is difficult to find.',
          'They are peeled by hand, one piece at a time. It is slow and expensive. It is also the only way for the fruit to reach the jar with its shape, texture and flavour intact.',
        ],
        highlight: 'Peeled by hand, one piece at a time.',
      },
      {
        title: 'Four ingredients',
        paragraphs: [
          'Peeled flat peach, water, sugar and lemon juice. That is the complete list.',
          'The lemon is not there by chance: it has always been used to help the preserve keep and stop the fruit from darkening. It does the job that preservatives do in other jars.',
          'There is no more because there does not need to be. When the fruit is good and at its best, the rest is unnecessary.',
        ],
        ingredients: ['No preservatives.', 'No colourings.', 'Nothing you would not already have in your kitchen.'],
      },
      {
        title: 'Why it costs more',
        paragraphs: [
          'It is a fair question.',
          'Peeling by hand takes hours. Slow cooking takes more time than cooking quickly. Working with seasonal fruit means doing it when the fruit is ready, not when it is convenient.',
          'None of that is free, and it is part of the price. In return, what you open in January tastes like the fruit picked in July.',
        ],
      },
    ],
    cta: 'View our products',
    imageAlt: "Mikel's Fruit flat peach in syrup",
  },
};

export default function ComoSeHace() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || 'es').split('-')[0];
  const content = language === 'en' ? CONTENT.en : CONTENT.es;

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <img
            src="/images/paraguayo-principal.webp"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-black/70" aria-hidden="true" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-secondary">{content.eyebrow}</p>
            <h1 className="mb-6 font-script text-6xl leading-none md:text-8xl">{content.title}</h1>
            <p className="max-w-2xl text-xl leading-relaxed text-white/90 md:text-2xl">{content.intro}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl space-y-16 md:space-y-20">
          {content.sections.map((section) => (
            <article key={section.title} className="border-l-4 border-secondary pl-6 md:pl-10">
              <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">{section.title}</h2>
              <div className="space-y-5 text-lg leading-relaxed text-gray-700 md:text-xl">
                {section.paragraphs.map((paragraph, index) => {
                  const isHighlight = section.highlight && paragraph.startsWith(section.highlight);
                  return (
                    <p key={`${section.title}-${index}`} className={isHighlight ? 'font-semibold text-primary' : ''}>
                      {paragraph}
                    </p>
                  );
                })}
              </div>
              {section.ingredients && (
                <ul className="mt-8 grid gap-3 rounded-xl bg-accent/15 p-6 text-lg font-medium text-primary md:grid-cols-3">
                  {section.ingredients.map((ingredient) => (
                    <li key={ingredient} className="flex items-start gap-3">
                      <Check className="mt-1 h-5 w-5 flex-none text-secondary" aria-hidden="true" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="bg-accent/15 py-16">
        <div className="container mx-auto px-4 text-center">
          <Link
            to="/tienda"
            className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-primary/90"
          >
            {content.cta}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
