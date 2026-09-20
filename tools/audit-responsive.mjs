/**
 * Минава сайта през типичните ширини на устройства и съобщава:
 * хоризонтално изнасяне, елементи по-широки от екрана, твърде малки цели за
 * пръст, твърде дребен шрифт, счупени заявки и грешки в конзолата.
 *
 * node tools/audit-responsive.mjs
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.SHOT_URL ?? 'http://localhost:5002/';

const DEVICES = [
  { name: 'iPhone SE', w: 320, h: 568, mobile: true },
  { name: 'Galaxy S8', w: 360, h: 740, mobile: true },
  { name: 'iPhone 12/13', w: 390, h: 844, mobile: true },
  { name: 'iPhone 14 Pro Max', w: 430, h: 932, mobile: true },
  { name: 'телефон легнало', w: 740, h: 360, mobile: true },
  { name: 'iPad mini', w: 768, h: 1024, mobile: true },
  { name: 'iPad Pro', w: 1024, h: 1366, mobile: true },
  { name: 'лаптоп', w: 1280, h: 800, mobile: false },
  { name: 'десктоп', w: 1440, h: 900, mobile: false },
  { name: 'широк', w: 1920, h: 1080, mobile: false },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
});

let problems = 0;

for (const d of DEVICES) {
  const page = await browser.newPage();
  await page.setViewport({ width: d.w, height: d.h, isMobile: d.mobile, hasTouch: d.mobile });

  const errors = [];
  const failed = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${new URL(r.url()).pathname}`); });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    // Изчакваме снимките, иначе се мери оформление, което още не е готово.
    // Lazy снимките извън екрана може да не се заредят изобщо, оттам лимитът.
    await Promise.all(
      [...document.images]
        .filter((i) => !i.complete)
        .map(
          (i) =>
            new Promise((r) => {
              const done = () => r();
              i.addEventListener('load', done, { once: true });
              i.addEventListener('error', done, { once: true });
              setTimeout(done, 2500);
            }),
        ),
    );
    await new Promise((r) => setTimeout(r, 1200));
  });

  const report = await page.evaluate(() => {
    const vw = window.innerWidth;
    const out = { scroll: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [] };

    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;

      // елемент, който стърчи навън, без да е в собствен скролер
      if (r.right > vw + 2 || r.left < -2) {
        let clipped = false;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const ps = getComputedStyle(p);
          if (/hidden|clip|auto|scroll/.test(ps.overflowX)) { clipped = true; break; }
        }
        if (!clipped) out.wide.push(`${el.tagName}.${String(el.className).split(' ')[0]} ${Math.round(r.left)}..${Math.round(r.right)}`);
      }

      // Цели за пръст и минимален шрифт се мерят само на тъч устройства:
      // с мишка по-малките цели и етикети са напълно използваеми.
      const touch = matchMedia('(pointer: coarse)').matches;

      if (touch && el.matches('a[href], button, [role="button"], input, select, textarea')) {
        if (el.offsetParent !== null && (r.height < 40 || r.width < 40)) {
          const t = (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 28);
          if (t) out.small.push(`${t} (${Math.round(r.width)}x${Math.round(r.height)})`);
        }
      }

      if (touch && el.children.length === 0 && (el.textContent || '').trim().length > 18) {
        const size = parseFloat(cs.fontSize);
        if (size < 12) out.tiny.push(`${size}px "${el.textContent.trim().slice(0, 28)}"`);
      }
    }

    const dedupe = (a) => [...new Set(a)].slice(0, 6);
    return { ...out, wide: dedupe(out.wide), small: dedupe(out.small), tiny: dedupe(out.tiny) };
  });

  const overflow = report.scroll > report.vw + 1;
  const bad = overflow || report.wide.length || report.small.length || report.tiny.length || errors.length || failed.length;
  if (bad) problems++;

  console.log(`\n${bad ? '!!' : 'ok'}  ${d.name.padEnd(20)} ${d.w}x${d.h}`);
  if (overflow) console.log(`    хоризонтален скрол: ${report.scroll} > ${report.vw}`);
  if (report.wide.length) console.log('    стърчи навън: ' + report.wide.join(' | '));
  if (report.small.length) console.log('    малки цели: ' + report.small.join(' | '));
  if (report.tiny.length) console.log('    дребен шрифт: ' + report.tiny.join(' | '));
  if (errors.length) console.log('    грешки: ' + [...new Set(errors)].join(' | '));
  if (failed.length) console.log('    404: ' + [...new Set(failed)].join(' | '));

  await page.close();
}

console.log(`\n${problems === 0 ? 'Всички размери са чисти.' : `${problems} размера с бележки.`}`);
await browser.close();
