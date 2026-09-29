import { useId } from 'react';

/**
 * Подаръчна карта „Анима“ – SVG в цветовете на логото: кремаво/бежово,
 * топло кафяво, охра за панделката и меко зелено за клонката.
 * Показва избраното в ваучера (масаж и продължителност или сума).
 *
 *   <GiftCard title="Класически масаж" subtitle="60 минути · 58 €" />
 *   <GiftCard dark />  – тъмният вариант (за втората карта отзад)
 */
export default function GiftCard({ title = 'Подари грижа', subtitle = 'Масаж по избор', dark = false, className = '' }) {
  const id = useId().replace(/:/g, '');
  const bg = dark ? ['#6b5039', '#3e2c22'] : ['#fdf9f2', '#efe2cd'];
  const ink = dark ? '#f7f1e6' : '#2e241d';
  const muted = dark ? 'rgba(247,241,230,0.72)' : '#8a6642';
  const longTitle = title.length > 18;

  return (
    <svg className={`anima-giftcard ${className}`.trim()} viewBox="0 0 400 252" role="img" aria-label={`Подаръчен ваучер Анима: ${title}, ${subtitle}`}>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="1" stopColor={bg[1]} />
        </linearGradient>
        <linearGradient id={`rb${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8641f" />
          <stop offset="0.5" stopColor="#d18a4a" />
          <stop offset="1" stopColor="#a8641f" />
        </linearGradient>
        <radialGradient id={`gl${id}`} cx="0.85" cy="0.1" r="0.7">
          <stop offset="0" stopColor={dark ? '#c27536' : '#ffffff'} stopOpacity={dark ? 0.25 : 0.9} />
          <stop offset="1" stopColor={dark ? '#c27536' : '#ffffff'} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`cl${id}`}>
          <rect width="400" height="252" rx="22" />
        </clipPath>
      </defs>

      <g clipPath={`url(#cl${id})`}>
        <rect width="400" height="252" fill={`url(#bg${id})`} />
        <rect width="400" height="252" fill={`url(#gl${id})`} />

        {/* клонка с листа в меко зелено */}
        <g opacity={dark ? 0.35 : 0.55} fill={dark ? '#b3c2a5' : '#9aae8c'}>
          <path d="M252 250 C 268 214, 290 190, 322 176" fill="none" stroke={dark ? '#b3c2a5' : '#8a9d7c'} strokeWidth="2" />
          <path d="M270 218 c -18 -4 -30 -18 -30 -34 c 16 2 28 14 30 34 z" />
          <path d="M284 200 c 4 -18 18 -30 34 -30 c -2 16 -14 28 -34 30 z" />
          <path d="M292 192 c -16 -8 -24 -24 -20 -40 c 14 6 22 22 20 40 z" />
          <path d="M306 184 c 8 -16 24 -24 40 -20 c -6 14 -22 22 -40 20 z" />
        </g>

        {/* панделка */}
        <rect x="330" y="0" width="22" height="252" fill={`url(#rb${id})`} />
        <g transform="translate(341 70)">
          <path d="M0 0 C -26 -30, -52 -8, -30 10 C -20 18, -8 10, 0 0 z" fill="#c27536" />
          <path d="M0 0 C 26 -30, 52 -8, 30 10 C 20 18, 8 10, 0 0 z" fill="#b56a2c" />
          <path d="M-4 4 L -18 40 L -8 34 L -2 44 z" fill="#a8641f" />
          <path d="M4 4 L 18 40 L 8 34 L 2 44 z" fill="#9c5a1c" />
          <circle r="8" fill="#d18a4a" stroke="#a8641f" strokeWidth="2" />
        </g>

        <rect x="10" y="10" width="380" height="232" rx="15" fill="none" stroke={dark ? 'rgba(247,241,230,0.18)' : 'rgba(91,68,50,0.14)'} />

        <image
          href="/brand/anima-logo@480.png"
          x="28"
          y="24"
          width="118"
          height="62"
          preserveAspectRatio="xMinYMid meet"
          style={dark ? { filter: 'brightness(0) invert(1)', opacity: 0.92 } : undefined}
        />

        <text x="30" y="124" fill={muted} fontFamily="Manrope, system-ui, sans-serif" fontSize="12" fontWeight="700" letterSpacing="3">
          ПОДАРЪЧЕН ВАУЧЕР
        </text>
        <text x="30" y={longTitle ? 156 : 160} fill={ink} fontFamily="Ovo, Georgia, serif" fontSize={longTitle ? 21 : 27}>
          {title}
        </text>
        <text x="30" y="186" fill={ink} fontFamily="Manrope, system-ui, sans-serif" fontSize="15" fontWeight="600" opacity="0.85">
          {subtitle}
        </text>
        <text x="30" y="226" fill={muted} fontFamily="Manrope, system-ui, sans-serif" fontSize="12" fontWeight="500">
          ул. „Лавеле“ 11, София · animacenter.bg
        </text>
      </g>
    </svg>
  );
}
