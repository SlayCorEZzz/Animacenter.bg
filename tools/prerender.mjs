/**
 * Готов HTML за всяка страница (пуска се от `npm run build`).
 *
 * Сайтът се рисува от React в браузъра. Без тази стъпка търсачката получава
 * празна страница с едно общо заглавие. Тук за всеки адрес от routes.jsx:
 *   - текстът на страницата влиза в <div id="root">
 *   - в <head> влизат заглавие, описание, ключови думи, canonical, Open Graph
 *     и структурирани данни (schema.org) за тази страница
 * После браузърът зарежда React както досега и страницата работи нормално.
 *
 * Прави и sitemap.xml и robots.txt.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = path.resolve('dist');
const SSR = path.resolve('dist-ssr/entry-server.js');

const { render, allPaths, SITE_URL } = await import(pathToFileURL(SSR).href);
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

if (!/<!--seo-->[\s\S]*<!--\/seo-->/.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error('index.html няма <!--seo--> блок или празен <div id="root">');
}

function page(route) {
  const { html, head } = render(route);
  return template
    .replace(/<!--seo-->[\s\S]*<!--\/seo-->/, head)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
}

/* /  -> index.html ; /a/b -> a/b.html (Vercel с cleanUrls го сервира като /a/b) */
const fileFor = (route) => (route === '/' ? 'index.html' : `${route.slice(1)}.html`);

const paths = allPaths();
for (const route of paths) {
  const out = path.join(DIST, fileFor(route));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page(route));
}
fs.writeFileSync(path.join(DIST, '404.html'), page('/404'));

const today = new Date().toISOString().slice(0, 10);
const priority = (r) => (r === '/' ? '1.0' : r.split('/').length === 2 ? '0.8' : '0.6');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((r) => `  <url><loc>${SITE_URL}${r}</loc><lastmod>${today}</lastmod><priority>${priority(r)}</priority></url>`)
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true });
console.log(`готов HTML за ${paths.length} страници + 404, sitemap.xml, robots.txt`);
