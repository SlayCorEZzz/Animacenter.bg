/**
 * Elementor ships a stylesheet that suppresses `background-image` on every
 * `.e-con.e-parent` past the first few until the element gets an `e-lazyloaded`
 * class. On the original page an inline script added that class on scroll, off
 * `DOMContentLoaded`. Here the markup only exists after React has mounted, so
 * the observer is started explicitly instead.
 *
 * Without this the section backgrounds below the fold never appear.
 */
export function observeLazyBackgrounds() {
  const run = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('e-lazyloaded');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '200px 0px 200px 0px' },
    );

    document
      .querySelectorAll('.e-con.e-parent:not(.e-lazyloaded)')
      .forEach((el) => observer.observe(el));
  };

  run();
  document.addEventListener('elementor/lazyload/observe', run);
}
