import { offers } from '../../content/site.js';

/**
 * Двете допълнителни предложения на центъра: офис масаж за фирми и базовия
 * курс по масаж. Заменя блог секциите от темплейта, за които няма съдържание.
 */
export default function OffersSection() {
  return (
    <section className="anima-section anima-offers" id="oferti">
      <div className="anima-wrap">
        <header className="anima-section__head">
          <p className="anima-eyebrow">Още от ANIMA</p>
          <h2 className="anima-section__title">Не само в салона</h2>
        </header>

        <div className="anima-offers__grid">
          {offers.map((offer) => (
            <article className="anima-offer" key={offer.title}>
              <div className="anima-offer__media">
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`${offer.image}@700.webp 700w, ${offer.image}.webp 1000w`}
                    sizes="(max-width: 900px) 92vw, 46vw"
                  />
                  <img
                    src={`${offer.image}.jpg`}
                    srcSet={`${offer.image}@700.jpg 700w, ${offer.image}.jpg 1000w`}
                    sizes="(max-width: 900px) 92vw, 46vw"
                    alt={offer.title}
                    loading="lazy"
                    decoding="async"
                    width="1000"
                    height="750"
                  />
                </picture>
                <span className="anima-offer__tag">{offer.tag}</span>
              </div>
              <div className="anima-offer__body">
                <h3>{offer.title}</h3>
                <p>{offer.text}</p>
                <button type="button" className="anima-btn anima-btn--ghost" data-book>
                  {offer.cta}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
