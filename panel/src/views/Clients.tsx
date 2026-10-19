import { useState } from 'react';

import { Icon } from '../icons';
import { STATUS, ago, avatarBg, initials, pl, programWeek, sgn } from '../lib';
import { statusOf, type PanelState, type Tab } from '../store';
import { CompareTab, DietTab, PlanTab, ReportTab } from './tabs';

type Filter = 'all' | 'todo' | 'late';
const FILTERS: [Filter, string][] = [['all', 'Wszyscy'], ['todo', 'Do sprawdzenia'], ['late', 'Brak raportu']];
const TABS: [Tab, string][] = [['raport', 'Raport tygodniowy'], ['compare', 'Porównanie zdjęć'], ['plan', 'Plan treningowy'], ['diet', 'Plan żywieniowy']];

export function Clients({ p }: { p: PanelState }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const { cur } = p;
  const all = p.clients ?? [];

  const ql = q.trim().toLowerCase();
  const list = all.filter(c => {
    const st = statusOf(c);
    if (filter === 'todo' && st !== 'raport' && st !== 'ankieta') return false;
    if (filter === 'late' && st !== 'spóźniony') return false;
    return !ql || c.name.toLowerCase().includes(ql) || c.email.includes(ql);
  });

  return (
    <>
      <section className="list-col" aria-label="Podopieczni">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Podopieczni</h3>
          <span className="muted" style={{ fontSize: 13 }}>{all.length} aktywnych</span>
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
            const [status, tagCls] = STATUS[statusOf(c)];
            return (
              <button key={c.id} className="person" aria-current={c.id === cur?.id} onClick={() => p.pick(c.id)}>
                <div className="av" style={{ width: 40, height: 40, fontSize: 13, background: avatarBg(c.id) }}>{initials(c.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <span className="ellipsis" style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                    <span className="muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{ago(c.lastReportAt ?? c.lastMsgAt ?? c.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span className="muted ellipsis" style={{ fontSize: 12 }}>{shortGoal(c.survey?.goal)} · tydz. {programWeek(c.createdAt)}</span>
                    <span className={`tag ${tagCls}`} style={{ whiteSpace: 'nowrap' }}>{status}</span>
                  </div>
                </div>
              </button>
            );
          })}
          {all.length > 0 && list.length === 0 && <p className="muted" style={{ fontSize: 13, padding: '8px 6px' }}>Nikt nie pasuje do tego filtra.</p>}
        </div>
      </section>

      <main className="main">
        <div className="main-inner">
          {p.clients === null ? (
            <p className="muted">Wczytuję podopiecznych…</p>
          ) : !cur ? (
            <NoClients />
          ) : (
            <ClientDetail p={p} />
          )}
        </div>
      </main>
    </>
  );
}

const shortGoal = (g?: string) => g?.replace(' tkanki tłuszczowej', '') ?? '—';

function NoClients() {
  const link = new URL('../', window.location.href).href;
  return (
    <div className="empty" style={{ maxWidth: 560 }}>
      <b>Nie masz jeszcze podopiecznych</b>
      <p className="muted" style={{ margin: '0 0 10px' }}>Wyślij im link do aplikacji. Po wypełnieniu ankiety pojawią się tutaj jako „Nowa ankieta”.</p>
      <code style={{ fontSize: 14, userSelect: 'all', wordBreak: 'break-all' }}>{link}</code>
    </div>
  );
}

function ClientDetail({ p }: { p: PanelState }) {
  const cur = p.cur!;
  const weight = cur.lastWeight ?? cur.startWeight;
  const [weekAgo] = useState(() => Date.now() - 7 * 86400000);
  const done7 = p.workouts.filter(w => w.createdAt && w.createdAt.toMillis() > weekAgo).length;
  const planned = p.plan ? Object.values(p.plan.days).filter(d => d.weekday && d.rows.length).length : 0;
  const lastDiet = p.reports[0]?.diet;
  const stats = [
    ['Waga', weight ? pl(weight) + ' kg' : '—', 'var(--color-neutral-700)', 'var(--color-text)', 'var(--color-surface)'],
    ['Od startu', cur.lastWeight ? sgn(+(cur.lastWeight - cur.startWeight).toFixed(1)) + ' kg' : '—', 'var(--color-accent-800)', 'var(--color-accent-900)', 'var(--color-accent-200)'],
    ['Trzymanie diety', lastDiet != null ? lastDiet + '%' : '—', 'var(--color-accent-2-800)', 'var(--color-accent-2-900)', 'var(--color-accent-2-200)'],
    ['Treningi w 7 dni', planned ? `${done7} z ${planned}` : String(done7), 'var(--color-neutral-700)', 'var(--color-text)', 'var(--color-surface)'],
  ];
  const s = cur.survey;

  return (
    <>
      <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
        <div className="av" style={{ width: 58, height: 58, fontSize: 18, background: avatarBg(cur.id) }}>{initials(cur.name)}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ margin: 0 }}>{cur.name}</h2>
          <div className="muted" style={{ fontSize: 14 }}>
            {[s?.goal, `tydzień ${programWeek(cur.createdAt)}`, s?.age && `${s.age} lat`, s?.height && `${s.height} cm`].filter(Boolean).join(' · ')}
          </div>
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

      {p.tab === 'raport' && <ReportTab key={cur.id} p={p} />}
      {p.tab === 'compare' && <CompareTab key={cur.id} p={p} />}
      {p.tab === 'plan' && <PlanTab key={cur.id + (p.plan === undefined ? ':loading' : '')} p={p} />}
      {p.tab === 'diet' && <DietTab key={cur.id + (p.diet === undefined ? ':loading' : '')} p={p} />}
    </>
  );
}
