import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const familyPage = await readFile(join(root, 'src/pages/LaFamilia.jsx'), 'utf8');

const unchangedCards = [
  ['De dónde viene', 'La fruta, del Segrià. El aceite, de nuestros olivos en la campiña cordobesa. Son dos sitios distintos y lo decimos, porque no es lo mismo una cosa que la otra.'],
  ['Qué lleva', 'Paraguayo, agua, azúcar y zumo de limón. Eso es todo. El limón es lo que hace que la conserva aguante: no hacen falta conservantes ni colorantes.'],
  ['Lo que está certificado', 'Aceite ecológico con certificación. Desde 2017, certificación Eco Garden, una de las más exigentes para exportar a Asia: solo tres empresas españolas la tienen. Y siete medallas en cinco años seguidos en los dos concursos internacionales de referencia, el NYIOOC de Nueva York y OLIVE JAPAN de Tokio.'],
  ['Cuánto hay', 'Una temporada al año y una cantidad limitada. Cuando se acaba, hay que esperar a la cosecha siguiente. No aspiramos a estar en todas partes.'],
  ['Desde cuándo', 'Las escrituras de la tierra que trabajamos datan de 1819. Siete generaciones después, la familia sigue en Alcarràs.'],
];

test('family editorial cards replace only the requested how-it-is-made card', () => {
  assert.match(familyPage, /title: 'Cómo se hace'/);
  assert.match(
    familyPage,
    /text: 'Se pela a mano, pieza a pieza\. A máquina la fruta se rompe y casi nadie la envasa entera\. La receta es la de casa: la de hacer conserva cada verano para el invierno\. El aceite sale de nuestro olivar en la campiña cordobesa, de una sola pasada y recogido verde\.'/,
  );
  assert.doesNotMatch(familyPage, /title: 'Quién lo hace'/);
  assert.doesNotMatch(familyPage, /El aceite es nuestro, de principio a fin/);

  for (const [title, text] of unchangedCards) {
    assert.match(familyPage, new RegExp(`title: '${title}'`));
    assert.ok(familyPage.includes(`text: '${text}'`), `${title} must remain unchanged`);
  }
});

test('the retired oil-origin wording is absent from public source files', async () => {
  const sourceRoots = ['src'];
  for (const rootPath of sourceRoots) {
    const result = await (await import('node:child_process')).execFileSync(
      'bash',
      ['-lc', `! rg -n -F --glob '!dist/**' 'El aceite es nuestro, de principio a fin' ${rootPath}`],
      { cwd: root, encoding: 'utf8' },
    );
    assert.equal(result, '');
  }
});
