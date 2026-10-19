import {
  createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile, type User,
} from 'firebase/auth';
import {
  addDoc, collection, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { auth, db } from '@/backend/firebase';
import {
  type ClientDoc, type DietDay, type DietPlan, type Message, type PhotoView, type Report, type ScaleKey, type Survey,
  type TrainingPlan, type Workout, type WorkoutKey,
} from '@/backend/types';
import { dayKey, programWeek, startOfWeek, weekdayShort } from '@/lib/dates';
import { mmss, num } from '@/lib/format';
import { loadLocal, saveLocal } from '@/lib/local';

export const PHOTO_VIEWS: PhotoView[] = ['Przód', 'Bok', 'Tył'];
export type { PhotoView, ScaleKey };

export type SetRow = { kg: string; reps: string; done: boolean };
export type LogExercise = { name: string; target: string; note: string; time: boolean; last: string; sets: SetRow[] };

export type ReportDraft = {
  photos: Partial<Record<PhotoView, string>>; // compressed JPEG data URIs
  weight: string;
  circ: Record<string, string>;
  scales: Partial<Record<ScaleKey, number>>;
  diet: number;
  q: string;
};

const emptyReport = (): ReportDraft => ({ photos: {}, weight: '', circ: {}, scales: {}, diet: 85, q: '' });

/** Polish error text for the auth errors a client can actually hit. */
export function authError(e: unknown) {
  const code = (e as { code?: string })?.code ?? '';
  if (code.includes('email-already-in-use')) return 'Na ten e-mail jest już konto. Zaloguj się.';
  if (code.includes('invalid-email')) return 'Ten adres e-mail wygląda na niepoprawny.';
  if (code.includes('weak-password')) return 'Hasło musi mieć co najmniej 6 znaków.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Zły e-mail albo hasło.';
  if (code.includes('too-many-requests')) return 'Za dużo prób. Spróbuj za kilka minut.';
  if (code.includes('network')) return 'Brak połączenia z internetem.';
  return 'Coś poszło nie tak. Spróbuj jeszcze raz.';
}

/** Turns a plan row into the starting values of the set logger. */
function exerciseFromPlan(row: TrainingPlan['days'][WorkoutKey]['rows'][number], lastWorkout?: Workout): LogExercise {
  const time = /\b(s|sek|min)\b/.test(row.reps);
  const kgMatch = row.load.match(/(\d+(?:[.,]\d+)?)\s*kg/);
  const kg = kgMatch ? kgMatch[1] : '';
  const reps = String(parseInt(row.reps, 10) || '');
  const prev = lastWorkout?.exercises.find(x => x.name === row.name)?.sets ?? [];
  const best = prev[0];
  const last = best ? (time ? `${prev.length} × ${best.reps} s` : best.kg ? `${best.kg} kg × ${best.reps}` : `${prev.length} × ${best.reps}`) : '—';
  return {
    name: row.name,
    target: `${row.sets} × ${row.reps}`,
    note: row.note,
    time,
    last,
    sets: Array.from({ length: Math.max(1, parseInt(row.sets, 10) || 3) }, () => ({ kg: time ? '' : kg, reps, done: false })),
  };
}

type Live = {
  uid: string | undefined;
  client: ClientDoc | null | undefined;
  plan: TrainingPlan | null | undefined;
  diet: DietPlan | null | undefined;
  reports: Report[];
  workouts: Workout[];
  msgs: Message[];
  photos: Record<string, string>;
};
const EMPTY: Omit<Live, 'uid'> = { client: undefined, plan: undefined, diet: undefined, reports: [], workouts: [], msgs: [], photos: {} };

function useAppState() {
  // ── session ──
  const [user, setUser] = useState<User | null | undefined>(undefined);
  // Everything streamed from the database, tagged with the user it belongs to,
  // so signing out (or in as someone else) never shows the previous person's data.
  const [live, setLive] = useState<Live>({ uid: undefined, ...EMPTY });
  const uid = user?.uid;

  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  useEffect(() => {
    if (!uid) return;
    const put = (patch: Partial<Live>) => setLive(l => ({ ...(l.uid === uid ? l : { uid, ...EMPTY }), ...patch, uid }));
    const base = doc(db, 'clients', uid);
    const unsubs = [
      onSnapshot(base, s => put({ client: s.exists() ? (s.data() as ClientDoc) : null }), () => put({ client: null })),
      onSnapshot(doc(base, 'plan', 'training'), s => put({ plan: s.exists() ? (s.data() as TrainingPlan) : null }), () => put({ plan: null })),
      onSnapshot(doc(base, 'plan', 'diet'), s => put({ diet: s.exists() ? (s.data() as DietPlan) : null }), () => put({ diet: null })),
      onSnapshot(query(collection(base, 'reports'), orderBy('createdAt', 'desc'), limit(60)),
        s => put({ reports: s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Report) }), () => {}),
      onSnapshot(query(collection(base, 'workouts'), orderBy('createdAt', 'desc'), limit(30)),
        s => put({ workouts: s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Workout) }), () => {}),
      onSnapshot(query(collection(base, 'messages'), orderBy('createdAt', 'asc'), limit(300)),
        s => put({ msgs: s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Message) }), () => {}),
    ];
    return () => unsubs.forEach(u => u());
  }, [uid]);

  const L = uid && live.uid === uid ? live : { uid, ...EMPTY, client: user === null ? null : undefined };
  const { client, plan, diet, reports, workouts, msgs, photos } = L;
  const setPhotos = useCallback((fn: (p: Record<string, string>) => Record<string, string>) =>
    setLive(l => l.uid === uid ? { ...l, photos: fn(l.photos) } : l), [uid]);

  // ── onboarding ──
  const [survey, setSurveyState] = useState<Survey>({ goal: 'Redukcja tkanki tłuszczowej', days: ['Pn', 'Śr', 'Pt'], exp: 'Średni', age: '', height: '', weight: '', limits: '' });

  // ── workout log (kept in memory while the screen is open) ──
  const [logKey, setLogKey] = useState<WorkoutKey | null>(null);
  const [logEx, setLogEx] = useState<LogExercise[]>([]);
  const [elapsed, setElapsed] = useState(0);

  // ── diet ticks, remembered per day on this device ──
  const today = dayKey(new Date());
  const [eaten, setEaten] = useState<Record<string, boolean>>(() => loadLocal('eaten:' + today, {}));
  const [dietDay, setDietDayState] = useState<DietDay>(() => loadLocal('dietDay:' + today, 'A' as DietDay));

  // ── weekly report draft ──
  const [rep, setRepState] = useState<ReportDraft>(emptyReport);

  const loadingPhotos = useRef(new Set<string>());

  const actions = useMemo(() => ({
    setSurvey: (patch: Partial<Survey>) => setSurveyState(s => ({ ...s, ...patch })),
    toggleDay: (d: string) => setSurveyState(s => ({ ...s, days: s.days.includes(d) ? s.days.filter(x => x !== d) : [...s.days, d] })),

    /** Creates the account and the client's profile with the start survey. */
    register: async (name: string, email: string, password: string, s: Survey) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      const profile: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
        consentAt: serverTimestamp(),
        survey: s,
        startWeight: num(s.weight),
        hasPlan: false,
        lastMsgAt: serverTimestamp(),
        lastMsgText: 'Nowa ankieta startowa',
        lastMsgFrom: 'client',
      };
      await setDoc(doc(db, 'clients', cred.user.uid), profile);
    },
    login: (email: string, password: string) => signInWithEmailAndPassword(auth, email.trim(), password),
    resetPassword: (email: string) => sendPasswordResetEmail(auth, email.trim()),
    logout: () => signOut(auth),

    pickDietDay: (d: DietDay) => setDietDayState(d),
    toggleEaten: (key: string) => setEaten(e => ({ ...e, [key]: !e[key] })),

    setRep: (patch: Partial<ReportDraft>) => setRepState(r => ({ ...r, ...patch })),
    setRepPhoto: (view: PhotoView, dataUri: string) => setRepState(r => ({ ...r, photos: { ...r.photos, [view]: dataUri } })),

    setSet: (i: number, j: number, patch: Partial<SetRow>) =>
      setLogEx(ex => ex.map((e, a) => a !== i ? e : { ...e, sets: e.sets.map((x, b) => b === j ? { ...x, ...patch } : x) })),
    addSet: (i: number) =>
      setLogEx(ex => ex.map((e, a) => a !== i ? e : { ...e, sets: [...e.sets, { ...e.sets[e.sets.length - 1], done: false }] })),
    tick: () => setElapsed(e => e + 1),
  }), []);

  useEffect(() => saveLocal('eaten:' + today, eaten), [eaten, today]);
  useEffect(() => saveLocal('dietDay:' + today, dietDay), [dietDay, today]);

  const startLog = useCallback((key: WorkoutKey) => {
    if (!plan) return;
    const last = workouts.find(w => w.key === key);
    setLogKey(key);
    setLogEx(plan.days[key].rows.map(r => exerciseFromPlan(r, last)));
    setElapsed(0);
  }, [plan, workouts]);

  const volume = logEx.reduce((v, e) => e.time ? v : v + e.sets.filter(x => x.done).reduce((a, x) => a + num(x.kg) * num(x.reps), 0), 0);

  const finishWorkout = useCallback(async () => {
    if (!uid || !logKey || !plan) return;
    const exercises = logEx.map(e => ({ name: e.name, sets: e.sets.filter(x => x.done).map(({ kg, reps }) => ({ kg, reps })) }))
      .filter(e => e.sets.length);
    await addDoc(collection(db, 'clients', uid, 'workouts'), {
      key: logKey, title: plan.days[logKey].title, createdAt: serverTimestamp(), seconds: elapsed, volume: Math.round(volume), exercises,
    });
    setLogKey(null);
    setLogEx([]);
  }, [uid, logKey, plan, logEx, elapsed, volume]);

  const week = client?.createdAt ? programWeek(client.createdAt.toDate()) : 1;
  const weekStart = startOfWeek(new Date());
  const lastReport = reports[0];
  const repSentThisWeek = !!lastReport?.createdAt && lastReport.createdAt.toDate() >= weekStart;
  const workoutsThisWeek = workouts.filter(w => w.createdAt && w.createdAt.toDate() >= weekStart).length;

  const sendReport = useCallback(async () => {
    if (!uid) return;
    const batch = writeBatch(db);
    const photoIds: Partial<Record<PhotoView, string>> = {};
    for (const v of PHOTO_VIEWS) {
      const data = rep.photos[v];
      if (!data) continue;
      const ref = doc(collection(db, 'clients', uid, 'photos'));
      batch.set(ref, { view: v, data, createdAt: serverTimestamp() });
      photoIds[v] = ref.id;
    }
    const circ: Record<string, number> = {};
    Object.entries(rep.circ).forEach(([k, v]) => { if (num(v)) circ[k] = num(v); });
    const weight = num(rep.weight);
    batch.set(doc(collection(db, 'clients', uid, 'reports')), {
      week, createdAt: serverTimestamp(), weight, circ, scales: rep.scales, diet: rep.diet, q: rep.q.trim(), photos: photoIds, workouts: workoutsThisWeek,
    });
    batch.update(doc(db, 'clients', uid), { lastReportAt: serverTimestamp(), lastWeight: weight });
    await batch.commit();
    setRepState(emptyReport());
  }, [uid, rep, week, workoutsThisWeek]);

  const sendMessage = useCallback(async (text: string) => {
    const t = text.trim();
    if (!uid || !t) return;
    await addDoc(collection(db, 'clients', uid, 'messages'), { from: 'client', text: t, createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'clients', uid), { lastMsgAt: serverTimestamp(), lastMsgText: t, lastMsgFrom: 'client', clientReadAt: serverTimestamp() });
  }, [uid]);

  const markChatRead = useCallback(() => {
    if (uid) updateDoc(doc(db, 'clients', uid), { clientReadAt: serverTimestamp() }).catch(() => {});
  }, [uid]);

  /** Fetches a report photo once and caches it; returns undefined while loading. */
  const photo = useCallback((id?: string) => {
    if (!id || !uid) return undefined;
    if (!photos[id] && !loadingPhotos.current.has(id)) {
      loadingPhotos.current.add(id);
      getDoc(doc(db, 'clients', uid, 'photos', id))
        .then(s => { const d = s.data(); if (d?.data) setPhotos(p => ({ ...p, [id]: d.data as string })); })
        .catch(() => {});
    }
    return photos[id];
  }, [uid, photos, setPhotos]);

  // Workout scheduled for today, from the weekday the trainer assigned to it.
  const todayShort = weekdayShort(new Date());
  const todayKey = plan ? (Object.keys(plan.days) as WorkoutKey[]).find(k => plan.days[k].weekday === todayShort && plan.days[k].rows.length) ?? null : null;
  const doneToday = workouts.find(w => w.createdAt && dayKey(w.createdAt.toDate()) === today);

  const lastTrainerMsg = [...msgs].reverse().find(m => m.from === 'trainer');
  const unreadChat = msgs.filter(m => m.from === 'trainer' && m.createdAt && (!client?.clientReadAt || m.createdAt.toMillis() > client.clientReadAt.toMillis())).length;

  return {
    user, client, plan, diet, reports, workouts, msgs, survey,
    loading: user === undefined || (!!user && client === undefined),
    week, repSentThisWeek, lastReport, workoutsThisWeek, todayKey, doneToday, lastTrainerMsg, unreadChat,
    logKey, logEx, elapsed, elapsedLabel: mmss(elapsed), volume, startLog, finishWorkout,
    dietDay, eaten, today,
    rep, sendReport, sendMessage, markChatRead, photo,
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
