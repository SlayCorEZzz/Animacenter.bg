/**
 * Рендерира футъра в няколко кандидат-цвята и ги подрежда един под друг,
 * за да се избере на око, а не по интуиция.
 *
 * node tools/footer-variants.mjs
 */
import fs from 'node:fs';
import sharp from 'sharp';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'C:/Users/SLAYCO~1/AppData/Local/Temp/claude';

/* Тъмните варианти отпаднаха: върху тях логото потъваше и трябваше да се
   обръща в бяло. Тук се сравняват светли пясъчни тонове: колко по-плътни от
   кремавото на секциите да е футърът, за да личи, че страницата свършва. */
const VARIANTS = [
  ['A', '#efe8dc', 'едва по-плътно от секциите'],
  ['B', '#e3dac8', 'пясъчно (сегашно)'],
  ['C', '#dccfb8', 'по-наситено пясъчно'],
  ['D', '#d5c6ab', 'най-плътното, преди да стане кафяво'],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

const shots = [];

for (const [id, color] of VARIANTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 900 });
  await page.goto('http://localhost:5002/', { waitUntil: 'networkidle2', timeout: 90000 });
  await page.addStyleTag({ content: `:root { --anima-sand-deep: ${color} !important; }` });
  // Картата е cross-origin iframe и не се композира в снимката, затова я крием,
  // за да не остава сива дупка, която пречи на преценката за цвета.
  await page.addStyleTag({ content: '.anima-footer__map { display: none; }' });
  await page.evaluate(async () => {
    const s = innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += s) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    document.querySelector('.anima-footer').scrollIntoView();
    await new Promise((r) => setTimeout(r, 700));
  });

  const file = `${OUT}/footer-${id}.png`;
  const el = await page.$('.anima-footer');
  await el.screenshot({ path: file });
  const meta = await sharp(file).metadata();
  await sharp(file).extract({ left: 0, top: 0, width: meta.width, height: Math.min(620, meta.height) }).toFile(`${file}.crop.png`);
  fs.renameSync(`${file}.crop.png`, file);
  shots.push({ id, color, file });
  await page.close();
}

await browser.close();

// Слепваме вариантите вертикално с етикет отстрани.
const labels = await Promise.all(
  shots.map(({ id, color }) =>
    sharp({
      create: { width: 900, height: 34, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="900" height="34"><text x="10" y="23" font-family="sans-serif" font-size="17" fill="#222">${id}: ${color}</text></svg>`,
          ),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer(),
  ),
);

const tiles = [];
let top = 0;
for (let i = 0; i < shots.length; i++) {
  tiles.push({ input: labels[i], top, left: 0 });
  top += 34;
  tiles.push({ input: fs.readFileSync(shots[i].file), top, left: 0 });
  top += 620;
}

await sharp({ create: { width: 900, height: top, channels: 3, background: { r: 255, g: 255, b: 255 } } })
  .composite(tiles)
  .png()
  .toFile(`${OUT}/footer-variants.png`);

console.log(`${OUT}/footer-variants.png`);
