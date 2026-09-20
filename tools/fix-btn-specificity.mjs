/**
 * Темата оцветява всеки <button> през `.elementor-kit-5 button` със
 * специфичност (0,1,1). Нашите `.anima-btn` правила са (0,1,0) и губят,
 * затова, откакто част от бутоните станаха <button> вместо <a>, оставаха с
 * бледия фон на темата. Тук селекторите се удвояват до (0,2,0).
 *
 * node tools/fix-btn-specificity.mjs
 */
import fs from 'node:fs';

const FILE = 'src/styles/anima.css';

const PAIRS = [
  ['\n.anima-btn {\n', '\n.anima-btn.anima-btn {\n'],
  ['\n.anima-btn:hover,\n.anima-btn:focus-visible {\n', '\n.anima-btn.anima-btn:hover,\n.anima-btn.anima-btn:focus-visible {\n'],
  ['\n.anima-btn--accent { --btn-bg: var(--anima-orange-cta); }\n.anima-btn--accent:hover,\n.anima-btn--accent:focus-visible {',
   '\n.anima-btn.anima-btn--accent { --btn-bg: var(--anima-orange-cta); }\n.anima-btn.anima-btn--accent:hover,\n.anima-btn.anima-btn--accent:focus-visible {'],
  ['\n.anima-btn--ghost {\n', '\n.anima-btn.anima-btn--ghost {\n'],
  ['\n.anima-btn--ghost:hover,\n.anima-btn--ghost:focus-visible {\n', '\n.anima-btn.anima-btn--ghost:hover,\n.anima-btn.anima-btn--ghost:focus-visible {\n'],
  ['\n.anima-btn--block { width: 100%; }\n', '\n.anima-btn.anima-btn--block { width: 100%; }\n'],
  ['\n.anima-callbar__btn {\n', '\n.anima-callbar .anima-callbar__btn {\n'],
  ['\n.anima-callbar__map {\n', '\n.anima-callbar .anima-callbar__map {\n'],
];

let css = fs.readFileSync(FILE, 'utf8');
for (const [from, to] of PAIRS) {
  if (!css.includes(from)) throw new Error(`не намирам:\n${from}`);
  css = css.replace(from, to);
}
fs.writeFileSync(FILE, css, 'utf8');
console.log(`вдигната специфичност на ${PAIRS.length} правила`);
