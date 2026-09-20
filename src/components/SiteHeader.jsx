import { useCallback, useEffect, useRef, useState } from 'react';
import { brand, contacts, nav } from '../content/site.js';
import { lockScroll, unlockScroll } from '../lib/scrollLock.js';
import { IconClose, IconFacebook, IconInstagram, IconMail, IconMenu, IconPhone, IconPin } from './Icons.jsx';

/**
 * Собствен header вместо този на Elementor.
 *
 * Логото е едно-единствено <img> с оригиналното SVG. Светлият вариант върху
 * хероя се получава с CSS филтър. По-рано тук стояха две снимки една върху
 * друга и при превключването се получаваше трепване.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const burgerRef = useRef(null);
  const closeRef = useRef(null);

  /* --- плътен фон + показване на долната лента --- */
  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setScrolled(y > 40);

        // Лентата се появява чак след хероя, за да не посреща посетителя още
        // на първия екран, и се скрива, докато се чете надолу.
        const hero = document.querySelector('.elementor-element-cde987c');
        const past = y > (hero ? hero.offsetHeight * 0.85 : 520);
        const goingUp = y < lastY - 4;
        const nearBottom = y + window.innerHeight > document.body.scrollHeight - 220;

        setShowBar(past && !nearBottom && (goingUp || y < lastY + 4));
        lastY = y;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* --- заключване на скрола зад отвореното меню --- */
  useEffect(() => {
    if (!open) return undefined;
    lockScroll();

    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1024) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    closeRef.current?.focus();

    return () => {
      unlockScroll();
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    burgerRef.current?.focus();
  }, []);

  const goTo = useCallback((e, href) => {
    if (!href.startsWith('#')) return;
    const target = href === '#top' ? document.body : document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    setOpen(false);

    const offset =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--anima-header-h'), 10) || 72;
    const top = href === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - offset - 8;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  return (
    <>
      <header className={`anima-header${scrolled ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
        <div className="anima-header__inner">
          <a
            className="anima-header__logo"
            href="#top"
            onClick={(e) => goTo(e, '#top')}
            aria-label={`${brand.name}, начало`}
          >
            <img src={brand.logo} alt={brand.name} width="5034" height="2687" />
          </a>

          <nav className="anima-header__nav" aria-label="Основна навигация">
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => goTo(e, item.href)}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="anima-header__actions">
            <a className="anima-header__phone" href={contacts.phoneHref}>
              <IconPhone />
              <span>{contacts.phone}</span>
            </a>
            <button type="button" className="anima-btn anima-btn--accent anima-header__cta" data-book>
              Запази час
            </button>

            <button
              type="button"
              className="anima-header__icon-btn anima-header__icon-btn--call"
              aria-label="Запази час"
              data-book
            >
              <IconPhone />
            </button>
            <button
              ref={burgerRef}
              type="button"
              className="anima-header__icon-btn anima-burger"
              aria-label={open ? 'Затвори менюто' : 'Отвори менюто'}
              aria-expanded={open}
              aria-controls="anima-mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* --- мобилно чекмедже --- */}
      <div
        className={`anima-drawer${open ? ' is-open' : ''}`}
        id="anima-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
        hidden={!open}
      >
        <button
          type="button"
          className="anima-drawer__scrim"
          aria-label="Затвори менюто"
          tabIndex={-1}
          onClick={close}
        />

        <div className="anima-drawer__panel">
          <div className="anima-drawer__head">
            <img src={brand.logo} alt={brand.name} className="anima-drawer__logo" width="5034" height="2687" />
            <button
              ref={closeRef}
              type="button"
              className="anima-header__icon-btn"
              onClick={close}
              aria-label="Затвори менюто"
            >
              <IconClose />
            </button>
          </div>

          <nav className="anima-drawer__nav" aria-label="Мобилна навигация">
            {nav.map((item, i) => (
              <a key={item.href} href={item.href} style={{ '--i': i }} onClick={(e) => goTo(e, item.href)}>
                <span>{item.label}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                  <path
                    d="M9 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ))}
          </nav>

          <div className="anima-drawer__foot">
            <button type="button" className="anima-btn anima-btn--accent anima-btn--block" data-book>
              <IconPhone />
              Запази час
            </button>

            <ul className="anima-drawer__meta">
              <li>
                <IconPin />
                <a href={contacts.mapsLink} target="_blank" rel="noopener noreferrer">
                  {contacts.street}, {contacts.city}, {contacts.landmark}
                </a>
              </li>
              <li>
                <IconMail />
                <a href={contacts.emailHref}>{contacts.email}</a>
              </li>
            </ul>
            <p className="anima-drawer__hours">{contacts.hours}</p>

            <div className="anima-drawer__social">
              <a href={contacts.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <IconFacebook />
              </a>
              <a href={contacts.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <IconInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* --- дискретен бутон за записване, само на телефон --- */}
      <div className={`anima-callbar${showBar && !open ? ' is-visible' : ''}`} aria-hidden={!showBar || open}>
        <a
          className="anima-callbar__map"
          href={contacts.mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Как да стигна"
          tabIndex={showBar && !open ? 0 : -1}
        >
          <IconPin />
        </a>
        <button type="button" className="anima-callbar__btn" data-book tabIndex={showBar && !open ? 0 : -1}>
          <IconPhone />
          Запази час
        </button>
      </div>
    </>
  );
}
