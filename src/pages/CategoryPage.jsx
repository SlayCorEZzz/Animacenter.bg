import { serviceCategories } from '../content/services.js';
import { bookingValue } from '../content/booking.js';
import Crumbs from '../components/Crumbs.jsx';
import { IconPhone } from '../components/Icons.jsx';

/**
 * Страница на една услуга: снимка, описание, подуслугите (всяка със
 * „Запази час“ или, при козметиката, един общ бутон) и другите услуги.
 */
export default function CategoryPage({ category: c }) {
  const others = serviceCategories.filter((x) => x.slug !== c.slug);

  return (
    <>
      <section className="anima-section anima-category">
        <div className="anima-wrap">
          <Crumbs label={c.name} parent={{ label: 'Услуги', href: '/uslugi' }} />

          <div className="anima-category__grid">
            <div className="anima-category__media">
              <picture>
                <source type="image/webp" srcSet={`${c.image}@600.webp 600w, ${c.image}.webp ${c.w}w`} sizes="(max-width: 900px) 92vw, 40vw" />
                <img
                  src={`${c.image}.jpg`}
                  srcSet={`${c.image}@600.jpg 600w, ${c.image}.jpg ${c.w}w`}
                  sizes="(max-width: 900px) 92vw, 40vw"
                  alt={`${c.name} в Анима, София`}
                  width={c.w}
                  height={c.w > 1000 ? 900 : 1200}
                />
              </picture>
            </div>

            <div className="anima-category__body">
              <p className="anima-eyebrow">Услуги</p>
              <h1 className="anima-section__title">{c.name}</h1>
              {c.intro?.map((p) => (
                <p key={p} className="anima-category__intro">
                  {p}
                </p>
              ))}

              {c.items && !c.singleBooking && (
                <ul className="anima-category__items">
                  {c.items.map((it) => (
                    <li key={it.name}>
                      <div>
                        <h2>{it.name}</h2>
                        {it.note && <p>{it.note}</p>}
                      </div>
                      <div className="anima-category__item-end">
                        {it.price && <strong>{it.price} €</strong>}
                        <button type="button" className="anima-btn anima-btn--accent" data-book={bookingValue(c, it)}>
                          Запази час
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {c.items && c.singleBooking && (
                <ul className="anima-category__list">
                  {c.items.map((it) => (
                    <li key={it.name}>{it.name}</li>
                  ))}
                </ul>
              )}

              {(!c.items || c.singleBooking) && (
                <button type="button" className="anima-btn anima-btn--accent anima-category__book" data-book={bookingValue(c)}>
                  <IconPhone />
                  Запази час
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="anima-section anima-blog anima-blog--more">
        <div className="anima-wrap">
          <header className="anima-section__head">
            <p className="anima-eyebrow">Услуги</p>
            <h2 className="anima-section__title">Още услуги</h2>
          </header>
          <ul className="anima-category__others">
            {others.map((o) => (
              <li key={o.slug}>
                <a href={`/uslugi/${o.slug}`}>{o.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
