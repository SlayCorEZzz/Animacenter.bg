/**
 * Темата рисува кръгъл фон зад всяка иконка в бутон чрез класа
 * `vamtam-has-icon-styles` (така изглеждаше старата иконка-детелина).
 * За бутоните за записване това не е нужно, иконката им е собствено SVG.
 * Класът се маха само от техните widget-и, вместо да се бие специфичност.
 *
 * node tools/strip-icon-styles.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/components/sections';
const CLASS = ' vamtam-has-icon-styles';

let stripped = 0;

for (const file of fs.readdirSync(DIR)) {
  const p = path.join(DIR, file);
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  let changed = false;

  lines.forEach((line, i) => {
    if (!line.includes('anima-book-btn__icon')) return;

    // Качваме се до най-близкия ред с className на widget-а.
    for (let k = i; k >= 0 && i - k < 14; k--) {
      if (!lines[k].includes('elementor-widget-button')) continue;
      if (!lines[k].includes(CLASS.trim())) break;
      lines[k] = lines[k].replace(CLASS, '');
      stripped++;
      changed = true;
      break;
    }
  });

  if (changed) {
    fs.writeFileSync(p, lines.join('\n'), 'utf8');
    console.log(`обновен: ${file}`);
  }
}

console.log(`\nмахнат класът от ${stripped} бутона`);
