import { massages, specializedMassages } from '../content/site.js';
import { detailsByName, massagePath } from '../content/serviceDetails.js';
import Crumbs from '../components/Crumbs.jsx';
import MassagePhoto from '../components/MassagePhoto.jsx';

const groups = [
  { title: 'Масажи', items: massages },
  { title: 'Специализирани масажи', items: specializedMassages },
];

/** Всички масажи с кратко описание и цени; всеки води към своята страница. */
export default function MassagesPage() {
  return (
    <section className="anima-section anima-massages">
      <div className="anima-wrap">
        <Crumbs label="Масажи" parent={{ label: 'Услуги', href: '/uslugi' }} />
        <header className="anima-section__head">
          <p className="anima-eyebrow">Услуги</p>
          <h1 className="anima-section__title">Масажи в центъра на София</h1>
          <p className="anima-section__lead">
            Избери масаж и прочети какво ще усетиш, за кого е подходящ и колко продължава.
          </p>
        </header>

        {groups.map((g) => (
          <div key={g.title} className="anima-massages__group">
            <h2 className="anima-massages__title">{g.title}</h2>
            <ul className="anima-massages__grid">
              {g.items.map((m) => (
                <li key={m.name}>
                  <MassageCard massage={m} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MassageCard({ massage: m }) {
  const href = detailsByName[m.name] ? massagePath(m.name) : null;
  return (
    <article className="anima-massage-card">
      {href ? (
        <a className="anima-massage-card__media" href={href} tabIndex={-1} aria-hidden="true">
          <MassagePhoto name={m.name} sizes="(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 380px" />
        </a>
      ) : (
        <div className="anima-massage-card__media">
          <MassagePhoto name={m.name} sizes="(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 380px" />
        </div>
      )}
      <h3>{href ? <a href={href}>{m.name}</a> : m.name}</h3>
      <p>{m.text}</p>
      <ul className="anima-detail__prices">
        {m.variants.map(([minutes, price]) => (
          <li key={minutes}>
            <span>{minutes} мин</span>
            <strong>{price} €</strong>
          </li>
        ))}
      </ul>
      <div className="anima-massage-card__actions">
        {href && (
          <a className="anima-price__more" href={href}>
            Прочети повече <span aria-hidden="true">→</span>
          </a>
        )}
        <button type="button" className="anima-btn anima-btn--accent" data-book={m.name}>
          Запази час
        </button>
      </div>
    </article>
  );
}
