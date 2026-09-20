/**
 * Прави снимки на сайта на няколко ширини и съобщава грешки в конзолата и
 * счупени заявки. Опционално отваря мобилното меню.
 *
 * node tools/shoot.mjs [ширина] [--menu] [--slice=0]
 */
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.SHOT_URL ?? 'http://localhost:5002/';
const WIDTH = Number(process.argv[2] ?? 1440);
const WANT_MENU = process.argv.includes('--menu');
const OUT = 'C:/Users/SLAYCO~1/AppData/Local/Temp/claude/shots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: WIDTH < 700 ? 844 : 950, isMobile: WIDTH < 700, hasTouch: WIDTH < 700 });

const errors = [];
const failed = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 220)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 220)); });
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });

await page.evaluate(async () => {
  const step = window.innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 160));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 1400));
});

const info = await page.evaluate(() => ({
  height: document.documentElement.scrollHeight,
  docWidth: document.documentElement.scrollWidth,
  viewport: window.innerWidth,
  invisible: document.querySelectorAll('.elementor-invisible:not(.animated)').length,
  overflowing: [...document.body.querySelectorAll('*')]
    .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1.5)
    .slice(0, 8)
    .map((el) => `${el.tagName}.${(el.className || '').toString().split(' ').slice(0, 3).join('.')} right=${Math.round(el.getBoundingClientRect().right)}`),
}));

if (WANT_MENU) {
  await page.click('.anima-burger');
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `${OUT}/menu-${WIDTH}.png` });
  console.log(`меню -> ${OUT}/menu-${WIDTH}.png`);
} else {
  await page.screenshot({ path: `${OUT}/anima-${WIDTH}.png`, fullPage: true });
  console.log(`страница -> ${OUT}/anima-${WIDTH}.png`);
}

console.log(JSON.stringify(info, null, 2));
if (errors.length) console.log('\nГРЕШКИ:\n  ' + [...new Set(errors)].join('\n  '));
if (failed.length) console.log('\nСЧУПЕНИ ЗАЯВКИ:\n  ' + [...new Set(failed)].join('\n  '));

await browser.close();
