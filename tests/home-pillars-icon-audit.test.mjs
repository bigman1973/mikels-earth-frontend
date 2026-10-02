import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const source = (path) => readFileSync(resolve(process.cwd(), path), 'utf8');

const approvedPillars = {
  pillars_title: 'Lo que hay detrás',
  pillar_tradition_title: 'Desde 1819',
  pillar_tradition_text: 'Las escrituras de la tierra que trabajamos datan de 1819. Siete generaciones después, la familia sigue en Alcarràs.',
  pillar_terroir_title: 'Dos orígenes',
  pillar_terroir_text: 'La fruta, del Segrià. El aceite, de nuestros olivos en Córdoba. Son dos sitios distintos y lo decimos, porque no es lo mismo una cosa que la otra.',
  pillar_craft_title: 'Pelado a mano',
  pillar_craft_text: 'El paraguayo se pela a mano, pieza a pieza. A máquina la fruta se deshace, y por eso casi nadie la envasa entera.',
  pillar_ingredients_title: 'Cuatro ingredientes',
  pillar_ingredients_text: 'Paraguayo, agua, azúcar y zumo de limón. Nada más.',
};

const approvedFeaturedProducts = {
  product_paraguayo: 'Paraguayo en Almíbar',
  product_paraguayo_tagline: 'Pelado a mano, pieza a pieza',
  product_paraguayo_desc: 'Paraguayo entero en almíbar ligero. Cuatro ingredientes: fruta, agua, azúcar y zumo de limón.',
  product_temprano: 'Aceite Temprano',
  product_temprano_tagline: 'Cosecha verde, sin filtrar',
  product_temprano_reservation_badge: 'RESERVA · COSECHA 2026/27',
  product_temprano_desc: 'Aceituna recogida antes de tiempo. Menos aceite por kilo y más carácter: verde, con cuerpo y ligeramente picante.',
  product_pack: 'Pack Degustación',
  product_pack_tagline: 'Mermelada y cuatro aceites',
  product_pack_desc: 'Una mermelada de paraguayo y cuatro miniaturas de aceite. Para probarlo todo, o para regalar.',
};

test('home pillars retain only their approved title and copy', () => {
  const home = source('src/pages/Home.jsx');
  const pillars = home.slice(home.indexOf('{/* Pilares */}'), home.indexOf('{/* Productos Destacados */}'));

  assert.match(home, /import \{ ArrowRight \} from 'lucide-react';/);
  assert.doesNotMatch(pillars, /Heart|Leaf|Award|ShoppingBag|pillar\.icon|icon: </);
  assert.doesNotMatch(pillars, /home\.view_products|home\.discover_more/);
  assert.match(pillars, /mb-8 text-center text-2xl font-medium text-primary/);
});

test('home pillar copy is the approved Spanish text in both language resources pending English review', () => {
  for (const path of ['src/i18n/locales/es.json', 'src/i18n/locales/en.json']) {
    const home = JSON.parse(source(path)).home;
    for (const [key, value] of Object.entries(approvedPillars)) {
      assert.equal(home[key], value, `${path}: ${key}`);
    }
  }
});

test('featured home products use the approved text and highlight Temprano reservation', () => {
  const home = source('src/pages/Home.jsx');
  const featured = home.slice(home.indexOf('{/* Productos Destacados */}'), home.indexOf('{/* Compromiso Social */}'));

  assert.match(featured, /home\.product_temprano_reservation_badge/);
  assert.match(featured, /absolute left-4 top-4 z-10 rounded-full bg-primary/);
  assert.match(featured, /link: '\/producto\/paraguayo-almibar'/);
  assert.match(featured, /link: '\/producto\/aceite-temprano-sin-filtrar'/);
  assert.match(featured, /link: '\/producto\/pack-mermelada-aceites'/);

  for (const path of ['src/i18n/locales/es.json', 'src/i18n/locales/en.json']) {
    const values = JSON.parse(source(path)).home;
    for (const [key, value] of Object.entries(approvedFeaturedProducts)) {
      assert.equal(values[key], value, `${path}: ${key}`);
    }
  }
});

test('other public pages retain functional icons but remove redundant generic motifs', () => {
  assert.doesNotMatch(source('src/pages/NuestrasJoyas.jsx'), /lucide-react|Sparkles|Droplet|Gift/);
  assert.doesNotMatch(source('src/pages/NuestraTierra.jsx'), /MapPin|Heart/);
  assert.doesNotMatch(source('src/pages/Recetario.jsx'), /ChefHat|Flame/);
  assert.doesNotMatch(source('src/pages/Blog.jsx'), /BookOpen|\bUser\b/);
  assert.doesNotMatch(source('src/components/common/Newsletter.jsx'), /mx-auto mb-4 text-secondary/);
});
