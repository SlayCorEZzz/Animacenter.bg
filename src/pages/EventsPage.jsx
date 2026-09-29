import { offers } from '../content/site.js';
import Crumbs from '../components/Crumbs.jsx';

/* „Събития – Школа по масажи“ от заданието: курсът по масаж. */
const school = offers.find((o) => o.tag.includes('Школа'));

export default function EventsPage() {
  return (
    <section className="anima-section anima-events">
      <div className="anima-wrap">
        <Crumbs label="Събития" />
        <header className="anima-section__head">
          <p className="anima-eyebrow">Събития</p>
          <h1 className="anima-section__title">Школа по масажи</h1>
        </header>

        <article className="anima-event">
          <div className="anima-event__media">
            <picture>
              <source type="image/webp" srcSet="/media/zona-sabitia@600.webp 600w, /media/zona-sabitia.webp 1200w" sizes="(max-width: 900px) 92vw, 50vw" />
              <img
                src="/media/zona-sabitia.jpg"
                srcSet="/media/zona-sabitia@600.jpg 600w, /media/zona-sabitia.jpg 1200w"
                sizes="(max-width: 900px) 92vw, 50vw"
                alt="Зона за събития и обучения в Анима, София"
                width="1200"
                height="900"
              />
            </picture>
          </div>
          <div className="anima-event__body">
            <h2>{school.title}</h2>
            <p>{school.text}</p>
            <button type="button" className="anima-btn anima-btn--accent" data-book={school.book}>
              {school.cta}
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
