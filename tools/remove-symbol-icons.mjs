/**
 * Маха декоративната иконка-детелина на темата (`vamtam-theme-symbol`).
 * Тя се среща в две роли:
 *   1. самостоятелен icon widget между заглавията и върху снимките;
 *   2. иконка вътре в бутон ("Запази час").
 * И в двата случая се изтрива обвивката, а не само <i>, за да не остане
 * празна кутия с отстъпи.
 *
 * node tools/remove-symbol-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/components/sections';
const MARK = 'vamtam-theme-symbol';
const KEPT = '__ANIMA_SYMBOL_KEPT__'; // сентинел без MARK в себе си, за да не зацикля

/** Обвивките, които махаме, подредени от най-близката навън. */
const WRAPPERS = ['elementor-button-icon', 'elementor-widget-icon'];

/**
 * Намира [начало, край] на най-близкия родител, чийто отварящ таг съдържа
 * някой от WRAPPERS. Работи по отстъпи, генерираният JSX е подравнен.
 */
function wrapperRange(lines, at) {
  for (let i = at; i >= 0; i--) {
    const open = /^(\s*)<(div|span)(\s|$)/.exec(lines[i]);
    if (!open) continue;

    // Атрибутите може да са на няколко реда, затова събираме целия отварящ таг.
    let head = lines[i];
    let j = i;
    while (!/>\s*$/.test(head) && j < at) head += ' ' + lines[++j];

    if (!WRAPPERS.some((w) => head.includes(w))) continue;
    if (/\/>\s*$/.test(head)) return null; // самозатварящ се, няма какво да махаме

    const close = `${open[1]}</${open[2]}>`;
    for (let k = j + 1; k < lines.length; k++) {
      if (lines[k] === close) return [i, k];
    }
    return null;
  }
  return null;
}

let removed = 0;
let skipped = 0;

for (const file of fs.readdirSync(DIR)) {
  const p = path.join(DIR, file);
  let text = fs.readFileSync(p, 'utf8');
  if (!text.includes(MARK)) continue;

  let lines = text.split('\n');

  for (;;) {
    const at = lines.findIndex((l) => l.includes(MARK));
    if (at === -1) break;

    const range = wrapperRange(lines, at);
    if (!range) {
      console.warn(`  ! ${file}: оставям иконката на ред ${at + 1}, няма позната обвивка`);
      lines[at] = lines[at].replace(MARK, KEPT);
      skipped++;
      continue;
    }

    lines.splice(range[0], range[1] - range[0] + 1);
    removed++;
  }

  lines = lines.map((l) => l.replaceAll(KEPT, MARK));
  fs.writeFileSync(p, lines.join('\n'), 'utf8');
  console.log(`почистен: ${file}`);
}

console.log(`\nмахнати ${removed} иконки${skipped ? `, оставени ${skipped}` : ''}`);
