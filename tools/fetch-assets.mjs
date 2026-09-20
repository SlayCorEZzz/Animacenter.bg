import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] ?? 'public');
const urls = fs.readFileSync(process.argv[3], 'utf8').split('\n').map(s => s.trim()).filter(Boolean);

const ok = [], skipped = [], failed = [];

for (const url of urls) {
  const u = new URL(url);
  const rel = decodeURIComponent(u.pathname).replace(/^\//, '');
  const dest = path.join(ROOT, rel);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { skipped.push(rel); continue; }
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) { failed.push(`${res.status} ${rel}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    ok.push(`${rel} (${buf.length})`);
  } catch (e) {
    failed.push(`ERR ${rel}: ${e.message}`);
  }
}

console.log(`downloaded: ${ok.length}, already present: ${skipped.length}, failed: ${failed.length}`);
if (failed.length) console.log('FAILED:\n' + failed.join('\n'));
