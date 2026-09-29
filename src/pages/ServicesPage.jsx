import { serviceCategories } from '../content/services.js';
import Crumbs from '../components/Crumbs.jsx';

/** Всички услуги: карта за всяка категория, води към нейната страница. */
export default function ServicesPage() {
  return (
    <section className="anima-section anima-services-page">
      <div className="anima-wrap">
        <Crumbs label="Услуги" />
        <header className="anima-section__head">
          <p className="anima-eyebrow">Услуги</p>
          <h1 className="anima-section__title">Масаж, кинезитерапия и козметика в центъра на София</h1>
          <p className="anima-section__lead">
            Всичко за здраво и спокойно тяло под един покрив, на ул. „Лавеле“ 11, до метростанция „Сердика“.
          </p>
        </header>

        <ul className="anima-cards">
          {serviceCategories.map((c) => (
            <li key={c.slug}>
              <ServiceCard category={c} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ServiceCard({ category: c }) {
  return (
    <a className="anima-post-card anima-service-card" href={`/uslugi/${c.slug}`}>
      <span className="anima-post-card__media">
        <img src={`${c.image}@600.jpg`} alt={c.name} loading="lazy" decoding="async" width="600" height="450" />
        <span className="anima-post-card__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <span className="anima-post-card__body">
        <span className="anima-post-card__title">{c.name}</span>
        <span className="anima-post-card__excerpt">{c.short}</span>
        <span className="anima-post-card__more">Виж повече</span>
      </span>
    </a>
  );
}
