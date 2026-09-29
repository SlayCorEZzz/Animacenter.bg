/**
 * Всички страници на сайта на едно място: адрес, съдържание и SEO данни
 * (заглавие, описание, ключови думи, пътечка, структурирани данни).
 *
 * Ползва се от браузъра (SubPage.jsx) и от билда (tools/prerender.mjs),
 * който прави готов HTML за всяка страница, с текста и мета таговете вътре,
 * и sitemap.xml за търсачките.
 */
import { contacts, massages, specializedMassages, therapist } from './content/site.js';
import { serviceCategories, categoryBySlug } from './content/services.js';
import { detailsBySlug, serviceDetails, massagePath, massageImage } from './content/serviceDetails.js';
import { posts, postBySlug } from './content/blog.js';
import VouchersSection from './components/sections/VouchersSection.jsx';
import PriceListSection from './components/sections/PriceListSection.jsx';
import BlogList from './pages/BlogList.jsx';
import BlogPost from './pages/BlogPost.jsx';
import EventsPage from './pages/EventsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import ContactsPage from './pages/ContactsPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import MassagesPage from './pages/MassagesPage.jsx';
import MassagePage from './pages/MassagePage.jsx';

export const SITE_URL = 'https://animacenter.bg';
const BRAND = 'Анима';
const DEFAULT_IMAGE = '/media/vhod.jpg';

/* Думите, с които хората от София търсят такъв център. Мета тагът за ключови
   думи Google не чете, но други търсачки го ползват; истинската тежест е в
   заглавията, описанията и текста на страниците. */
const BASE_KEYWORDS = [
  'масаж София',
  'масажи София център',
  'масажен център София',
  'масажен салон София',
  'масаж Сердика',
  'масаж ул. Лавеле',
  'Анима',
  'ANIMA Center',
];

const allMassages = [...massages, ...specializedMassages];
const priceOf = (name) => allMassages.find((m) => m.name === name);
const minutesText = (m) => m.variants.map(([min]) => min).join('/');
const fromPrice = (m) => Math.min(...m.variants.map(([, p]) => p));

/* ------------------------------------------------------------------ */
/*  Структурирани данни (schema.org)                                    */
/* ------------------------------------------------------------------ */

const businessId = `${SITE_URL}/#business`;

export function businessSchema() {
  return {
    '@type': 'HealthAndBeautyBusiness',
    '@id': businessId,
    name: BRAND,
    alternateName: ['ANIMA Center', 'Анима център', 'Anima Center София'],
    description:
      'Анима – център за масажи, кинезитерапия и естетически процедури в сърцето на София, на ул. „Лавеле“ 11, до метростанция „Сердика“.',
    slogan: 'Тялото знае пътя. Ние само му помагаме да го намери.',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/brand/anima-logo-fixed.png`,
    image: [`${SITE_URL}/media/vhod.jpg`, `${SITE_URL}/media/recepcia.jpg`, `${SITE_URL}/media/kabinet-1.jpg`],
    telephone: '+359897700766',
    email: contacts.email,
    priceRange: '25 € – 73 €',
    currenciesAccepted: 'EUR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. „Лавеле“ 11',
      addressLocality: 'София',
      addressRegion: 'София-град',
      postalCode: '1000',
      addressCountry: 'BG',
    },
    hasMap: contacts.mapsLink,
    areaServed: { '@type': 'City', name: 'София' },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    sameAs: [contacts.facebook, contacts.instagram.split('?')[0]],
    employee: { '@type': 'Person', name: therapist.name, jobTitle: therapist.role },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Масажи',
      itemListElement: allMassages.map((m) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: m.name, url: `${SITE_URL}${massagePath(m.name)}` },
        price: fromPrice(m),
        priceCurrency: 'EUR',
      })),
    },
  };
}

function breadcrumbSchema(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Начало', path: '/' }, ...crumbs].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

function serviceSchema({ name, description, path, offers }) {
  return {
    '@type': 'Service',
    name,
    serviceType: name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { '@id': businessId },
    areaServed: { '@type': 'City', name: 'София' },
    ...(offers?.length
      ? {
          offers: offers.map((o) => ({
            '@type': 'Offer',
            price: o.price,
            priceCurrency: 'EUR',
            ...(o.label ? { name: o.label } : {}),
          })),
        }
      : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  Страниците                                                          */
/* ------------------------------------------------------------------ */

const notFound = {
  title: `Страницата не е намерена | ${BRAND}`,
  description: 'Тази страница не съществува.',
  noindex: true,
  body: (
    <section className="anima-section anima-notfound">
      <div className="anima-wrap">
        <p className="anima-eyebrow">404</p>
        <h1 className="anima-section__title">Тази страница не съществува</h1>
        <p className="anima-section__lead">Може адресът да е сгрешен или страницата да е преместена.</p>
        <a className="anima-btn anima-btn--accent" href="/">
          Към началото
        </a>
      </div>
    </section>
  ),
};

/** Всичко за даден адрес: SEO данни + съдържание (body). */
export function resolveRoute(path) {
  if (path === '/') {
    return {
      title: 'Масаж в центъра на София | Анима – масажи, кинезитерапия и козметика',
      description:
        'Анима – център за масажи, кинезитерапия и естетически процедури на ул. „Лавеле“ 11, до метро „Сердика“, София. Класически, лечебен и релаксиращ масаж, консултации, козметика. Тел. 089 770 0766.',
      keywords: ['масаж център София', 'кинезитерапия София', 'козметика София', 'лечебен масаж София', 'подаръчен ваучер масаж'],
      schema: [
        businessSchema(),
        { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: BRAND, alternateName: 'ANIMA Center', inLanguage: 'bg' },
      ],
    };
  }

  if (path === '/uslugi') {
    return {
      title: `Услуги – масаж, кинезитерапия, козметика в София | ${BRAND}`,
      description:
        'Всички услуги на Анима в центъра на София: масажи, консултации с функционална оценка, кинезитерапия, мануална терапия, вендузи, апаратен лимфодренаж, TENS, козметика и маникюр.',
      keywords: serviceCategories.map((c) => `${c.name} София`),
      crumbs: [{ name: 'Услуги', path }],
      body: <ServicesPage />,
    };
  }

  if (path === '/uslugi/masazhi') {
    const c = categoryBySlug.masazhi;
    return {
      title: `${c.seo.title} | ${BRAND}`,
      description: c.seo.description,
      keywords: c.seo.keywords.split(', '),
      image: `${c.image}.jpg`,
      crumbs: [
        { name: 'Услуги', path: '/uslugi' },
        { name: c.name, path },
      ],
      extraSchema: [serviceSchema({ name: 'Масаж', description: c.seo.description, path })],
      body: <MassagesPage />,
    };
  }

  const massage = /^\/uslugi\/masazhi\/[a-z0-9-]+$/.test(path) && detailsBySlug[path.split('/')[3]];
  if (massage) {
    const p = priceOf(massage.name);
    const intro = massage.blocks.find((b) => b.type === 'p')?.text.replace(/\*\*/g, '') ?? '';
    const description = `${massage.name} в центъра на София${p ? `: ${minutesText(p)} мин, от ${fromPrice(p)} €` : ''}. ${intro}`.slice(0, 300);
    return {
      title: `${massage.name} в София${p ? ` – от ${fromPrice(p)} €` : ''} | ${BRAND}`,
      description,
      keywords: [`${massage.name.toLowerCase()} София`, `${massage.name.toLowerCase()} цена`, `${massage.name.toLowerCase()} център София`],
      crumbs: [
        { name: 'Услуги', path: '/uslugi' },
        { name: 'Масажи', path: '/uslugi/masazhi' },
        { name: massage.name, path },
      ],
      ogType: 'article',
      image: `${massageImage(massage.name)}.jpg`,
      extraSchema: [
        serviceSchema({
          name: massage.name,
          description: intro,
          path,
          offers: p?.variants.map(([min, price]) => ({ price, label: `${min} мин` })),
        }),
      ],
      body: <MassagePage detail={massage} />,
    };
  }

  const parts = path.split('/');
  const category = parts.length === 3 && parts[1] === 'uslugi' && categoryBySlug[parts[2]];
  if (category && category.slug !== 'masazhi') {
    return {
      title: `${category.seo.title} | ${BRAND}`,
      description: category.seo.description,
      keywords: category.seo.keywords.split(', '),
      image: `${category.image}.jpg`,
      crumbs: [
        { name: 'Услуги', path: '/uslugi' },
        { name: category.name, path },
      ],
      extraSchema: [
        serviceSchema({
          name: category.name,
          description: category.seo.description,
          path,
          offers: category.items?.filter((i) => i.price).map((i) => ({ price: i.price, label: i.name })),
        }),
      ],
      body: <CategoryPage category={category} />,
    };
  }

  if (path === '/cenorazpis') {
    return {
      title: `Ценоразпис – цени на масажи в София | ${BRAND}`,
      description:
        'Цени на масажите в Анима, София: класически масаж от 52 €, релаксиращ от 47 €, лечебен от 54 €, дълбокотъканен 69 €, специализирани масажи, консултации и процедури за лице.',
      keywords: ['цени масаж София', 'масаж цена', 'ценоразпис масаж', 'колко струва масаж София'],
      crumbs: [{ name: 'Ценоразпис', path }],
      body: <PriceListSection standalone />,
    };
  }

  if (path === '/vaucheri') {
    return {
      title: `Подаръчен ваучер за масаж в София | ${BRAND}`,
      description:
        'Подари нещо смислено. Подари грижа. Подаръчен ваучер за масаж в София – за конкретна процедура или за стойност по избор, в подаръчен плик или PDF по имейл.',
      keywords: ['ваучер за масаж', 'подаръчен ваучер масаж София', 'подарък масаж', 'ваучер масаж София'],
      image: '/media/kafe.jpg',
      crumbs: [{ name: 'Ваучери', path }],
      body: <VouchersSection standalone />,
    };
  }

  if (path === '/sabitia') {
    return {
      title: `Школа по масажи в София – курс по масаж | ${BRAND}`,
      description:
        'Школа по масажи в Анима, София: базов модул по масаж с 80 часа практика и теория, в група до 8 души, със сертификат за правоспособност. Събота и неделя.',
      keywords: ['курс по масаж София', 'школа по масажи', 'обучение масаж София', 'масажист курс'],
      image: '/media/zona-sabitia.jpg',
      crumbs: [{ name: 'Събития', path }],
      extraSchema: [
        {
          '@type': 'Course',
          name: 'Базов модул по масаж',
          description: 'Интензивен курс с 80 часа практика и теория, в група до 8 души, със сертификат за правоспособност.',
          provider: { '@id': businessId },
          inLanguage: 'bg',
        },
      ],
      body: <EventsPage />,
    };
  }

  if (path === '/blog') {
    return {
      title: `Блог – съвети за масажа и здравето | ${BRAND}`,
      description: 'Съвети за масажа, възстановяването и грижата за тялото от екипа на Анима, масажен център в София.',
      keywords: ['масаж съвети', 'видове масаж', 'блог масаж'],
      crumbs: [{ name: 'Блог', path }],
      body: <BlogList />,
    };
  }

  const post = parts.length === 3 && parts[1] === 'blog' && postBySlug[parts[2]];
  if (post) {
    return {
      title: `${post.title} | ${BRAND}`,
      description: post.excerpt,
      keywords: [post.tag.toLowerCase(), 'масаж София'],
      image: post.image,
      ogType: 'article',
      crumbs: [
        { name: 'Блог', path: '/blog' },
        { name: post.title, path },
      ],
      extraSchema: [
        {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: `${SITE_URL}${post.image}`,
          datePublished: post.date.split('/').reverse().join('-'),
          inLanguage: 'bg',
          mainEntityOfPage: `${SITE_URL}${path}`,
          author: { '@id': businessId },
          publisher: { '@id': businessId },
        },
      ],
      body: <BlogPost post={post} />,
    };
  }

  if (path === '/ekip') {
    return {
      title: `Екип – кинезитерапевти и масажисти в София | ${BRAND}`,
      description:
        'Екипът на Анима: професионална грижа, съобразена с нуждите на Вашето тяло, с внимание към детайла и индивидуален подход. д-р Теодора Цолова, магистър кинезитерапевт.',
      keywords: ['кинезитерапевт София', 'масажист София', 'Теодора Цолова'],
      image: `${therapist.photo}.jpg`,
      crumbs: [{ name: 'Екип', path }],
      body: <TeamPage />,
    };
  }

  if (path === '/kontakti') {
    return {
      title: `Контакти – ул. „Лавеле“ 11, София | ${BRAND}`,
      description:
        'Анима, гр. София, ул. „Лавеле“ 11, до метростанция „Сердика“. Тел. +359 89 770 0766. Работно време: вторник – неделя 10:00 – 20:00, понеделник почивен ден.',
      keywords: ['масаж Лавеле', 'масаж Сердика', 'масаж център София адрес'],
      crumbs: [{ name: 'Контакти', path }],
      footerContact: false,
      body: <ContactsPage />,
    };
  }

  return notFound;
}

/** Всички адреси за готовия HTML и за sitemap.xml. */
export function allPaths() {
  return [
    '/',
    '/uslugi',
    ...serviceCategories.map((c) => `/uslugi/${c.slug}`),
    ...serviceDetails.map((d) => massagePath(d.name)),
    '/cenorazpis',
    '/vaucheri',
    '/sabitia',
    '/blog',
    ...posts.map((p) => `/blog/${p.slug}`),
    '/ekip',
    '/kontakti',
  ];
}

/* ------------------------------------------------------------------ */
/*  Мета таговете в <head>                                              */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Готовият HTML за <head> на дадена страница (ползва го билдът). */
export function headHtml(path, route = resolveRoute(path)) {
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
  const image = `${SITE_URL}${route.image ?? DEFAULT_IMAGE}`;
  const keywords = [...(route.keywords ?? []), ...BASE_KEYWORDS].join(', ');

  const graph = route.schema ?? [
    businessSchema(),
    ...(route.crumbs ? [breadcrumbSchema(route.crumbs)] : []),
    ...(route.extraSchema ?? []),
  ];
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');

  return [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}">`,
    `<meta name="keywords" content="${esc(keywords)}">`,
    `<meta name="robots" content="${route.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">`,
    route.noindex ? '' : `<link rel="canonical" href="${url}">`,
    `<meta name="geo.region" content="BG-22">`,
    `<meta name="geo.placename" content="София">`,
    `<meta property="og:locale" content="bg_BG">`,
    `<meta property="og:site_name" content="${BRAND}">`,
    `<meta property="og:type" content="${route.ogType ?? 'website'}">`,
    `<meta property="og:title" content="${esc(route.title)}">`,
    `<meta property="og:description" content="${esc(route.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(route.title)}">`,
    `<meta name="twitter:description" content="${esc(route.description)}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ]
    .filter(Boolean)
    .join('\n');
}
