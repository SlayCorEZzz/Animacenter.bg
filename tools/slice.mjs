import sharp from 'sharp';
const [file, out, top, height, width] = process.argv.slice(2);
const m = await sharp(file).metadata();
const t = Number(top), h = Math.min(Number(height), m.height - Number(top));
await sharp(file).extract({ left: 0, top: t, width: m.width, height: h })
  .resize({ width: Number(width || m.width) }).png().toFile(out);
console.log(`${out}  (${m.width}x${m.height} -> top ${t}, h ${h})`);
