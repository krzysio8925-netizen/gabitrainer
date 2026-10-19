import type { Timestamp } from 'firebase/firestore';

import type { Status } from './store';

export const STATUS: Record<Status, [string, string]> = {
  raport: ['Nowy raport', 'tag-accent'],
  ankieta: ['Nowa ankieta', 'tag-accent-2'],
  spóźniony: ['Brak raportu', 'tag-neutral'],
  ok: ['Sprawdzony', 'tag-outline'],
};

export const AVATAR_BG = ['var(--color-accent-300)', 'var(--color-accent-2-300)', 'var(--color-neutral-300)', 'var(--color-accent-200)', 'var(--color-accent-2-200)', 'var(--color-neutral-200)'];
/** Stable avatar color per client. */
export const avatarBg = (id: string) => AVATAR_BG[[...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_BG.length];
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase();
export const firstName = (name: string) => name.split(/\s+/)[0] ?? name;

export const pl = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
export const sgn = (d: number) => d === 0 ? '0' : (d < 0 ? '−' : '+') + pl(Math.abs(d));
export const num = (v: string | number | undefined) => parseFloat(String(v ?? '').replace(',', '.')) || 0;

export const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
const DAY = 86400000;
const MONTHS_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfWeek = (d: Date) => new Date(startOfDay(d).getTime() - weekdayIndex(d) * DAY);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const shortDate = (d: Date) => `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** "19–25 października 2026" */
export function weekRange(monday: Date) {
  const sun = addDays(monday, 6);
  return monday.getMonth() === sun.getMonth()
    ? `${monday.getDate()}–${sun.getDate()} ${MONTHS_GEN[sun.getMonth()]} ${sun.getFullYear()}`
    : `${monday.getDate()} ${MONTHS_GEN[monday.getMonth()]} – ${sun.getDate()} ${MONTHS_GEN[sun.getMonth()]} ${sun.getFullYear()}`;
}

/** Short "how long ago": "teraz", "2 godz.", "wczoraj", "pn.", "12.10". */
export function ago(t?: Timestamp | null, now = new Date()) {
  if (!t) return '';
  const d = t.toDate();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 60) return mins <= 1 ? 'teraz' : `${mins} min`;
  const days = Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / DAY);
  if (days === 0) return `${Math.floor(mins / 60)} godz.`;
  if (days === 1) return 'wczoraj';
  if (days < 7) return WEEKDAYS[weekdayIndex(d)].toLowerCase() + '.';
  return shortDate(d);
}

/** Chat stamp: "Dziś 08:12", "Wczoraj 19:10", "Pn 20:04", "12.10". */
export function stamp(t?: Timestamp | null, now = new Date()) {
  if (!t) return 'Teraz';
  const d = t.toDate();
  const days = Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / DAY);
  if (days <= 0) return 'Dziś ' + hhmm(d);
  if (days === 1) return 'Wczoraj ' + hhmm(d);
  if (days < 7) return WEEKDAYS[weekdayIndex(d)] + ' ' + hhmm(d);
  return shortDate(d);
}

export const programWeek = (joined?: Timestamp, now = new Date()) =>
  joined ? Math.max(1, Math.floor((startOfDay(now).getTime() - startOfDay(joined.toDate()).getTime()) / (7 * DAY)) + 1) : 1;
