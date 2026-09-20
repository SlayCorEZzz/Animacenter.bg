/**
 * Заключване на скрола зад отворен слой. Брои се, защото може да има повече
 * от един отворен наведнъж (меню + модал) и последният, който се затваря,
 * трябва да върне страницата както си е била.
 */
let depth = 0;
let saved = null;

export function lockScroll() {
  depth += 1;
  if (depth > 1) return;

  const { body } = document;
  // Компенсира изчезналата лента за скрол, за да не „подскача“ страницата.
  const gap = window.innerWidth - document.documentElement.clientWidth;
  saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
  body.style.overflow = 'hidden';
  if (gap > 0) body.style.paddingRight = `${gap}px`;
}

export function unlockScroll() {
  depth = Math.max(0, depth - 1);
  if (depth > 0 || !saved) return;

  document.body.style.overflow = saved.overflow;
  document.body.style.paddingRight = saved.paddingRight;
  saved = null;
}
