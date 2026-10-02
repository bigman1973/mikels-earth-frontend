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

test('other public pages retain functional icons but remove redundant generic motifs', () => {
  assert.doesNotMatch(source('src/pages/NuestrasJoyas.jsx'), /lucide-react|Sparkles|Droplet|Gift/);
  assert.doesNotMatch(source('src/pages/NuestraTierra.jsx'), /MapPin|Heart/);
  assert.doesNotMatch(source('src/pages/Recetario.jsx'), /ChefHat|Flame/);
  assert.doesNotMatch(source('src/pages/Blog.jsx'), /BookOpen|\bUser\b/);
  assert.doesNotMatch(source('src/components/common/Newsletter.jsx'), /mx-auto mb-4 text-secondary/);
});
