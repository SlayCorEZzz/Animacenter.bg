import { contacts } from '../content/site.js';
import Crumbs from '../components/Crumbs.jsx';
import LocationMap from '../components/LocationMap.jsx';
import { IconClock, IconMail, IconPhone, IconPin } from '../components/Icons.jsx';

/**
 * Контакти по заданието (по примера на molekula.bg/kontakti): адрес,
 * телефон, работно време и голяма карта до тях.
 */
export default function ContactsPage() {
  return (
    <section className="anima-section anima-contacts">
      <div className="anima-wrap">
        <Crumbs label="Контакти" />
        <header className="anima-section__head">
          <p className="anima-eyebrow">Контакти</p>
          <h1 className="anima-section__title">Контакти</h1>
        </header>

        <figure className="anima-contacts__welcome">
          <picture>
            <source media="(max-width: 700px)" type="image/webp" srcSet="/media/vhod-2@600.webp 600w, /media/vhod-2.webp 900w" sizes="92vw" />
            <source media="(max-width: 700px)" srcSet="/media/vhod-2@600.jpg 600w, /media/vhod-2.jpg 900w" sizes="92vw" />
            <source type="image/webp" srcSet="/media/vhod@600.webp 600w, /media/vhod.webp 1200w" sizes="(max-width: 1280px) 92vw, 1200px" />
            <img
              src="/media/vhod.jpg"
              srcSet="/media/vhod@600.jpg 600w, /media/vhod.jpg 1200w"
              sizes="(max-width: 1280px) 92vw, 1200px"
              alt="Входът на Анима на ул. „Лавеле“ 11 в центъра на София"
              width="1200"
              height="900"
            />
          </picture>
          <figcaption>Мястото, където сте добре дошли – ул. „Лавеле“ 11, София</figcaption>
        </figure>

        <div className="anima-contacts__grid">
          <div className="anima-contacts__card">
            <ul className="anima-contacts__list">
              <li>
                <IconPin />
                <div>
                  <span className="anima-contacts__label">Адрес</span>
                  <a href={contacts.mapsLink} target="_blank" rel="noopener noreferrer">
                    гр. София, {contacts.street}
                  </a>
                  <span className="anima-contacts__muted">{contacts.landmark}</span>
                </div>
              </li>
              <li>
                <IconPhone />
                <div>
                  <span className="anima-contacts__label">Телефон</span>
                  <a href={contacts.phoneHref}>{contacts.phone}</a>
                </div>
              </li>
              <li>
                <IconMail />
                <div>
                  <span className="anima-contacts__label">Имейл</span>
                  <a href={contacts.emailHref}>{contacts.email}</a>
                </div>
              </li>
            </ul>

            <div className="anima-contacts__hours">
              <h2>
                <IconClock /> Работно време
              </h2>
              <dl>
                <div>
                  <dt>Вторник – Неделя</dt>
                  <dd>10:00 – 20:00 часа</dd>
                </div>
                <div>
                  <dt>Понеделник</dt>
                  <dd>почивен ден</dd>
                </div>
              </dl>
            </div>

            <div className="anima-contacts__actions">
              <button type="button" className="anima-btn anima-btn--accent" data-book>
                <IconPhone />
                Запази час
              </button>
              <a className="anima-btn anima-btn--ghost" href={contacts.directionsLink} target="_blank" rel="noopener noreferrer">
                Упъти ме
              </a>
            </div>
          </div>

          <div className="anima-contacts__map">
            <LocationMap className="anima-gmap--contacts" />
          </div>
        </div>
      </div>
    </section>
  );
}
