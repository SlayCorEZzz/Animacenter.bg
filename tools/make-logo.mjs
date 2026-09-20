/**
 * Подготвя марковите файлове от оригиналното векторно лого
 * (public/brand/anima-logo.svg).
 *
 * В сайта самото лого се ползва като SVG, остава остро на всеки екран.
 * Тук се генерира само иконата за таба/началния екран, изрязана около
 * фигурата от логото, защото пълният надпис е твърде широк за квадрат.
 *
 * node tools/make-logo.mjs
 */
import fs from 'node:fs';
import sharp from 'sharp';

const SRC = 'public/brand/anima-logo.svg';
const OUT = 'public/brand';

const meta = await sharp(SRC).metadata();
console.log(`изходно лого: ${meta.width}x${meta.height}`);

/** Фигурата заема лявата част от заключването, от нея става квадратна икона. */
const MARK_WIDTH = 0.225; // дял от ширината

// Рендерира се голямо, за да е гладко след смаляването.
// SVG-то е с голям собствен размер, затова се рендерира както си е и се смалява.
const big = await sharp(SRC)
  .resize({ width: 3000 })
  .png()
  .toBuffer();
const bigMeta = await sharp(big).metadata();

const markW = Math.round(bigMeta.width * MARK_WIDTH);

// extract и trim се правят на два отделни прохода, защото в една верига sharp ги
// подрежда по свой ред и изрязването пада извън платното.
const cut = await sharp(big)
  .extract({ left: 0, top: 0, width: markW, height: bigMeta.height })
  .png()
  .toBuffer();
const mark = await sharp(cut).trim({ threshold: 1 }).png().toBuffer();
console.log(`фигура: ${markW}x${bigMeta.height} -> ${(await sharp(mark).metadata()).width}x${(await sharp(mark).metadata()).height}`);

for (const size of [512, 192, 32]) {
  await sharp(mark)
    .resize({
      width: Math.round(size * 0.82),
      height: Math.round(size * 0.82),
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: Math.round(size * 0.09),
      bottom: Math.round(size * 0.09),
      left: Math.round(size * 0.09),
      right: Math.round(size * 0.09),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/anima-icon${size === 512 ? '' : `-${size}`}.png`);
}

// PNG резерва за местата, където SVG не е удобен (например og:image).
await sharp(SRC)
  .resize({ width: 1200 })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/anima-logo.png`);

for (const f of fs.readdirSync(OUT)) {
  const m = await sharp(`${OUT}/${f}`).metadata();
  console.log(`${f.padEnd(22)} ${m.width}x${m.height}  ${(fs.statSync(`${OUT}/${f}`).size / 1024).toFixed(0)}KB`);
}
