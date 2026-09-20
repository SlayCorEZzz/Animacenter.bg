/**
 * Проверява двата модала на няколко размера екран: отваряне, къде се
 * позиционират (fixed спрямо екрана, а не спрямо секция), заключен скрол,
 * затваряне с Esc, връщане на фокуса и навигация в галерията.
 *
 * node tools/check-modals.mjs
 */
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

/* Картата „Запази час онлайн“ винаги стои в прозореца. Докато
   адресът на платформата липсва, тя е изключен бутон; щом се попълни -
   истинска връзка към него. Проверката чете същата настройка, за да знае
   кое от двете очаква. */
const bookingUrl = /bookingUrl:\s*'([^']*)'/.exec(fs.readFileSync('src/content/site.js', 'utf8'))?.[1] ?? '';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.SHOT_URL ?? 'http://localhost:5002/';
const OUT = 'C:/Users/SLAYCO~1/AppData/Local/Temp/claude';

const SIZES = [
  { name: 'телефон', w: 390, h: 844, mobile: true },
  { name: 'таблет', w: 820, h: 1180, mobile: true },
  { name: 'десктоп', w: 1440, h: 900, mobile: false },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

let problems = 0;
const say = (ok, msg) => {
  if (!ok) problems++;
  console.log(`   ${ok ? 'ok ' : '!! '} ${msg}`);
};

for (const s of SIZES) {
  console.log(`\n=== ${s.name} ${s.w}x${s.h} ===`);
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, isMobile: s.mobile, hasTouch: s.mobile });

  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));
  });

  /* ---------- прозорец за записване ---------- */
  await page.evaluate(() => document.querySelector('[data-book]')?.click());
  await new Promise((r) => setTimeout(r, 500));

  let m = await page.evaluate(() => {
    const el = document.querySelector('.anima-modal');
    if (!el) return null;
    const panel = el.querySelector('.anima-modal__panel');
    const r = panel.getBoundingClientRect();
    return {
      inBody: el.parentElement === document.body,
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      left: Math.round(r.left),
      right: Math.round(r.right),
      vw: innerWidth,
      vh: innerHeight,
      locked: getComputedStyle(document.body).overflow === 'hidden',
      focusInside: panel.contains(document.activeElement),
      hasCall: !!el.querySelector('a[href^="tel:"]'),
      hasOnline: !!el.querySelector('.anima-book__card--primary'),
      onlineHref: el.querySelector('a.anima-book__card--primary')?.getAttribute('href') ?? '',
      onlineWaiting: !!el.querySelector('button.anima-book__card--primary[disabled]'),
    };
  });

  say(!!m, 'модалът се отваря');
  if (m) {
    say(m.inBody, 'рендерира се директно в <body> (портал)');
    say(m.top >= -1 && m.bottom <= m.vh + 1, `стои в екрана по височина (${m.top}..${m.bottom} от ${m.vh})`);
    say(m.left >= -1 && m.right <= m.vw + 1, `стои в екрана по ширина (${m.left}..${m.right} от ${m.vw})`);
    say(m.locked, 'скролът отзад е заключен');
    say(m.focusInside, 'фокусът е вътре в панела');
    say(m.hasCall, 'има опция за обаждане');
    say(m.hasOnline, 'бутонът за онлайн записване е първият избор');
    if (bookingUrl) say(m.onlineHref === bookingUrl, `води към contacts.bookingUrl (${m.onlineHref || 'никъде'})`);
    else say(m.onlineWaiting, 'бутонът е изключен, докато contacts.bookingUrl е празен');
  }

  // Esc затваря и връща фокуса
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 400));
  const closed = await page.evaluate(() => ({
    gone: !document.querySelector('.anima-modal'),
    unlocked: getComputedStyle(document.body).overflow !== 'hidden',
  }));
  say(closed.gone, 'Esc затваря');
  say(closed.unlocked, 'скролът се отключва');

  /* ---------- галерия ---------- */
  await page.evaluate(() => {
    document.querySelector('#galeria')?.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => document.querySelector('.anima-gallery__grid button')?.click());
  await new Promise((r) => setTimeout(r, 600));

  const g = await page.evaluate(() => {
    const el = document.querySelector('.anima-modal.anima-lightbox');
    if (!el) return null;
    const img = el.querySelector('img');
    const r = img.getBoundingClientRect();
    return {
      inBody: el.parentElement === document.body,
      fits: r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1,
      box: `${Math.round(r.width)}x${Math.round(r.height)}`,
      caption: el.querySelector('figcaption')?.textContent?.trim().slice(0, 40),
      locked: getComputedStyle(document.body).overflow === 'hidden',
    };
  });

  say(!!g, 'лайтбоксът се отваря');
  if (g) {
    say(g.inBody, 'лайтбоксът е в <body>');
    say(g.fits, `снимката се побира в екрана (${g.box})`);
    say(g.locked, 'скролът е заключен');
  }

  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 400));
  const next = await page.evaluate(
    () => document.querySelector('.anima-lightbox figcaption')?.textContent?.trim().slice(0, 40),
  );
  say(next && next !== g?.caption, `стрелката сменя снимката (${next})`);

  await page.screenshot({ path: `${OUT}/lightbox-${s.w}.png` });
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 300));

  // пак отваряме модала за записване, за да го снимаме
  await page.evaluate(() => document.querySelector('[data-book]')?.click());
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `${OUT}/booking-${s.w}.png` });

  if (errors.length) {
    say(false, 'грешки в конзолата: ' + [...new Set(errors)].join(' | '));
  }

  await page.close();
}

await browser.close();
console.log(`\n${problems === 0 ? 'Модалите работят навсякъде.' : `${problems} проблема.`}`);
console.log(`снимки: ${fs.readdirSync(OUT).filter((f) => /^(lightbox|booking)-/.test(f)).join(', ')}`);
