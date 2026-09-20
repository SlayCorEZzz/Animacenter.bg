/** Lists every user-visible string in the generated components. */
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'src/components/SiteHeader.jsx',
  'src/components/SiteFooter.jsx',
  ...fs.readdirSync('src/components/sections').map((f) => path.join('src/components/sections', f)),
];

const STR = /\{"((?:[^"\\]|\\.)*)"\}/g;
const TXT = />([^<>{}\n]{2,})</g;

for (const p of files) {
  const src = fs.readFileSync(p, 'utf8');
  const texts = [];
  const push = (t) => {
    t = t.trim();
    if (t.length > 1 && !/^[\s.,;:|·\u2014–_-]*$/.test(t) && !texts.includes(t)) texts.push(t);
  };
  for (const m of src.matchAll(TXT)) push(m[1]);
  for (const m of src.matchAll(STR)) {
    try { push(JSON.parse('"' + m[1] + '"')); } catch { /* not a plain string */ }
  }
  if (!texts.length) continue;
  console.log(`\n##### ${path.basename(p)} (${texts.length})`);
  console.log(texts.join('\n'));
}
