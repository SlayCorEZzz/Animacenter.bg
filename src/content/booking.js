/**
 * Името на услуга за бутоните „Запази час“ по страниците (data-book="…").
 * Прозорецът „Запази час“ е с два бутона – онлайн резервация и обаждане;
 * името остава в разметката, за да може по-късно системата за резервации
 * да се отвори направо с избраната услуга, ако я поддържа.
 */
export function bookingValue(category, item) {
  if (!item || category.singleBooking) return category.name;
  if (category.slug === 'konsultacii') return `Консултация: ${item.name}`;
  if (category.slug === 'kineziterapia') return `Кинезитерапия: ${item.name}`;
  return `${category.name}: ${item.name}`;
}
