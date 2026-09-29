/**
 * Фоновите видеа: теглят се и въртят само когато се виждат.
 *
 * Темплейтът пуска видеото в хероя и това в призива за записване (същият
 * файл, от друга секунда) и ги оставя да въртят докрай. На телефон това
 * дърпа батерия, а второто видео се теглеше още при отваряне на страницата,
 * макар да е далеч надолу (~700 KB в повече).
 *
 * Затова:
 *   - видео, което е далеч от екрана, не получава адреса си (src) веднага:
 *     темата го слага, ние го пазим в data-anima-src и го връщаме, когато
 *     секцията наближи;
 *   - всяко видео се спира, щом излезе от екрана, и тръгва, когато се върне.
 */

const MARGIN = '300px 0px 300px 0px';
const SELECTOR = 'video.elementor-background-video-hosted';

/** Близо ли е до екрана (същото поле като MARGIN). */
function isNear(video) {
  const r = video.getBoundingClientRect();
  return r.bottom > -300 && r.top < window.innerHeight + 300;
}

function stash(video) {
  const src = video.getAttribute('src');
  if (!src) return;
  video.dataset.animaSrc = src;
  video.removeAttribute('src');
  video.load(); // прекъсва вече започнатото теглене
}

function restore(video) {
  if (video.dataset.animaSrc && !video.getAttribute('src')) {
    video.setAttribute('src', video.dataset.animaSrc);
    delete video.dataset.animaSrc;
  }
}

export function pauseOffscreenMedia() {
  if (!('IntersectionObserver' in window)) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (entry.isIntersecting) {
          restore(video);
          // play() връща отхвърлено обещание, ако браузърът откаже автоплей
          if (!reduce) video.play?.().catch(() => {});
        } else {
          video.pause?.();
        }
      }
    },
    { rootMargin: MARGIN, threshold: 0 },
  );

  // Темата слага src по-късно, като атрибут: хващаме го в момента, в който се
  // появи, и ако видеото е далеч от екрана, го отлагаме.
  const srcWatcher = new MutationObserver((records) => {
    for (const r of records) {
      const video = r.target;
      if (video.getAttribute('src') && !isNear(video)) stash(video);
    }
  });

  const attach = () => {
    for (const video of document.querySelectorAll(SELECTOR)) {
      if (video.dataset.animaWatched) continue;
      video.dataset.animaWatched = '1';
      video.preload = isNear(video) ? 'metadata' : 'none';
      if (video.getAttribute('src') && !isNear(video)) stash(video);
      srcWatcher.observe(video, { attributes: true, attributeFilter: ['src'] });
      observer.observe(video);
    }
  };

  attach();

  // Elementor вкарва видеата след своя старт, затова следим и за нови.
  const mo = new MutationObserver(attach);
  mo.observe(document.body, { childList: true, subtree: true });

  // Когато разделът не е активен, няма смисъл нищо да върви.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    document.querySelectorAll(SELECTOR).forEach((v) => v.pause?.());
  });
}
