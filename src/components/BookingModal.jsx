import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { contacts } from '../content/site.js';
import { IconCalendar, IconClock, IconPhone } from './Icons.jsx';
import Modal from './Modal.jsx';

const BookingContext = createContext(() => {});

/** Отваря прозореца „Запази час“ отвсякъде в сайта: useBooking()(). */
export const useBooking = () => useContext(BookingContext);

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openBooking = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  /**
   * Всеки елемент с data-book отваря прозореца. Прихващат се и старите бутони
   * на темплейта (a.elementor-button с tel:), но не и обикновените телефонни
   * номера: те звънят направо.
   */
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest?.('a.elementor-button[href^="tel:"], [data-book]');
      if (!el || el.closest('.anima-modal')) return;
      if (e.metaKey || e.ctrlKey || e.button === 1) return;
      e.preventDefault();
      openBooking();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [openBooking]);

  const value = useMemo(() => openBooking, [openBooking]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={close} label="Запази час" className="anima-book">
        {open && <BookingChoices />}
      </Modal>
    </BookingContext.Provider>
  );
}

/**
 * Два бутона: онлайн резервация и обаждане.
 *
 * Адресът на системата за резервации се слага на едно място:
 * src/content/site.js -> contacts.bookingUrl. Докато е празен, бутонът
 * стои, но при натискане казва, че онлайн резервациите предстоят.
 */
function BookingChoices() {
  const [soon, setSoon] = useState(false);
  const url = contacts.bookingUrl;

  const online = (
    <>
      <span className="anima-book__icon">
        <IconCalendar />
      </span>
      <span className="anima-book__body">
        <strong>Онлайн резервация</strong>
        <small>Избери услуга и свободен час</small>
      </span>
    </>
  );

  return (
    <div className="anima-book__simple">
      <div className="anima-book__head">
        <h2>Запази час</h2>
        <p className="anima-book__lead">Как ти е удобно?</p>
      </div>

      <div className="anima-book__choices">
        {url ? (
          <a className="anima-book__card anima-book__card--primary" href={url} target="_blank" rel="noopener noreferrer">
            {online}
          </a>
        ) : (
          <button type="button" className="anima-book__card anima-book__card--primary" onClick={() => setSoon(true)}>
            {online}
          </button>
        )}

        <a className="anima-book__card" href={contacts.phoneHref}>
          <span className="anima-book__icon">
            <IconPhone />
          </span>
          <span className="anima-book__body">
            <strong>Обади се</strong>
            <span className="anima-book__num">{contacts.phone}</span>
          </span>
        </a>
      </div>

      {soon && (
        <p className="anima-book__soon" role="status">
          Онлайн резервациите се включват съвсем скоро. Дотогава се обади и ще запазим час веднага.
        </p>
      )}

      <p className="anima-book__hours">
        <IconClock />
        {contacts.hoursShort}
      </p>
    </div>
  );
}
