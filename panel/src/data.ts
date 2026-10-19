// Sample data for Gabi's panel. Mirrors the Claude Design prototype until a backend exists.

export type Status = 'raport' | 'ankieta' | 'spóźniony' | 'ok';

export type Client = {
  id: string;
  full: string;
  first: string;
  firstTo: string; // dative: "do Kasi"
  goal: string;
  week: number;
  age: number;
  height: number;
  status: Status;
  when: string;
  diet: number;
  workouts: string;
  sc: [number, number, number]; // mood, sleep, stress
  sentAt: string;
  q: string;
  ini: string;
  avBg: string;
  weights: number[];
};

export type PlanRow = { name: string; sets: string; reps: string; load: string; note: string };
export type PlanDay = 'A' | 'B' | 'C' | 'K';
export type Plan = Record<PlanDay, PlanRow[]>;

export type MenuRow = { time: string; name: string; kcal: string };
export type Diet = { p: string; f: string; c: string; menu: Record<string, MenuRow[]> };

export type Msg = { me: boolean; text: string; time: string };

export type Task = { text: string; due: string; done: boolean };

const AV = ['var(--color-accent-300)', 'var(--color-accent-2-300)', 'var(--color-neutral-300)', 'var(--color-accent-200)', 'var(--color-accent-2-200)', 'var(--color-neutral-200)'];

type Raw = Omit<Client, 'ini' | 'avBg' | 'weights'> & { w0: number; rate: number };

const RAW: Raw[] = [
  { id: 'kn', full: 'Katarzyna Nowak', first: 'Kasia', firstTo: 'Kasi', goal: 'Redukcja', week: 8, age: 29, height: 168, status: 'raport', when: '2 godz.', w0: 72.4, rate: -0.45, diet: 85, workouts: '3 z 4', sc: [4, 3, 2], sentAt: 'wysłany dziś, 10:24',
    q: 'W piątek było wesele i odpuściłam dietę na jeden wieczór. Lepiej następnego dnia zjeść mniej czy trzymać plan normalnie? Mogę dodać jedno cardio w tygodniu?' },
  { id: 'ow', full: 'Aleksandra Wójcik', first: 'Ola', firstTo: 'Oli', goal: 'Redukcja', week: 5, age: 34, height: 164, status: 'raport', when: '5 godz.', w0: 81.0, rate: -0.6, diet: 70, workouts: '2 z 3', sc: [3, 2, 4], sentAt: 'wysłany dziś, 07:51',
    q: 'Mam mało energii na popołudniowych treningach. Czy mogę przesunąć więcej węglowodanów na obiad?' },
  { id: 'mw', full: 'Marek Wiśniewski', first: 'Marek', firstTo: 'Marka', goal: 'Budowa mięśni', week: 1, age: 31, height: 182, status: 'ankieta', when: 'wczoraj', w0: 76.0, rate: 0.2, diet: 0, workouts: '—', sc: [4, 4, 3], sentAt: 'ankieta startowa, wczoraj',
    q: 'Chcę przybrać na masie, ale mam ograniczony czas — max 3 treningi po godzinie. Siłownia osiedlowa, bez maszyn.' },
  { id: 'tk', full: 'Tomasz Kaczmarek', first: 'Tomek', firstTo: 'Tomka', goal: 'Siła i sprawność', week: 10, age: 42, height: 178, status: 'spóźniony', when: '4 dni', w0: 88.0, rate: -0.15, diet: 75, workouts: '2 z 4', sc: [3, 3, 4], sentAt: 'raport z tygodnia 9',
    q: 'Bark trochę boli przy wyciskaniu nad głowę. Zamienić na coś innego?' },
  { id: 'jl', full: 'Julia Lewandowska', first: 'Julia', firstTo: 'Julii', goal: 'Zdrowie i samopoczucie', week: 6, age: 26, height: 171, status: 'ok', when: 'wt.', w0: 63.0, rate: -0.1, diet: 90, workouts: '4 z 4', sc: [5, 4, 2], sentAt: 'sprawdzony 13.10',
    q: 'Wszystko dobrze, plecy dużo lepiej!' },
  { id: 'pd', full: 'Piotr Dąbrowski', first: 'Piotr', firstTo: 'Piotra', goal: 'Redukcja', week: 3, age: 38, height: 185, status: 'ok', when: 'pon.', w0: 102.0, rate: -0.8, diet: 80, workouts: '3 z 3', sc: [4, 3, 3], sentAt: 'sprawdzony 12.10',
    q: 'Czy mogę jeść owoce wieczorem?' },
];

export const CLIENTS: Client[] = RAW.map(({ w0, rate, ...c }, i) => {
  const n = Math.max(2, Math.min(c.week + 1, 9));
  return {
    ...c,
    ini: c.full.split(' ').map(x => x[0]).join(''),
    avBg: AV[i],
    weights: Array.from({ length: n }, (_, k) => +(w0 + rate * k + (k % 3 === 1 ? 0.2 : 0)).toFixed(1)),
  };
});

export const STATUS: Record<Status, [string, string]> = {
  raport: ['Nowy raport', 'tag-accent'],
  ankieta: ['Nowa ankieta', 'tag-accent-2'],
  spóźniony: ['Brak raportu', 'tag-neutral'],
  ok: ['Sprawdzony', 'tag-outline'],
};

/** Circumferences: label, start, change this week, change since start (cm). */
export const CIRC: [string, number, number, number][] = [
  ['Talia', 82, -0.5, -5], ['Biodra', 102, -0.5, -3.5], ['Klatka', 92, 0, -2], ['Ramię', 30, 0, -1], ['Udo', 60, -0.5, -2.5],
];

export const SNIPPETS = [
  'Świetna robota w tym tygodniu!',
  'Po jednym luźniejszym wieczorze wracamy do planu bez kompensacji.',
  'Dodaję 1 cardio 30 min w sobotę.',
  'Zwiększamy ciężar w przysiadzie o 2,5 kg.',
];

const BASEPLAN: Record<PlanDay, string[][]> = {
  A: [['Wyciskanie hantli, ławka skośna', '4', '10', '2×14 kg', ''], ['Wiosłowanie hantlem', '4', '10', '16 kg', ''], ['Ściąganie drążka', '3', '12', '35 kg', 'Łopatki w dół przed ruchem.'], ['Wyciskanie nad głowę', '3', '10', '2×8 kg', ''], ['Face pull', '3', '15', '15 kg', '']],
  B: [['Przysiad ze sztangą', '4', '8', '50 kg', 'Pełny zakres, pauza 1 s na dole.'], ['Martwy ciąg rumuński', '3', '10', '40 kg', 'Plecy proste, sztanga blisko nóg.'], ['Hip thrust', '4', '10', '60 kg', ''], ['Wykroki chodzone', '3', '12', '2×10 kg', ''], ['Plank', '3', '45 s', '', '']],
  C: [['Martwy ciąg klasyczny', '4', '6', '60 kg', 'Ostatnia seria RPE 8.'], ['Pompki', '3', 'max', '', ''], ['Goblet squat', '3', '12', '16 kg', ''], ['Wiosłowanie TRX', '3', '12', '', ''], ['Spacer farmera', '3', '40 m', '2×16 kg', '']],
  K: [['Rower stacjonarny', '1', '40 min', '', 'Tętno 130–145.']],
};

export const DAYINFO: Record<PlanDay, string> = { A: 'Środa · Góra ciała', B: 'Poniedziałek · Dół ciała', C: 'Piątek · Całe ciało', K: 'Sobota · Cardio' };

const BASEMENU: Record<string, [string, string, number][]> = {
  A: [['07:30', 'Owsianka z masłem orzechowym i bananem', 480], ['10:30', 'Skyr z borówkami i miodem', 230], ['13:30', 'Kurczak z ryżem jaśminowym i brokułem', 560], ['16:30', 'Kanapki z twarożkiem i rzodkiewką', 270], ['19:30', 'Omlet ze szpinakiem i fetą', 310]],
  B: [['07:30', 'Jajecznica na maśle z pieczywem', 450], ['10:30', 'Jogurt grecki z granolą', 280], ['13:30', 'Indyk z kaszą bulgur i warzywami', 540], ['16:30', 'Jabłko i garść migdałów', 220], ['19:30', 'Sałatka z tuńczykiem i ciecierzycą', 360]],
  C: [['07:30', 'Placki proteinowe z owocami', 470], ['10:30', 'Hummus z warzywami', 240], ['13:30', 'Łosoś z ziemniakami i fasolką', 580], ['16:30', 'Serek wiejski z pomidorem', 200], ['19:30', 'Wrap z kurczakiem i warzywami', 360]],
};

export const newPlan = (): Plan => Object.fromEntries(Object.entries(BASEPLAN).map(([k, v]) =>
  [k, v.map(([name, sets, reps, load, note]) => ({ name, sets, reps, load, note }))])) as Plan;

export const newDiet = (): Diet => ({
  p: '130', f: '60', c: '195',
  menu: Object.fromEntries(Object.entries(BASEMENU).map(([k, v]) => [k, v.map(([time, name, kcal]) => ({ time, name, kcal: String(kcal) }))])),
});

export const THREADS: Record<string, Msg[]> = {
  kn: [{ me: false, text: 'Dzięki! Mogę w dniu B zamienić kolację na omlet?', time: 'Nd 20:04' }, { me: true, text: 'Jasne, makro wychodzi prawie identycznie. Daj znać po treningu, jak poszło.', time: 'Dziś 08:12' }, { me: false, text: 'Raport wysłany. Przysiad 50 kg wszedł!', time: 'Dziś 10:25' }],
  ow: [{ me: false, text: 'Wysłałam raport, trochę słabszy tydzień.', time: 'Dziś 07:52' }],
  mw: [{ me: false, text: 'Cześć, wypełniłem ankietę. Kiedy mogę zacząć?', time: 'Wczoraj 19:10' }],
  tk: [{ me: true, text: 'Tomek, czekam na raport z tygodnia 10. Wszystko ok?', time: 'Pt 09:00' }],
  jl: [{ me: true, text: 'Super tydzień, tak trzymaj.', time: 'Wt 18:40' }],
  pd: [{ me: false, text: 'Dzięki za plan!', time: 'Pon 21:02' }],
};

export const UNREAD = ['kn', 'ow', 'mw'];

type EventKind = 's' | 'k' | 'r' | 'z'; // session, call, report, admin
export const CAL: { d: string; n: number; ev: [string, string, EventKind][] }[] = [
  { d: 'Pn', n: 19, ev: [['07:00', 'Trening personalny — Marek W.', 's'], ['10:24', 'Raport — Kasia N.', 'r'], ['17:30', 'Konsultacja online — nowa klientka', 'k']] },
  { d: 'Wt', n: 20, ev: [['09:00', 'Plan startowy — Marek W.', 'z'], ['18:00', 'Check-in wideo — Ola W.', 'k']] },
  { d: 'Śr', n: 21, ev: [['07:00', 'Trening personalny — Piotr D.', 's']] },
  { d: 'Cz', n: 22, ev: [['12:00', 'Aktualizacja jadłospisów', 'z']] },
  { d: 'Pt', n: 23, ev: [['07:00', 'Trening personalny — Marek W.', 's'], ['16:00', 'Check-in wideo — Tomek K.', 'k']] },
  { d: 'Sb', n: 24, ev: [] },
  { d: 'Nd', n: 25, ev: [['20:00', 'Termin raportów tygodniowych (6)', 'r']] },
];

export const EVENT_COLORS: Record<EventKind, [string, string]> = {
  s: ['var(--color-accent-700)', 'var(--color-bg)'],
  k: ['var(--color-accent-2-200)', 'var(--color-accent-2-900)'],
  r: ['var(--color-accent-200)', 'var(--color-accent-900)'],
  z: ['var(--color-neutral-300)', 'var(--color-neutral-900)'],
};

export const INIT_TASKS: Task[] = [
  { text: 'Sprawdź raport — Kasia N.', due: 'Dziś', done: false },
  { text: 'Sprawdź raport — Ola W.', due: 'Dziś', done: false },
  { text: 'Plan startowy dla Marka W.', due: 'Wt, 20.10', done: false },
  { text: 'Przypomnij o raporcie — Tomek K.', due: 'Dziś', done: false },
  { text: 'Zamówić taśmy oporowe', due: 'Ten tydzień', done: true },
];

export const pl = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
export const sgn = (d: number) => d === 0 ? '0' : (d < 0 ? '−' : '+') + pl(Math.abs(d));
export const num = (v: string) => parseFloat(String(v).replace(',', '.')) || 0;
