import { Lang } from './translations';

export const MONTHS_FULL: Record<Lang, string[]> = {
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  mg: ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'],
};

export const MONTHS_SHORT: Record<Lang, string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  mg: ['Janv', 'Febr', 'Mar', 'Apr', 'Mey', 'Jona', 'Jol', 'Aog', 'Sept', 'Okt', 'Nov', 'Des'],
};

// Index 0 = Lundi ... 6 = Dimanche (semaine commençant le lundi, comme dans le calendrier)
export const WEEKDAYS_MIN: Record<Lang, string[]> = {
  fr: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  mg: ['Al', 'Ta', 'Ar', 'Ak', 'Zo', 'Sb', 'Ah'],
};

// Index 0 = Dimanche ... 6 = Samedi (correspond à Date.getDay())
export const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  fr: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  mg: ['Alahady', 'Alats.', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Sabotsy'],
};

/** "12 sept." */
export function formatDayMonth(date: Date, lang: Lang): string {
  return `${date.getDate()} ${MONTHS_SHORT[lang][date.getMonth()]}`;
}

/** "ven. 12 sept." */
export function formatWeekdayDayMonth(date: Date, lang: Lang): string {
  return `${WEEKDAYS_SHORT[lang][date.getDay()]} ${formatDayMonth(date, lang)}`;
}

/** "Août 2026" */
export function formatMonthYear(date: Date, lang: Lang): string {
  return `${MONTHS_FULL[lang][date.getMonth()]} ${date.getFullYear()}`;
}

/** Date complète type "12 septembre 2026" */
export function formatFullDate(date: Date, lang: Lang): string {
  return `${date.getDate()} ${MONTHS_FULL[lang][date.getMonth()].toLowerCase()} ${date.getFullYear()}`;
}