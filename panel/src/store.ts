import { useCallback, useEffect, useRef, useState } from 'react';

import { CLIENTS, INIT_TASKS, THREADS, UNREAD, newDiet, newPlan, type Client, type Diet, type Msg, type Plan, type PlanDay, type Status, type Task } from './data';

// All panel state lives here, in memory, until the panel talks to the backend.

export type View = 'klienci' | 'kalendarz' | 'czat';
export type Tab = 'raport' | 'compare' | 'plan' | 'diet';
export type Filter = 'all' | 'todo' | 'late';

export function usePanel() {
  const [view, setView] = useState<View>('klienci');
  const [sel, setSel] = useState('kn');
  const [tab, setTab] = useState<Tab>('raport');
  const [reviewed, setReviewed] = useState<Record<string, string>>({});
  const [fb, setFbMap] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [planDay, setPlanDay] = useState<PlanDay>('B');
  const [diets, setDiets] = useState<Record<string, Diet>>({});
  const [dietDay, setDietDay] = useState('A');
  const [tasks, setTasks] = useState<Task[]>(INIT_TASKS);
  const [threads, setThreads] = useState<Record<string, Msg[]>>(THREADS);
  const [unread, setUnread] = useState<string[]>(UNREAD);
  const [chatSel, setChatSel] = useState('kn');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const flash = useCallback((t: string) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const cur = CLIENTS.find(c => c.id === sel)!;
  const statusOf = (c: Client): Status => reviewed[c.id] ? 'ok' : c.status;
  const plan = plans[sel] ?? newPlan();
  const diet = diets[sel] ?? newDiet();

  const openChat = (id: string) => {
    setChatSel(id);
    setUnread(u => u.filter(x => x !== id));
    setView('czat');
  };

  return {
    view, setView, sel, cur, tab, setTab, statusOf, toast, flash,
    pick: (id: string) => setSel(id),

    fb: fb[sel] ?? '',
    setFb: (text: string) => setFbMap(m => ({ ...m, [sel]: text })),
    addSnippet: (t: string) => setFbMap(m => ({ ...m, [sel]: ((m[sel] ?? '') + ' ' + t).trim() })),
    reviewedText: reviewed[sel],
    sendFeedback: () => {
      const text = (fb[sel] ?? '').trim();
      if (!text) return;
      setReviewed(r => ({ ...r, [sel]: text }));
      setTasks(ts => ts.map(t => t.text.startsWith('Sprawdź') && t.text.includes(cur.first) ? { ...t, done: true } : t));
      setThreads(th => ({ ...th, [sel]: [...th[sel], { me: true, text, time: 'Teraz' }] }));
      flash('Feedback wysłany do ' + cur.firstTo);
    },

    plan, planDay, setPlanDay,
    editPlan: (fn: (rows: Plan[PlanDay]) => void) => setPlans(ps => {
      const p: Plan = structuredClone(ps[sel] ?? newPlan());
      fn(p[planDay]);
      return { ...ps, [sel]: p };
    }),

    diet, dietDay, setDietDay,
    editDiet: (fn: (d: Diet) => void) => setDiets(ds => {
      const d: Diet = structuredClone(ds[sel] ?? newDiet());
      fn(d);
      return { ...ds, [sel]: d };
    }),

    tasks,
    toggleTask: (i: number) => setTasks(ts => ts.map((t, j) => j === i ? { ...t, done: !t.done } : t)),
    addTask: (text: string) => setTasks(ts => [...ts, { text, due: 'Bez terminu', done: false }]),

    threads, unread, chatSel, openChat,
    sendMessage: (text: string) => setThreads(th => ({ ...th, [chatSel]: [...th[chatSel], { me: true, text, time: 'Teraz' }] })),
    openProfile: () => { setSel(chatSel); setView('klienci'); },
  };
}

export type PanelState = ReturnType<typeof usePanel>;
