/**
 * Пауза на фоновите видеа, които не се виждат.
 *
 * Темплейтът пуска видеото в хероя и това в призива за записване и ги оставя
 * да въртят докрай. На телефон това дърпа батерия и се усеща като забиване
 * при скрол. Тук всяко от тях се спира, щом излезе от екрана, и тръгва
 * отново, когато се върне.
 *
 * И двете са <video>: секцията с призива беше YouTube embed, но плеърът
 * рисуваше собствените си бутони върху кадъра (виж BookingCtaSection.jsx).
 */

const MARGIN = '120px 0px 120px 0px';
const SELECTOR = 'video.elementor-background-video-hosted';

export function pauseOffscreenMedia() {
  if (!('IntersectionObserver' in window)) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !reduce) {
          // play() връща отхвърлено обещание, ако браузърът откаже автоплей
          entry.target.play?.().catch(() => {});
        } else {
          entry.target.pause?.();
        }
      }
    },
    { rootMargin: MARGIN, threshold: 0 },
  );

  const attach = () => {
    for (const video of document.querySelectorAll(SELECTOR)) {
      if (video.dataset.animaWatched) continue;
      video.dataset.animaWatched = '1';
      video.preload = 'metadata';
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
