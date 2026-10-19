import { useState } from 'react';

import { CAL, EVENT_COLORS } from '../data';
import { Icon } from '../icons';
import type { PanelState } from '../store';

export function Calendar({ p }: { p: PanelState }) {
  const [draft, setDraft] = useState('');
  const left = p.tasks.filter(t => !t.done).length;

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    p.addTask(t);
    setDraft('');
  };

  return (
    <main className="main" style={{ paddingLeft: 28 }}>
      <div className="cal-wrap">
        <div className="col" style={{ gap: 16, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>Kalendarz</h3>
            <span className="muted">19–25 października 2026</span>
          </div>
          <div className="cal-scroll">
            <div className="cal">
              {CAL.map((d, i) => (
                <div key={d.d} className={`cal-day${i === 0 ? ' today' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '0 4px' }}>
                    <span className="muted" style={{ fontSize: 12 }}>{d.d}</span>
                    <span className="fh" style={{ fontSize: 20 }}>{d.n}</span>
                  </div>
                  {d.ev.map(([time, title, kind]) => (
                    <div key={time + title} className="ev" style={{ background: EVENT_COLORS[kind][0], color: EVENT_COLORS[kind][1] }}>
                      <div style={{ fontWeight: 700 }}>{time}</div>
                      <div style={{ textWrap: 'pretty' }}>{title}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22, gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="card-title" style={{ fontSize: 20 }}>Zadania</div>
            <span className="muted" style={{ fontSize: 13 }}>{left} do zrobienia</span>
          </div>
          <div className="col" style={{ gap: 4 }}>
            {p.tasks.map((t, i) => (
              <button key={i} className="task" role="checkbox" aria-checked={t.done} onClick={() => p.toggleTask(i)}>
                <span className="task-box">{t.done && <Icon name="check" size={12} />}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="task-text" style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{t.text}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{t.due}</span>
                </span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="new-task" className="input on-bg" placeholder="Nowe zadanie…" aria-label="Nowe zadanie" value={draft}
              onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); }} />
            <button className="btn btn-primary btn-icon" style={{ flex: 'none' }} aria-label="Dodaj zadanie" onClick={add}><Icon name="plus" /></button>
          </div>
        </div>
      </div>
    </main>
  );
}
