/**
 * Сайтът е една дълга начална страница плюс няколко отделни страници
 * (/vaucheri, /blog, /blog/<статия>). Менюто пази котвите на началната
 * страница (#uslugi, #ceni…); тук се решава накъде да сочат от текущата.
 */

/** Котви, които съществуват на всяка страница (футърът е навсякъде). */
const EVERYWHERE = ['#kontakti'];

/* При билда (tools/prerender.mjs) няма window: там адресът се подава отвън. */
let serverPath = '/';
export function setServerPath(path) {
  serverPath = path;
}

export function currentPath() {
  if (typeof window === 'undefined') return serverPath;
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

export const isHomePage = () => currentPath() === '/';

/** Връзката към елемент от менюто, както трябва да изглежда на тази страница. */
export function pageHref(href) {
  if (!href.startsWith('#') || isHomePage() || EVERYWHERE.includes(href)) return href;
  return href === '#top' ? '/' : `/${href}`;
}

/** Дали елементът от менюто е текущата отделна страница. */
export function isCurrent(href, path = currentPath()) {
  return !href.startsWith('#') && (path === href || path.startsWith(`${href}/`));
}
