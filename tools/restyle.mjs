/**
 * Подменя блоковете в anima.css и sections.css, които се пренаписват заедно
 * с новите компоненти: логото (вече едно SVG), долната лента, лайтбокса и
 * ценоразписа. Замяната е по точен текст, за да няма мълчаливо разминаване.
 *
 * node tools/restyle.mjs
 */
import fs from 'node:fs';

const cut = (file, from, to) => {
  const src = fs.readFileSync(file, 'utf8');
  const a = src.indexOf(from);
  if (a < 0) throw new Error(`${file}: не намирам начало\n${from.slice(0, 60)}`);
  const b = src.indexOf(to, a + from.length);
  if (b < 0) throw new Error(`${file}: не намирам край\n${to.slice(0, 60)}`);
  return { src, a, b: b + to.length };
};

const replace = (file, from, to, text) => {
  const { src, a, b } = cut(file, from, to);
  fs.writeFileSync(file, src.slice(0, a) + text + src.slice(b), 'utf8');
  console.log(`${file}: заменени ${b - a} знака`);
};

/* ---------------- лого в лентата ---------------- */
replace(
  'src/styles/anima.css',
  '.anima-header__logo {',
  '.anima-header.is-solid .anima-header__logo-img--dark { opacity: 1; }',
  `.anima-header__logo {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  line-height: 0;
}
/* Логото е оригиналното SVG, едно <img>, а светлият вариант върху хероя се
   получава с филтър. По-рано тук стояха две снимки една върху друга и при
   превключването се получаваше трепване. */
.anima-header__logo img {
  display: block;
  width: auto;
  height: var(--anima-logo-h, 54px);
  filter: brightness(0) invert(1);
  transition: filter 0.3s var(--anima-ease);
}
.anima-header.is-solid .anima-header__logo img { filter: none; }`,
);

/* ---------------- долна лента ---------------- */
replace(
  'src/styles/anima.css',
  '.anima-callbar {',
  '  .anima-callbar { display: flex; }\n  /* лентата да не покрива края на футъра */\n  body { padding-bottom: 72px; }\n}',
  `/* Дискретен бутон за записване: плаващ, не лента през целия екран.
   Появява се чак след хероя и се скрива, докато се чете надолу. */
.anima-callbar {
  display: none;
  position: fixed;
  z-index: 900;
  right: 14px;
  bottom: calc(14px + env(safe-area-inset-bottom));
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(247, 243, 234, 0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 28px rgba(35, 38, 28, 0.22);
  opacity: 0;
  transform: translateY(18px) scale(0.96);
  transition: opacity 0.28s var(--anima-ease), transform 0.28s var(--anima-ease);
  pointer-events: none;
}
.anima-callbar.is-visible {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.anima-callbar__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  background: var(--anima-orange-cta);
  color: #fff;
  font: 600 15px/1 'Manrope', system-ui, sans-serif;
  text-decoration: none;
  cursor: pointer;
}
.anima-callbar__map {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(78, 90, 43, 0.1);
  color: var(--anima-olive);
  text-decoration: none;
}
.anima-callbar__map:hover { background: var(--anima-olive); color: #fff; }

@media (max-width: 1024px) {
  .anima-callbar { display: flex; }
}`,
);

/* ---------------- лайтбокс ---------------- */
replace(
  'src/styles/sections.css',
  '/* --- лайтбокс --- */',
  '@media (max-width: 700px) {\n  .anima-lightbox {\n    grid-template-columns: 1fr;\n    grid-template-rows: 1fr auto;\n    justify-items: center;\n  }\n  .anima-lightbox__figure { grid-row: 1; }\n  .anima-lightbox__nav { grid-row: 2; }\n  .anima-lightbox__nav--prev { justify-self: start; grid-column: 1; }\n  .anima-lightbox__nav--next { justify-self: end; grid-column: 1; margin-top: -52px; }\n}',
  `/* --- лайтбокс (ползва общия Modal) --- */
.anima-modal.anima-lightbox .anima-modal__panel {
  width: min(1180px, 100%);
  max-height: none;
  padding: 0;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  overflow: visible;
}
.anima-modal.anima-lightbox .anima-modal__scrim { background: rgba(18, 20, 14, 0.94); }

.anima-lightbox__inner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(6px, 2vw, 18px);
}

.anima-lightbox__figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.anima-lightbox__figure img {
  max-width: 100%;
  max-height: min(74svh, 860px);
  border-radius: 12px;
  object-fit: contain;
}
.anima-lightbox__figure figcaption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 4px 12px;
  color: rgba(255, 255, 255, 0.86);
  font: 400 15px/1.4 'Manrope', system-ui, sans-serif;
  text-align: center;
}
.anima-lightbox__count { color: rgba(255, 255, 255, 0.5); }

.anima-lightbox .anima-lightbox__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  cursor: pointer;
  transition: background-color 0.22s var(--anima-ease);
}
.anima-lightbox .anima-lightbox__nav:hover { background: var(--anima-olive); }

@media (max-width: 760px) {
  /* На телефон стрелките слизат под снимката, иначе стоят върху нея
     и пречат, а и се сменя със плъзгане с пръст. */
  .anima-lightbox__inner {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr auto;
    gap: 14px;
  }
  .anima-lightbox__figure { grid-column: 1 / -1; grid-row: 1; }
  .anima-lightbox__nav--prev { grid-column: 1; justify-self: start; }
  .anima-lightbox__nav--next { grid-column: 2; justify-self: end; }
}`,
);

/* ---------------- ценоразпис ---------------- */
replace(
  'src/styles/sections.css',
  '.anima-pricelist {',
  '  .anima-prices__foot .anima-btn { width: 100%; }\n}',
  `.anima-pricelist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.anima-price {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(210px, auto);
  gap: 10px clamp(20px, 4vw, 48px);
  align-items: start;
  padding: clamp(18px, 2.4vw, 24px) clamp(18px, 3vw, 28px);
  border: 1px solid rgba(35, 38, 28, 0.1);
  border-radius: 14px;
  background: var(--anima-cream);
  transition: border-color 0.2s var(--anima-ease), box-shadow 0.2s var(--anima-ease);
}
.anima-price:hover {
  border-color: rgba(90, 87, 48, 0.32);
  box-shadow: 0 8px 24px rgba(35, 38, 28, 0.07);
}

.anima-price__name {
  margin: 0;
  font: 400 clamp(19px, 2vw, 23px) / 1.25 'Ovo', Georgia, serif;
  color: var(--anima-ink);
}
.anima-price__text {
  margin: 6px 0 0;
  max-width: 58ch;
  color: var(--anima-muted);
  font: 400 14.5px/1.55 'Manrope', system-ui, sans-serif;
}

/* Всеки вариант е отделен ред „60 мин · · · 58 €“. Мерната единица е изписана,
   а точките водят окото от времето до цената. */
.anima-price__variants {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
  align-content: start;
}
.anima-price__variants li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 8px;
}
.anima-price__time {
  color: var(--anima-muted);
  font: 500 15px/1.4 'Manrope', system-ui, sans-serif;
  white-space: nowrap;
}
.anima-price__dots {
  align-self: center;
  height: 1px;
  border-bottom: 1px dotted rgba(35, 38, 28, 0.28);
}
.anima-price__value {
  color: var(--anima-olive-600);
  font: 700 17px/1.4 'Manrope', system-ui, sans-serif;
  white-space: nowrap;
}

.anima-prices__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 28px;
}
.anima-prices__foot p {
  flex: 1 1 320px;
  margin: 0;
  color: var(--anima-muted);
  font: 400 15px/1.6 'Manrope', system-ui, sans-serif;
}

@media (max-width: 720px) {
  .anima-price {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .anima-price__variants {
    padding-top: 12px;
    border-top: 1px solid rgba(35, 38, 28, 0.1);
  }
  .anima-prices__foot .anima-btn { width: 100%; }
}`,
);

console.log('готово');
