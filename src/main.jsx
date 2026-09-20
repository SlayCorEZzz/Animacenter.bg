import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { bootLegacyRuntime } from './legacy/bootLegacyRuntime.js';
import { observeLazyBackgrounds } from './legacy/lazyBackgrounds.js';
import { revealTemplateSections } from './legacy/revealAnimations.js';
import { pauseOffscreenMedia } from './legacy/pauseOffscreenMedia.js';

// Зареждат се последни, за да пребият стиловете на темата.
import './styles/anima.css';
import './styles/sections.css';
import './styles/modal.css';

const root = createRoot(document.getElementById('root'));

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
