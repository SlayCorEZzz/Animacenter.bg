/**
 * Converts the HTTrack mirror of flexora.vamtam.com/massage-therapist/ into
 * React components, preserving the DOM byte-for-byte (same tags, same
 * attributes, same text, same order) so that the original Elementor CSS and
 * JavaScript keep producing exactly the same design and animations.
 *
 * Run: node tools/convert.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const SRC = 'C:/masege/mesege/flexora.vamtam.com/massage-therapist/index.html';
const OUT = path.resolve('src');

/* ------------------------------------------------------------------ *
 * HTML attribute name -> React prop name
 * ------------------------------------------------------------------ */
const ATTR_MAP = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  srcset: 'srcSet',
  fetchpriority: 'fetchPriority',
  itemscope: 'itemScope',
  itemtype: 'itemType',
  itemprop: 'itemProp',
  itemid: 'itemID',
  itemref: 'itemRef',
  crossorigin: 'crossOrigin',
  autoplay: 'autoPlay',
  playsinline: 'playsInline',
  autofocus: 'autoFocus',
  autocomplete: 'autoComplete',
  maxlength: 'maxLength',
  minlength: 'minLength',
  readonly: 'readOnly',
  novalidate: 'noValidate',
  formaction: 'formAction',
  formnovalidate: 'formNoValidate',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  charset: 'charSet',
  'http-equiv': 'httpEquiv',
  usemap: 'useMap',
  contenteditable: 'contentEditable',
  spellcheck: 'spellCheck',
  datetime: 'dateTime',
  enctype: 'encType',
  frameborder: 'frameBorder',
  allowfullscreen: 'allowFullScreen',
  marginwidth: 'marginWidth',
  marginheight: 'marginHeight',
  srclang: 'srcLang',
  accesskey: 'accessKey',
  'accept-charset': 'acceptCharset',
  // SVG
  viewbox: 'viewBox',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'text-anchor': 'textAnchor',
  'xmlns:xlink': 'xmlnsXlink',
  'xlink:href': 'xlinkHref',
  preserveaspectratio: 'preserveAspectRatio',
  gradientunits: 'gradientUnits',
  gradienttransform: 'gradientTransform',
};

/** React props that are booleans: an empty HTML value must become `{true}`. */
const BOOLEAN_PROPS = new Set([
  'autoPlay', 'muted', 'loop', 'controls', 'playsInline', 'required', 'disabled',
  'checked', 'selected', 'readOnly', 'multiple', 'noValidate', 'open', 'hidden',
  'itemScope', 'async', 'defer', 'reversed', 'autoFocus', 'default', 'inert',
  'allowFullScreen', 'formNoValidate', 'scoped', 'seamless',
]);

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

/** Tags whose text content must be passed through untouched. */
const RAW_TEXT_TAGS = new Set(['style', 'script']);

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/**
 * The mirror addresses assets relative to /massage-therapist/ or by their
 * original absolute URL. In the Vite app they all live under public/, i.e. at
 * the site root. Page links (/about/, /services/, ...) are left untouched.
 */
function rewriteUrls(value) {
  return value
    .replace(/\.\.\/(wp-content|wp-includes|cdn-cgi)\//g, '/$1/')
    .replace(/https:\/\/flexora\.vamtam\.com\/(wp-content|wp-includes|cdn-cgi)\//g, '/$1/')
    .replace(/https:\\\/\\\/flexora\.vamtam\.com\\\/(wp-content|wp-includes|cdn-cgi)\\\//g, '\\/$1\\/')
    // self-reference; left alone Vite would treat it as a second HTML entry
    .replace(/href=(["'])index\.html\1/g, 'href="/"');
}

/** JSON.stringify, but also escapes invisible / ambiguous characters. */
function str(value) {
  return JSON.stringify(value).replace(
    /[\u00a0\u00ad\u200b-\u200f\u2028\u2029\u202a-\u202e\u2060\ufeff]/g,
    (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
  );
}

function styleToObject(css) {
  const entries = [];
  for (const rawDecl of css.split(';')) {
    const decl = rawDecl.trim();
    if (!decl) continue;
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    const key = prop.startsWith('--')
      ? str(prop)
      : /^[a-z-]+$/.test(prop)
        ? prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
        : str(prop);
    entries.push(`${key}: ${str(value)}`);
  }
  return entries.length ? `{{ ${entries.join(', ')} }}` : '{{}}';
}

function renderAttributes(node) {
  const out = [];
  for (const [rawName, originalValue] of Object.entries(node.attributes)) {
    const lower = rawName.toLowerCase();
    let rawValue = rewriteUrls(originalValue);
    // Links back to this very page.
    if ((lower === 'href' || lower === 'src') && rawValue === 'index.html') rawValue = '/';

    // data-* and aria-* pass straight through to the DOM.
    const isPassthrough = lower.startsWith('data-') || lower.startsWith('aria-');
    const name = isPassthrough ? rawName : (ATTR_MAP[lower] ?? rawName);

    if (name === 'style') {
      out.push(`style=${styleToObject(rawValue)}`);
      continue;
    }

    // React turns `value` on a non-hidden input into a controlled field.
    let propName = name;
    if (
      propName === 'value' &&
      node.rawTagName === 'input' &&
      (node.getAttribute('type') || '').toLowerCase() !== 'hidden'
    ) {
      propName = 'defaultValue';
    }

    if (rawValue === '' && BOOLEAN_PROPS.has(propName)) {
      out.push(`${propName}={true}`);
      continue;
    }

    // A quoted JSX attribute re-decodes HTML entities, so anything holding an
    // ampersand, a newline or a non-ASCII character goes through an expression.
    const printableAscii = !/[&\\\n\r\t]/.test(rawValue) && !/[^\x20-\x7e]/.test(rawValue);
    if (printableAscii && !rawValue.includes('"')) {
      out.push(`${propName}="${rawValue}"`);
    } else if (printableAscii && !rawValue.includes("'")) {
      out.push(`${propName}='${rawValue}'`);
    } else {
      out.push(`${propName}={${str(rawValue)}}`);
    }
  }
  return out;
}

/** True when the element holds text that must not be re-flowed by JSX. */
function hasMeaningfulText(node) {
  return node.childNodes.some((c) => c.nodeType === 3 && c.rawText.trim() !== '');
}

/* ------------------------------------------------------------------ *
 * Serializer
 * ------------------------------------------------------------------ */

/**
 * `replacements` maps a DOM node to a JSX snippet (used to swap a sub-tree for
 * a `<Component />` call when generating App.jsx).
 */
function serialize(node, indent, inline, replacements) {
  const pad = '  '.repeat(indent);

  if (replacements?.has(node)) {
    return pad + replacements.get(node);
  }

  // Comment
  if (node.nodeType === 8) {
    const body = node.rawText.replace(/\*\//g, '*\u200b/');
    return `${inline ? '' : pad}{/*${body}*/}`;
  }

  // Text
  if (node.nodeType === 3) {
    const text = node.text;
    if (!inline && text.trim() === '') return null; // layout-irrelevant whitespace
    // Inline children are emitted on a single line, so JSX preserves the text
    // verbatim; only characters JSX would reinterpret need a string expression.
    if (inline && !/[{}<>&\n\r]/.test(text)) return text;
    return `${inline ? '' : pad}{${str(text)}}`;
  }

  const tag = node.rawTagName;
  const attrs = renderAttributes(node);

  // <style> / <script> keep their exact payload.
  if (RAW_TEXT_TAGS.has(tag)) {
    const html = rewriteUrls(node.rawText ?? '');
    const all = [...attrs, `dangerouslySetInnerHTML={{ __html: ${str(html)} }}`];
    return `${inline ? '' : pad}<${tag} ${all.join(' ')} />`;
  }

  const isVoid = VOID_TAGS.has(tag) || node.childNodes.length === 0;
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  if (isVoid) {
    return `${inline ? '' : pad}<${tag}${attrStr} />`;
  }

  // Mixed content: everything stays on one line so JSX keeps the whitespace.
  const goInline = inline || hasMeaningfulText(node);

  if (goInline) {
    const kids = node.childNodes
      .map((c) => serialize(c, 0, true, replacements))
      .filter((s) => s !== null)
      .join('');
    return `${inline ? '' : pad}<${tag}${attrStr}>${kids}</${tag}>`;
  }

  const kids = node.childNodes
    .map((c) => serialize(c, indent + 1, false, replacements))
    .filter((s) => s !== null);

  if (!kids.length) return `${pad}<${tag}${attrStr} />`;

  // Keep long attribute lists readable.
  const open = attrStr.length > 110
    ? `${pad}<${tag}\n${attrs.map((a) => '  '.repeat(indent + 1) + a).join('\n')}\n${pad}>`
    : `${pad}<${tag}${attrStr}>`;

  return `${open}\n${kids.join('\n')}\n${pad}</${tag}>`;
}

function componentFile(name, node, replacements) {
  const body = serialize(node, 2, false, replacements);
  return `export default function ${name}() {\n  return (\n${body}\n  );\n}\n`;
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

/**
 * Еднократен инструмент. След първото пускане компонентите са преведени и
 * пренаписани на ръка, затова повторно стартиране изисква изричен --force.
 */
if (fs.existsSync(path.join(OUT, 'App.jsx')) && !process.argv.includes('--force')) {
  console.error(
    'src/App.jsx вече съществува. Повторното генериране ще изтрие ръчните промени.\n' +
      'Ако наистина това искаш: node tools/convert.mjs --force',
  );
  process.exit(1);
}

const html = fs.readFileSync(SRC, 'utf8');
const root = parse(html, {
  comment: true,
  blockTextElements: { script: true, style: true, pre: true },
});

const body = root.querySelector('body');
const headerEl = body.querySelector('header[data-elementor-type="header"]');
const footerWrapper = body.querySelector('.footer-wrapper');
const scrollTop = body.querySelector('#scroll-to-top');
const pageRoot = body.querySelector('.elementor-17');

const SECTIONS = [
  ['cde987c', 'HeroSection'],
  ['8ca86ae', 'TherapistsIntroSection'],
  ['bc455de', 'ServicesHeadingSection'],
  ['58572a0', 'ServicesGridSection'],
  ['0166223', 'WhyChooseUsSection'],
  ['20576cd', 'MassageBenefitsSection'],
  ['a69c699', 'MeetTherapistSection'],
  ['32389c6', 'BookingCtaSection'],
  ['70e2915', 'ReviewsSection'],
  ['c07241e', 'BlogHeadingSection'],
  ['d59bb68', 'BlogGridSection'],
];

const sectionNodes = pageRoot.childNodes.filter((n) => n.nodeType === 1);
if (sectionNodes.length !== SECTIONS.length) {
  throw new Error(`Expected ${SECTIONS.length} page sections, found ${sectionNodes.length}`);
}
sectionNodes.forEach((n, i) => {
  if (n.getAttribute('data-id') !== SECTIONS[i][0]) {
    throw new Error(`Section ${i} is ${n.getAttribute('data-id')}, expected ${SECTIONS[i][0]}`);
  }
});

// Sanity: no <script> may live inside a component we generate.
for (const n of [headerEl, footerWrapper, pageRoot]) {
  if (n.querySelectorAll('script').length) {
    throw new Error('Unexpected <script> inside converted markup');
  }
}

fs.mkdirSync(path.join(OUT, 'components', 'sections'), { recursive: true });

// --- section components ---
sectionNodes.forEach((node, i) => {
  const [, name] = SECTIONS[i];
  fs.writeFileSync(
    path.join(OUT, 'components', 'sections', `${name}.jsx`),
    componentFile(name, node),
    'utf8',
  );
});

// --- header / footer / scroll-to-top ---
fs.writeFileSync(path.join(OUT, 'components', 'SiteHeader.jsx'), componentFile('SiteHeader', headerEl), 'utf8');
fs.writeFileSync(path.join(OUT, 'components', 'SiteFooter.jsx'), componentFile('SiteFooter', footerWrapper), 'utf8');
fs.writeFileSync(path.join(OUT, 'components', 'ScrollToTop.jsx'), componentFile('ScrollToTop', scrollTop), 'utf8');

// --- App.jsx: the body shell, with the pieces above swapped for components ---
const replacements = new Map();
replacements.set(headerEl, '<SiteHeader />');
replacements.set(footerWrapper, '<SiteFooter />');
replacements.set(scrollTop, '<ScrollToTop />');
sectionNodes.forEach((node, i) => replacements.set(node, `<${SECTIONS[i][1]} />`));

// Scripts and stylesheets are hoisted into index.html / the legacy bootstrap.
// The lone hidden Cloudflare beacon <a> renders nothing and is dropped.
const isHoisted = (n) =>
  n.nodeType === 1 &&
  (n.rawTagName === 'script' ||
    n.rawTagName === 'link' ||
    (n.rawTagName === 'a' && n.getAttribute('aria-hidden') === 'true' &&
      (n.getAttribute('href') || '').includes('/cdn-cgi/content')));

const shellNodes = body.childNodes
  .filter((n) => !isHoisted(n))
  .map((n) => serialize(n, 3, false, replacements))
  .filter((s) => s !== null);

const imports = [
  `import SiteHeader from './components/SiteHeader.jsx';`,
  ...SECTIONS.map(([, name]) => `import ${name} from './components/sections/${name}.jsx';`),
  `import SiteFooter from './components/SiteFooter.jsx';`,
  `import ScrollToTop from './components/ScrollToTop.jsx';`,
].join('\n');

const app = `${imports}

export default function App() {
  return (
    <>
${shellNodes.join('\n')}
    </>
  );
}
`;
fs.writeFileSync(path.join(OUT, 'App.jsx'), app, 'utf8');

/* ------------------------------------------------------------------ *
 * index.html - the original <head> minus the scripts, which the legacy
 * bootstrap re-loads in dependency order once React has mounted.
 * ------------------------------------------------------------------ */
const head = root.querySelector('head');
const headHtml = head.childNodes
  .filter((n) => !(n.nodeType === 1 && n.rawTagName === 'script'))
  .map((n) => (n.nodeType === 3 ? n.rawText : rewriteUrls(n.toString())))
  .join('')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

// The five stylesheets WordPress printed in the body stay last in the cascade.
const bodyStylesheets = body.childNodes
  .filter((n) => n.nodeType === 1 && n.rawTagName === 'link')
  .map((n) => rewriteUrls(n.toString()))
  .join('\n');

const bodyClass = body.getAttribute('class');

fs.writeFileSync(
  path.resolve('index.html'),
  `<!DOCTYPE html>
<html lang="en-US" class="no-js">
<head>
${headHtml}

<!-- printed in the body by WordPress; kept last so the cascade is unchanged -->
${bodyStylesheets}
</head>
<body class="${bodyClass}">
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>
`,
  'utf8',
);

/* ------------------------------------------------------------------ *
 * Legacy runtime: the exact scripts and inline configs the page shipped.
 * ------------------------------------------------------------------ */
const scriptNodes = [...head.querySelectorAll('script'), ...body.querySelectorAll('script')];
const byId = (id) => scriptNodes.find((n) => n.getAttribute('id') === id);
const srcOf = (id) => rewriteUrls(byId(id).getAttribute('src'));
const codeOf = (id) => rewriteUrls(byId(id).rawText.trim());

const emailDecode = scriptNodes.find((n) => (n.getAttribute('src') || '').includes('email-decode'));

const SEQUENCE = [
  { src: srcOf('jquery-core-js') },
  { src: srcOf('jquery-migrate-js') },
  { src: rewriteUrls(emailDecode.getAttribute('src')) },
  { code: codeOf('vamtam-all-js-extra'), name: 'vamtam-all-js-extra' },
  { src: srcOf('vamtam-all-js') },
  { src: srcOf('elementor-webpack-runtime-js') },
  { src: srcOf('elementor-frontend-modules-js') },
  { code: codeOf('jquery-ui-core-js-before'), name: 'jquery-ui-core-js-before' },
  { src: srcOf('jquery-ui-core-js') },
  { code: codeOf('elementor-frontend-js-before'), name: 'elementor-frontend-js-before' },
  { src: srcOf('elementor-frontend-js') },
  { src: srcOf('smartmenus-js') },
  { src: srcOf('e-sticky-js') },
  { src: srcOf('vamtam-form-js') },
  { src: srcOf('swiper-js') },
  { src: srcOf('imagesloaded-js') },
  { src: srcOf('elementor-pro-webpack-runtime-js') },
  { src: srcOf('wp-hooks-js') },
  { src: srcOf('wp-i18n-js') },
  { code: codeOf('wp-i18n-js-after'), name: 'wp-i18n-js-after' },
  { code: codeOf('elementor-pro-frontend-js-before'), name: 'elementor-pro-frontend-js-before' },
  { src: srcOf('elementor-pro-frontend-js') },
  { src: srcOf('pro-elements-handlers-js') },
  { src: srcOf('elementor-dialog-js') },
  { src: srcOf('vamtam-elementor-frontend-js') },
];

for (const step of SEQUENCE) {
  if (step.src == null && step.code == null) throw new Error('Missing script in sequence');
}

const stripSourceUrl = (code) => code.replace(/\n?\/\/# sourceURL=.*$/, '').trim();

fs.mkdirSync(path.join(OUT, 'legacy'), { recursive: true });
fs.writeFileSync(
  path.join(OUT, 'legacy', 'runtime-manifest.js'),
  `/**
 * Generated by tools/convert.mjs - do not edit by hand.
 *
 * The scripts the original WordPress page loaded, in dependency order.
 * \`src\` entries are files under public/, \`code\` entries are the inline
 * configuration blocks WordPress printed between them.
 */
export const LEGACY_RUNTIME = [
${SEQUENCE.map((s) =>
  s.src
    ? `  { src: ${str(s.src)} },`
    : `  { name: ${str(s.name)}, code: ${str(stripSourceUrl(s.code))} },`,
).join('\n')}
];
`,
  'utf8',
);

console.log('Generated:');
console.log('  index.html');
console.log('  src/legacy/runtime-manifest.js');
console.log('  src/App.jsx');
console.log('  src/components/SiteHeader.jsx');
console.log('  src/components/SiteFooter.jsx');
console.log('  src/components/ScrollToTop.jsx');
SECTIONS.forEach(([, n]) => console.log(`  src/components/sections/${n}.jsx`));
