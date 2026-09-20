import { therapist } from '../../content/site.js';
import { IconCheck, IconPhone } from '../Icons.jsx';

const CREDENTIALS = [
  'Магистър по кинезитерапия',
  'Терапевтичен и лечебен масаж',
  'Работа след травми и претоварване',
  'Водещ на базовия курс по масаж',
];

/**
 * Представя терапевта на центъра. Темплейтът имаше решетка с двама измислени
 * специалисти. Тук е реалният човек, с реални квалификации.
 */
export default function TherapistSection() {
  return (
    <section className="anima-section anima-therapist" id="terapevt">
      <div className="anima-wrap anima-therapist__inner">
        <div className="anima-therapist__media">
          <img
            src={`${therapist.photo}.jpg`}
            srcSet={`${therapist.photo}@560.jpg 560w, ${therapist.photo}.jpg 800w`}
            sizes="(max-width: 900px) 78vw, 38vw"
            alt={therapist.name}
            loading="lazy"
            decoding="async"
            width="800"
            height="1067"
          />
        </div>

        <div className="anima-therapist__body">
          <p className="anima-eyebrow">Нашият терапевт</p>
          <h2 className="anima-section__title">{therapist.name}</h2>
          <p className="anima-therapist__role">{therapist.role}</p>
          <p className="anima-therapist__text">{therapist.text}</p>

          <ul className="anima-therapist__list">
            {CREDENTIALS.map((item) => (
              <li key={item}>
                <IconCheck />
                {item}
              </li>
            ))}
          </ul>

          <button type="button" className="anima-btn anima-btn--accent" data-book>
            <IconPhone />
            Запази час
          </button>
        </div>
      </div>
    </section>
  );
}
