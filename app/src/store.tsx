import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  INIT_HISTORY, INIT_MSGS, LOG, type DietDay, type HistoryEntry, type Message,
} from '@/data/sample';
import { mmss, num, thousands } from '@/lib/format';

// All client state lives here, in memory, until the app talks to the trainer backend.

export type PhotoView = 'Przód' | 'Bok' | 'Tył';
export const PHOTO_VIEWS: PhotoView[] = ['Przód', 'Bok', 'Tył'];

export type SetRow = { kg: string; reps: string; done: boolean };
export type ScaleKey = 'mood' | 'sleep' | 'stress';

export type Survey = {
  goal: number;
  days: string[];
  exp: number;
  age: string;
  height: string;
  weight: string;
  limits: string;
};

export type Report = {
  photos: Partial<Record<PhotoView, string>>; // local image URIs
  weight: string;
  circ: Record<string, string>;
  scales: Partial<Record<ScaleKey, number>>;
  diet: number;
  q: string;
};

const initialLog = () => {
  const log: Record<string, SetRow[]> = {};
  LOG.forEach(e => {
    log[e.id] = Array.from({ length: e.sets }, () => ({ kg: e.kg ? String(e.kg) : '', reps: String(e.reps), done: false }));
  });
  return log;
};

/** Total kg moved in completed sets; timed exercises (plank) don't count. */
export const logVolume = (log: Record<string, SetRow[]>) =>
  LOG.reduce((vol, e) => e.time ? vol : vol + log[e.id].filter(x => x.done).reduce((a, x) => a + num(x.kg) * num(x.reps), 0), 0);

function useAppState() {
  const [onboarded, setOnboarded] = useState(false);
  const [survey, setSurveyState] = useState<Survey>({ goal: 0, days: ['Pn', 'Śr', 'Pt', 'Sb'], exp: 1, age: '29', height: '168', weight: '72,4', limits: '' });
  const [log, setLogState] = useState(initialLog);
  const [elapsed, setElapsed] = useState(0);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(INIT_HISTORY);
  const [dietDay, setDietDay] = useState<DietDay>('A');
  const [eaten, setEaten] = useState<Record<string, boolean>>({ A0: true, A1: true });
  const [rep, setRepState] = useState<Report>({ photos: {}, weight: '', circ: {}, scales: {}, diet: 85, q: '' });
  const [repSent, setRepSent] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>(INIT_MSGS);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const actions = useMemo(() => ({
    finishOnboarding: () => setOnboarded(true),
    setSurvey: (patch: Partial<Survey>) => setSurveyState(s => ({ ...s, ...patch })),
    toggleDay: (d: string) => setSurveyState(s => ({ ...s, days: s.days.includes(d) ? s.days.filter(x => x !== d) : [...s.days, d] })),

    setSet: (id: string, i: number, patch: Partial<SetRow>) =>
      setLogState(l => ({ ...l, [id]: l[id].map((x, j) => j === i ? { ...x, ...patch } : x) })),
    addSet: (id: string) =>
      setLogState(l => ({ ...l, [id]: [...l[id], { ...l[id][l[id].length - 1], done: false }] })),
    tick: () => setElapsed(e => e + 1),
    finishWorkout: (seconds: number, volume: number) => {
      setWorkoutDone(true);
      setHistory(h => [{ w: 'B', title: 'B — Dół ciała', date: 'Pn 19.10', time: Math.max(1, Math.round(seconds / 60)) + ' min', vol: thousands(volume) + ' kg' }, ...h]);
    },

    pickDietDay: setDietDay,
    toggleEaten: (key: string) => setEaten(e => ({ ...e, [key]: !e[key] })),

    setRep: (patch: Partial<Report>) => setRepState(r => ({ ...r, ...patch })),
    sendReport: () => setRepSent(true),

    sendMessage: (text: string) => {
      const t = text.trim();
      if (!t) return;
      setMsgs(m => [...m, { me: true, text: t, time: 'Teraz' }]);
      // Demo stand-in for the trainer's reply until chat goes through the backend.
      clearTimeout(replyTimer.current);
      replyTimer.current = setTimeout(() => setMsgs(m => [...m, { me: false, text: 'Dzięki, zerknę wieczorem i odpiszę.', time: 'Teraz' }]), 1800);
    },
  }), []);

  return {
    onboarded, survey, log, volume: logVolume(log), elapsed, elapsedLabel: mmss(elapsed), workoutDone, history,
    dietDay, eaten, rep, repSent, msgs,
    ...actions,
  };
}

type AppState = ReturnType<typeof useAppState>;
const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={useAppState()}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStateProvider');
  return v;
}
