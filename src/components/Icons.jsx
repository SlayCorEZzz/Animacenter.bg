/** Малък набор inline икони, без външен шрифт, наследяват currentColor. */

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

export function IconPhone(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6.6 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.2 5.2l1.4-2 3.8 1.5v3a1.6 1.6 0 0 1-1.7 1.6A15.5 15.5 0 0 1 5 5.2 1.6 1.6 0 0 1 6.6 3.5Z" />
    </svg>
  );
}

export function IconMail(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7 7.2 5.2a1.7 1.7 0 0 0 2 0L20.2 7" />
    </svg>
  );
}

export function IconPin(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function IconClock(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7.2V12l3.2 2" />
    </svg>
  );
}

export function IconMenu(props) {
  return (
    <svg {...base} strokeWidth="2" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props) {
  return (
    <svg {...base} strokeWidth="2" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconFacebook(props) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6A21 21 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.12V9.9H7.6V13h2.7v8Z" />
    </svg>
  );
}

export function IconInstagram(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCalendar(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.2" y="5" width="17.6" height="15" rx="2.6" />
      <path d="M3.2 9.6h17.6M8 3.2v3.4M16 3.2v3.4" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg {...base} strokeWidth="2.2" {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}
