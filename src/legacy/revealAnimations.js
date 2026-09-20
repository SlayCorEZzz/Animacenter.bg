/**
 * Появата на секциите, наследени от темплейта.
 *
 * Оригиналният маркъп на Elementor слага `elementor-invisible`
 * (`visibility: hidden`) на всеки анимиран елемент и разчита рънтайма на
 * темата да я махне, когато елементът влезе в екрана. Така целият текст на
 * горната половина от сайта виси на двайсетина външни скрипта: падне ли един
 * от тях (jQuery, webpack runtime, elementor frontend), посетителят вижда само
 * фоновете на секциите - точно оплакването „понякога половината секции не се
 * зареждат“. Долната половина е наша и затова винаги излиза.
 *
 * Тук появата се поема от обикновен IntersectionObserver, който тръгва още
 * преди старият рънтайм. Ключовете за анимация се махат от `data-settings`,
 * за да не анимира Elementor същия елемент втори път, ако все пак се зареди.
 */

/** Колко да чакаме, преди да покажем насила каквото вече е на екрана. */
const FAILSAFE_MS = 1500;

let done = false;

/** Elementor пази отделна стойност за таблет и телефон: `_animation_mobile`. */
function currentSuffix() {
  if (window.innerWidth <= 767) return '_mobile';
  if (window.innerWidth <= 1024) return '_tablet';
  return '';
}

function pickAnimation(settings) {
  const suffix = currentSuffix();
  for (const base of ['animation', '_animation']) {
    const value = (suffix && settings[base + suffix]) || settings[base];
    if (value) return value;
  }
  return '';
}

/** Маха анимационните ключове, за да не се хване рънтаймът за същия елемент. */
function disarmElementor(el, settings) {
  const rest = {};
  for (const [key, value] of Object.entries(settings)) {
    if (!/^_?animation/.test(key)) rest[key] = value;
  }
  el.dataset.settings = JSON.stringify(rest);
}

export function revealTemplateSections() {
  if (done) return;
  done = true;

  // Скритото състояние важи само докато този контрольор е поел появата - ако
  // модулът не се изпълни, стилът по-долу оставя всичко видимо.
  document.documentElement.classList.add('anima-reveal');

  const nodes = [...document.querySelectorAll('.elementor-invisible')];
  if (!nodes.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = new Map();

  for (const el of nodes) {
    let settings = {};
    try {
      settings = JSON.parse(el.dataset.settings || '{}');
    } catch {
      settings = {};
    }
    disarmElementor(el, settings);

    items.set(el, {
      name: reduce ? '' : pickAnimation(settings),
      delay: Number(settings._animation_delay ?? settings.animation_delay ?? 0) || 0,
    });
  }

  const show = (el) => {
    const item = items.get(el);
    if (!item || !el.classList.contains('elementor-invisible')) return;
    items.delete(el);

    const apply = () => {
      el.classList.remove('elementor-invisible');
      if (item.name && item.name !== 'none') el.classList.add('animated', item.name);
    };
    if (item.delay > 0) setTimeout(apply, item.delay);
    else apply();
  };

  if (typeof IntersectionObserver !== 'function') {
    nodes.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        show(entry.target);
      }
    },
    // малко навътре в екрана, за да не се изиграе анимацията точно на ръба
    { rootMargin: '0px 0px -8% 0px' },
  );
  nodes.forEach((el) => observer.observe(el));

  // Предпазна мрежа: ако наблюдателят по някаква причина не се обади, каквото
  // вече е стигнало до екрана, се показва без анимация. Секциите надолу си
  // остават скрити и се анимират нормално при скролване.
  setTimeout(() => {
    for (const el of [...items.keys()]) {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        observer.unobserve(el);
        items.get(el).delay = 0;
        show(el);
      }
    }
  }, FAILSAFE_MS);
}
