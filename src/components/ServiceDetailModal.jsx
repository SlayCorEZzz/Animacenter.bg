import { useCallback, useEffect, useState } from 'react';
import { massages, specializedMassages } from '../content/site.js';
import { detailsByName } from '../content/serviceDetails.js';
import { useBooking } from './BookingModal.jsx';
import { IconPhone } from './Icons.jsx';
import RichBlocks from './RichBlocks.jsx';
import MassagePhoto from './MassagePhoto.jsx';
import Modal from './Modal.jsx';

const priced = Object.fromEntries([...massages, ...specializedMassages].map((m) => [m.name, m]));

/**
 * Пълното описание на масаж от заданието.
 *
 * Отваря се с клик върху всеки елемент с `data-service="Име на масажа"`:
 * картите на услугите и редовете в ценовата листа. Така секциите остават
 * същите, а дългият текст е на един клик разстояние.
 */
export function ServiceDetailProvider({ children }) {
  const [name, setName] = useState('');
  const openBooking = useBooking();
  const close = useCallback(() => setName(''), []);

  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest?.('[data-service]');
      if (!el || el.closest('.anima-modal')) return;
      const target = el.getAttribute('data-service');
      if (!detailsByName[target]) return;
      if (e.metaKey || e.ctrlKey || e.button === 1) return;
      e.preventDefault();
      setName(target);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const detail = detailsByName[name];
  const price = priced[name];

  const book = () => {
    close();
    // Прозорецът за записване се отваря, след като този се е затворил,
    // за да не се бият двата за фокуса и заключването на скрола.
    const service = detail.name;
    requestAnimationFrame(() => openBooking(service));
  };

  return (
    <>
      {children}
      <Modal open={Boolean(detail)} onClose={close} label={detail?.name ?? 'Услуга'} className="anima-detail">
        {detail && (
          <article>
            <MassagePhoto name={detail.name} eager className="anima-detail__photo" sizes="(max-width: 760px) 92vw, 700px" />
            <header className="anima-detail__head">
              <p className="anima-eyebrow">Услуги</p>
              <h2>{detail.title}</h2>
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

            <RichBlocks blocks={detail.blocks} className="anima-detail__body" />

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

            <footer className="anima-detail__cta">
              <p className="anima-detail__cta-title">{detail.cta.title}</p>
              {detail.cta.text && <p className="anima-detail__cta-text">{detail.cta.text}</p>}
              <button type="button" className="anima-btn anima-btn--accent" onClick={book}>
                <IconPhone />
                {detail.cta.button ?? 'Запази час'}
              </button>
            </footer>
          </article>
        )}
      </Modal>
    </>
  );
}
