import { voucherText } from '../../content/vouchers.js';

/** Кратко каре на началната страница; поръчката е на /vaucheri. */
export default function VoucherTeaserSection() {
  return (
    <section className="anima-section anima-voucher-teaser" id="vaucheri">
      <div className="anima-wrap">
        <div className="anima-voucher-teaser__card">
          <div className="anima-voucher-teaser__text">
            <p className="anima-eyebrow">Ваучери</p>
            <h2 className="anima-section__title">{voucherText.title}</h2>
            <p className="anima-vouchers__lead">{voucherText.lead}</p>
            <p className="anima-section__lead">{voucherText.text}</p>
          </div>
          <a className="anima-btn anima-btn--accent" href="/vaucheri">
            Поръчай ваучер
          </a>
        </div>
      </div>
    </section>
  );
}
