import { massages, specializedMassages } from '../content/site.js';
import { massagePath } from '../content/serviceDetails.js';
import Crumbs from '../components/Crumbs.jsx';
import RichBlocks from '../components/RichBlocks.jsx';
import MassagePhoto from '../components/MassagePhoto.jsx';
import { IconPhone } from '../components/Icons.jsx';

const all = [...massages, ...specializedMassages];

/** Страница на един масаж: същият текст като в прозореца, но с адрес за Google. */
export default function MassagePage({ detail }) {
  const price = all.find((m) => m.name === detail.name);
  const group = massages.includes(price) ? massages : specializedMassages;
  const others = group.filter((m) => m.name !== detail.name);

  return (
    <>
      <article className="anima-section anima-article anima-massage-page">
        <div className="anima-wrap anima-article__wrap">
          <nav className="anima-crumbs" aria-label="Пътечка">
            <a href="/">Начало</a>
            <span aria-hidden="true">/</span>
            <a href="/uslugi">Услуги</a>
            <span aria-hidden="true">/</span>
            <a href="/uslugi/masazhi">Масажи</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{detail.name}</span>
          </nav>

          <header className="anima-article__head">
            <p className="anima-eyebrow">Масаж в София</p>
            <h1 className="anima-section__title">{detail.title}</h1>
            {price && (
              <ul className="anima-detail__prices">
                {price.variants.map(([minutes, value]) => (
                  <li key={minutes}>
                    <span>{minutes} мин</span>
                    <strong>{value} €</strong>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <MassagePhoto name={detail.name} eager className="anima-article__photo" sizes="(max-width: 900px) 92vw, 860px" />

          <RichBlocks blocks={detail.blocks} className="anima-article__body" />

          <ul className="anima-detail__facts">
            {detail.facts.map((f) => (
              <li key={f.k}>
                <span aria-hidden="true">◇</span>
                <span>
                  <strong>{f.k}:</strong> {f.v}
                </span>
              </li>
            ))}
          </ul>

          <footer className="anima-article__cta">
            <p>{detail.cta.title}</p>
            {detail.cta.text && <p className="anima-detail__cta-text">{detail.cta.text}</p>}
            <div className="anima-article__actions">
              <button type="button" className="anima-btn anima-btn--accent" data-book={detail.name}>
                <IconPhone />
                {detail.cta.button ?? 'Запази час'}
              </button>
              <a className="anima-btn anima-btn--ghost" href="/cenorazpis">
                Ценоразпис
              </a>
            </div>
          </footer>
        </div>
      </article>

      <section className="anima-section anima-blog anima-blog--more">
        <div className="anima-wrap">
          <header className="anima-section__head">
            <p className="anima-eyebrow">Масажи</p>
            <h2 className="anima-section__title">Други масажи</h2>
          </header>
          <ul className="anima-category__others">
            {others.map((m) => (
              <li key={m.name}>
                <a href={massagePath(m.name)}>{m.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
