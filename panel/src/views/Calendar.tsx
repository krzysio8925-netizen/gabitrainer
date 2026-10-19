import { useState, type FormEvent } from 'react';

import { Icon } from '../icons';
import { WEEKDAYS, addDays, dayKey, startOfWeek, weekRange } from '../lib';
import type { CalEvent, PanelState } from '../store';

const KINDS: [CalEvent['kind'], string][] = [['s', 'Trening personalny'], ['k', 'Konsultacja / check-in'], ['z', 'Zadanie / inne'], ['r', 'Raport']];
const EVENT_COLORS: Record<CalEvent['kind'], [string, string]> = {
  s: ['var(--color-accent-700)', 'var(--color-bg)'],
  k: ['var(--color-accent-2-200)', 'var(--color-accent-2-900)'],
  r: ['var(--color-accent-200)', 'var(--color-accent-900)'],
  z: ['var(--color-neutral-300)', 'var(--color-neutral-900)'],
};
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const initial = (name: string) => { const [f, l] = name.split(/\s+/); return l ? `${f} ${l[0]}.` : f; };

export function Calendar({ p }: { p: PanelState }) {
  const [offset, setOffset] = useState(0);
  const [taskDraft, setTaskDraft] = useState('');
  const [today] = useState(() => new Date());
  const monday = addDays(startOfWeek(today), offset * 7);
  const [form, setForm] = useState({ day: dayKey(today), time: '', title: '', kind: 's' as CalEvent['kind'] });
  const left = p.tasks.filter(t => !t.done).length;

  // Reports and new sign-ups show up on their own; the rest Gabi adds herself.
  const auto: (Omit<CalEvent, 'id'> & { id?: string })[] = [];
  (p.clients ?? []).forEach(c => {
    if (c.lastReportAt) { const d = c.lastReportAt.toDate(); auto.push({ date: dayKey(d), time: hhmm(d), title: `Raport — ${initial(c.name)}`, kind: 'r' }); }
    if (c.createdAt) { const d = c.createdAt.toDate(); auto.push({ date: dayKey(d), time: hhmm(d), title: `Nowa ankieta — ${initial(c.name)}`, kind: 'k' }); }
  });
  const all = [...p.events, ...auto];

  const days = WEEKDAYS.map((d, i) => {
    const date = addDays(monday, i);
    const key = dayKey(date);
    return { d, date, key, ev: all.filter(e => e.date === key).sort((a, b) => a.time.localeCompare(b.time)) };
  });

  const addTask = () => {
    const t = taskDraft.trim();
    if (!t) return;
    p.addTask(t);
    setTaskDraft('');
  };
  const addEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    p.addEvent({ date: form.day, time: form.time, title: form.title.trim(), kind: form.kind });
    setForm(f => ({ ...f, time: '', title: '' }));
  };

  return (
    <main className="main" style={{ paddingLeft: 28 }}>
      <div className="cal-wrap">
        <div className="col" style={{ gap: 16, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>Kalendarz</h3>
            <span className="muted">{weekRange(monday)}</span>
            <span style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary" onClick={() => setOffset(o => o - 1)} aria-label="Poprzedni tydzień">←</button>
              {offset !== 0 && <button className="btn btn-secondary" onClick={() => setOffset(0)}>Dziś</button>}
              <button className="btn btn-secondary" onClick={() => setOffset(o => o + 1)} aria-label="Następny tydzień">→</button>
            </div>
          </div>
          <div className="cal-scroll">
            <div className="cal">
              {days.map(d => (
                <div key={d.key} className={`cal-day${d.key === dayKey(today) ? ' today' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '0 4px' }}>
                    <span className="muted" style={{ fontSize: 12 }}>{d.d}</span>
                    <span className="fh" style={{ fontSize: 20 }}>{d.date.getDate()}</span>
                  </div>
                  {d.ev.map((e, i) => (
                    <div key={(e.id ?? 'auto') + i} className="ev" style={{ background: EVENT_COLORS[e.kind][0], color: EVENT_COLORS[e.kind][1] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>{e.time}</span>
                        {e.id && <button className="ev-del" aria-label={`Usuń: ${e.title}`} onClick={() => p.deleteEvent(e as CalEvent)}>×</button>}
                      </div>
                      <div style={{ textWrap: 'pretty' }}>{e.title}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <form className="card" style={{ padding: 18, gap: 10 }} onSubmit={addEvent}>
            <div className="card-title">Dodaj do kalendarza</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select id="ev-day" className="input on-bg select" aria-label="Dzień" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} style={{ width: 'auto' }}>
                {days.map(d => <option key={d.key} value={d.key}>{d.d} {d.date.getDate()}.{String(d.date.getMonth() + 1).padStart(2, '0')}</option>)}
              </select>
              <input id="ev-time" className="input on-bg" type="time" aria-label="Godzina" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ width: 120 }} />
              <select id="ev-kind" className="input on-bg select" aria-label="Rodzaj" value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value as CalEvent['kind'] }))} style={{ width: 'auto' }}>
                {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <input id="ev-title" className="input on-bg" placeholder="np. Trening — Marek W." aria-label="Opis" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ flex: '1 1 200px' }} />
              <button className="btn btn-primary" disabled={!form.title.trim()}><Icon name="plus" />Dodaj</button>
            </div>
          </form>
        </div>

        <div className="card" style={{ padding: 22, gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="card-title" style={{ fontSize: 20 }}>Zadania</div>
            <span className="muted" style={{ fontSize: 13 }}>{left} do zrobienia</span>
          </div>
          <div className="col" style={{ gap: 4 }}>
            {p.tasks.length === 0 && <p className="muted" style={{ margin: 0, fontSize: 14 }}>Brak zadań. Dopisz pierwsze poniżej.</p>}
            {p.tasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <button className="task" role="checkbox" aria-checked={t.done} onClick={() => p.toggleTask(t)}>
                  <span className="task-box">{t.done && <Icon name="check" size={12} />}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="task-text" style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{t.text}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{t.due}</span>
                  </span>
                </button>
                <button className="btn btn-icon btn-ghost icon-del" aria-label={`Usuń zadanie: ${t.text}`} onClick={() => p.deleteTask(t)}><Icon name="trash" /></button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="new-task" className="input on-bg" placeholder="Nowe zadanie…" aria-label="Nowe zadanie" value={taskDraft}
              onChange={e => setTaskDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addTask(); }} />
            <button className="btn btn-primary btn-icon" style={{ flex: 'none' }} aria-label="Dodaj zadanie" onClick={addTask}><Icon name="plus" /></button>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>Raporty i nowe ankiety od podopiecznych pojawiają się w kalendarzu same.</p>
        </div>
      </div>
    </main>
  );
}
