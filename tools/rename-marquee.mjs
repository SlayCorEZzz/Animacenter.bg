/**
 * Надписите в бягащата лента (в хероя и във футъра).
 *
 * Първо бяха общи термини („Кръвообращение“), после усещания („Тих ум“).
 * И двете стояха абстрактно, а лентата минава покрай окото за секунда и е
 * по-полезна, ако казва какво всъщност се предлага. Сега са услугите от
 * ценоразписа, разредени с по една къса дума, за да има ритъм.
 *
 * node tools/rename-marquee.mjs
 */
import fs from 'node:fs';

const HERO = 'src/components/sections/HeroSection.jsx';
const CONTENT = 'src/content/site.js';

/** Редът има значение: дълго · късо · дълго · късо. */
export const WORDS = [
  'Релаксиращ масаж',
  'Гъвкавост',
  'Лечебен масаж',
  'Разпускане',
  'Кинезитерапия',
  'Терапия за лице',
  'Масаж с етерични масла',
  'Спокойствие',
];

/** Каквото и да пише сега в хероя, вадим го по реда на появата му. */
const heroCurrent = (src) =>
  [...src.matchAll(/elementor-heading-title elementor-size-default">([^<]+)<\/div>/g)]
    .map((m) => m[1])
    .filter((t) => t.length < 30);

let hero = fs.readFileSync(HERO, 'utf8');
const current = heroCurrent(hero);

if (current.length !== WORDS.length) {
  console.error(`! в хероя намирам ${current.length} надписа, а очаквам ${WORDS.length}`);
  process.exit(1);
}

current.forEach((from, i) => {
  hero = hero.replace(`>${from}</div>`, `>${WORDS[i]}</div>`);
});
fs.writeFileSync(HERO, hero, 'utf8');

const content = fs.readFileSync(CONTENT, 'utf8');
const list = WORDS.map((w) => `  '${w}',`).join('\n');
const next = content.replace(
  /export const marquee = \[[\s\S]*?\];/,
  `export const marquee = [\n${list}\n];`,
);

if (next === content) {
  console.error('! не намирам masiva `marquee` в site.js');
  process.exit(1);
}
fs.writeFileSync(CONTENT, next, 'utf8');

console.log(`сменени ${WORDS.length} надписа в хероя и във футъра`);
