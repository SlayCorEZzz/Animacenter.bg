/**
 * Turns the raw phone photos in public/images into optimised, sensibly named
 * web assets under public/media (WebP + JPEG fallback, several widths).
 *
 * Run: node tools/make-photos.mjs [име ...]
 * Без аргументи минава през всички снимки; с аргументи - само посочените,
 * например `node tools/make-photos.mjs office-massage`.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { slugify } from '../src/lib/slug.js';

const SRC = 'public/images';
const OUT = 'public/media';
fs.mkdirSync(OUT, { recursive: true });

const f = (id) => path.join(SRC, `viber_image_2026-09-19_14-33-${id}.jpg`);

/**
 * name      -> output basename
 * src       -> source file
 * crop      -> optional { left, top, width, height } in source pixels
 * ratio     -> output aspect (w/h); the crop is centred on `focus`
 * widths    -> rendered widths
 * focus     -> 0..1 vertical anchor used when the ratio crop happens
 */
const JOBS = [
  // --- interiors ---
  { name: 'reception', src: f('37-121'), ratio: 4 / 3, widths: [1200, 600] },
  { name: 'cabins', src: f('37-000'), ratio: 4 / 3, widths: [1200, 600] },
  { name: 'corridor', src: f('37-034'), ratio: 3 / 4, widths: [900, 600] },
  { name: 'cabin-room', src: f('37-059'), ratio: 3 / 4, widths: [900, 600] },
  { name: 'stairs', src: f('37-019'), ratio: 3 / 4, widths: [900, 600] },
  { name: 'stairs-green', src: f('37-098'), ratio: 3 / 4, widths: [900, 600] },
  { name: 'entrance', src: f('37-074'), ratio: 3 / 4, widths: [900, 600] },
  { name: 'lounge', src: f('37-142'), ratio: 3 / 4, widths: [900, 600] },
  { name: 'wood-wall', src: f('37-181'), ratio: 4 / 3, widths: [1200, 600] },

  // --- people ---
  // Оригиналният портрет на д-р Цолова (public/images/therapist-original.jpg).
  // Пълният размер на оригинала (1170) за компютър/ретина, 800 и 560 за по-малки екрани.
  { name: 'therapist', src: path.join(SRC, 'therapist-original.jpg'), ratio: 3 / 4, widths: [1170, 800, 560], focus: 0.42 },

  // --- offers ---
  // Оригиналът за офис масажа (public/images/office-massage-original.png) е широк
  // кадър; изрязваме лявата му трета, за да останат двете фигури и растението,
  // а не празната стена отдясно.
  { name: 'office-massage', src: path.join(SRC, 'office-massage-original.png'), crop: { left: 0, top: 0, width: 1235, height: 926 }, ratio: 4 / 3, widths: [1000, 700] },
  { name: 'massage-closeup', src: f('37-324'), crop: { left: 110, top: 712, width: 1000, height: 562 }, ratio: 16 / 9, widths: [1400, 700] },

  // --- новите снимки на центъра (2026-10), оригиналите са в source-photos/ ---
  // Пазят естественото си съотношение; галерията ги реже с CSS.
  ...[
    ['vhod', 4 / 3],
    ['vhod-2', 3 / 4],
    ['recepcia', 4 / 3],
    ['kafe', 4 / 3],
    ['kabinet-1', 4 / 3],
    ['kabinet-2', 3 / 4],
    ['kabinet-3', 3 / 4],
    ['kabinet-kozmetika', 3 / 4],
    ['funkcionalen-kabinet', 3 / 4],
    ['manikyur', 3 / 4],
    ['zona-sabitia', 4 / 3],
    ['koridor', 3 / 4],
    ['stalbishte-predi', 3 / 4],
    ['stalbishte-sled', 3 / 4],
  ].map(([name, ratio]) => ({
    name,
    src: path.join('source-photos', `${name}.jpg`),
    ratio,
    widths: ratio > 1 ? [1200, 600] : [900, 600],
  })),

  // --- снимка за всеки масаж (картите и страниците): /media/m-<slug> ---
  // Четирите масажа от картите на началната страница ползват СЪЩАТА снимка
  // като картата, за да не се отваря друга снимка при клик.
  ...[
    ['Класически масаж', 'wp:GettyImages-2222455931.jpg', 0.42], // като картата
    ['Дълбокотъканен масаж', 'wp:GettyImages-200112735-001.jpg', 0.42],
    ['Лечебен масаж', 'wp:GettyImages-2210243626.jpg', 0.5], // като картата
    ['Антицелулитен масаж', 'wp:GettyImages-554598667.jpg', 0.5],
    ['Релаксиращ масаж', 'wp:GettyImages-2222455863.jpg', 0.5], // като картата
    ['Силов масаж', 'wp:GettyImages-1357320863-1.jpg', 0.42],
    ['Миофасциален масаж', 'wp:pexels-arina-krasnikova-6663372.jpg', 0.38], // като картата
    ['Масаж с етерични масла', 'wp:Flexora-2-cover.jpg', 0.5],
    ['Масаж с масажна свещ', 'source-photos/kabinet-3.jpg', 0.55],
    ['Частичен масаж', 'public/wp-content/uploads/2025/10/pexels.com_video_woman-doing-a-back-massage-6628400-cover14.jpg', 0.5],
    ['Сегментарен масаж', 'public/media/massage-closeup.jpg', 0.5],
    ['Масаж на лице и скалп', 'wp:GettyImages-489204244.jpg', 0.4],
    ['Рефлексотерапия', 'source-photos/kabinet-2.jpg', 0.62],
    ['Възстановителен масаж', 'wp:GettyImages-1322320699-1.jpg', 0.9],
    ['Масаж за бременни', 'wp:GettyImages-1315518121-1.jpg', 0.5],
    ['Лимфен дренаж', 'source-photos/kabinet-1.jpg', 0.55],
    ['Детски масаж', 'source-photos/funkcionalen-kabinet.jpg', 0.6],
  ].map(([massage, file, focus]) => ({
    name: `m-${slugify(massage)}`,
    src: file.startsWith('wp:') ? path.join('public/wp-content/uploads/2025/09', file.slice(3)) : file,
    ratio: 4 / 3,
    widths: [900, 600],
    focus,
  })),
];

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const jobs = only.length ? JOBS.filter((j) => only.includes(j.name)) : JOBS;
if (only.length && jobs.length !== only.length) {
  const missing = only.filter((n) => !JOBS.some((j) => j.name === n));
  throw new Error(`Непозната снимка: ${missing.join(', ')}`);
}

for (const job of jobs) {
  // Materialise the optional crop first - metadata() reports the *input* size,
  // so the aspect-ratio maths below has to run against the cropped image.
  let stage = sharp(job.src).rotate();
  if (job.crop) stage = sharp(await stage.extract(job.crop).toBuffer());

  const meta = await stage.metadata();
  const srcW = meta.width;
  const srcH = meta.height;
  const img = stage;

  // Centre-crop to the requested aspect ratio.
  let cw = srcW;
  let ch = Math.round(srcW / job.ratio);
  if (ch > srcH) {
    ch = srcH;
    cw = Math.round(srcH * job.ratio);
  }
  const focus = job.focus ?? 0.5;
  const left = Math.round((srcW - cw) / 2);
  const top = Math.max(0, Math.min(srcH - ch, Math.round(srcH * focus - ch / 2)));

  const buf = await img.extract({ left, top, width: cw, height: ch }).toBuffer();

  for (const w of job.widths) {
    const suffix = w === job.widths[0] ? '' : `@${w}`;
    const base = sharp(buf).resize({ width: w, kernel: 'lanczos3' });
    await base.clone().webp({ quality: 80 }).toFile(path.join(OUT, `${job.name}${suffix}.webp`));
    await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, `${job.name}${suffix}.jpg`));
  }

  // Tiny blurred placeholder, inlined as a background while the photo loads.
  const lqip = await sharp(buf).resize({ width: 24 }).blur(1).jpeg({ quality: 40 }).toBuffer();
  fs.writeFileSync(path.join(OUT, `${job.name}.lqip.txt`), `data:image/jpeg;base64,${lqip.toString('base64')}`);

  console.log(`${job.name.padEnd(18)} ${cw}x${ch} -> ${job.widths.join(', ')}`);
}

const total = fs.readdirSync(OUT)
  .filter((n) => /\.(webp|jpg)$/.test(n))
  .reduce((s, n) => s + fs.statSync(path.join(OUT, n)).size, 0);
console.log(`\n${fs.readdirSync(OUT).length} files, ${(total / 1024 / 1024).toFixed(1)}MB`);
