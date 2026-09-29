import { massageImage } from '../content/serviceDetails.js';

/** Снимката на масаж, 4:3, WebP с JPEG резерва и малък вариант за телефон. */
export default function MassagePhoto({ name, sizes = '(max-width: 600px) 92vw, 400px', eager = false, className = '' }) {
  const base = massageImage(name);
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={`${base}@600.webp 600w, ${base}.webp 900w`} sizes={sizes} />
      <img
        src={`${base}@600.jpg`}
        srcSet={`${base}@600.jpg 600w, ${base}.jpg 900w`}
        sizes={sizes}
        alt={`${name} в Анима, София`}
        width="900"
        height="675"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}
