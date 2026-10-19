import type { DietPlan, PlanRow, Survey, TrainingPlan, WorkoutKey } from './types';

// Starting points the trainer edits for a new client.

const rows = (r: string[][]): PlanRow[] => r.map(([name, sets, reps, load, note]) => ({ name, sets, reps, load, note }));

const BASE: Record<WorkoutKey, { title: string; rows: PlanRow[] }> = {
  A: { title: 'A — Góra ciała', rows: rows([['Wyciskanie hantli, ławka skośna', '4', '10', '2×14 kg', ''], ['Wiosłowanie hantlem', '4', '10', '16 kg', ''], ['Ściąganie drążka', '3', '12', '35 kg', 'Łopatki w dół przed ruchem.'], ['Wyciskanie nad głowę', '3', '10', '2×8 kg', ''], ['Face pull', '3', '15', '15 kg', '']]) },
  B: { title: 'B — Dół ciała', rows: rows([['Przysiad ze sztangą', '4', '8', '50 kg', 'Pełny zakres, pauza 1 s na dole.'], ['Martwy ciąg rumuński', '3', '10', '40 kg', 'Plecy proste, sztanga blisko nóg.'], ['Hip thrust', '4', '10', '60 kg', ''], ['Wykroki chodzone', '3', '12', '2×10 kg', ''], ['Plank', '3', '45 s', '', '']]) },
  C: { title: 'C — Całe ciało', rows: rows([['Martwy ciąg klasyczny', '4', '6', '60 kg', 'Ostatnia seria RPE 8.'], ['Pompki', '3', 'max', '', ''], ['Goblet squat', '3', '12', '16 kg', ''], ['Wiosłowanie TRX', '3', '12', '', ''], ['Spacer farmera', '3', '40 m', '2×16 kg', '']]) },
  K: { title: 'Cardio', rows: rows([['Rower stacjonarny', '1', '40 min', '', 'Tętno 130–145.']]) },
};

/** Starter plan: workouts A, B, C (and cardio) placed on the days the client said they can train. */
export function planTemplate(survey?: Survey): TrainingPlan {
  const days = survey?.days ?? ['Pn', 'Śr', 'Pt'];
  const order: WorkoutKey[] = ['A', 'B', 'C', 'K'];
  return {
    days: Object.fromEntries(order.map((k, i) => [k, { title: BASE[k].title, weekday: days[i] ?? '', rows: BASE[k].rows.map(r => ({ ...r })) }])) as TrainingPlan['days'],
  };
}

export function dietTemplate(): DietPlan {
  return {
    p: '130', f: '60', c: '195',
    note: 'Woda min. 2,5 l dziennie. Posiłki możesz przestawiać w obrębie dnia.',
    days: {
  A: [
    {
      time: '07:30',
      label: 'Śniadanie',
      name: 'Owsianka z masłem orzechowym i bananem',
      kcal: '480',
      p: '22',
      f: '16',
      c: '62',
      ing: 'Płatki owsiane: 60 g\nMleko 2%: 200 ml\nBanan: 100 g\nMasło orzechowe: 15 g\nOdżywka białkowa: 15 g'
    },
    {
      time: '10:30',
      label: 'II śniadanie',
      name: 'Skyr z borówkami i miodem',
      kcal: '230',
      p: '22',
      f: '2',
      c: '30',
      ing: 'Skyr naturalny: 200 g\nBorówki: 80 g\nMiód: 10 g'
    },
    {
      time: '13:30',
      label: 'Obiad',
      name: 'Kurczak z ryżem jaśminowym i brokułem',
      kcal: '560',
      p: '45',
      f: '14',
      c: '62',
      ing: 'Pierś z kurczaka: 150 g\nRyż jaśminowy (suchy): 70 g\nBrokuł: 150 g\nOliwa: 10 g'
    },
    {
      time: '16:30',
      label: 'Podwieczorek',
      name: 'Kanapki z twarożkiem i rzodkiewką',
      kcal: '270',
      p: '18',
      f: '8',
      c: '32',
      ing: 'Chleb żytni: 60 g\nTwarożek półtłusty: 80 g\nRzodkiewka: 50 g'
    },
    {
      time: '19:30',
      label: 'Kolacja',
      name: 'Omlet ze szpinakiem i fetą',
      kcal: '310',
      p: '23',
      f: '20',
      c: '9',
      ing: 'Jajka: 3 szt.\nSzpinak: 80 g\nFeta: 30 g\nPomidorki: 100 g'
    }
  ],
  B: [
    {
      time: '07:30',
      label: 'Śniadanie',
      name: 'Jajecznica na maśle z pieczywem',
      kcal: '450',
      p: '26',
      f: '22',
      c: '36',
      ing: 'Jajka: 3 szt.\nMasło: 5 g\nChleb żytni: 70 g\nOgórek: 100 g'
    },
    {
      time: '10:30',
      label: 'II śniadanie',
      name: 'Jogurt grecki z granolą',
      kcal: '280',
      p: '18',
      f: '8',
      c: '34',
      ing: 'Jogurt grecki 2%: 200 g\nGranola: 30 g'
    },
    {
      time: '13:30',
      label: 'Obiad',
      name: 'Indyk z kaszą bulgur i warzywami',
      kcal: '540',
      p: '42',
      f: '12',
      c: '64',
      ing: 'Filet z indyka: 150 g\nBulgur (suchy): 70 g\nCukinia i papryka: 200 g\nOliwa: 8 g'
    },
    {
      time: '16:30',
      label: 'Podwieczorek',
      name: 'Jabłko i garść migdałów',
      kcal: '220',
      p: '6',
      f: '12',
      c: '24',
      ing: 'Jabłko: 180 g\nMigdały: 20 g'
    },
    {
      time: '19:30',
      label: 'Kolacja',
      name: 'Sałatka z tuńczykiem i ciecierzycą',
      kcal: '360',
      p: '38',
      f: '8',
      c: '36',
      ing: 'Tuńczyk w sosie własnym: 120 g\nCiecierzyca: 80 g\nSałata, pomidor: 150 g'
    }
  ],
  C: [
    {
      time: '07:30',
      label: 'Śniadanie',
      name: 'Placki proteinowe z owocami',
      kcal: '470',
      p: '32',
      f: '12',
      c: '58',
      ing: 'Płatki owsiane: 50 g\nJajko: 1 szt.\nOdżywka białkowa: 20 g\nTruskawki: 150 g'
    },
    {
      time: '10:30',
      label: 'II śniadanie',
      name: 'Hummus z warzywami',
      kcal: '240',
      p: '9',
      f: '12',
      c: '24',
      ing: 'Hummus: 60 g\nMarchew, papryka: 200 g'
    },
    {
      time: '13:30',
      label: 'Obiad',
      name: 'Łosoś z ziemniakami i fasolką',
      kcal: '580',
      p: '38',
      f: '22',
      c: '52',
      ing: 'Łosoś: 130 g\nZiemniaki: 250 g\nFasolka szparagowa: 150 g'
    },
    {
      time: '16:30',
      label: 'Podwieczorek',
      name: 'Serek wiejski z pomidorem',
      kcal: '200',
      p: '20',
      f: '8',
      c: '10',
      ing: 'Serek wiejski: 200 g\nPomidor: 120 g'
    },
    {
      time: '19:30',
      label: 'Kolacja',
      name: 'Wrap z kurczakiem i warzywami',
      kcal: '360',
      p: '31',
      f: '8',
      c: '44',
      ing: 'Tortilla pełnoziarnista: 1 szt.\nKurczak: 90 g\nWarzywa: 120 g\nJogurt naturalny: 40 g'
    }
  ]
},
  };
}
