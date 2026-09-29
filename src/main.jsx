import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { bootLegacyRuntime } from './legacy/bootLegacyRuntime.js';
import { observeLazyBackgrounds } from './legacy/lazyBackgrounds.js';
import { revealTemplateSections } from './legacy/revealAnimations.js';
import { pauseOffscreenMedia } from './legacy/pauseOffscreenMedia.js';
import { currentPath } from './lib/pages.js';

// Зареждат се последни, за да пребият стиловете на темата.
import './styles/anima.css';
import './styles/sections.css';
import './styles/modal.css';
import './styles/pages.css';

const root = createRoot(document.getElementById('root'));
const path = currentPath();

if (path === '/') {
  // Elementor's runtime walks the DOM the instant it executes, so the markup has
  // to be committed first - hence flushSync rather than a plain render().
  flushSync(() => {
    root.render(<App />);
  });

  // Първо поемаме появата на секциите: така текстовете се виждат дори ако
  // някой от скриптовете на темата по-долу не се зареди.
  revealTemplateSections();

  observeLazyBackgrounds();
  bootLegacyRuntime();

  // Веднага след като темата пусне видеата, поемаме контрола над тях.
  pauseOffscreenMedia();

  // Идваме от друга страница с котва (/#ceni): съдържанието се рисува от
  // JavaScript, затова браузърът не намира котвата сам и тук я довършваме.
  if (window.location.hash) {
    const jump = () => document.querySelector(window.location.hash)?.scrollIntoView();
    requestAnimationFrame(jump);
    window.addEventListener('load', () => setTimeout(jump, 150), { once: true });
  }
} else {
  // Отделните страници (ваучери, блог, услуги…) нямат секции на Elementor и
  // не зареждат неговия runtime. Кодът им е в отделен файл, който началната
  // страница изобщо не тегли; текстът им вече е в готовия HTML.
  document.body.classList.add('anima-subpage');
  import('./SubPage.jsx').then(({ default: SubPage }) => root.render(<SubPage path={path} />));
}
