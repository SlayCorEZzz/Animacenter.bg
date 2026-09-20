/**
 * Сменя стоковите снимки на темплейта с реалните снимки на ANIMA Center.
 * Пипа целия <img …> таг: src, srcSet, sizes, width, height и alt.
 *
 * Стартиране: node tools/swap-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/components/sections';

/** стоков файл -> { base, w, h, alt } от public/media */
const MAP = {
  // карти с услуги (портрет 3:4)
  'GettyImages-2222455931-683x1024.jpg': { base: 'cabin-room', w: 900, h: 1200, small: 600, alt: 'Кабинет за масаж в ANIMA Center' },
  'GettyImages-2222455863-683x1024.jpg': { base: 'corridor', w: 900, h: 1200, small: 600, alt: 'Коридорът към кабинетите' },
  'GettyImages-2210243626-683x1024.jpg': { base: 'lounge', w: 900, h: 1200, small: 600, alt: 'Зоната за изчакване' },
  'pexels-arina-krasnikova-6663372-684x1024.jpg': { base: 'entrance', w: 900, h: 1200, small: 600, alt: 'Входът на центъра' },

  // карти в блога (портрет)
  'GettyImages-489204244-801x1024.jpg': { base: 'stairs-green', w: 900, h: 1200, small: 600, alt: 'Стълбите към ANIMA Center' },
  'GettyImages-200112735-001-801x1024.jpg': { base: 'cabin-room', w: 900, h: 1200, small: 600, alt: 'Кабинет за масаж' },
  'GettyImages-1357320863-1-801x1024.jpg': { base: 'corridor', w: 900, h: 1200, small: 600, alt: 'Интериорът на центъра' },

  // екип (пейзаж)
  'GettyImages-1324943018-2-1024x600.jpg': { base: 'therapist', w: 800, h: 1067, small: 560, alt: 'д-р Теодора Цолова' },
  'GettyImages-sb10064081j-002-1024x600.jpg': { base: 'reception', w: 1200, h: 900, small: 600, alt: 'Рецепцията на ANIMA Center' },
};

const IMG = /<img\b[^>]*?\/>/g;
const SRC = /src="([^"]*)"/;

let swapped = 0;
const seen = new Set();

for (const file of fs.readdirSync(DIR)) {
  const p = path.join(DIR, file);
  let src = fs.readFileSync(p, 'utf8');
  const before = src;

  src = src.replace(IMG, (tag) => {
    const m = SRC.exec(tag);
    if (!m) return tag;
    const stock = path.basename(m[1]);
    const rep = MAP[stock];
    if (!rep) return tag;
    seen.add(stock);
    swapped++;

    // Запазваме класовете на Elementor, от тях зависят анимациите.
    const cls = /className="([^"]*)"/.exec(tag)?.[1] ?? '';
    const priority = /fetchpriority="high"/i.test(tag);

    return (
      `<img${priority ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"` +
      ` width="${rep.w}" height="${rep.h}"` +
      ` src="/media/${rep.base}.jpg"` +
      ` srcSet="/media/${rep.base}@${rep.small}.jpg ${rep.small}w, /media/${rep.base}.jpg ${rep.w}w"` +
      ` sizes="(max-width: 767px) 92vw, (max-width: 1024px) 46vw, 24vw"` +
      ` className="${cls}" alt="${rep.alt}" />`
    );
  });

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf8');
    console.log(`обновен: ${file}`);
  }
}

console.log(`\nсменени ${swapped} снимки`);
const missing = Object.keys(MAP).filter((k) => !seen.has(k));
if (missing.length) console.log('ненамерени:', missing.join(', '));
