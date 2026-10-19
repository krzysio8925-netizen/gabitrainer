import {
  createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User,
} from 'firebase/auth';
import {
  addDoc, collection, deleteDoc, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TRAINER_EMAIL } from './backend/config';
import { auth, db } from './backend/firebase';
import type { ClientDoc, DietPlan, Message, Report, TrainingPlan, Workout } from './backend/types';

// All panel state: the trainer's session and live data from the shared database.

export type View = 'klienci' | 'kalendarz' | 'czat';
export type Tab = 'raport' | 'compare' | 'plan' | 'diet';
export type Status = 'raport' | 'ankieta' | 'spóźniony' | 'ok';
export type Client = ClientDoc & { id: string };
export type Task = { id: string; text: string; due: string; done: boolean };
export type CalEvent = { id: string; date: string; time: string; title: string; kind: 's' | 'k' | 'r' | 'z' };

const DAY = 86400000;

export function statusOf(c: Client, now = Date.now()): Status {
  if (!c.hasPlan) return 'ankieta';
  if (c.lastReportAt && !c.lastReportReviewed) return 'raport';
  const since = (c.lastReportAt ?? c.createdAt)?.toMillis() ?? now;
  if (now - since > 8 * DAY) return 'spóźniony';
  return 'ok';
}

export const isUnread = (c: Client) =>
  c.lastMsgFrom === 'client' && !!c.lastMsgAt && (!c.trainerReadAt || c.lastMsgAt.toMillis() > c.trainerReadAt.toMillis());

export function authError(e: unknown) {
  const code = (e as { code?: string })?.code ?? '';
  if (code.includes('email-already-in-use')) return 'To konto już istnieje. Zaloguj się.';
  if (code.includes('invalid-email')) return 'Ten adres e-mail wygląda na niepoprawny.';
  if (code.includes('weak-password')) return 'Hasło musi mieć co najmniej 6 znaków.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Zły e-mail albo hasło.';
  if (code.includes('too-many-requests')) return 'Za dużo prób. Spróbuj za kilka minut.';
  if (code.includes('network')) return 'Brak połączenia z internetem.';
  return 'Coś poszło nie tak. Spróbuj jeszcze raz.';
}

export function usePanel() {
  // ── session ──
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [verified, setVerified] = useState(false);
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setVerified(!!u?.emailVerified); }), []);
  const isTrainer = !!user && user.email?.toLowerCase() === TRAINER_EMAIL.toLowerCase();
  const ready = isTrainer && verified;

  const session = {
    login: (email: string, password: string) => signInWithEmailAndPassword(auth, email.trim(), password),
    signup: async (email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(cred.user);
    },
    resendVerification: () => user ? sendEmailVerification(user) : Promise.resolve(),
    /** After clicking the link in the e-mail: refresh the account and its token so the database sees the verified flag. */
    checkVerified: async () => {
      if (!user) return false;
      await reload(user);
      await user.getIdToken(true);
      setVerified(!!auth.currentUser?.emailVerified);
      return !!auth.currentUser?.emailVerified;
    },
    resetPassword: (email: string) => sendPasswordResetEmail(auth, email.trim()),
    logout: () => signOut(auth),
  };

  // ── navigation ──
  const [view, setView] = useState<View>('klienci');
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('raport');
  const [chatSel, setChatSel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const flash = useCallback((t: string) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  // ── everyone: clients, tasks, calendar ──
  const [clients, setClients] = useState<Client[] | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  useEffect(() => {
    if (!ready) return;
    const unsubs = [
      onSnapshot(query(collection(db, 'clients'), orderBy('createdAt', 'desc')),
        s => setClients(s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Client))),
      onSnapshot(query(collection(db, 'tasks'), orderBy('createdAt', 'asc')),
        s => setTasks(s.docs.map(d => ({ id: d.id, ...d.data() }) as Task))),
      onSnapshot(collection(db, 'events'), s => setEvents(s.docs.map(d => ({ id: d.id, ...d.data() }) as CalEvent))),
    ];
    return () => unsubs.forEach(u => u());
  }, [ready]);

  // The selected client defaults to the first one who needs attention.
  const list = clients ?? [];
  const order: Status[] = ['raport', 'ankieta', 'spóźniony', 'ok'];
  const firstUp = [...list].sort((a, b) => order.indexOf(statusOf(a)) - order.indexOf(statusOf(b)))[0];
  const curId = sel && list.some(c => c.id === sel) ? sel : firstUp?.id ?? null;
  const cur = list.find(c => c.id === curId) ?? null;
  const chatId = chatSel && list.some(c => c.id === chatSel) ? chatSel : curId;

  // ── the selected client's details ──
  type Detail = { id: string | null; plan?: TrainingPlan | null; diet?: DietPlan | null; reports: Report[]; workouts: Workout[] };
  const [detail, setDetail] = useState<Detail>({ id: null, reports: [], workouts: [] });
  useEffect(() => {
    if (!ready || !curId) return;
    const put = (patch: Partial<Detail>) => setDetail(d => ({ ...(d.id === curId ? d : { id: curId, reports: [], workouts: [] }), ...patch, id: curId }));
    const base = doc(db, 'clients', curId);
    const unsubs = [
      onSnapshot(doc(base, 'plan', 'training'), s => put({ plan: s.exists() ? (s.data() as TrainingPlan) : null })),
      onSnapshot(doc(base, 'plan', 'diet'), s => put({ diet: s.exists() ? (s.data() as DietPlan) : null })),
      onSnapshot(query(collection(base, 'reports'), orderBy('createdAt', 'desc'), limit(60)),
        s => put({ reports: s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Report) })),
      onSnapshot(query(collection(base, 'workouts'), orderBy('createdAt', 'desc'), limit(30)),
        s => put({ workouts: s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Workout) })),
    ];
    return () => unsubs.forEach(u => u());
  }, [ready, curId]);
  const D: Detail = detail.id === curId ? detail : { id: curId, reports: [], workouts: [] };

  // ── chat with one client ──
  const [thread, setThread] = useState<{ id: string | null; msgs: Message[] }>({ id: null, msgs: [] });
  useEffect(() => {
    if (!ready || !chatId || view !== 'czat') return;
    return onSnapshot(query(collection(db, 'clients', chatId, 'messages'), orderBy('createdAt', 'asc'), limit(300)),
      s => setThread({ id: chatId, msgs: s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as Message) }));
  }, [ready, chatId, view]);
  const chatClient = list.find(c => c.id === chatId) ?? null;
  // Opening a conversation marks it read.
  useEffect(() => {
    if (view === 'czat' && chatClient && isUnread(chatClient)) {
      updateDoc(doc(db, 'clients', chatClient.id), { trainerReadAt: serverTimestamp() }).catch(() => {});
    }
  }, [view, chatClient]);

  // ── photos, fetched once each ──
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const asked = useRef(new Set<string>());
  const photo = useCallback((clientId: string, id?: string) => {
    if (!id) return undefined;
    if (!asked.current.has(id)) {
      asked.current.add(id);
      getDoc(doc(db, 'clients', clientId, 'photos', id))
        .then(s => { const d = s.data(); if (d?.data) setPhotos(p => ({ ...p, [id]: d.data as string })); })
        .catch(() => asked.current.delete(id));
    }
    return photos[id];
  }, [photos]);

  // ── writes ──
  const say = async (clientId: string, text: string) => {
    const batch = writeBatch(db);
    batch.set(doc(collection(db, 'clients', clientId, 'messages')), { from: 'trainer', text, createdAt: serverTimestamp() });
    batch.update(doc(db, 'clients', clientId), { lastMsgAt: serverTimestamp(), lastMsgText: text, lastMsgFrom: 'trainer', trainerReadAt: serverTimestamp() });
    await batch.commit();
  };

  return {
    user, isTrainer, verified, ready, session,
    view, setView, tab, setTab, toast, flash,
    clients, cur, pick: (id: string) => setSel(id),
    plan: D.plan, diet: D.diet, reports: D.reports, workouts: D.workouts,
    photo,

    sendFeedback: async (report: Report, text: string) => {
      if (!cur) return;
      const batch = writeBatch(db);
      batch.update(doc(db, 'clients', cur.id, 'reports', report.id), { feedback: text, reviewedAt: serverTimestamp() });
      batch.set(doc(collection(db, 'clients', cur.id, 'messages')), { from: 'trainer', text, createdAt: serverTimestamp() });
      batch.update(doc(db, 'clients', cur.id), {
        lastReportReviewed: report.id === D.reports[0]?.id ? true : cur.lastReportReviewed ?? true,
        lastMsgAt: serverTimestamp(), lastMsgText: text, lastMsgFrom: 'trainer', trainerReadAt: serverTimestamp(),
      });
      await batch.commit();
    },
    savePlan: async (plan: TrainingPlan) => {
      if (!cur) return;
      const batch = writeBatch(db);
      batch.set(doc(db, 'clients', cur.id, 'plan', 'training'), { days: plan.days, updatedAt: serverTimestamp() });
      batch.update(doc(db, 'clients', cur.id), { hasPlan: true });
      await batch.commit();
    },
    saveDiet: async (diet: DietPlan) => {
      if (!cur) return;
      await setDoc(doc(db, 'clients', cur.id, 'plan', 'diet'), { p: diet.p, f: diet.f, c: diet.c, note: diet.note, days: diet.days, updatedAt: serverTimestamp() });
    },

    tasks,
    toggleTask: (t: Task) => updateDoc(doc(db, 'tasks', t.id), { done: !t.done }),
    addTask: (text: string) => addDoc(collection(db, 'tasks'), { text, due: 'Bez terminu', done: false, createdAt: serverTimestamp() }),
    deleteTask: (t: Task) => deleteDoc(doc(db, 'tasks', t.id)),
    events,
    addEvent: (e: Omit<CalEvent, 'id'>) => addDoc(collection(db, 'events'), e),
    deleteEvent: (e: CalEvent) => deleteDoc(doc(db, 'events', e.id)),

    chatClient, msgs: thread.id === chatId ? thread.msgs : [],
    openChat: (id: string) => { setChatSel(id); setView('czat'); },
    sendMessage: (text: string) => chatId ? say(chatId, text) : Promise.resolve(),
    openProfile: () => { if (chatId) setSel(chatId); setView('klienci'); },
  };
}

export type PanelState = ReturnType<typeof usePanel>;
