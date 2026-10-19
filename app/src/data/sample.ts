// Sample data for Kasia, week 8 of 12. Mirrors the Claude Design prototype until a backend exists.

export type LogExercise = {
  id: string;
  name: string;
  target: string;
  kg: number;
  reps: number;
  sets: number;
  last: string;
  note: string;
  time?: boolean;
};

export type PlanItem = { name: string; target: string; load: string; note?: string };

export type WeekDay = { d: string; n: number; w?: WorkoutKey; title?: string };

export type WorkoutKey = 'A' | 'B' | 'C' | 'K';

export type Meal = {
  time: string;
  label: string;
  name: string;
  kcal: number;
  p: number;
  f: number;
  c: number;
  ing: { n: string; q: string }[];
};

export type DietDay = 'A' | 'B' | 'C';

export type Message = { me: boolean; text: string; time: string };

export type HistoryEntry = { w: string; title: string; date: string; time: string; vol: string };

export const CLIENT = { first: 'Kasia', initials: 'KN' };
export const TODAY_LABEL = 'Poniedziałek, 19 października';
export const KCAL_TARGET = 1850;

export const LOG: LogExercise[] = [
  { id: 'sq', name: 'Przysiad ze sztangą', target: '4 × 8', kg: 50, reps: 8, sets: 4, last: '47,5 kg × 8', note: 'Pełny zakres, pauza 1 s na dole.' },
  { id: 'rdl', name: 'Martwy ciąg rumuński', target: '3 × 10', kg: 40, reps: 10, sets: 3, last: '40 kg × 10', note: 'Plecy proste, sztanga blisko nóg.' },
  { id: 'ht', name: 'Hip thrust', target: '4 × 10', kg: 60, reps: 10, sets: 4, last: '55 kg × 10', note: '' },
  { id: 'lu', name: 'Wykroki chodzone', target: '3 × 12', kg: 10, reps: 12, sets: 3, last: '2 × 8 kg × 12', note: 'Hantle po 10 kg w każdej ręce.' },
  { id: 'pl', name: 'Plank', target: '3 × 45 s', kg: 0, reps: 45, sets: 3, last: '3 × 40 s', note: '', time: true },
];

export const PLANS: Record<WorkoutKey, PlanItem[]> = {
  B: LOG.map(e => ({ name: e.name, target: e.target, load: e.kg ? e.kg + ' kg' : '', note: e.note })),
  A: [
    { name: 'Wyciskanie hantli, ławka skośna', target: '4 × 10', load: '2 × 14 kg' },
    { name: 'Wiosłowanie hantlem', target: '4 × 10', load: '16 kg' },
    { name: 'Ściąganie drążka', target: '3 × 12', load: '35 kg', note: 'Łopatki w dół przed ruchem.' },
    { name: 'Wyciskanie nad głowę', target: '3 × 10', load: '2 × 8 kg' },
    { name: 'Face pull', target: '3 × 15', load: '15 kg' },
  ],
  C: [
    { name: 'Martwy ciąg klasyczny', target: '4 × 6', load: '60 kg', note: 'Ostatnia seria RPE 8.' },
    { name: 'Pompki', target: '3 × max', load: '' },
    { name: 'Goblet squat', target: '3 × 12', load: '16 kg' },
    { name: 'Wiosłowanie TRX', target: '3 × 12', load: '' },
    { name: 'Spacer farmera', target: '3 × 40 m', load: '2 × 16 kg' },
  ],
  K: [{ name: 'Rower stacjonarny', target: '40 min', load: 'tętno 130–145' }],
};

export const WEEK: WeekDay[] = [
  { d: 'Pn', n: 19, w: 'B', title: 'B — Dół ciała' },
  { d: 'Wt', n: 20 },
  { d: 'Śr', n: 21, w: 'A', title: 'A — Góra ciała' },
  { d: 'Cz', n: 22 },
  { d: 'Pt', n: 23, w: 'C', title: 'C — Całe ciało' },
  { d: 'Sb', n: 24, w: 'K', title: 'Cardio' },
  { d: 'Nd', n: 25 },
];

export const FULL_DAY: Record<string, string> = {
  Pn: 'Poniedziałek', Wt: 'Wtorek', Śr: 'Środa', Cz: 'Czwartek', Pt: 'Piątek', Sb: 'Sobota', Nd: 'Niedziela',
};

const ing = (s: string) => s.split('|').map(x => { const [n, q] = x.split(':'); return { n, q }; });

export const MEALS: Record<DietDay, Meal[]> = {
  A: [
    { time: '07:30', label: 'Śniadanie', name: 'Owsianka z masłem orzechowym i bananem', kcal: 480, p: 22, f: 16, c: 62, ing: ing('Płatki owsiane:60 g|Mleko 2%:200 ml|Banan:100 g|Masło orzechowe:15 g|Odżywka białkowa:15 g') },
    { time: '10:30', label: 'II śniadanie', name: 'Skyr z borówkami i miodem', kcal: 230, p: 22, f: 2, c: 30, ing: ing('Skyr naturalny:200 g|Borówki:80 g|Miód:10 g') },
    { time: '13:30', label: 'Obiad', name: 'Kurczak z ryżem jaśminowym i brokułem', kcal: 560, p: 45, f: 14, c: 62, ing: ing('Pierś z kurczaka:150 g|Ryż jaśminowy (suchy):70 g|Brokuł:150 g|Oliwa:10 g') },
    { time: '16:30', label: 'Podwieczorek', name: 'Kanapki z twarożkiem i rzodkiewką', kcal: 270, p: 18, f: 8, c: 32, ing: ing('Chleb żytni:60 g|Twarożek półtłusty:80 g|Rzodkiewka:50 g') },
    { time: '19:30', label: 'Kolacja', name: 'Omlet ze szpinakiem i fetą', kcal: 310, p: 23, f: 20, c: 9, ing: ing('Jajka:3 szt.|Szpinak:80 g|Feta:30 g|Pomidorki:100 g') },
  ],
  B: [
    { time: '07:30', label: 'Śniadanie', name: 'Jajecznica na maśle z pieczywem', kcal: 450, p: 26, f: 22, c: 36, ing: ing('Jajka:3 szt.|Masło:5 g|Chleb żytni:70 g|Ogórek:100 g') },
    { time: '10:30', label: 'II śniadanie', name: 'Jogurt grecki z granolą', kcal: 280, p: 18, f: 8, c: 34, ing: ing('Jogurt grecki 2%:200 g|Granola:30 g') },
    { time: '13:30', label: 'Obiad', name: 'Indyk z kaszą bulgur i warzywami', kcal: 540, p: 42, f: 12, c: 64, ing: ing('Filet z indyka:150 g|Bulgur (suchy):70 g|Cukinia i papryka:200 g|Oliwa:8 g') },
    { time: '16:30', label: 'Podwieczorek', name: 'Jabłko i garść migdałów', kcal: 220, p: 6, f: 12, c: 24, ing: ing('Jabłko:180 g|Migdały:20 g') },
    { time: '19:30', label: 'Kolacja', name: 'Sałatka z tuńczykiem i ciecierzycą', kcal: 360, p: 38, f: 8, c: 36, ing: ing('Tuńczyk w sosie własnym:120 g|Ciecierzyca:80 g|Sałata, pomidor:150 g') },
  ],
  C: [
    { time: '07:30', label: 'Śniadanie', name: 'Placki proteinowe z owocami', kcal: 470, p: 32, f: 12, c: 58, ing: ing('Płatki owsiane:50 g|Jajko:1 szt.|Odżywka białkowa:20 g|Truskawki:150 g') },
    { time: '10:30', label: 'II śniadanie', name: 'Hummus z warzywami', kcal: 240, p: 9, f: 12, c: 24, ing: ing('Hummus:60 g|Marchew, papryka:200 g') },
    { time: '13:30', label: 'Obiad', name: 'Łosoś z ziemniakami i fasolką', kcal: 580, p: 38, f: 22, c: 52, ing: ing('Łosoś:130 g|Ziemniaki:250 g|Fasolka szparagowa:150 g') },
    { time: '16:30', label: 'Podwieczorek', name: 'Serek wiejski z pomidorem', kcal: 200, p: 20, f: 8, c: 10, ing: ing('Serek wiejski:200 g|Pomidor:120 g') },
    { time: '19:30', label: 'Kolacja', name: 'Wrap z kurczakiem i warzywami', kcal: 360, p: 31, f: 8, c: 44, ing: ing('Tortilla pełnoziarnista:1 szt.|Kurczak:90 g|Warzywa:120 g|Jogurt naturalny:40 g') },
  ],
};

export type MetricKey = 'waga' | 'talia' | 'biodra';

export const SERIES: Record<MetricKey, { label: string; unit: string; v: number[] }> = {
  waga: { label: 'Waga', unit: 'kg', v: [72.4, 71.9, 71.6, 71.0, 70.8, 70.1, 69.7, 69.2] },
  talia: { label: 'Talia', unit: 'cm', v: [82, 81.5, 80.5, 80, 79.5, 78.5, 77.5, 77] },
  biodra: { label: 'Biodra', unit: 'cm', v: [102, 101.5, 101, 100.5, 100, 99.5, 99, 98.5] },
};

export const CIRC = [
  { k: 'talia', label: 'Talia', s: 82, n: 77 },
  { k: 'biodra', label: 'Biodra', s: 102, n: 98.5 },
  { k: 'klatka', label: 'Klatka', s: 92, n: 90 },
  { k: 'ramie', label: 'Ramię', s: 30, n: 29 },
  { k: 'udo', label: 'Udo', s: 60, n: 57.5 },
];

export const PREV_WEIGHT = '69,2';

export const INIT_MSGS: Message[] = [
  { me: false, text: 'Kasia, świetny raport. Waga spada równo, a talia poszła w dół o pół centymetra.', time: 'Pt 18:20' },
  { me: false, text: 'Od poniedziałku podnosimy przysiad do 50 kg. Jeśli technika się posypie, zostań przy 47,5.', time: 'Pt 18:21' },
  { me: true, text: 'Dzięki! Mogę w dniu B zamienić kolację na omlet?', time: 'Nd 20:04' },
  { me: false, text: 'Jasne, makro wychodzi prawie identycznie. Daj znać po treningu, jak poszło.', time: 'Dziś 08:12' },
];

export const INIT_HISTORY: HistoryEntry[] = [
  { w: 'C', title: 'C — Całe ciało', date: 'Pt 16.10', time: '52 min', vol: '7 840 kg' },
  { w: 'A', title: 'A — Góra ciała', date: 'Śr 14.10', time: '48 min', vol: '5 260 kg' },
  { w: 'B', title: 'B — Dół ciała', date: 'Pn 12.10', time: '57 min', vol: '8 450 kg' },
];

export const GOALS = [
  ['Redukcja tkanki tłuszczowej', 'Mniej kilogramów i centymetrów'],
  ['Budowa mięśni', 'Więcej siły i lepsza sylwetka'],
  ['Siła i sprawność', 'Lepsze wyniki i kondycja'],
  ['Zdrowie i samopoczucie', 'Ruch bez bólu, więcej energii'],
] as const;

export const EXPERIENCE = ['Początkujący', 'Średni', 'Zaawansowany'] as const;

export const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'] as const;
