/**
 * Поправя логото: в оригиналния файл последното „e“ от „massage“ е отрязано
 * наполовина (вижда се като „massagr“). В „therapy“ има същото „e“ в същия
 * шрифт, размер и цвят – копираме го на мястото на отрязаното и оставяме
 * малко въздух вдясно.
 *
 *   node tools/fix-logo.mjs  ->  public/brand/anima-logo-fixed.png (2400 px)
 *                                public/brand/anima-logo@480.png  (за сайта)
 */
import fs from 'node:fs';
import sharp from 'sharp';

const WIDTH = 2400; // ширина на рендера на оригиналния вектор
const PAD = 40; // въздух вдясно след поправката

const svg = fs.readFileSync('public/brand/anima-logo.svg');
const base = await sharp(svg, { density: (WIDTH / 5034.3335) * 72 }).resize({ width: WIDTH }).ensureAlpha().png().toBuffer();
const { data, info } = await sharp(base).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const alpha = (x, y) => data[(y * W + x) * 4 + 3];

// Лентата с надписа „kin • therapy • massage“ е в долната част на логото.
const bandTop = Math.round(H * 0.6);
const bandBottom = Math.round(H * 0.9);

// Колони с мастило в лентата -> отделни букви (сегменти между празни колони).
const ink = [];
for (let x = 0; x < W; x++) {
  let n = 0;
  for (let y = bandTop; y < bandBottom; y++) if (alpha(x, y) > 30) n++;
  ink.push(n);
}
// Надписът започва след фигурата вляво: търсим сегментите в дясната ~70%.
const segments = [];
let start = -1;
for (let x = Math.round(W * 0.28); x < W; x++) {
  if (ink[x] > 0 && start < 0) start = x;
  if ((ink[x] === 0 || x === W - 1) && start >= 0) {
    segments.push([start, ink[x] === 0 ? x - 1 : x]);
    start = -1;
  }
}
// k i n • t h e r a p y • m a s s a g e  -> 19 букви/точки
if (segments.length !== 19) throw new Error(`Очаквах 19 знака в надписа, намерих ${segments.length}: ${JSON.stringify(segments)}`);
const [eL, eR] = segments[6]; // „e“ в „therapy“
const [cutL] = segments[18]; // отрязаното „e“ в „massage“

// вертикалните граници на „e“ в „therapy“
let eTop = H;
let eBottom = 0;
for (let y = bandTop; y < bandBottom; y++) for (let x = eL; x <= eR; x++) if (alpha(x, y) > 10) { eTop = Math.min(eTop, y); eBottom = Math.max(eBottom, y); }
const box = { left: eL - 2, top: eTop - 2, width: eR - eL + 5, height: eBottom - eTop + 5 };
const glyph = await sharp(base).extract(box).png().toBuffer();

// Разширено платно, отрязаното „e“ се изтрива и на мястото му влиза цялото.
const newW = cutL - 2 + box.width + PAD;
// „dest-out“ с плътен правоъгълник изтрива логото само в зоната на отрязаното „e“.
const cleared = await sharp(base)
  .composite([{ input: { create: { width: W - (cutL - 2), height: bandBottom - bandTop, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } }, left: cutL - 2, top: bandTop, blend: 'dest-out' }])
  .png()
  .toBuffer();
const fixed = await sharp({ create: { width: newW, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([
    { input: cleared, left: 0, top: 0 },
    { input: glyph, left: cutL - 2, top: box.top },
  ])
  .png()
  .toBuffer();

await sharp(fixed).png({ compressionLevel: 9 }).toFile('public/brand/anima-logo-fixed.png');
await sharp(fixed).resize({ width: 480 }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile('public/brand/anima-logo@480.png');
console.log(`логото е поправено: ${W}x${H} -> ${newW}x${H}; „e“ ${box.width}px от x=${eL} копирано на x=${cutL}`);
