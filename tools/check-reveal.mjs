/**
 * Проверява, че секциите на темплейта се показват дори когато рънтаймът на
 * темата не се зареди.
 *
 * Маркупът на Elementor слага `elementor-invisible` на всеки анимиран елемент
 * и разчита на своя рънтайм да я махне. Появата е поета от
 * src/legacy/revealAnimations.js, а този тест блокира по един ключов скрипт и
 * гледа дали текстът все пак излиза.
 *
 * Run: node tools/check-reveal.mjs   (по избор SHOT_URL=...)
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.SHOT_URL ?? 'http://localhost:5002/';

const CASES = [
  { name: 'пълен рънтайм', block: null },
  { name: 'jQuery пада', block: /jquery\.min/ },
  { name: 'elementor frontend пада', block: /elementor\/assets\/js\/frontend/ },
  { name: 'webpack runtime пада', block: /webpack\.runtime/ },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
});

let failed = 0;

for (const c of CASES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  if (c.block) {
    await page.setRequestInterception(true);
    page.on('request', (r) => (c.block.test(r.url()) ? r.abort() : r.continue()));
  }

  await page.goto(URL, { waitUntil: 'load', timeout: 90000 }).catch(() => {});

  // бавно надолу, както би минал посетител
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 900));
  });

  const info = await page.evaluate(() => ({
    hidden: [...document.querySelectorAll('.elementor-invisible')].map((e) => e.dataset.id),
    animated: document.querySelectorAll('.animated').length,
  }));

  const ok = info.hidden.length === 0;
  if (!ok) failed++;
  console.log(
    `${ok ? '✓' : '✗'} ${c.name.padEnd(24)} показани=${info.animated}` +
      (ok ? '' : `  ОСТАВАТ СКРИТИ: ${info.hidden.join(', ')}`),
  );
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
