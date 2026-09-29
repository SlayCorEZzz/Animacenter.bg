import { useMemo, useState } from 'react';
import { contacts } from '../../content/site.js';
import {
  amountMin,
  amountPresets,
  byDuration,
  deliveryKinds,
  durations,
  paymentMethods,
  priceFor,
  voucherKinds,
  voucherTerms,
  voucherText,
} from '../../content/vouchers.js';
import GiftCard from '../GiftCard.jsx';

let nextId = 1;
const newItem = () => ({ id: nextId++, minutes: null, name: '', amount: '' });

function itemPrice(kind, it) {
  if (kind === 'amount') {
    const n = Number(it.amount);
    return Number.isFinite(n) && n >= amountMin ? n : 0;
  }
  return it.name && it.minutes ? priceFor(it.name, it.minutes) ?? 0 : 0;
}

/** Какво да пише на картата в „Вашата поръчка“ според избора. */
function previewOf(kind, it) {
  if (kind === 'procedure' && it?.name) {
    const price = priceFor(it.name, it.minutes);
    return { title: it.name, subtitle: `${it.minutes} минути${price ? ` · ${price} €` : ''}` };
  }
  if (kind === 'amount' && Number(it?.amount) >= amountMin) {
    return { title: 'Подари грижа', subtitle: `Стойност ${Number(it.amount)} €` };
  }
  return { title: 'Подари грижа', subtitle: kind === 'amount' ? 'Стойност по избор' : 'Масаж по избор' };
}

function itemLabel(kind, it) {
  if (kind === 'amount') return `Ваучер за стойност ${it.amount || '…'} €`;
  return it.name ? `${it.name}, ${it.minutes} мин` : 'Изберете масаж';
}

/**
 * Подаръчни ваучери: текстът и поръчката от заданието, в реда, в който са
 * описани там: вид → получаване → оформяне (продължителност, масаж) →
 * още един ваучер → поръчка → плащане → данни → „Поръчай“ → условия.
 *
 * Сайтът няма собствен сървър, затова „Поръчай“ отваря имейл до центъра с
 * попълнената поръчка.
 */
export default function VouchersSection({ standalone = false }) {
  const Title = standalone ? 'h1' : 'h2';
  const [kind, setKind] = useState('');
  const [delivery, setDelivery] = useState('');
  const [items, setItems] = useState(() => [newItem()]);
  const [payment, setPayment] = useState('');
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState('');

  const total = useMemo(() => items.reduce((s, it) => s + itemPrice(kind, it), 0), [items, kind]);
  const update = (id, patch) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  function validate() {
    const e = {};
    if (!kind) e.kind = 'Изберете вида на ваучера.';
    if (!delivery) e.delivery = 'Изберете как да получите ваучера.';
    items.forEach((it) => {
      if (kind === 'procedure' && !it.minutes) e[`m${it.id}`] = 'Изберете продължителност.';
      else if (kind === 'procedure' && !it.name) e[`n${it.id}`] = 'Изберете вида масаж.';
      if (kind === 'amount' && !itemPrice(kind, it)) e[`a${it.id}`] = `Въведете сума от поне ${amountMin} €.`;
    });
    if (!payment) e.payment = 'Изберете начин на плащане.';
    if (customer.name.trim().split(/\s+/).length < 2) e.name = 'Въведете име и фамилия.';
    if (!/^\S+@\S+\.\S+$/.test(customer.email.trim())) e.email = 'Въведете валиден имейл.';
    if (customer.phone.replace(/\D/g, '').length < 9) e.phone = 'Въведете телефон.';
    return e;
  }

  function submit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const text = [
      'Поръчка на подаръчен ваучер',
      '',
      `Вид: ${voucherKinds.find((k) => k.id === kind).label}`,
      `Получаване: ${deliveryKinds.find((d) => d.id === delivery).label}`,
      '',
      ...items.map((it, i) => `${i + 1}. ${itemLabel(kind, it)} – ${itemPrice(kind, it)} €`),
      '',
      `Общо: ${total} €`,
      `Плащане: ${paymentMethods.find((p) => p.id === payment).label}`,
      '',
      `Име: ${customer.name.trim()}`,
      `Имейл: ${customer.email.trim()}`,
      `Телефон: ${customer.phone.trim()}`,
    ].join('\n');

    window.location.href = `${contacts.emailHref}?subject=${encodeURIComponent(
      `Поръчка на ваучер – ${customer.name.trim()}`,
    )}&body=${encodeURIComponent(text)}`;
    setSent(text);
  }

  const err = (key) => (errors[key] ? <p className="anima-voucher__error">{errors[key]}</p> : null);

  return (
    <section className="anima-section anima-vouchers" id="vaucheri">
      <div className="anima-wrap anima-vouchers__inner">
        {standalone && (
          <nav className="anima-crumbs" aria-label="Пътечка">
            <a href="/">Начало</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Ваучери</span>
          </nav>
        )}
        <div className="anima-vouchers__hero">
          <header className="anima-section__head anima-vouchers__head">
            <p className="anima-eyebrow">Ваучери</p>
            <Title className="anima-section__title">{voucherText.title}</Title>
            <p className="anima-vouchers__lead">{voucherText.lead}</p>
            <p className="anima-section__lead">{voucherText.text}</p>
            <p className="anima-section__lead">{voucherText.kindsIntro}</p>
            <ol className="anima-vouchers__kinds">
              <li>за конкретна процедура</li>
              <li>за определена стойност по избор</li>
            </ol>
            <a className="anima-btn anima-btn--accent anima-vouchers__cta" href="#vaucher-forma">
              Избери своя ваучер
            </a>
          </header>

          <div className="anima-giftcards" aria-hidden="true">
            <GiftCard dark className="anima-giftcards__back" title="Време за теб" subtitle="Масаж по избор" />
            <GiftCard className="anima-giftcards__front" title="Подари грижа" subtitle="Класически масаж · 60 минути" />
          </div>
        </div>

        <ol className="anima-vouchers__how">
          <li>
            <span>1</span>
            <strong>Избери ваучер</strong>
            <p>За конкретен масаж и продължителност или за сума по избор.</p>
          </li>
          <li>
            <span>2</span>
            <strong>Изпрати заявката</strong>
            <p>Ще се свържем с теб в работно време, за да я потвърдим.</p>
          </li>
          <li>
            <span>3</span>
            <strong>Плати и подари</strong>
            <p>На място в студиото или по банков път. Ваучерът е в подаръчен плик или PDF по имейл.</p>
          </li>
        </ol>

        {sent ? (
          <div className="anima-voucher__done" role="status">
            <h3>Благодарим!</h3>
            <p>
              Отворихме имейл с поръчката – остава само да го изпратите. Ако програмата за имейл не се
              отвори, изпратете текста по-долу на <a href={contacts.emailHref}>{contacts.email}</a> или се
              обадете на <a href={contacts.phoneHref}>{contacts.phone}</a>.
            </p>
            <pre>{sent}</pre>
          </div>
        ) : (
          <form className="anima-voucher" id="vaucher-forma" onSubmit={submit} noValidate>
            <fieldset className="anima-voucher__step">
              <legend>1. Избери вида на ваучера</legend>
              <div className="anima-voucher__options">
                {voucherKinds.map((k) => (
                  <Choice key={k.id} name="kind" checked={kind === k.id} onChange={() => setKind(k.id)}>
                    {k.label}
                  </Choice>
                ))}
              </div>
              {err('kind')}
            </fieldset>

            <fieldset className="anima-voucher__step">
              <legend>2. Как да получиш ваучера</legend>
              <div className="anima-voucher__options">
                {deliveryKinds.map((d) => (
                  <Choice key={d.id} name="delivery" checked={delivery === d.id} onChange={() => setDelivery(d.id)}>
                    {d.label}
                  </Choice>
                ))}
              </div>
              {err('delivery')}
            </fieldset>

            <fieldset className="anima-voucher__step">
              <legend>3. Оформяне на ваучера</legend>
              {!kind && <p className="anima-voucher__hint">Първо изберете вида на ваучера.</p>}

              {kind &&
                items.map((it, i) => (
                  <div className="anima-voucher__item" key={it.id}>
                    <div className="anima-voucher__item-head">
                      <strong>Ваучер {i + 1}</strong>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="anima-btn anima-btn--ghost anima-voucher__remove"
                          onClick={() => setItems((l) => l.filter((x) => x.id !== it.id))}
                        >
                          Премахни
                        </button>
                      )}
                    </div>

                    {kind === 'procedure' ? (
                      <>
                        <p className="anima-voucher__label">Избери продължителност</p>
                        <div className="anima-voucher__pills">
                          {durations.map((d) => (
                            <Choice
                              key={d}
                              pill
                              name={`min-${it.id}`}
                              checked={it.minutes === d}
                              onChange={() => update(it.id, { minutes: d, name: byDuration[d].includes(it.name) ? it.name : '' })}
                            >
                              {d} минути
                            </Choice>
                          ))}
                        </div>
                        {err(`m${it.id}`)}

                        <label className="anima-voucher__field">
                          <span className="anima-voucher__label">Избери вида масаж</span>
                          <select value={it.name} disabled={!it.minutes} onChange={(e) => update(it.id, { name: e.target.value })}>
                            <option value="">{it.minutes ? `Масажи от ${it.minutes} минути` : 'Първо изберете продължителност'}</option>
                            {(byDuration[it.minutes] ?? []).map((n) => (
                              <option key={n} value={n}>
                                {n} – {priceFor(n, it.minutes)} €
                              </option>
                            ))}
                          </select>
                        </label>
                        {err(`n${it.id}`)}
                      </>
                    ) : (
                      <>
                        <p className="anima-voucher__label">Избери стойност</p>
                        <div className="anima-voucher__pills">
                          {amountPresets.map((a) => (
                            <Choice key={a} pill name={`amt-${it.id}`} checked={Number(it.amount) === a} onChange={() => update(it.id, { amount: String(a) })}>
                              {a} €
                            </Choice>
                          ))}
                        </div>
                        <label className="anima-voucher__field anima-voucher__field--short">
                          <span className="anima-voucher__label">или въведи сума (€)</span>
                          <input type="number" inputMode="numeric" min={amountMin} value={it.amount} onChange={(e) => update(it.id, { amount: e.target.value })} />
                        </label>
                        {err(`a${it.id}`)}
                      </>
                    )}
                  </div>
                ))}

              {kind && (
                <button type="button" className="anima-btn anima-btn--ghost anima-voucher__add" onClick={() => setItems((l) => [...l, newItem()])}>
                  + Бих желал(а) да добавя още един ваучер
                </button>
              )}
            </fieldset>

            <fieldset className="anima-voucher__step">
              <legend>4. Вашата поръчка</legend>
              <div className="anima-voucher__preview">
                <GiftCard {...previewOf(kind, items[0])} />
                {items.length > 1 && <span className="anima-voucher__more">+ още {items.length - 1}</span>}
              </div>
              {kind ? (
                <ul className="anima-voucher__summary">
                  {items.map((it) => (
                    <li key={it.id}>
                      <span>{itemLabel(kind, it)}</span>
                      <strong>{itemPrice(kind, it) ? `${itemPrice(kind, it)} €` : '–'}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="anima-voucher__hint">Все още няма избран ваучер.</p>
              )}
              <p className="anima-voucher__total">
                <span>Общо</span>
                <strong>{total} €</strong>
              </p>
            </fieldset>

            <fieldset className="anima-voucher__step">
              <legend>5. Начин на плащане</legend>
              <div className="anima-voucher__options">
                {paymentMethods.map((p) => (
                  <Choice key={p.id} name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)}>
                    {p.label}
                  </Choice>
                ))}
              </div>
              {err('payment')}
            </fieldset>

            <fieldset className="anima-voucher__step">
              <legend>6. Данни за доставка</legend>
              <div className="anima-voucher__fields">
                <label className="anima-voucher__field">
                  <span className="anima-voucher__label">Име и фамилия</span>
                  <input type="text" autoComplete="name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                  {err('name')}
                </label>
                <label className="anima-voucher__field">
                  <span className="anima-voucher__label">Мейл</span>
                  <input type="email" autoComplete="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                  {err('email')}
                </label>
                <label className="anima-voucher__field">
                  <span className="anima-voucher__label">Телефон</span>
                  <input type="tel" autoComplete="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                  {err('phone')}
                </label>
              </div>
            </fieldset>

            <p className="anima-voucher__paynote">
              Плащане през сайта не се извършва. След поръчката ще се свържем с вас за плащането и получаването на
              ваучера.
            </p>
            <button type="submit" className="anima-btn anima-btn--accent anima-btn--block">
              Поръчай
            </button>

            <div className="anima-voucher__terms">
              <h3>За ваша информация</h3>
              <p>{voucherTerms}</p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

/** Радио бутон, оформен като карта или като хапче. */
function Choice({ name, checked, onChange, pill = false, children }) {
  return (
    <label className={`anima-voucher__choice${pill ? ' is-pill' : ''}${checked ? ' is-checked' : ''}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}
