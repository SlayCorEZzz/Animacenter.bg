/**
 * Elementor loads part of its frontend as lazy webpack chunks, which HTTrack
 * never saw because they are requested at runtime. This drives the built page
 * in a real browser, collects every 404, pulls the file from the origin, and
 * repeats until nothing is missing.
 *
 * Run: node tools/harvest-missing.mjs   (with the dist server on :5002)
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const REACT = 'http://localhost:5002/';
const ORIGIN = 'https://flexora.vamtam.com';
const PUBLIC = path.resolve('public');
const DIST = path.resolve('dist');

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});

async function collectMissing() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  const missing = new Set();

  page.on('response', (r) => {
    if (r.status() !== 404) return;
    const u = new URL(r.url());
    if (u.origin !== new URL(REACT).origin) return;
    missing.add(u.pathname);
  });

  await page.goto(REACT, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 1000));
  });
  await page.close();
  return [...missing];
}

for (let round = 1; round <= 6; round++) {
  const missing = await collectMissing();
  if (!missing.length) {
    console.log(`round ${round}: nothing missing`);
    break;
  }
  console.log(`round ${round}: ${missing.length} missing`);

  let fetched = 0;
  for (const p of missing) {
    const res = await fetch(ORIGIN + p, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.log(`  ! ${res.status} ${p}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    for (const base of [PUBLIC, DIST]) {
      const dest = path.join(base, p.replace(/^\//, ''));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
    }
    console.log(`  + ${p} (${buf.length})`);
    fetched++;
  }
  if (!fetched) break;
}

await browser.close();
