import { team, teamIntro } from '../content/site.js';
import Crumbs from '../components/Crumbs.jsx';

/** Екипът: текстът от заданието, отдолу снимка, име и професия на всеки. */
export default function TeamPage() {
  return (
    <section className="anima-section anima-team-page">
      <div className="anima-wrap">
        <Crumbs label="Екип" />
        <header className="anima-section__head anima-team__head">
          <p className="anima-eyebrow">Екип</p>
          <h1 className="anima-section__title">Нашият екип</h1>
          <p className="anima-team__intro">{teamIntro}</p>
        </header>

        <ul className={`anima-team__grid anima-team__grid--${Math.min(team.length, 3)}`}>
          {team.map((m) => (
            <li key={m.name} className="anima-member">
              <div className="anima-member__photo">
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`${m.photo}@560.webp 560w, ${m.photo}@800.webp 800w, ${m.photo}.webp 1170w`}
                    sizes="(max-width: 520px) 92vw, 380px"
                  />
                  <img
                    src={`${m.photo}@800.jpg`}
                    srcSet={`${m.photo}@560.jpg 560w, ${m.photo}@800.jpg 800w, ${m.photo}.jpg 1170w`}
                    sizes="(max-width: 520px) 92vw, 380px"
                    alt={m.name}
                    width="1170"
                    height="1560"
                  />
                </picture>
              </div>
              <h2 className="anima-member__name">{m.name}</h2>
              <p className="anima-member__role">{m.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
