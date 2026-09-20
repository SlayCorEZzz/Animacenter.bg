/**
 * Strict check: compares the rendered content DOM (ignoring <script>/<link>
 * plumbing and the #root wrapper) and pixel-diffs full-page screenshots.
 *
 * Run: node tools/verify.mjs [width]
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ORIGINAL = 'http://localhost:5001/massage-therapist/index.html';
const REACT = process.env.CMP_B ?? 'http://localhost:5002/';
const WIDTH = Number(process.argv[2] ?? 1440);
const OUT = 'C:/Users/SLAYCO~1/AppData/Local/Temp/claude/shots';

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'],
});

/** Serialised content tree: tag + class + trimmed own text, scripts excluded. */
const SNAPSHOT = () => {
  const skip = new Set(['SCRIPT', 'LINK', 'NOSCRIPT']);
  const lines = [];
  const walk = (node, depth) => {
    for (const child of node.children) {
      if (skip.has(child.tagName)) continue;
      if (child.id === 'root') { walk(child, depth); continue; }
      // hidden Cloudflare beacon, dropped during the conversion
      if (child.tagName === 'A' && (child.getAttribute('href') || '').includes('/cdn-cgi/content')) continue;
      const own = [...child.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      const cls = (typeof child.className === 'string' ? child.className : '')
        // classes Elementor/Swiper add at runtime, order varies with timing
        .split(/\s+/)
        .filter((c) => c && !/^(animated|swiper-|e-lazyloaded|sm-|elementor-invisible)/.test(c))
        .sort()
        .join(' ');
      lines.push(`${'  '.repeat(depth)}${child.tagName}.${cls}${own ? ' :: ' + own : ''}`);
      walk(child, depth + 1);
    }
  };
  walk(document.body, 0);
  return lines;
};

async function snap(label, url) {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: 1000 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 2500));

    // Background video frames are not reproducible - park them on frame 0.
    document.querySelectorAll('video').forEach((v) => {
      v.pause();
      try { v.currentTime = 0; } catch { /* not seekable yet */ }
    });
    // Same for the continuously scrolling marquee carousels.
    document.querySelectorAll('.swiper').forEach((el) => {
      const s = el.swiper;
      if (!s) return;
      s.autoplay?.stop();
      s.setTranslate?.(0);
      s.slideTo?.(0, 0, false);
    });
    await new Promise((r) => setTimeout(r, 800));
  });

  const tree = await page.evaluate(SNAPSHOT);
  const file = `${OUT}/${label}-${WIDTH}.png`;
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
  return { tree, file };
}

const a = await snap('original', ORIGINAL);
const b = await snap('react', REACT);
await browser.close();

console.log(`=== content DOM @ ${WIDTH}px ===`);
console.log(`original: ${a.tree.length} elements, react: ${b.tree.length} elements`);

const max = Math.max(a.tree.length, b.tree.length);
let diffs = 0;
for (let i = 0; i < max; i++) {
  if (a.tree[i] !== b.tree[i]) {
    if (diffs < 20) {
      console.log(`  line ${i}:`);
      console.log(`    original: ${a.tree[i] ?? '<missing>'}`);
      console.log(`    react   : ${b.tree[i] ?? '<missing>'}`);
    }
    diffs++;
  }
}
console.log(diffs === 0 ? '  IDENTICAL' : `  ${diffs} differing lines`);

/* ---- pixel diff (raw PNG decode, no extra dependencies) ---- */
function decodePng(file) {
  const buf = fs.readFileSync(file);
  let pos = 8, width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error(`unsupported PNG (depth ${bitDepth}, color ${colorType})`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    const row = raw.subarray(rp, rp + stride); rp += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prior = y ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const A = x >= channels ? cur[x - channels] : 0;
      const B = prior[x];
      const C = x >= channels ? prior[x - channels] : 0;
      let v = row[x];
      if (filter === 1) v += A;
      else if (filter === 2) v += B;
      else if (filter === 3) v += (A + B) >> 1;
      else if (filter === 4) {
        const p = A + B - C, pa = Math.abs(p - A), pb = Math.abs(p - B), pc = Math.abs(p - C);
        v += pa <= pb && pa <= pc ? A : pb <= pc ? B : C;
      }
      cur[x] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

const pa = decodePng(a.file);
const pb = decodePng(b.file);
console.log(`\n=== pixels @ ${WIDTH}px ===`);
console.log(`original: ${pa.width}x${pa.height}   react: ${pb.width}x${pb.height}`);

if (pa.width === pb.width && pa.height === pb.height) {
  let differing = 0;
  const rows = new Map();
  for (let y = 0; y < pa.height; y++) {
    let rowDiff = 0;
    for (let x = 0; x < pa.width; x++) {
      const ia = (y * pa.width + x) * pa.channels;
      const ib = (y * pb.width + x) * pb.channels;
      const d =
        Math.abs(pa.data[ia] - pb.data[ib]) +
        Math.abs(pa.data[ia + 1] - pb.data[ib + 1]) +
        Math.abs(pa.data[ia + 2] - pb.data[ib + 2]);
      if (d > 24) { differing++; rowDiff++; }
    }
    if (rowDiff > pa.width * 0.005) rows.set(y, rowDiff);
  }
  const total = pa.width * pa.height;
  console.log(`differing pixels: ${differing} / ${total} (${((differing / total) * 100).toFixed(3)}%)`);
  if (rows.size) {
    const ys = [...rows.keys()];
    const bands = [];
    let start = ys[0], prev = ys[0];
    for (const y of ys.slice(1)) {
      if (y - prev > 12) { bands.push([start, prev]); start = y; }
      prev = y;
    }
    bands.push([start, prev]);
    console.log('bands with >2% differing pixels (y ranges):');
    bands.forEach(([s, e]) => console.log(`  ${s}-${e}`));
  }
}
