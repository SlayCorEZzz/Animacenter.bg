import { brand, contacts, marquee, nav } from '../content/site.js';
import { serviceCategories } from '../content/services.js';
import { pageHref } from '../lib/pages.js';
import LocationMap from './LocationMap.jsx';
import { IconClock, IconFacebook, IconInstagram, IconMail, IconPhone, IconPin } from './Icons.jsx';

/**
 * Собствен футър. Формата за имейл бюлетин от темплейта е премахната по
 * желание на клиента.
 *
 * Фонът е светъл пясъчен, не тъмен. Тъмната лента задушаваше логото, защото то е с
 * топли, приглушени цветове и потъваше във фона, а единственият изход беше да
 * се обръща в бяло, тоест да се показва не самото лого. Върху пясъчно то стои
 * както е нарисувано.
 *
 * Картата е извадена извън `.anima-wrap`, за да заема цялата ширина на екрана,
 * и стои преди контактите: първо се вижда къде е центърът, после на кой адрес
 * и телефон. Под тях изглеждаше като залепена отдолу.
 */
export default function SiteFooter({ withContact = true }) {
  const year = new Date().getFullYear();

  return (
    <footer className="anima-footer" id="kontakti">
      {/* бягаща лента с услугите */}
      <div className="anima-marquee" aria-hidden="true">
        <div className="anima-marquee__track">
          {[0, 1].map((copy) => (
            <ul key={copy}>
              {marquee.map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {withContact && (
        <>
          {/* --- картата: през цялата ширина, преди контактите --- */}
          <div className="anima-footer__map">
            <LocationMap className="anima-gmap--footer" />
          </div>
        </>
      )}

      <div className="anima-wrap">
        {withContact && (
          <>
            {/* --- контакти --- */}    
            <div className="anima-footer__contact">    
              <div className="anima-footer__intro">    
                <p className="anima-eyebrow">Контакти</p>    
                <h2 className="anima-section__title">Ще ви очакваме</h2>    
                <p className="anima-footer__lead">    
                  В центъра на София, на минута пеша от метростанция „Сердика“. Обадете се или    
                  запазете час онлайн и ще потвърдим.    
                </p>    
        
                <div className="anima-footer__cta">    
                  <button type="button" className="anima-btn anima-btn--accent" data-book>    
                    <IconPhone />    
                    Запази час    
                  </button>    
                  <a    
                    className="anima-btn anima-btn--ghost"    
                    href={contacts.directionsLink}    
                    target="_blank"    
                    rel="noopener noreferrer"    
                  >    
                    Упъти ме    
                  </a>    
                </div>    
              </div>    
        
              <ul className="anima-contact-list">    
                <li>    
                  <IconPin />    
                  <div>    
                    {/* Ориентирът е част от връзката, за да е целта висока    
                        колкото пръст, без изкуствен отстъп между двата реда. */}    
                    <a    
                      className="anima-contact-list__stacked"    
                      href={contacts.mapsLink}    
                      target="_blank"    
                      rel="noopener noreferrer"    
                    >    
                      <span>    
                        {contacts.street}, {contacts.city}    
                      </span>    
                      <span className="is-muted">{contacts.landmark}</span>    
                    </a>    
                  </div>    
                </li>    
                <li>    
                  <IconPhone />    
                  <div>    
                    <a href={contacts.phoneHref}>{contacts.phone}</a>    
                    <a href={contacts.phoneAltHref}>{contacts.phoneAlt}</a>    
                  </div>    
                </li>    
                <li>    
                  <IconMail />    
                  <div>    
                    <a href={contacts.emailHref}>{contacts.email}</a>    
                  </div>    
                </li>    
                <li>    
                  <IconClock />    
                  <div>    
                    <span className="is-strong">{contacts.hours}</span>    
                    <span>{contacts.hoursNote}</span>    
                  </div>    
                </li>    
              </ul>    
            </div>
          </>
        )}

        {/* --- долни колони --- */}
        <div className="anima-footer__cols">
          <div className="anima-footer__brand">
            <img src={brand.logo} alt={brand.name} width="2443" height="1281" />
            <p className="anima-footer__slogan">„{brand.slogan}“</p>
            <div className="anima-footer__social">
              <a href={contacts.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <IconFacebook />
              </a>
              <a href={contacts.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <IconInstagram />
              </a>
            </div>
          </div>

          <nav className="anima-footer__nav" aria-label="Навигация във футъра">
            <h3>Меню</h3>
            <ul>
              {[{ label: 'Начало', href: '#top' }, ...nav, { label: 'Галерия', href: '#galeria' }].map((item) => (
                <li key={item.href}>
                  <a href={pageHref(item.href)}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="anima-footer__nav" aria-label="Услуги">
            <h3>Услуги</h3>
            <ul>
              {serviceCategories.map((c) => (
                <li key={c.slug}>
                  <a href={`/uslugi/${c.slug}`}>{c.name}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="anima-footer__line">{brand.footerLine}</p>

        <div className="anima-footer__bottom">
          <p>
            © {year} {brand.name} Center. Всички права запазени.
          </p>
          <p>{brand.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
