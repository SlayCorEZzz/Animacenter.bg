/**
 * Превежда текстовете в генерираните секции. Замяната е върху точни низове в
 * двете форми, в които конверторът ги изписва: `>текст<` и `{"текст"}`.
 * Низ, който не е намерен, се съобщава, така че нищо не остава непреведено
 * мълчаливо.
 *
 * Стартиране: node tools/translate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/components/sections';

/* Английските ключове са точният текст от разметката на темплейта и трябва да
   съвпадат буква по буква, затова двата с дълго тире го пазят. Записано е с
   escape, за да не стои знакът буквално в кода. */
const DICT = {
  /* --- Hero --- */
  'Massage for \n': 'Масаж за вашето \n',
  '\nYour Body & Mind': '\nтяло и ум',
  'Make it a weekly ritual \u2014 relax, recharge, recover.':
    'Направете го седмичен ритуал. Отпуснете се, презаредете се, възстановете се.',
  'Trusted by 1000+ patients': 'В сърцето на София, до метростанция „Сердика“',

  /* --- лентата с ползи (herо + футър) --- */
  'Improved Mobility': 'Подвижност',
  'Reduced Pain': 'По-малко болка',
  'Improved Circulation': 'Кръвообращение',
  'Reduced Stress': 'По-малко стрес',
  'Enhances Overall Well-being': 'Добро самочувствие',
  'Relieved Muscle Tension': 'Отпуснати мускули',
  'Boosted Circulation': 'Възстановяване',
  'Eased Chronic Pain': 'Спокоен сън',

  /* --- Кои сме ние --- */
  '16+ Years of Experience': 'Индивидуален подход',
  'Evening & Weekend Availability': 'Работим и в събота',
  'Who we are': 'Кои сме ние',
  'Professional Care, Inspired by Nature': 'Професионална грижа,\nвдъхновена от природата',
  'Skilled, Caring Therapists': 'Квалифицирани терапевти',
  'Our licensed professionals bring years of experience and a deep understanding of bodywork and wellness.':
    'Работим с дипломирани кинезитерапевти и масажисти, които разбират тялото в дълбочина.',
  'Inspired by Nature': 'Вдъхновени от природата',
  'We use gentle techniques, natural oils, and calming touch to help you feel restored and balanced.':
    'Използваме натурални масла, етерични аромати и спокоен допир, за да се почувствате възстановени.',
  'A Trusted Local Studio': 'В центъра на София',
  'We’ve helped thousands of clients reduce stress, manage pain, and feel better with care that truly makes a difference.':
    'Намираме се на ул. „Лавеле“ 11, на минута пеша от метростанция „Сердика“, в самия център на града.',
  'More Than Massage': 'Повече от масаж',
  'Our peaceful space is designed for calm, comfort, and care \u2014 offering a quiet moment of relief in your busy, demanding day.':
    'Спокойно пространство, създадено за тишина и комфорт. Кратка почивка насред натоварения ви ден.',

  /* --- Услуги --- */
  Services: 'Услуги',
  'Begin Your Journey \nto Better Health': 'Започнете пътя \nкъм по-добро здраве',
  'View All': 'Виж цените',
  'View All Services': 'Виж пълната ценова листа',

  'Swedish Massage': 'Класически масаж',
  'Deep Tissue': 'Релаксиращ масаж',
  'Medical Massage': 'Лечебен масаж',
  'SPA Massage': 'Миофасциален масаж',
  'Gentle, full-body massage that relaxes muscles and reduces stress.':
    'Облекчава мускулното напрежение и подобрява кръвообращението. От 52 €.',
  'Focused pressure to release deep tension and chronic muscle pain.':
    'Нежен и успокояващ метод за дълбока релаксация и облекчение на стреса. От 47 €.',
  'Targeted therapy to support recovery from injuries or conditions.':
    'Терапевтични техники, насочени към конкретна проблемна зона. От 54 €.',
  'A soothing, sensory massage for total relaxation and self-care.':
    'Повлиява съединителната тъкан и мускулатурата в дълбочина. От 65 €.',

  /* --- Защо ANIMA --- */
  'Why Choose Us?': 'Защо ANIMA?',
  'Care That Goes Beyond the Massage': 'Грижа, която надхвърля масажа',
  'Flat Fee': 'Ясни цени',
  'Simple, transparent pricing. Our therapists appreciate tips, reviews, and referrals.':
    'Обявена ценова листа без скрити доплащания. Знаете точно колко струва часът ви.',
  'Easy Online Booking': 'Бързо записване',
  'Same-day appointments often available. Book your massage in minutes.':
    'Едно обаждане е достатъчно. Често имаме свободен час и за същия ден.',
  'Licensed & Trusted': 'Квалифицирани специалисти',
  'All therapists are licensed, insured, and highly experienced.':
    'Терапевтите ни са дипломирани кинезитерапевти с практика и продължаващо обучение.',
  'Eco-Friendly': 'Централна локация',
  'As a small, sustainable business, we offer personalized care with a lighter footprint.':
    'На ул. „Лавеле“ 11, на минута от метростанция „Сердика“. Лесно се стига отвсякъде.',

  /* --- Ползи --- */
  'Massage And Your Body': 'Масажът и тялото',
  'How Massage Therapy Transforms Your Body': 'Как масажът променя тялото ви',
  'Relieves Muscle Tension': 'Облекчава мускулното напрежение',
  'Helps release tight muscles and restore natural mobility.':
    'Освобождава стегнатите мускули и връща естествената подвижност.',
  'Boosts Circulation': 'Подобрява кръвообращението',
  'Encourages healthy blood flow, delivering oxygen and nutrients to tissues and supporting faster recovery.':
    'Подпомага притока на кръв, доставя кислород и хранителни вещества до тъканите и ускорява възстановяването.',
  'Reduces Stress & Anxiety': 'Намалява стреса и тревожността',
  'Promotes deep relaxation, calming both the body and the mind.':
    'Води до дълбока релаксация, която успокоява едновременно тялото и ума.',
  'Eases Chronic Pain': 'Облекчава хроничната болка',
  'Provides lasting relief from ongoing discomfort related to injuries or overuse.':
    'Дава трайно облекчение при дискомфорт от травми или претоварване.',
  'Improves Sleep Quality': 'Подобрява съня',
  'Supports deeper, more restful sleep by reducing physical and mental tension.':
    'Подпомага по-дълбок и спокоен сън, като намалява физическото и психическото напрежение.',

  /* --- Терапевт --- */
  'Our therapist': 'Нашият екип',
  'Meet Our Therapist': 'Запознайте се с терапевта',
  'Every therapist is carefully vetted and background-checked to ensure your safety, comfort, and expert care.':
    'Всеки терапевт при нас е дипломиран специалист, който работи с внимание към вашето състояние и комфорт.',
  'Meet the Team': 'Свържете се с нас',
  'Hana Gregson': 'д-р Теодора Цолова',
  'Founder / Massage Therapist': 'Магистър кинезитерапевт',

  /* --- Призив за записване --- */
  'Why Wait to Feel Better?': 'Защо да чакате, за да се почувствате по-добре?',
  'Trusted by 1,000+ Happy Clients and 5-star Rated in San Francisco.':
    'Запишете своя час в ANIMA Center на ул. „Лавеле“ 11, до метростанция „Сердика“.',
  or: 'или',

  /* --- общи --- */
  'Book Appointment': 'Запази час',
  '(422) 820 820': '+359 89 770 0766',
};

/** Разделя низа на водещи/следващи празни знаци и същинско съдържание. */
function split(text) {
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
  return { lead: m[1], core: m[2], trail: m[3] };
}

const files = fs.readdirSync(DIR).map((f) => path.join(DIR, f));
const used = new Set();

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  // >текст<  плосък JSX текст
  src = src.replace(/>([^<>{}\n]+)</g, (whole, text) => {
    const { lead, core, trail } = split(text);
    const bg = DICT[core];
    if (bg === undefined) return whole;
    used.add(core);
    return `>${lead}${bg}${trail}<`;
  });

  // {"текст"}  низов израз
  src = src.replace(/\{"((?:[^"\\]|\\.)*)"\}/g, (whole, raw) => {
    let text;
    try { text = JSON.parse(`"${raw}"`); } catch { return whole; }
    const { lead, core, trail } = split(text);
    const bg = DICT[core];
    if (bg === undefined) return whole;
    used.add(core);
    return `{${JSON.stringify(lead + bg + trail)}}`;
  });

  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    console.log(`преведен: ${path.basename(file)}`);
  }
}

const missing = Object.keys(DICT).filter((k) => !used.has(k));
if (missing.length) {
  console.log(`\nНЕНАМЕРЕНИ (${missing.length}):`);
  missing.forEach((m) => console.log(`  ${JSON.stringify(m)}`));
} else {
  console.log('\nВсички низове от речника са намерени и заменени.');
}
