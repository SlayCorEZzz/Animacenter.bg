import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll, unlockScroll } from '../lib/scrollLock.js';
import { IconClose } from './Icons.jsx';

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Общ слой за модалните прозорци.
 *
 * Рендерира се през портал директно в <body>. Това е съществено: секциите на
 * Elementor ползват motion-fx, който слага `transform` на родителите, а
 * трансформираният родител става контейнер за `position: fixed`. Тогава
 * модалът се позиционира спрямо секцията, а не спрямо екрана. Точно това
 * чупеше лайтбокса на галерията.
 *
 * Поема и заключването на скрола, Esc, клика встрани, капана за фокуса и
 * връщането на фокуса там, откъдето е дошъл.
 */
export default function Modal({ open, onClose, label, className = '', children, initialFocus }) {
  const panelRef = useRef(null);
  const returnTo = useRef(null);

  const close = useCallback(() => onClose?.(), [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    returnTo.current = document.activeElement;
    lockScroll();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);

    // Фокусът влиза в панела чак след като браузърът е разположил слоя.
    const id = requestAnimationFrame(() => {
      // По подразбиране фокусът отива в самия панел, така първият бутон не
      // грейва с фокусен пръстен само защото прозорецът се е отворил.
      const target =
        (initialFocus?.current ?? null) ||
        panelRef.current?.querySelector('[data-autofocus]') ||
        panelRef.current;
      target?.focus?.({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKey, true);
      unlockScroll();
      returnTo.current?.focus?.({ preventScroll: true });
    };
  }, [open, close, initialFocus]);

  if (!open) return null;

  return createPortal(
    <div className={`anima-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-label={label}>
      <div className="anima-modal__scrim" onClick={close} />
      <div className="anima-modal__panel" ref={panelRef} tabIndex={-1}>
        <button type="button" className="anima-modal__close" onClick={close} aria-label="Затвори">
          <IconClose />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
