// Polish date labels used across the app.

export const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'] as const;
const FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
const MONTHS_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const DAY_MS = 86400000;

/** Monday = 0 … Sunday = 6. */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;
export const weekdayShort = (d: Date) => WEEKDAYS[weekdayIndex(d)];
export const weekdayFull = (d: Date) => FULL[weekdayIndex(d)];

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfWeek = (d: Date) => new Date(startOfDay(d).getTime() - weekdayIndex(d) * DAY_MS);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** "Poniedziałek, 19 października" */
export const longDate = (d: Date) => `${weekdayFull(d)}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
/** "19.10" */
export const shortDate = (d: Date) => `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Chat-style stamp: "Dziś 08:12", "Wczoraj 19:10", "Pn 20:04", "12.10". */
export function stamp(d: Date | null | undefined, now = new Date()) {
  if (!d) return 'Teraz';
  const days = Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / DAY_MS);
  if (days <= 0) return 'Dziś ' + hhmm(d);
  if (days === 1) return 'Wczoraj ' + hhmm(d);
  if (days < 7) return weekdayShort(d) + ' ' + hhmm(d);
  return shortDate(d);
}

/** Week of the programme, counting from the day the client joined (week 1 = first 7 days). */
export const programWeek = (joined: Date, now = new Date()) =>
  Math.max(1, Math.floor((startOfDay(now).getTime() - startOfDay(joined).getTime()) / (7 * DAY_MS)) + 1);
