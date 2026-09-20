import { useCallback, useEffect, useState } from 'react';
import { gallery } from '../../content/site.js';
import Modal from '../Modal.jsx';

/**
 * Реалните снимки на центъра. Уголемената снимка минава през общия Modal,
 * който се рендерира в <body>, а секциите на Elementor имат `transform` от
 * motion-fx, а трансформиран родител чупи `position: fixed`.
 */
export default function GallerySection() {
  const [index, setIndex] = useState(-1);
  const open = index >= 0;

  const close = useCallback(() => setIndex(-1), []);
  const step = useCallback(
    (delta) => setIndex((i) => (i < 0 ? i : (i + delta + gallery.length) % gallery.length)),
    [],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, step]);

  /* --- плъзгане с пръст --- */
  const [touchX, setTouchX] = useState(null);
  const onTouchStart = (e) => setTouchX(e.changedTouches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    setTouchX(null);
  };

  const photo = open ? gallery[index] : null;

  return (
    <section className="anima-section anima-gallery" id="galeria">
      <div className="anima-wrap">
        <header className="anima-section__head">
          <p className="anima-eyebrow">Галерия</p>
          <h2 className="anima-section__title">Нашата галерия</h2>
          <p className="anima-section__lead">
            Истински снимки от ул. „Лавеле“ 11 – рецепцията, кабинетите и зоната за
            изчакване, точно така, както ще ги заварите.
          </p>
        </header>

        <ul className="anima-gallery__grid">
          {gallery.map((item, i) => (
            <li key={item.src}>
              <button type="button" onClick={() => setIndex(i)} aria-label={`Отвори: ${item.alt}`}>
                <img
                  src={`${item.src}.jpg`}
                  srcSet={`${item.src}@600.jpg 600w, ${item.src}.jpg ${i === 0 ? 1200 : 900}w`}
                  sizes={i === 0 ? '(max-width: 700px) 92vw, 46vw' : '(max-width: 700px) 45vw, 23vw'}
                  alt={item.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  width="900"
                  height="1200"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={open} onClose={close} label={photo?.alt ?? 'Снимка'} className="anima-lightbox">
        {photo && (
          <div className="anima-lightbox__inner" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <button
              type="button"
              className="anima-lightbox__nav anima-lightbox__nav--prev"
              onClick={() => step(-1)}
              aria-label="Предишна снимка"
            >
              <Chevron dir="left" />
            </button>

            <figure className="anima-lightbox__figure">
              <img src={`${photo.src}.jpg`} alt={photo.alt} />
              <figcaption>
                <span>{photo.alt}</span>
                <span className="anima-lightbox__count">
                  {index + 1} / {gallery.length}
                </span>
              </figcaption>
            </figure>

            <button
              type="button"
              className="anima-lightbox__nav anima-lightbox__nav--next"
              onClick={() => step(1)}
              aria-label="Следваща снимка"
            >
              <Chevron dir="right" />
            </button>
          </div>
        )}
      </Modal>
    </section>
  );
}

function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
