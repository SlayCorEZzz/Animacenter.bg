import { useId, useState } from 'react';
import { contacts, faceTreatments, massages } from '../../content/site.js';
import { IconPhone } from '../Icons.jsx';

const TABS = [
  { id: 'masazhi', label: 'Масажи', items: massages },
  { id: 'lice', label: 'Процедури за лице', items: faceTreatments },
];

/**
 * Пълната ценова листа.
 *
 * Всяка услуга показва вариантите си един под друг („60 мин · 58 €“) вместо
 * два успоредни реда с времена и цени, които читателят трябва да съчетава сам.
 */
export default function PriceListSection() {
  const [active, setActive] = useState(TABS[0].id);
  const uid = useId();
  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section className="anima-section anima-prices" id="ceni">
      <div className="anima-wrap">
        <header className="anima-section__head">
          <p className="anima-eyebrow">Ценова листа</p>
          <h2 className="anima-section__title">Ясни цени, без изненади</h2>
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
              </div>

              <ul className="anima-price__variants">
                {item.variants.map(([minutes, price]) => (
                  <li key={minutes}>
                    <span className="anima-price__time">{minutes} мин</span>
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
