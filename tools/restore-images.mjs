/**
 * Връща оригиналните снимки на темплейта в секциите (реалните снимки на
 * центъра остават само в галерията). Таговете се вземат дословно от
 * огледалото и се превеждат към JSX, за да съвпадат с оригинала.
 *
 * Стартиране: node tools/restore-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const MIRROR = 'C:/masege/mesege/flexora.vamtam.com/massage-therapist/index.html';
const DIR = 'src/components/sections';

/** текуща снимка в public/media -> оригиналният стоков файл */
const BACK = {
  'cabin-room': 'GettyImages-2222455931-683x1024.jpg',
  corridor: 'GettyImages-2222455863-683x1024.jpg',
  lounge: 'GettyImages-2210243626-683x1024.jpg',
  entrance: 'pexels-arina-krasnikova-6663372-684x1024.jpg',
};

const html = fs.readFileSync(MIRROR, 'utf8');

/** Намира оригиналния <img …> таг по име на файл и го превръща в JSX. */
function originalTag(stock) {
  const re = new RegExp(`<img[^>]*${stock.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>`);
  const m = re.exec(html);
  if (!m) throw new Error(`няма таг за ${stock}`);

  return m[0]
    .replace(/\sclass=/g, ' className=')
    .replace(/\ssrcset=/g, ' srcSet=')
    .replace(/\.\.\/wp-content\//g, '/wp-content/')
    .replace(/https:\/\/flexora\.vamtam\.com\/wp-content\//g, '/wp-content/')
    .replace(/\s*\/?>$/, ' />');
}

const IMG = /<img\b[^>]*?\/>/g;
let restored = 0;

for (const file of fs.readdirSync(DIR)) {
  const p = path.join(DIR, file);
  const before = fs.readFileSync(p, 'utf8');

  const after = before.replace(IMG, (tag) => {
    const src = /src="\/media\/([a-z-]+)\.jpg"/.exec(tag);
    if (!src) return tag;
    const stock = BACK[src[1]];
    if (!stock) return tag;
    restored++;
    return originalTag(stock);
  });

  if (after !== before) {
    fs.writeFileSync(p, after, 'utf8');
    console.log(`възстановен: ${file}`);
  }
}

console.log(`\nвърнати ${restored} оригинални снимки`);
