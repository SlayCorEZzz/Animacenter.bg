/**
 * Изважда доминиращите цветове от логото, за да се построи палитрата на сайта
 * от самата марка, а не на око. Групира по оттенък и връща средния цвят на
 * всяка група заедно с тегло.
 *
 * node tools/sample-logo.mjs
 */
import sharp from 'sharp';

const { data, info } = await sharp('public/brand/anima-logo.png')
  .raw()
  .toBuffer({ resolveWithObject: true });

const toHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
};

const hex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** Групи по оттенък: зелено/маслинено, оранжево/охра, останало. */
const buckets = new Map();

for (let p = 0; p < info.width * info.height; p++) {
  const i = p * info.channels;
  if (data[i + 3] < 220) continue;
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const [h, s, l] = toHsl(r, g, b);
  if (s < 0.1 || l > 0.93 || l < 0.05) continue;

  // 15-градусови кошници по оттенък и три нива по светлота
  const key = `${Math.floor(h / 15) * 15}|${Math.min(2, Math.floor(l * 3))}`;
  const acc = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, h, l };
  acc.r += r; acc.g += g; acc.b += b; acc.n++;
  buckets.set(key, acc);
}

const rows = [...buckets.entries()]
  .map(([key, a]) => {
    const [hue, lvl] = key.split('|');
    return {
      hue: Number(hue),
      lvl: Number(lvl),
      n: a.n,
      hex: hex(a.r / a.n, a.g / a.n, a.b / a.n),
    };
  })
  .filter((x) => x.n > 200)
  .sort((a, b) => b.n - a.n);

console.log('оттенък  светлота  пиксели  цвят');
for (const r of rows) {
  const name = r.hue >= 20 && r.hue < 50 ? 'оранжево/охра' : r.hue >= 50 && r.hue < 100 ? 'маслинено/зелено' : `${r.hue}°`;
  console.log(`${String(r.hue).padStart(3)}°   ${['тъмно', 'средно', 'светло'][r.lvl].padEnd(7)} ${String(r.n).padStart(6)}   ${r.hex}   ${name}`);
}
