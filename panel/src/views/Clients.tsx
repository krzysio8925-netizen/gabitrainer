import { useState } from 'react';

import { CLIENTS, STATUS, pl, sgn } from '../data';
import { Icon } from '../icons';
import type { Filter, PanelState, Tab } from '../store';
import { CompareTab, DietTab, PlanTab, ReportTab } from './tabs';

const FILTERS: [Filter, string][] = [['all', 'Wszyscy'], ['todo', 'Do sprawdzenia'], ['late', 'Brak raportu']];
const TABS: [Tab, string][] = [['raport', 'Raport tygodniowy'], ['compare', 'Porównanie zdjęć'], ['plan', 'Plan treningowy'], ['diet', 'Plan żywieniowy']];

export function Clients({ p }: { p: PanelState }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const { cur } = p;

  const ql = q.trim().toLowerCase();
  const list = CLIENTS.filter(c => {
    const st = p.statusOf(c);
    if (filter === 'todo' && st !== 'raport' && st !== 'ankieta') return false;
    if (filter === 'late' && st !== 'spóźniony') return false;
    return !ql || c.full.toLowerCase().includes(ql);
  });

  const W = cur.weights, wNow = W[W.length - 1];
  const stats = [
    ['Waga', pl(wNow) + ' kg', 'var(--color-neutral-700)', 'var(--color-text)', 'var(--color-surface)'],
    ['Od startu', sgn(+(wNow - W[0]).toFixed(1)) + ' kg', 'var(--color-accent-800)', 'var(--color-accent-900)', 'var(--color-accent-200)'],
    ['Trzymanie diety', cur.diet ? cur.diet + '%' : '—', 'var(--color-accent-2-800)', 'var(--color-accent-2-900)', 'var(--color-accent-2-200)'],
    ['Treningi w tyg.', cur.workouts, 'var(--color-neutral-700)', 'var(--color-text)', 'var(--color-surface)'],
  ];

  return (
    <>
      <section className="list-col" aria-label="Podopieczni">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Podopieczni</h3>
          <span className="muted" style={{ fontSize: 13 }}>{CLIENTS.length} aktywnych</span>
        </div>
        <div className="search">
          <Icon name="search" />
          <input id="client-search" className="input" placeholder="Szukaj" aria-label="Szukaj podopiecznego" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 36, height: 38 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(([id, label]) => (
            <button key={id} className="pill-btn filter" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
        <div className="list-scroll">
          {list.map(c => {
            const [status, tagCls] = STATUS[p.statusOf(c)];
            return (
              <button key={c.id} className="person" aria-current={c.id === p.sel} onClick={() => p.pick(c.id)}>
                <div className="av" style={{ width: 40, height: 40, fontSize: 13, background: c.avBg }}>{c.ini}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <span className="ellipsis" style={{ fontWeight: 700, fontSize: 14 }}>{c.full}</span>
                    <span className="muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{c.when}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span className="muted ellipsis" style={{ fontSize: 12 }}>{c.goal} · tydz. {c.week}</span>
                    <span className={`tag ${tagCls}`} style={{ whiteSpace: 'nowrap' }}>{status}</span>
                  </div>
                </div>
              </button>
            );
          })}
          {list.length === 0 && <p className="muted" style={{ fontSize: 13, padding: '8px 6px' }}>Nikt nie pasuje do tego filtra.</p>}
        </div>
      </section>

      <main className="main">
        <div className="main-inner">
          <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
            <div className="av" style={{ width: 58, height: 58, fontSize: 18, background: cur.avBg }}>{cur.ini}</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ margin: 0 }}>{cur.full}</h2>
              <div className="muted" style={{ fontSize: 14 }}>{cur.goal} · tydzień {cur.week} z 12 · {cur.age} lat, {cur.height} cm</div>
            </div>
            <button className="btn btn-secondary" onClick={() => p.openChat(cur.id)}><Icon name="chat" />Napisz</button>
          </div>

          <div className="stats">
            {stats.map(([label, val, fg, fg2, bg]) => (
              <div key={label} className="stat" style={{ background: bg }}>
                <div style={{ fontSize: 12, color: fg }}>{label}</div>
                <div className="stat-val" style={{ color: fg2 }}>{val}</div>
              </div>
            ))}
          </div>

          <div className="tabs" role="tablist">
            {TABS.map(([id, label]) => (
              <button key={id} role="tab" className="pill-btn tab" aria-selected={p.tab === id} onClick={() => p.setTab(id)}>{label}</button>
            ))}
          </div>

          {p.tab === 'raport' && <ReportTab p={p} />}
          {p.tab === 'compare' && <CompareTab key={cur.id} client={cur} />}
          {p.tab === 'plan' && <PlanTab p={p} />}
          {p.tab === 'diet' && <DietTab p={p} />}
        </div>
      </main>
    </>
  );
}
