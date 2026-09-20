/**
 * Минава по всички бутони и връзки-бутони, симулира :hover и мери контраста
 * текст/фон. Така се хващат състояния, в които надписът изчезва.
 *
 * Обхожда и съдържанието на прозорците: те се рендерират през портал в
 * <body>, извън обвивките, в които живее нулирането на стиловете на темата,
 * затова правилата ѝ за <button> ги достигат непокътнати.
 *
 * node tools/check-hover.mjs
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.SHOT_URL ?? 'http://localhost:5002/';

const PAGE_TARGETS =
  '.elementor-button, .anima-btn, .anima-tabs__btn, .anima-callbar__btn, .anima-footer__nav a, .anima-header__nav a';
const MODAL_TARGETS =
  '.anima-book__card, .anima-modal .anima-btn, .anima-book__alt a, .anima-modal__close';
const LIGHTBOX_TARGETS = '.anima-lightbox__nav, .anima-lightbox__close';

const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rel = ([r, g, b]) => 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(b / 255);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });

// Анимациите при скрол държат част от бутоните скрити, докато секцията не е
// минала през екрана, затова първо се минава цялата страница.
await page.evaluate(async () => {
  const s = innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += s) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 130));
  }
  scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 900));
});

const report = [];

async function sweep(where, selector) {
  for (const el of await page.$$(selector)) {
    // Елементът се изкарва в средата на екрана, иначе фиксираната лента го
    // покрива, hover не се задейства и се мери преходно състояние.
    await el.evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' })).catch(() => {});
    await new Promise((r) => setTimeout(r, 160));
    await el.hover().catch(() => {});
    await new Promise((r) => setTimeout(r, 420));

    const data = await el.evaluate((node) => {
      const parse = (s) => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const a = m[1].split(',').map(Number);
        return { rgb: a.slice(0, 3), a: a[3] ?? 1 };
      };
      // Търсим първия непрозрачен фон нагоре по дървото.
      let bg = null;
      for (let n = node; n && !bg; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0.75) bg = c.rgb;
      }
      const cs = getComputedStyle(node);
      return {
        // Бутоните само с иконка нямат текст, етикетът им служи за име,
        // а цветът им е същият `currentColor`, с който се рисува SVG-то.
        text: (node.textContent || node.getAttribute('aria-label') || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 26),
        cls: String(node.className || '').slice(0, 70),
        ownBg: cs.backgroundColor,
        hovered: node.matches(':hover'),
        fg: parse(cs.color)?.rgb ?? null,
        bg,
      };
    });

    if (!data.fg || !data.bg || !data.text) continue;
    const l1 = rel(data.fg), l2 = rel(data.bg);
    report.push({ ...data, where, ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) });
  }
}

await sweep('страницата', PAGE_TARGETS);

// --- прозорецът за записване ---
await page.evaluate(() => document.querySelector('[data-book]').click());
await page.waitForSelector('.anima-book__card', { timeout: 5000 });
await new Promise((r) => setTimeout(r, 500));
await sweep('модал', MODAL_TARGETS);
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 400));

// --- галерията ---
await page.evaluate(() => document.querySelector('.anima-gallery__grid button')?.click());
await page.waitForSelector('.anima-lightbox__nav', { timeout: 5000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 500));
await sweep('галерия', LIGHTBOX_TARGETS);

await browser.close();

const bad = report.filter((r) => r.ratio < 3);
const weak = report.filter((r) => r.ratio >= 3 && r.ratio < 4.5);

const counts = report.reduce((a, r) => ({ ...a, [r.where]: (a[r.where] ?? 0) + 1 }), {});
console.log(`проверени ${report.length} бутона при hover`);
Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log('');

if (bad.length) {
  console.log('НЕЧЕТИМИ (< 3:1):');
  bad.forEach((r) =>
    console.log(`  ${r.ratio.toFixed(2)}:1  [${r.where}] "${r.text}" (${r.cls}) hover=${r.hovered} собствен=${r.ownBg} текст=rgb(${r.fg}) фон=rgb(${r.bg})`),
  );
}
if (weak.length) {
  console.log('\nна ръба (3–4.5:1):');
  weak.forEach((r) => console.log(`  ${r.ratio.toFixed(2)}:1  [${r.where}] "${r.text}"  текст rgb(${r.fg}) върху rgb(${r.bg})`));
}
if (!bad.length && !weak.length) console.log('Всички надписи се четат при hover.');
