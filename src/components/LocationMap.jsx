import { contacts } from '../content/site.js';

const PHOTO = '/media/vhod@600.jpg';
const NAME = 'Анима център';
const ADDRESS = 'ул. „Лавеле“ 11, София';

/**
 * Google Maps с картичка „Анима център“: снимката на входа, името и адресът,
 * за да се ориентират хората как изглежда мястото отвън, и бутон „Упъти ме“
 * (маршрут в Google Maps; на телефон се отваря приложението).
 *
 * Картата е центрирана на адреса, затова маркерът на Google е точно в
 * средата, а картичката стои винаги видима непосредствено под него и сочи
 * към него.
 */
export default function LocationMap({ className = '' }) {
  return (
    <div className={`anima-gmap ${className}`.trim()}>
      <iframe
        src={contacts.mapsEmbed}
        title={`Карта: ${NAME}, ${ADDRESS}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />

      <div className="anima-gmap__card" role="group" aria-label={NAME}>
        <span className="anima-gmap__tip" aria-hidden="true" />
        <img src={PHOTO} alt={`Входът на ${NAME}, ${ADDRESS}`} width="600" height="450" loading="lazy" decoding="async" />
        <div className="anima-gmap__body">
          <strong>{NAME}</strong>
          <span>{ADDRESS}</span>
          <div className="anima-gmap__actions">
            <a className="anima-gmap__go" href={contacts.directionsLink} target="_blank" rel="noopener noreferrer">
              Упъти ме
            </a>
            <a className="anima-gmap__open" href={contacts.mapsLink} target="_blank" rel="noopener noreferrer">
              Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
