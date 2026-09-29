import { useEffect } from 'react';
import { BookingProvider } from './components/BookingModal.jsx';
import { ServiceDetailProvider } from './components/ServiceDetailModal.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import { resolveRoute } from './routes.jsx';

/**
 * Отделна страница със същия хедър и футър като началната.
 * Съдържанието и SEO данните идват от routes.jsx.
 */
export default function SubPage({ path }) {
  const page = resolveRoute(path);

  // В готовия HTML таговете вече са попълнени; това е за режима на разработка.
  useEffect(() => {
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
  }, [page.title, page.description]);

  return (
    <BookingProvider>
      <ServiceDetailProvider>
        <SiteHeader solid />
        <main className="anima-page">{page.body}</main>
        <SiteFooter withContact={page.footerContact !== false} />
      </ServiceDetailProvider>
    </BookingProvider>
  );
}
