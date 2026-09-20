import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { contacts } from '../content/site.js';
import { IconCalendar, IconClock, IconPhone, IconPin } from './Icons.jsx';
import Modal from './Modal.jsx';

const BookingContext = createContext(() => {});

/** Хук за отваряне на прозореца за записване отвсякъде в сайта. */
export const useBooking = () => useContext(BookingContext);

/** Viber е най-честият канал за връзка в България. */
const viberHref = `viber://chat?number=${encodeURIComponent(contacts.phone.replace(/\s/g, ''))}`;

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openBooking = useCallback(() => setOpen(true), []);

  /**
   * Бутоните „Запази час“ в секциите идват от разметката на темплейта и са
   * обикновени <a href="tel:…">. Вместо да се пипа всеки от тях, кликът се
   * прихваща тук и отваря избора. Връзките вътре в самия прозорец се
   * пропускат, за да работи истинското обаждане.
   */
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest?.('a[href^="tel:"], [data-book]');
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

      <Modal open={open} onClose={() => setOpen(false)} label="Запазване на час" className="anima-book">
        <div className="anima-book__head">
          <p className="anima-eyebrow">ANIMA Center</p>
          <h2>Запазване на час</h2>
          <p className="anima-book__lead">Изберете как предпочитате да запазите часа си.</p>
        </div>

        <ChoiceView />

        <div className="anima-book__foot">
          <span>
            <IconPin />
            {contacts.street}, {contacts.city}
          </span>
          <span>
            <IconClock />
            {contacts.hoursShort}
          </span>
        </div>
      </Modal>
    </BookingContext.Provider>
  );
}

/**
 * Начините за записване. Онлайн записването стои първо, защото се прави по
 * всяко време и не чака работно време.
 *
 * Тук няма форма: резервациите се приемат от външна платформа, където човек
 * си избира услугата и часа. Адресът й стои в `contacts.bookingUrl`.
 */
function ChoiceView() {
  return (
    <div className="anima-book__choices">
      <OnlineCard />

      <a className="anima-book__card" href={contacts.phoneHref}>
        <span className="anima-book__icon">
          <IconPhone />
        </span>
        <span className="anima-book__body">
          <strong>Обади се сега</strong>
          <span className="anima-book__num">{contacts.phone}</span>
          <small>Потвърждаваме часа веднага, {contacts.hoursShort}</small>
        </span>
      </a>

      <div className="anima-book__alt">
        <span>Или пишете в</span>
        <a href={viberHref}>Viber</a>
        <span aria-hidden="true">·</span>
        <a href={contacts.emailHref}>имейл</a>
        <span aria-hidden="true">·</span>
        <a href={contacts.phoneAltHref}>{contacts.phoneAlt}</a>
      </div>
    </div>
  );
}

/**
 * Бутонът за онлайн записване.
 *
 * Адресът на платформата се попълва на едно място - `contacts.bookingUrl`
 * в src/content/site.js. Докато е празен, картата си стои на мястото, но
 * изключена, за да не води наникъде; щом се попълни, става истинска
 * връзка, която се отваря в нов раздел.
 */
function OnlineCard() {
  const url = contacts.bookingUrl;

  const inside = (
    <>
      <span className="anima-book__icon">
        <IconCalendar />
      </span>
      <span className="anima-book__body">
        <strong>Запази час онлайн</strong>
        <span className="anima-book__num">Вижте свободните часове</span>
        <small>
          {url
            ? 'Изберете услуга и час в системата за резервации'
            : 'Системата за резервации се включва скоро'}
        </small>
      </span>
    </>
  );

  if (!url) {
    return (
      <button
        type="button"
        className="anima-book__card anima-book__card--primary is-waiting"
        disabled
      >
        {inside}
      </button>
    );
  }

  return (
    <a
      className="anima-book__card anima-book__card--primary"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {inside}
    </a>
  );
}
