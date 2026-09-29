import { useId, useState } from 'react';
import { contacts, faceTreatments, massages, specializedMassages } from '../../content/site.js';
import { detailsByName, massagePath } from '../../content/serviceDetails.js';
import { categoryBySlug } from '../../content/services.js';
import { IconPhone } from '../Icons.jsx';
import Crumbs from '../Crumbs.jsx';

/* Консултациите с цена, от страницата на услугата (без продължителност). */
const consultations = categoryBySlug.konsultacii.items
  .filter((it) => it.price)
  .map((it) => ({ name: it.name, text: 'Консултация с функционална оценка.', variants: [[null, it.price]] }));

/** Името, с което прозорецът „Запази час“ се отваря за даден ред. */
const bookValue = (tabId, item) =>
  tabId === 'konsultacii' ? `Консултация: ${item.name}` : tabId === 'lice' ? `Козметика: ${item.name}` : item.name;

const TABS = [
  { id: 'masazhi', label: 'Масажи', items: massages },
  { id: 'specializirani', label: 'Специализирани масажи', items: specializedMassages },
  { id: 'konsultacii', label: 'Консултации', items: consultations },
  { id: 'lice', label: 'Процедури за лице', items: faceTreatments },
];

/**
 * Пълната ценова листа.
 *
 * Всяка услуга показва вариантите си един под друг („60 мин · 58 €“) вместо
 * два успоредни реда с времена и цени, които читателят трябва да съчетава сам.
 */
export default function PriceListSection({ standalone = false }) {
  const [active, setActive] = useState(TABS[0].id);
  const uid = useId();
  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section className="anima-section anima-prices" id="ceni">
      <div className="anima-wrap">
        {standalone && <Crumbs label="Ценоразпис" />}
        <header className="anima-section__head">
          <p className="anima-eyebrow">Ценова листа</p>
          {standalone ? (
            <h1 className="anima-section__title">Ценоразпис</h1>
          ) : (
            <h2 className="anima-section__title">Ясни цени, без изненади</h2>
          )}
          <p className="anima-section__lead">
            Цената зависи само от продължителността на процедурата и включва консултация преди
            началото ѝ. Часовете се запазват предварително.
          </p>
        </header>

        <div className="anima-tabs" role="tablist" aria-label="Групи услуги">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`${uid}-tab-${tab.id}`}
              type="button"
              role="tab"
              className={`anima-tabs__btn${active === tab.id ? ' is-active' : ''}`}
              aria-selected={active === tab.id}
              aria-controls={`${uid}-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ul
          className="anima-pricelist"
          id={`${uid}-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${current.id}`}
        >
          {current.items.map((item) => (
            <li className="anima-price" key={item.name}>
              <div className="anima-price__main">
                <h3 className="anima-price__name">{item.name}</h3>
                <p className="anima-price__text">{item.text}</p>
                <div className="anima-price__links">
                  {detailsByName[item.name] && (
                    <a className="anima-price__more" href={massagePath(item.name)} data-service={item.name}>
                      Прочети повече
                      <span aria-hidden="true">→</span>
                    </a>
                  )}
                  <button type="button" className="anima-price__book" data-book={bookValue(current.id, item)}>
                    Запази час
                  </button>
                </div>
              </div>

              <ul className="anima-price__variants">
                {item.variants.map(([minutes, price]) => (
                  <li key={minutes ?? 'price'}>
                    <span className="anima-price__time">{minutes ? `${minutes} мин` : 'Цена'}</span>
                    <span className="anima-price__dots" aria-hidden="true" />
                    <span className="anima-price__value">{price} €</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="anima-prices__foot">
          <p>
            Работим с предварително записване и консултация по телефона при нужда. Пакетни и
            корпоративни условия по запитване.
          </p>
          <button type="button" className="anima-btn anima-btn--accent" data-book>
            <IconPhone />
            Запази час
          </button>
        </div>
      </div>
    </section>
  );
}
