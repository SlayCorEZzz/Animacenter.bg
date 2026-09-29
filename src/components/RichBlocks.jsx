import { Fragment } from 'react';
import { IconCheck } from './Icons.jsx';

/** Текст с **удебелени** части. */
export function Rich({ text }) {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>));
}

function Block({ block }) {
  switch (block.type) {
    case 'h':
      return <h3 className="anima-rich__h">{block.text}</h3>;
    case 'list':
      return (
        <ul className={`anima-rich__list${block.strong ? ' is-strong' : ''}`}>
          {block.items.map((item) => (
            <li key={item}>
              <IconCheck />
              <span>
                <Rich text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="anima-rich__ol">
          {block.items.map((item) => (
            <li key={item}>
              <Rich text={item} />
            </li>
          ))}
        </ol>
      );
    case 'callout':
      return (
        <div className="anima-rich__callout">
          <h3>{block.title}</h3>
          <p>{block.text}</p>
        </div>
      );
    default:
      return (
        <p>
          <Rich text={block.text} />
        </p>
      );
  }
}

/**
 * Съдържание, записано като блокове: p (абзац), h (подзаглавие),
 * list (списък с отметки), ol (номериран), callout (открояващо се каре).
 */
export default function RichBlocks({ blocks, className = '' }) {
  return (
    <div className={`anima-rich ${className}`.trim()}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
