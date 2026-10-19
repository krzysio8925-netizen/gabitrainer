import { useState, type ChangeEvent } from 'react';

import { CIRC, DAYINFO, SNIPPETS, num, pl, sgn, type Client, type PlanDay } from '../data';
import { Icon } from '../icons';
import type { PanelState } from '../store';

const PHOTO_VIEWS = ['Przód', 'Bok', 'Tył'];

// ─── weekly report + feedback ────────────────────────────────────────────

export function ReportTab({ p }: { p: PanelState }) {
  const { cur } = p;
  const W = cur.weights, last = W.length - 1;
  const meas = [{ label: 'Waga (kg)', prev: W[last - 1], now: W[last], dv: W[last] - W[last - 1], tv: W[last] - W[0] }]
    .concat(CIRC.map(([label, base, d, t]) => ({ label: label + ' (cm)', prev: base + t - d, now: base + t, dv: d, tv: t })));
  const scales: [string, number, string][] = [
    ['Samopoczucie', cur.sc[0], 'var(--color-accent-2-600)'],
    ['Sen', cur.sc[1], 'var(--color-accent-2-600)'],
    ['Stres', cur.sc[2], 'var(--color-accent)'],
  ];

  return (
    <div className="split split-report">
      <div className="col" style={{ gap: 18 }}>
        <div className="card" style={{ padding: 22, gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <div className="card-title" style={{ fontSize: 20 }}>Raport · tydzień {cur.week}</div>
            <span className="muted" style={{ fontSize: 13 }}>{cur.sentAt}</span>
          </div>
          <div className="photos">
            {PHOTO_VIEWS.map(v => (
              <div key={v} className="col" style={{ gap: 6 }}>
                <div className="photo-ph">zdjęcie klienta</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => p.setTab('compare')}>Porównaj z poprzednimi tygodniami →</button>
        </div>

        <div className="card" style={{ padding: '10px 22px 14px', gap: 0 }}>
          <div className="mrow thead"><span>Pomiar</span><span>Poprz.</span><span>Teraz</span><span>Zmiana</span><span style={{ textAlign: 'right' }}>Od startu</span></div>
          {meas.map(m => {
            const d = +m.dv.toFixed(1);
            return (
              <div key={m.label} className="mrow">
                <span style={{ fontWeight: 600 }}>{m.label}</span>
                <span>{pl(m.prev)}</span>
                <span style={{ fontWeight: 700 }}>{pl(m.now)}</span>
                <span><span className={`tag ${d < 0 ? 'tag-accent-2' : d > 0 ? 'tag-accent' : 'tag-neutral'}`}>{sgn(d)}</span></span>
                <span className="muted" style={{ textAlign: 'right' }}>{sgn(+m.tv.toFixed(1))}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col" style={{ gap: 18 }}>
        <div className="card" style={{ padding: 22, gap: 14 }}>
          <div className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Samopoczucie</div>
          {scales.map(([label, v, col]) => (
            <div key={label} className="scale">
              <span className="scale-label">{label}</span>
              <div style={{ flex: 1, display: 'flex', gap: 5 }} aria-label={`${label}: ${v} z 5`}>
                {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ flex: 1, height: 10, borderRadius: 999, background: i <= v ? col : 'var(--color-neutral-300)' }} />)}
              </div>
              <b style={{ width: 28, textAlign: 'right' }}>{v}/5</b>
            </div>
          ))}
          <div className="scale">
            <span className="scale-label">Dieta</span>
            <div className="bar"><div style={{ background: 'var(--color-accent-2-600)', width: cur.diet + '%' }} /></div>
            <b style={{ width: 40, textAlign: 'right' }}>{cur.diet}%</b>
          </div>
          <div className="scale">
            <span className="scale-label">Treningi</span>
            <span style={{ fontSize: 14 }}><b>{cur.workouts}</b> zapisane w dzienniczku</span>
          </div>
        </div>

        <div className="card" style={{ padding: 22, gap: 10 }}>
          <div className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Pytania od {cur.first}</div>
          <p style={{ margin: 0, fontSize: 15, textWrap: 'pretty' }}>„{cur.q}”</p>
        </div>

        <div className="card" style={{ padding: 22, gap: 12, background: 'var(--color-neutral-100)', boxShadow: 'var(--shadow-sm)' }}>
          {p.reviewedText ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div className="av" style={{ width: 40, height: 40, background: 'var(--color-accent-2-600)', color: 'var(--color-bg)' }}><Icon name="check" /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>Raport sprawdzony</div>
                <div style={{ fontSize: 14, color: 'var(--color-neutral-800)', whiteSpace: 'pre-wrap', textWrap: 'pretty' }}>{p.reviewedText}</div>
              </div>
            </div>
          ) : (
            <div className="col" style={{ gap: 12 }}>
              <div className="card-title">Twój feedback</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SNIPPETS.map(t => (
                  <button key={t} className="tag tag-accent" style={{ border: 0, cursor: 'pointer', fontSize: 12 }} onClick={() => p.addSnippet(t)}>+ {t}</button>
                ))}
              </div>
              <textarea id={`feedback-${cur.id}`} className="input on-bg" style={{ borderRadius: 20, minHeight: 130 }} aria-label="Feedback dla podopiecznego"
                placeholder="Napisz, co idzie dobrze i co zmieniasz w planie…" value={p.fb} onChange={e => p.setFb(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => p.setTab('plan')}>Edytuj plan</button>
                <button className="btn btn-primary" disabled={!p.fb.trim()} onClick={p.sendFeedback}>Wyślij i oznacz jako sprawdzony</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── before / after ──────────────────────────────────────────────────────

export function CompareTab({ client }: { client: Client }) {
  const W = client.weights, last = W.length - 1;
  const [view, setView] = useState('Przód');
  const [a, setA] = useState(0);
  const [b, setB] = useState(last);
  const [pct, setPct] = useState(50);

  const mn = Math.min(...W) - 0.5, mx = Math.max(...W) + 0.5, step = W.length > 1 ? 410 / (W.length - 1) : 0;
  const dots = W.map((y, i) => ({ x: 5 + i * step, y: 20 + (mx - y) / (mx - mn) * 130, on: i === a || i === b, l: 'T' + (i + 1) }));

  const weekPicker = (label: string, value: number, set: (i: number) => void) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 40, fontSize: 13, flex: 'none' }}>{label}</span>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }} role="group" aria-label={`Tydzień ${label.toLowerCase()}`}>
        {W.map((_, i) => <button key={i} className="wk" aria-pressed={i === value} onClick={() => set(i)}>{i + 1}</button>)}
      </div>
    </div>
  );

  return (
    <div className="split split-half">
      <div className="card" style={{ padding: 22, gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="card-title" style={{ fontSize: 20 }}>Przed / po</div>
          <div className="seg">
            {PHOTO_VIEWS.map(v => (
              <label key={v} className="seg-opt"><input type="radio" name="cmpv" checked={view === v} onChange={() => setView(v)} />{v}</label>
            ))}
          </div>
        </div>
        <div className="cmp">
          <div className="cmp-layer cmp-a"><span className="tag tag-neutral" style={{ fontSize: 12 }}>Tydzień {a + 1} · {pl(W[a])} kg</span></div>
          <div className="cmp-layer cmp-b" style={{ clipPath: `inset(0 0 0 ${pct}%)` }}><span className="tag tag-accent-2" style={{ fontSize: 12 }}>Tydzień {b + 1} · {pl(W[b])} kg</span></div>
          <div className="cmp-line" style={{ left: pct + '%' }} />
          <div className="cmp-knob" style={{ left: pct + '%' }}>⇆</div>
          <div className="muted" style={{ position: 'absolute', left: '50%', top: 16, transform: 'translateX(-50%)', fontSize: 12 }}>{view}</div>
          <input id="cmp-range" className="cmp-range" type="range" min={0} max={100} value={pct} aria-label="Przesuń, żeby porównać zdjęcia" onChange={e => setPct(+e.target.value)} />
        </div>
      </div>

      <div className="col" style={{ gap: 18 }}>
        <div className="card" style={{ padding: 22, gap: 12 }}>
          <div className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Wybierz tygodnie</div>
          <div className="col" style={{ gap: 10 }}>
            {weekPicker('Przed', a, setA)}
            {weekPicker('Po', b, setB)}
          </div>
        </div>
        <div className="card" style={{ padding: 22, gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <div className="card-title">Waga</div>
            <span className="tag tag-accent-2" style={{ fontSize: 12 }}>{sgn(+(W[b] - W[a]).toFixed(1))} kg między T{a + 1} a T{b + 1}</span>
          </div>
          <svg width="100%" viewBox="0 0 420 170" style={{ display: 'block', overflow: 'visible' }} role="img" aria-label="Wykres wagi tydzień po tygodniu">
            {[20, 85, 150].map(y => <line key={y} x1={0} x2={420} y1={y} y2={y} stroke="var(--color-divider)" strokeDasharray="3 5" />)}
            <polyline points={dots.map(d => `${d.x.toFixed(1)},${d.y.toFixed(1)}`).join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
            {dots.map(d => <circle key={d.l} cx={d.x} cy={d.y} r={d.on ? 7 : 4} fill={d.on ? 'var(--color-accent)' : 'var(--color-bg)'} stroke="var(--color-accent)" strokeWidth={3} />)}
          </svg>
          <div className="muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            {dots.map(d => <span key={d.l}>{d.l}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── training plan editor ────────────────────────────────────────────────

const PLAN_DAYS: PlanDay[] = ['A', 'B', 'C', 'K'];

export function PlanTab({ p }: { p: PanelState }) {
  const rows = p.plan[p.planDay];
  const field = (i: number, k: 'name' | 'sets' | 'reps' | 'load' | 'note') =>
    (e: ChangeEvent<HTMLInputElement>) => { const v = e.target.value; p.editPlan(d => { d[i][k] = v; }); };

  return (
    <div className="card" style={{ padding: 22, gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="seg">
          {PLAN_DAYS.map(d => (
            <label key={d} className="seg-opt" style={{ padding: '8px 16px' }}>
              <input type="radio" name="pday" checked={p.planDay === d} onChange={() => p.setPlanDay(d)} />{d === 'K' ? 'Cardio' : 'Trening ' + d}
            </label>
          ))}
        </div>
        <span className="muted" style={{ fontSize: 13 }}>{DAYINFO[p.planDay]} · {rows.length} ćw.</span>
      </div>
      <div className="table-scroll">
        <div className="plan-grid thead"><span /><span>Ćwiczenie</span><span>Serie</span><span>Powt.</span><span>Ciężar</span><span>Wskazówka dla klienta</span><span /></div>
        <div className="col" style={{ gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} className="plan-grid">
              <span className="num-badge">{i + 1}</span>
              <input className="input on-bg" aria-label={`Ćwiczenie ${i + 1}`} value={r.name} onChange={field(i, 'name')} style={{ fontWeight: 600 }} />
              <input className="input on-bg" aria-label={`Serie, ćwiczenie ${i + 1}`} value={r.sets} onChange={field(i, 'sets')} style={{ textAlign: 'center' }} />
              <input className="input on-bg" aria-label={`Powtórzenia, ćwiczenie ${i + 1}`} value={r.reps} onChange={field(i, 'reps')} style={{ textAlign: 'center' }} />
              <input className="input on-bg" aria-label={`Ciężar, ćwiczenie ${i + 1}`} value={r.load} onChange={field(i, 'load')} style={{ textAlign: 'center' }} />
              <input className="input on-bg" aria-label={`Wskazówka, ćwiczenie ${i + 1}`} value={r.note} placeholder="opcjonalnie" onChange={field(i, 'note')} />
              <button className="btn btn-icon btn-ghost icon-del" aria-label={`Usuń ćwiczenie ${i + 1}`} onClick={() => p.editPlan(d => { d.splice(i, 1); })}><Icon name="trash" /></button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={() => p.editPlan(d => { d.push({ name: 'Nowe ćwiczenie', sets: '3', reps: '10', load: '', note: '' }); })}><Icon name="plus" />Dodaj ćwiczenie</button>
        <button className="btn btn-primary" onClick={() => p.flash(`Plan zapisany — ${p.cur.first} dostał(a) powiadomienie`)}>Zapisz i wyślij do {p.cur.firstTo}</button>
      </div>
    </div>
  );
}

// ─── diet editor ─────────────────────────────────────────────────────────

export function DietTab({ p }: { p: PanelState }) {
  const D = p.diet;
  const kcal = Math.round(4 * num(D.p) + 9 * num(D.f) + 4 * num(D.c));
  const macros: ['p' | 'f' | 'c', string, number, string][] = [
    ['p', 'Białko', 4, 'var(--color-accent)'], ['f', 'Tłuszcze', 9, 'var(--color-accent-2-600)'], ['c', 'Węglowodany', 4, 'var(--color-neutral-600)'],
  ];
  const menu = D.menu[p.dietDay] ?? [];
  const menuKcal = Math.round(menu.reduce((a, m) => a + num(m.kcal), 0));
  const diff = menuKcal - kcal;
  const onTarget = Math.abs(diff) <= 50;
  const field = (i: number, k: 'time' | 'name' | 'kcal') =>
    (e: ChangeEvent<HTMLInputElement>) => { const v = e.target.value; p.editDiet(d => { d.menu[p.dietDay][i][k] = v; }); };

  return (
    <div className="split split-diet">
      <div className="card" style={{ padding: 22, gap: 14 }}>
        <div className="card-title">Cel dzienny</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="fh" style={{ fontSize: 36 }}>{kcal}</span><span className="muted">kcal</span>
        </div>
        {macros.map(([k, label, m, color]) => {
          const share = kcal ? Math.round(num(D[k]) * m / kcal * 100) : 0;
          return (
            <div key={k} className="field">
              <label htmlFor={`macro-${k}`}>{label} (g) · {share}% energii</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input id={`macro-${k}`} className="input on-bg" inputMode="numeric" value={D[k]} onChange={e => { const v = e.target.value; p.editDiet(d => { d[k] = v; }); }} style={{ fontWeight: 700, maxWidth: 100 }} />
                <div className="bar" style={{ height: 8 }}><div style={{ background: color, width: Math.min(100, share) + '%' }} /></div>
              </div>
            </div>
          );
        })}
        <div className="muted" style={{ fontSize: 12 }}>Kalorie liczone automatycznie: 4 kcal/g białka i węglowodanów, 9 kcal/g tłuszczu.</div>
      </div>

      <div className="card" style={{ padding: 22, gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="seg">
            {Object.keys(D.menu).map(d => (
              <label key={d} className="seg-opt" style={{ padding: '8px 16px' }}>
                <input type="radio" name="dday" checked={p.dietDay === d} onChange={() => p.setDietDay(d)} />Dzień {d}
              </label>
            ))}
          </div>
          <span className={`tag ${onTarget ? 'tag-accent-2' : 'tag-accent'}`} style={{ fontSize: 12 }}>
            {menuKcal} kcal · {onTarget ? 'zgodne z celem' : (diff > 0 ? '+' : '−') + Math.abs(diff) + ' kcal od celu'}
          </span>
        </div>
        <div className="menu-grid thead"><span>Godz.</span><span>Posiłek</span><span>kcal</span><span /></div>
        <div className="col" style={{ gap: 8 }}>
          {menu.map((m, i) => (
            <div key={i} className="menu-grid">
              <input className="input on-bg" aria-label={`Godzina, posiłek ${i + 1}`} value={m.time} onChange={field(i, 'time')} style={{ textAlign: 'center' }} />
              <input className="input on-bg" aria-label={`Posiłek ${i + 1}`} value={m.name} onChange={field(i, 'name')} style={{ fontWeight: 600 }} />
              <input className="input on-bg" aria-label={`Kalorie, posiłek ${i + 1}`} inputMode="numeric" value={m.kcal} onChange={field(i, 'kcal')} style={{ textAlign: 'center' }} />
              <button className="btn btn-icon btn-ghost icon-del" aria-label={`Usuń posiłek ${i + 1}`} onClick={() => p.editDiet(d => { d.menu[p.dietDay].splice(i, 1); })}><Icon name="trash" /></button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => p.editDiet(d => { d.menu[p.dietDay].push({ time: '', name: 'Nowy posiłek', kcal: '0' }); })}><Icon name="plus" />Dodaj posiłek</button>
          <button className="btn btn-primary" onClick={() => p.flash(`Jadłospis zapisany — ${p.cur.first} dostał(a) powiadomienie`)}>Zapisz i wyślij do {p.cur.firstTo}</button>
        </div>
      </div>
    </div>
  );
}
