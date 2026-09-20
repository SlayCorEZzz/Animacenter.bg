/**
 * Проверява, че фоновите видеа спират, когато излязат от екрана, и че на
 * страницата няма чужд плеър, който да рисува свои бутони върху кадъра.
 *
 * node tools/check-media.mjs
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.SHOT_URL ?? 'http://localhost:5002/';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
await new Promise((r) => setTimeout(r, 2500));

let problems = 0;
const say = (ok, msg) => {
  if (!ok) problems++;
  console.log(`${ok ? ' ok ' : ' !! '} ${msg}`);
};

/** Състоянието на всяко фоново видео: вижда ли се, върви ли, как тегли. */
const state = () =>
  page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight;
    };
    return [...document.querySelectorAll('video.elementor-background-video-hosted')].map((v) => ({
      section: v.closest('[data-id]')?.dataset.id ?? '?',
      paused: v.paused,
      visible: vis(v),
      preload: v.preload,
      hasSrc: Boolean(v.currentSrc || v.src),
    }));
  });

/** Всяко видео минава през екрана и после излиза от него. */
async function visit(i) {
  await page.evaluate((idx) => {
    const v = document.querySelectorAll('video.elementor-background-video-hosted')[idx];
    v.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, i);
  await new Promise((r) => setTimeout(r, 1400));
  return (await state())[i];
}

const all = await state();
console.log(`--- намерени ${all.length} фонови видеа ---`);
say(all.length === 2, `хероят и призивът за записване (${all.length})`);
all.forEach((v, i) => {
  say(v.hasSrc, `видео ${i + 1} (секция ${v.section}) има източник`);
  say(v.preload === 'metadata', `видео ${i + 1}: preload=${v.preload} (не тегли целия файл)`);
});

for (let i = 0; i < all.length; i++) {
  console.log(`\n--- видео ${i + 1} ---`);
  const inView = await visit(i);
  say(inView.visible === true, 'в екрана е');
  say(inView.paused === false, 'и се възпроизвежда');

  await page.evaluate(() => scrollBy(0, innerHeight * 2.2));
  await new Promise((r) => setTimeout(r, 1400));
  const gone = (await state())[i];
  say(gone.visible === false, 'след скрол е извън екрана');
  say(gone.paused === true, 'и е спряно');
}

console.log('\n--- чужди плеъри ---');
const embeds = await page.evaluate(
  () => document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"], .elementor-background-video-embed').length,
);
// YouTube рисува собствените си бутони вътре в iframe-а и те не могат да
// бъдат скрити отвън, затова фоновете са локални <video>.
say(embeds === 0, `няма вграден плеър за фон (${embeds})`);

console.log('\n--- скрит раздел ---');
await page.evaluate(() => scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 1200));
await page.evaluate(() => {
  Object.defineProperty(document, 'hidden', { value: true, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
});
await new Promise((r) => setTimeout(r, 600));
const hidden = await state();
say(hidden.every((v) => v.paused), 'всички видеа спират, щом разделът не е активен');

await browser.close();
console.log(`\n${problems === 0 ? 'Видеата се държат както трябва.' : `${problems} проблема.`}`);
