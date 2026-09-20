/**
 * Бутоните „Запази час“ в секциите идват от темплейта и останаха дребни и
 * бели, след като декоративната иконка беше махната. Тук всеки от тях получава
 * клас `anima-book-btn` и иконка телефон, за да изглежда като призива за
 * действие в останалата част от сайта.
 *
 * node tools/brand-book-buttons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/components/sections';

const ICON =
  '<span className="elementor-button-icon anima-book-btn__icon" aria-hidden="true">' +
  '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" ' +
  'strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">' +
  '<path d="M6.6 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.2 5.2l1.4-2 3.8 1.5v3a1.6 1.6 0 0 1-1.7 1.6A15.5 15.5 0 0 1 5 5.2 1.6 1.6 0 0 1 6.6 3.5Z" />' +
  '</svg></span>';

let patched = 0;

for (const file of fs.readdirSync(DIR)) {
  const p = path.join(DIR, file);
  let src = fs.readFileSync(p, 'utf8');
  const before = src;

  // Целта е <a class="elementor-button …"> , чийто единствен надпис е „Запази час“.
  src = src.replace(
    /(<a\s+className=")(elementor-button[^"]*)(")([^>]*>)(\s*<span className="elementor-button-content-wrapper">\s*)(<span className="elementor-button-text">Запази час<\/span>)/g,
    (_, a, cls, q, rest, wrap, text) => {
      patched++;
      return `${a}${cls} anima-book-btn${q}${rest}${wrap}${ICON}\n                  ${text}`;
    },
  );

  if (src !== before) {
    fs.writeFileSync(p, src, 'utf8');
    console.log(`обновен: ${file}`);
  }
}

console.log(`\nоформени ${patched} бутона „Запази час“`);
