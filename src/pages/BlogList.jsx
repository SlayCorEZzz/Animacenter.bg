import { useState } from 'react';
import { blogIntro, blogTags, posts } from '../content/blog.js';

const PER_PAGE = 8;

/**
 * Списъкът със статии, по примера на блога на Молекула: въведение,
 * филтър по категория и карти със снимка, дата, заглавие и кратък текст.
 */
export default function BlogList() {
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);

  const shown = tag ? posts.filter((p) => p.tag === tag) : posts;
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const visible = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pick = (t) => {
    setTag(t);
    setPage(1);
  };

  return (
    <section className="anima-section anima-blog">
      <div className="anima-wrap">
        <nav className="anima-crumbs" aria-label="Пътечка">
          <a href="/">Начало</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Блог</span>
        </nav>

        <header className="anima-section__head anima-blog__head">
          <p className="anima-eyebrow">Блог</p>
          <h1 className="anima-section__title">{blogIntro.title}</h1>
          <p className="anima-section__lead">{blogIntro.text}</p>
        </header>

        <div className="anima-tabs anima-blog__tags" role="group" aria-label="Категории">
          <button type="button" className={`anima-tabs__btn${tag === '' ? ' is-active' : ''}`} aria-pressed={tag === ''} onClick={() => pick('')}>
            Всички
          </button>
          {blogTags.map((t) => (
            <button key={t} type="button" className={`anima-tabs__btn${tag === t ? ' is-active' : ''}`} aria-pressed={tag === t} onClick={() => pick(t)}>
              {t}
            </button>
          ))}
        </div>

        <ul className="anima-blog__grid">
          {visible.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>

        {pages > 1 && (
          <nav className="anima-blog__pager" aria-label="Страници">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`anima-tabs__btn${n === page ? ' is-active' : ''}`}
                aria-current={n === page ? 'page' : undefined}
                onClick={() => {
                  setPage(n);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {n}
              </button>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

/** Карта на статия. Цялата карта е връзка към статията. */
export function PostCard({ post }) {
  return (
    <a className="anima-post-card" href={`/blog/${post.slug}`}>
      <span className="anima-post-card__media">
        <img src={post.image} alt="" loading="lazy" decoding="async" width="1000" height="667" />
        <span className="anima-post-card__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <span className="anima-post-card__body">
        <span className="anima-post-card__meta">
          <time>{post.date}</time>
          <span>{post.tag}</span>
        </span>
        <span className="anima-post-card__title">{post.title}</span>
        <span className="anima-post-card__excerpt">{post.excerpt}</span>
        <span className="anima-post-card__more">Прочети</span>
      </span>
    </a>
  );
}
