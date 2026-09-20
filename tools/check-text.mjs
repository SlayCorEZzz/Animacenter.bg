/**
 * Търси дълго тире (U+2014) на две места: в текста, който вижда
 * посетителят, и в самия код.
 *
 * Клиентът разпознава този знак като „писано от машина“ и не го иска
 * никъде. Страницата се проверява сглобена, а не по изходния код:
 * част от текстовете идват от `site.js`, а друга от разметката на
 * темплейта, и лесно се пропуска някой. Обхожда се и прозорецът за
 * записване.
 *
 * Късото тире в диапазони („09:00 – 20:00“, „Пон – Съб“) е нормална
 * типография и не се брои.
 *
 * node tools/check-text.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.SHOT_URL ?? 'http://localhost:5002/';

/** Самият знак, който търсим. Записан е с escape, за да не стои буквално
    в този файл и проверката да не намира себе си. */
const DASH = '\u2014';

// --- 1. изходният код ---
// Там, където знакът трябва да остане в низа (английските ключове в
// translate.mjs), той се записва с escape, затова тук не се среща.
const CODE_DIRS = ['src', 'tools'];
const CODE_EXT = ['.js', '.jsx', '.mjs', '.css', '.html', '.md'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '_generated-original']);

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (CODE_EXT.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
};

const codeFiles = ['index.html', 'README.md', ...CODE_DIRS.flatMap((d) => walk(d))];
const inCode = [];

for (const file of codeFiles) {
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (line.includes(DASH)) inCode.push({ where: `${file}:${i + 1}`, text: line.trim().slice(0, 110) });
    });
}

// --- 2. сглобената страница ---
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });

await page.evaluate(async () => {
  const s = innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += s) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 600));
});

/** Всеки текстов възел, който наистина се показва, плюс заглавието и мета. */
const collect = () =>
  page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.nodeValue.replace(/\s+/g, ' ').trim();
      if (!t || !t.includes('\u2014')) continue;
      const el = n.parentElement;
      if (!el || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) continue;
      if (getComputedStyle(el).display === 'none') continue;
      out.push({ where: el.tagName.toLowerCase(), text: t.slice(0, 120) });
    }
    for (const el of document.querySelectorAll('[aria-label], [title], [alt]')) {
      for (const attr of ['aria-label', 'title', 'alt']) {
        const v = el.getAttribute(attr);
        if (v && v.includes('\u2014')) out.push({ where: `${el.tagName.toLowerCase()}[${attr}]`, text: v });
      }
    }
    return out;
  });

const hits = [...(await collect())];

// заглавието и мета описанията също се четат от хора (и от търсачките)
{
  const head = await page.evaluate(() => {
    const out = [];
    if (document.title.includes('\u2014')) out.push({ where: 'title', text: document.title });
    for (const m of document.querySelectorAll('meta[content]')) {
      if (m.content.includes('\u2014')) out.push({ where: `meta[${m.name || m.getAttribute('property')}]`, text: m.content.slice(0, 120) });
    }
    return out;
  });
  hits.push(...head);
}

// Прозорецът за записване се рендерира чак при отваряне.
await page.evaluate(() => document.querySelector('[data-book]').click());
await page.waitForSelector('.anima-book__card', { timeout: 5000 });
await new Promise((r) => setTimeout(r, 400));
hits.push(...(await collect()).map((h) => ({ ...h, where: `модал / ${h.where}` })));

await browser.close();

if (inCode.length) {
  console.log(`В кода (${codeFiles.length} файла) има ${inCode.length} дълги тирета:`);
  inCode.forEach((h) => console.log(`  ${h.where}  ${h.text}`));
} else {
  console.log(`Кодът е чист (${codeFiles.length} файла).`);
}

if (hits.length) {
  console.log(`
На страницата има ${hits.length} дълги тирета:`);
  hits.forEach((h) => console.log(`  [${h.where}] ${h.text}`));
} else {
  console.log('Страницата е чиста.');
}

if (inCode.length || hits.length) process.exitCode = 1;
