/**
 * Рендиране в Node при билда: дава готовия HTML на всяка страница, за да
 * има търсачката текст още в първия отговор. Ползва го tools/prerender.mjs.
 */
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import SubPage from './SubPage.jsx';
import { setServerPath } from './lib/pages.js';
import { allPaths, headHtml, resolveRoute, SITE_URL } from './routes.jsx';

export function render(path) {
  setServerPath(path);
  const html = renderToString(path === '/' ? <App /> : <SubPage path={path} />);
  return { html, head: headHtml(path), noindex: Boolean(resolveRoute(path).noindex) };
}

export { allPaths, SITE_URL };
