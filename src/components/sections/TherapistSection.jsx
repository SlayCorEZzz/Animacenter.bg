import { teamIntro, therapist } from '../../content/site.js';
import { IconCheck, IconPhone } from '../Icons.jsx';

/* Колко широка е снимката на екрана: до 420px на телефон/таблет,
   около 40% от ширината на лаптоп, до ~505px на голям монитор. */
const THERAPIST_SIZES = '(max-width: 900px) min(420px, 92vw), (max-width: 1280px) 40vw, 505px';

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
      <div className="anima-wrap">
        <header className="anima-section__head anima-team__head">
          <p className="anima-eyebrow">Екип</p>
          {/* На началната страница – само първото изречение; целият текст е на /ekip. */}
          <p className="anima-team__intro">{teamIntro.split('. ')[0]}.</p>
          <a className="anima-team__more" href="/ekip">
            Запознай се с екипа <span aria-hidden="true">→</span>
          </a>
        </header>
      </div>
      <div className="anima-wrap anima-therapist__inner">
        <div className="anima-therapist__media">
          <picture>
            <source
              type="image/webp"
              srcSet={`${therapist.photo}@560.webp 560w, ${therapist.photo}@800.webp 800w, ${therapist.photo}.webp 1170w`}
              sizes={THERAPIST_SIZES}
            />
            <img
              src={`${therapist.photo}@800.jpg`}
              srcSet={`${therapist.photo}@560.jpg 560w, ${therapist.photo}@800.jpg 800w, ${therapist.photo}.jpg 1170w`}
              sizes={THERAPIST_SIZES}
              alt={therapist.name}
              loading="lazy"
              decoding="async"
              width="1170"
              height="1560"
            />
          </picture>
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
