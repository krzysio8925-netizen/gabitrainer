/** Polish decimal: 69.2 → "69,2", rounded to one place. */
export const pl = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

/** Parses user input that may use a decimal comma. */
export const num = (v: string | number) => parseFloat(String(v).replace(',', '.')) || 0;

/** Groups thousands with a space, as pl-PL does: 7840 → "7 840". */
export const thousands = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const mmss = (sec: number) =>
  String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
