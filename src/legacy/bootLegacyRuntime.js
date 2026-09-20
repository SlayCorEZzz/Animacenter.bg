import { LEGACY_RUNTIME } from './runtime-manifest.js';

let booted = false;

/**
 * Loads the original WordPress/Elementor runtime (jQuery, Elementor frontend,
 * Elementor Pro, Swiper, SmartMenus, the sticky plugin and the Vamtam theme
 * scripts) exactly as the source page did.
 *
 * Every script is inserted with `async = false`, which puts it in the browser's
 * "execute in order" list: they download in parallel but run strictly in the
 * order below, and they still block `window.load` - Elementor Pro hangs some of
 * its handlers off that event, so it must not have fired yet.
 *
 * The inline configuration blocks (`elementorFrontendConfig`, `VAMTAM_FRONT`,
 * ...) are turned into blob URLs so they join the same ordered queue; a plain
 * inline <script> would execute the moment it is inserted and jump the line.
 */
export function bootLegacyRuntime() {
  if (booted) return;
  booted = true;

  const fragment = document.createDocumentFragment();

  for (const step of LEGACY_RUNTIME) {
    const el = document.createElement('script');
    el.async = false;

    if (step.src) {
      el.src = step.src;
    } else {
      const url = URL.createObjectURL(new Blob([step.code], { type: 'text/javascript' }));
      el.src = url;
      el.dataset.inlineScript = step.name;
      el.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    }

    fragment.appendChild(el);
  }

  document.body.appendChild(fragment);
}
