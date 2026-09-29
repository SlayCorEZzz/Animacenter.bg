import { posts } from '../content/blog.js';
import { detailsByName } from '../content/serviceDetails.js';
import RichBlocks from '../components/RichBlocks.jsx';
import { IconPhone } from '../components/Icons.jsx';
import { PostCard } from './BlogList.jsx';

/** Една статия: заглавие, дата, снимка, текст, призив и още статии. */
export default function BlogPost({ post }) {
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="anima-section anima-article">
        <div className="anima-wrap anima-article__wrap">
          <nav className="anima-crumbs" aria-label="Пътечка">
            <a href="/">Начало</a>
            <span aria-hidden="true">/</span>
            <a href="/blog">Блог</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{post.title}</span>
          </nav>

          <header className="anima-article__head">
            <p className="anima-post-card__meta">
              <time>{post.date}</time>
              <span>{post.tag}</span>
            </p>
            <h1 className="anima-section__title">{post.title}</h1>
            <p className="anima-section__lead">{post.excerpt}</p>
          </header>

          <img className="anima-article__image" src={post.image} alt="" width="1000" height="667" />

          <RichBlocks blocks={post.blocks} className="anima-article__body" />

          <footer className="anima-article__cta">
            <p>Погрижи се за себе си още днес</p>
            <div className="anima-article__actions">
              <button type="button" className="anima-btn anima-btn--accent" data-book={post.related ?? ''}>
                <IconPhone />
                Запази час
              </button>
              {post.related && detailsByName[post.related] && (
                <a className="anima-btn anima-btn--ghost" href="/#ceni" data-service={post.related}>
                  Прочети за масажа
                </a>
              )}
              {post.link && (
                <a className="anima-btn anima-btn--ghost" href={post.link.href}>
                  {post.link.label}
                </a>
              )}
            </div>
          </footer>
        </div>
      </article>

      {more.length > 0 && (
        <section className="anima-section anima-blog anima-blog--more">
          <div className="anima-wrap">
            <header className="anima-section__head">
              <p className="anima-eyebrow">Блог</p>
              <h2 className="anima-section__title">Още статии</h2>
            </header>
            <ul className="anima-blog__grid anima-blog__grid--3">
              {more.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
