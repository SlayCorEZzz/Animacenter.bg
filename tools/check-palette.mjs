/**
 * Търси зелени тонове из целия сайт.
 *
 * Палитрата на темплейта беше студено зелено-тюркоазена, а първата ни беше
 * маслинена; клиентът не искаше нито едното. Обхожда се всеки елемент и се
 * гледат цветовете, които CSS-ът наистина прилага: текст, фон, рамка, fill,
 * stroke. Снимките и видеата не се броят: там цветът е част от кадъра.
 *
 * node tools/check-palette.mjs
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.SHOT_URL ?? 'http://localhost:5002/';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });

// Част от секциите се появяват чак след като минат през екрана.
await page.evaluate(async () => {
  const s = innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += s) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 130));
  }
  scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 700));
});

const scan = () =>
  page.evaluate(() => {
    const PROPS = ['color', 'backgroundColor', 'borderTopColor', 'borderBottomColor', 'fill', 'stroke'];

    /** Оттенък и наситеност по HSL, само по тях се познава зеленото. */
    const hs = (s) => {
      const m = s.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
      if (!m) return null;
      const [r, g, b] = [+m[1], +m[2], +m[3]].map((v) => v / 255);
      const a = m[4] === undefined ? 1 : +m[4];
      if (a < 0.2) return null;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      if (d === 0) return null;
      const l = (max + min) / 2;
      const sat = d / (1 - Math.abs(2 * l - 1));
      let h;
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
      return { h, s: sat, l };
    };

    const hits = [];
    for (const el of document.querySelectorAll('*')) {
      if (/^(IMG|VIDEO|IFRAME|CANVAS|SCRIPT|STYLE)$/.test(el.tagName)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      for (const prop of PROPS) {
        const raw = cs[prop];
        const c = hs(raw);
        // Зелено: оттенък 70–175°, с достатъчно наситеност, за да си личи.
        if (!c || c.h < 70 || c.h > 175 || c.s < 0.1) continue;
        hits.push({
          prop,
          raw,
          hue: Math.round(c.h),
          tag: el.tagName.toLowerCase(),
          cls: String(el.className?.baseVal ?? el.className ?? '').slice(0, 60),
        });
      }
    }
    return hits;
  });

const onPage = await scan();

// Прозорците се рендерират през портал и не се обхождат заедно с останалото.
await page.evaluate(() => document.querySelector('[data-book]').click());
await page.waitForSelector('.anima-book__card', { timeout: 5000 });
await new Promise((r) => setTimeout(r, 500));
const inModal = await scan();

await browser.close();

const hits = [...onPage, ...inModal];
console.log(`обходени са всички елементи на страницата и в прозореца за записване\n`);

if (!hits.length) {
  console.log('Няма зелени тонове, палитрата е топла.');
} else {
  const seen = new Map();
  hits.forEach((h) => {
    const key = `${h.raw}|${h.prop}`;
    if (!seen.has(key)) seen.set(key, { ...h, n: 0 });
    seen.get(key).n++;
  });
  console.log(`НАМЕРЕНО ЗЕЛЕНО (${hits.length} места, ${seen.size} различни):`);
  [...seen.values()]
    .sort((a, b) => b.n - a.n)
    .forEach((h) => console.log(`  ${h.raw}  оттенък ${h.hue}°  ${h.prop}  ×${h.n}  напр. <${h.tag} class="${h.cls}">`));
}
