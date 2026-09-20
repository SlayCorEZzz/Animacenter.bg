/**
 * Пренаписва <head> на index.html за ANIMA: заглавие и описание на български,
 * собствено лого за икона, отваряне на графиката и структурирани данни за
 * локален бизнес. Маха остатъците от WordPress, които сочат към чуждия сайт.
 *
 * Стартиране: node tools/rewrite-head.mjs
 */
import fs from 'node:fs';

const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

const TITLE = 'ANIMA Center | Масаж и кинезитерапия в центъра на София';
const HERO_POSTER =
  '/wp-content/uploads/2025/10/pexels.com_video_woman-doing-a-back-massage-6628400-cover14.jpg';
const DESC =
  'Професионален масаж и кинезитерапия в ANIMA Center на ул. „Лавеле“ 11, до метростанция „Сердика“ в София. Класически, релаксиращ, лечебен и миофасциален масаж, процедури за лице и офис масаж.';

/** Ред, който трябва да изчезне изцяло. */
const DROP = [
  /^<link rel="alternate"[^>]*>\s*$/gm,
  /^<link rel="https:\/\/api\.w\.org\/"[^>]*>.*$/gm,
  /^<meta name="generator" content="WordPress[^>]*>\s*$/gm,
  /^<link rel='shortlink'[^>]*>\s*$/gm,
  /^<meta name="msapplication-TileImage"[^>]*>\s*$/gm,
];
for (const re of DROP) html = html.replace(re, '');

const swap = (from, to) => {
  if (!from.test(html)) throw new Error(`не е намерено: ${from}`);
  html = html.replace(from, to);
};

swap(/<html lang="en-US"/, '<html lang="bg"');
swap(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`);

// постерът на видео фона си остава; добавя се и логото
swap(
  /<link data-rocket-prefetch[^>]*><link rel="preload"[^>]*>/,
  '<link data-rocket-prefetch href="https://www.youtube.com/" rel="dns-prefetch">' +
    `<link rel="preload" as="image" href="${HERO_POSTER}" fetchpriority="high">\n` +
    '<link rel="preload" as="image" href="/brand/anima-logo-white.png">',
);

swap(/<meta name='robots'[^>]*>/, `<meta name="description" content="${DESC}">\n<meta name="robots" content="index, follow, max-image-preview:large">`);

swap(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="https://animacenter.bg/">');

swap(/<meta property="og:locale"[^>]*>/, '<meta property="og:locale" content="bg_BG">');
swap(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${TITLE}">`);
swap(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${DESC}">`);
swap(/<meta property="og:url"[^>]*>/, '<meta property="og:url" content="https://animacenter.bg/">');
swap(/<meta property="og:site_name"[^>]*>/, '<meta property="og:site_name" content="ANIMA Center">');
swap(/<meta property="article:modified_time"[^>]*>\s*/, '');
swap(
  /<meta property="og:image"[^>]*>/,
  `<meta property="og:image" content="https://animacenter.bg${HERO_POSTER}">`,
);
swap(/<meta property="og:image:width"[^>]*>/, '<meta property="og:image:width" content="1920">');
swap(/<meta property="og:image:height"[^>]*>/, '<meta property="og:image:height" content="1080">');

swap(/<meta name="theme-color"[^>]*>/, '<meta name="theme-color" content="#4e5a2b">');
swap(
  /<link rel="icon" href="\/wp-content\/uploads\/2025\/08\/fav-icon-150x150\.png" sizes="32x32" >\s*<link rel="icon"[^>]*>\s*<link rel="apple-touch-icon"[^>]*>/,
  '<link rel="icon" href="/brand/anima-icon.png" sizes="any">\n' +
    '<link rel="apple-touch-icon" href="/brand/anima-icon.png">',
);

/* --- структурирани данни за Google --- */
const JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  name: 'ANIMA Center',
  description: DESC,
  image: `https://animacenter.bg${HERO_POSTER}`,
  logo: 'https://animacenter.bg/brand/anima-logo.png',
  url: 'https://animacenter.bg/',
  telephone: '+359897700766',
  email: 'animacenterbg@gmail.com',
  priceRange: '35–73 €',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. „Лавеле“ 11',
    addressLocality: 'София',
    postalCode: '1000',
    addressCountry: 'BG',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00',
    },
  ],
};

html = html.replace(
  '</head>',
  `<script type="application/ld+json">${JSON.stringify(JSONLD)}</script>\n</head>`,
);

html = html.replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(FILE, html, 'utf8');
console.log('index.html е обновен за ANIMA');
