import { useState, type ChangeEvent } from 'react';

import { dietTemplate, planTemplate } from '../backend/templates';
import { CIRC, type DietDay, type DietPlan, type PhotoView, type Report, type TrainingPlan, type WorkoutKey } from '../backend/types';
import { Icon } from '../icons';
import { WEEKDAYS, firstName, num, pl, sgn, stamp } from '../lib';
import type { PanelState } from '../store';

const PHOTO_VIEWS: PhotoView[] = ['Przód', 'Bok', 'Tył'];
const SNIPPETS = [
  'Świetna robota w tym tygodniu!',
  'Po jednym luźniejszym wieczorze wracamy do planu bez kompensacji.',
  'Dodaję 1 cardio 30 min w sobotę.',
  'Zwiększamy ciężar w przysiadzie o 2,5 kg.',
];

/** Polish dative of a first name, good enough for buttons ("do Kasi", "do Marka"). */
function dative(name: string) {
  if (/ia$/.test(name)) return name.slice(0, -1) + 'i';
  if (/a$/.test(name)) return name.slice(0, -1) + 'i';
  if (/ek$/.test(name)) return name.slice(0, -2) + 'ka';
  return name + 'a';
}

function Photo({ p, id }: { p: PanelState; id?: string }) {
  const uri = id && p.cur ? p.photo(p.cur.id, id) : undefined;
  if (uri) return <img className="photo-img" src={uri} alt="" />;
  return <div className="photo-ph">{id ? 'wczytywanie…' : 'brak zdjęcia'}</div>;
}

// ─── weekly report + feedback ────────────────────────────────────────────

export function ReportTab({ p }: { p: PanelState }) {
  const cur = p.cur!;
  const first = firstName(cur.name);
  const [selId, setSelId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const idx = Math.max(0, p.reports.findIndex(r => r.id === selId));
  const r: Report | undefined = p.reports[idx];
  const prev = p.reports[idx + 1];
  const chrono = [...p.reports].reverse();
  const s = cur.survey;

  const surveyCard = s && (
    <div className="card" style={{ padding: 22, gap: 8 }}>
      <div className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Ankieta startowa</div>
      <div style={{ fontSize: 14 }}><b>Cel:</b> {s.goal}</div>
      <div style={{ fontSize: 14 }}><b>Doświadczenie:</b> {s.exp} · <b>dni:</b> {s.days.join(', ') || '—'}</div>
      <div style={{ fontSize: 14 }}><b>Start:</b> {s.age} lat, {s.height} cm, {s.weight} kg</div>
      <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}><b>Kontuzje, dieta:</b> {s.limits.trim() || 'brak uwag'}</div>
    </div>
  );

  if (!r) {
    return (
      <div className="split split-report">
        <div className="col" style={{ gap: 18 }}>
          <div className="empty">
            <b>{first} nie wysłał(a) jeszcze raportu</b>
            <span className="muted">{cur.hasPlan ? 'Pierwszy raport pojawi się tutaj po tygodniu treningów.' : 'Najpierw przygotuj plan treningowy i jadłospis. Klient zobaczy je od razu w aplikacji.'}</span>
          </div>
          {!cur.hasPlan && <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => p.setTab('plan')}>Przygotuj plan dla {dative(first)}</button>}
        </div>
        <div className="col" style={{ gap: 18 }}>{surveyCard}</div>
      </div>
    );
  }

  const firstCirc = (k: string) => chrono.find(x => x.circ?.[k])?.circ[k];
  const meas = [
    { label: 'Waga (kg)', prev: prev?.weight, now: r.weight, start: cur.startWeight },
    ...CIRC.map(c => ({ label: c.label + ' (cm)', prev: prev?.circ?.[c.k], now: r.circ?.[c.k], start: firstCirc(c.k) })),
  ].filter(m => m.now);
  const scales: [string, number | undefined, string][] = [
    ['Samopoczucie', r.scales?.mood, 'var(--color-accent-2-600)'],
    ['Sen', r.scales?.sleep, 'var(--color-accent-2-600)'],
    ['Stres', r.scales?.stress, 'var(--color-accent)'],
  ];
  const fb = drafts[r.id] ?? '';

  const send = async () => {
    setBusy(true);
    try {
      await p.sendFeedback(r, fb.trim());
      p.flash('Feedback wysłany do ' + dative(first));
    } catch {
      p.flash('Nie udało się wysłać. Sprawdź internet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="split split-report">
      <div className="col" style={{ gap: 18 }}>
        <div className="card" style={{ padding: 22, gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <div className="card-title" style={{ fontSize: 20 }}>Raport · tydzień {r.week}</div>
            <span className="muted" style={{ fontSize: 13 }}>wysłany {stamp(r.createdAt).toLowerCase()}</span>
          </div>
          {p.reports.length > 1 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }} role="group" aria-label="Wybierz raport">
              {p.reports.slice(0, 12).map(x => (
                <button key={x.id} className="wk" style={{ width: 'auto', padding: '0 10px' }} aria-pressed={x.id === r.id} onClick={() => setSelId(x.id)}>T{x.week}</button>
              ))}
            </div>
          )}
          <div className="photos">
            {PHOTO_VIEWS.map(v => (
              <div key={v} className="col" style={{ gap: 6 }}>
                <Photo p={p} id={r.photos?.[v]} />
                <div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => p.setTab('compare')}>Porównaj z poprzednimi tygodniami →</button>
        </div>

        <div className="card" style={{ padding: '10px 22px 14px', gap: 0 }}>
          <div className="mrow thead"><span>Pomiar</span><span>Poprz.</span><span>Teraz</span><span>Zmiana</span><span style={{ textAlign: 'right' }}>Od startu</span></div>
          {meas.map(m => {
            const d = m.prev ? +(m.now! - m.prev).toFixed(1) : null;
            return (
              <div key={m.label} className="mrow">
                <span style={{ fontWeight: 600 }}>{m.label}</span>
                <span>{m.prev ? pl(m.prev) : '—'}</span>
                <span style={{ fontWeight: 700 }}>{pl(m.now!)}</span>
                <span>{d == null ? '—' : <span className={`tag ${d < 0 ? 'tag-accent-2' : d > 0 ? 'tag-accent' : 'tag-neutral'}`}>{sgn(d)}</span>}</span>
                <span className="muted" style={{ textAlign: 'right' }}>{m.start ? sgn(+(m.now! - m.start).toFixed(1)) : '—'}</span>
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
              <div style={{ flex: 1, display: 'flex', gap: 5 }} aria-label={`${label}: ${v ?? 'brak'} z 5`}>
                {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ flex: 1, height: 10, borderRadius: 999, background: v && i <= v ? col : 'var(--color-neutral-300)' }} />)}
              </div>
              <b style={{ width: 28, textAlign: 'right' }}>{v ?? '—'}/5</b>
            </div>
          ))}
          <div className="scale">
            <span className="scale-label">Dieta</span>
            <div className="bar"><div style={{ background: 'var(--color-accent-2-600)', width: r.diet + '%' }} /></div>
            <b style={{ width: 40, textAlign: 'right' }}>{r.diet}%</b>
          </div>
          <div className="scale">
            <span className="scale-label">Treningi</span>
            <span style={{ fontSize: 14 }}><b>{r.workouts}</b> zapisane w tym tygodniu</span>
          </div>
        </div>

        {!!r.q && (
          <div className="card" style={{ padding: 22, gap: 10 }}>
            <div className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Pytania od {first}</div>
            <p style={{ margin: 0, fontSize: 15, textWrap: 'pretty', whiteSpace: 'pre-wrap' }}>„{r.q}”</p>
          </div>
        )}

        <div className="card" style={{ padding: 22, gap: 12, background: 'var(--color-neutral-100)', boxShadow: 'var(--shadow-sm)' }}>
          {r.reviewedAt ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div className="av" style={{ width: 40, height: 40, background: 'var(--color-accent-2-600)', color: 'var(--color-bg)' }}><Icon name="check" /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>Raport sprawdzony</div>
                <div style={{ fontSize: 14, color: 'var(--color-neutral-800)', whiteSpace: 'pre-wrap', textWrap: 'pretty' }}>{r.feedback}</div>
              </div>
            </div>
          ) : (
            <div className="col" style={{ gap: 12 }}>
              <div className="card-title">Twój feedback</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SNIPPETS.map(t => (
                  <button key={t} className="tag tag-accent" style={{ border: 0, cursor: 'pointer', fontSize: 12 }}
                    onClick={() => setDrafts(d => ({ ...d, [r.id]: ((d[r.id] ?? '') + ' ' + t).trim() }))}>+ {t}</button>
                ))}
              </div>
              <textarea id={`feedback-${r.id}`} className="input on-bg" style={{ borderRadius: 20, minHeight: 130 }} aria-label="Feedback dla podopiecznego"
                placeholder="Napisz, co idzie dobrze i co zmieniasz w planie…" value={fb} onChange={e => setDrafts(d => ({ ...d, [r.id]: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => p.setTab('plan')}>Edytuj plan</button>
                <button className="btn btn-primary" disabled={!fb.trim() || busy} onClick={send}>{busy ? 'Wysyłam…' : 'Wyślij i oznacz jako sprawdzony'}</button>
              </div>
            </div>
          )}
        </div>

        {surveyCard}
      </div>
    </div>
  );
}

// ─── before / after ──────────────────────────────────────────────────────

export function CompareTab({ p }: { p: PanelState }) {
  const cur = p.cur!;
  const chrono = [...p.reports].reverse();
  const [view, setView] = useState<PhotoView>('Przód');
  const [a, setA] = useState(0);
  const [b, setB] = useState<number | null>(null);
  const [pct, setPct] = useState(50);

  if (chrono.length === 0) {
    return <div className="empty"><b>Brak raportów do porównania</b><span className="muted">Zdjęcia pojawią się tutaj z każdym raportem tygodniowym.</span></div>;
  }
  const last = chrono.length - 1;
  const ai = Math.min(a, last), bi = b == null ? last : Math.min(b, last);
  const A = chrono[ai], B = chrono[bi];
  const uriA = p.photo(cur.id, A.photos?.[view]);
  const uriB = p.photo(cur.id, B.photos?.[view]);

  const W = [{ v: cur.startWeight, l: 'Start', on: false }, ...chrono.map((r, i) => ({ v: r.weight, l: 'T' + r.week, on: i === ai || i === bi }))].slice(-12);
  const mn = Math.min(...W.map(w => w.v)) - 0.5, mx = Math.max(...W.map(w => w.v)) + 0.5, step = W.length > 1 ? 410 / (W.length - 1) : 0;
  const dots = W.map((w, i) => ({ ...w, x: 5 + i * step, y: 20 + (mx - w.v) / (mx - mn) * 130 }));

  const weekPicker = (label: string, value: number, set: (i: number) => void) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 40, fontSize: 13, flex: 'none' }}>{label}</span>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }} role="group" aria-label={`Tydzień ${label.toLowerCase()}`}>
        {chrono.map((r, i) => <button key={r.id} className="wk" aria-pressed={i === value} onClick={() => set(i)}>{r.week}</button>)}
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
          <div className="cmp-layer cmp-a">
            {uriA && <img className="cmp-img" src={uriA} alt="" />}
            <span className="tag tag-neutral" style={{ fontSize: 12, position: 'relative' }}>Tydzień {A.week} · {pl(A.weight)} kg</span>
          </div>
          <div className="cmp-layer cmp-b" style={{ clipPath: `inset(0 0 0 ${pct}%)` }}>
            {uriB && <img className="cmp-img" src={uriB} alt="" />}
            <span className="tag tag-accent-2" style={{ fontSize: 12, position: 'relative' }}>Tydzień {B.week} · {pl(B.weight)} kg</span>
          </div>
          <div className="cmp-line" style={{ left: pct + '%' }} />
          <div className="cmp-knob" style={{ left: pct + '%' }}>⇆</div>
          <input id="cmp-range" className="cmp-range" type="range" min={0} max={100} value={pct} aria-label="Przesuń, żeby porównać zdjęcia" onChange={e => setPct(+e.target.value)} />
        </div>
      </div>

      <div className="col" style={{ gap: 18 }}>
        <div className="card" style={{ padding: 22, gap: 12 }}>
          <div className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Wybierz tygodnie</div>
          <div className="col" style={{ gap: 10 }}>
            {weekPicker('Przed', ai, setA)}
            {weekPicker('Po', bi, setB)}
          </div>
        </div>
        <div className="card" style={{ padding: 22, gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <div className="card-title">Waga</div>
            <span className="tag tag-accent-2" style={{ fontSize: 12 }}>{sgn(+(B.weight - A.weight).toFixed(1))} kg między T{A.week} a T{B.week}</span>
          </div>
          <svg width="100%" viewBox="0 0 420 170" style={{ display: 'block', overflow: 'visible' }} role="img" aria-label="Wykres wagi tydzień po tygodniu">
            {[20, 85, 150].map(y => <line key={y} x1={0} x2={420} y1={y} y2={y} stroke="var(--color-divider)" strokeDasharray="3 5" />)}
            <polyline points={dots.map(d => `${d.x.toFixed(1)},${d.y.toFixed(1)}`).join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
            {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.on ? 7 : 4} fill={d.on ? 'var(--color-accent)' : 'var(--color-bg)'} stroke="var(--color-accent)" strokeWidth={3} />)}
          </svg>
          <div className="muted" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            {dots.map((d, i) => <span key={i}>{d.l}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── training plan editor ────────────────────────────────────────────────

const PLAN_DAYS: WorkoutKey[] = ['A', 'B', 'C', 'K'];

export function PlanTab({ p }: { p: PanelState }) {
  const cur = p.cur!;
  const [draft, setDraft] = useState<TrainingPlan>(() => structuredClone(p.plan ?? planTemplate(cur.survey)));
  const [day, setDay] = useState<WorkoutKey>('A');
  const [dirty, setDirty] = useState(!p.plan);
  const [busy, setBusy] = useState(false);
  const d = draft.days[day];

  const edit = (fn: (d: TrainingPlan['days'][WorkoutKey]) => void) => {
    setDraft(x => { const n = structuredClone(x); fn(n.days[day]); return n; });
    setDirty(true);
  };
  const field = (i: number, k: 'name' | 'sets' | 'reps' | 'load' | 'note') =>
    (e: ChangeEvent<HTMLInputElement>) => { const v = e.target.value; edit(x => { x.rows[i][k] = v; }); };

  const save = async () => {
    setBusy(true);
    try {
      await p.savePlan(draft);
      setDirty(false);
      p.flash(`Plan wysłany — ${firstName(cur.name)} widzi go już w aplikacji`);
    } catch {
      p.flash('Nie udało się zapisać. Sprawdź internet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: 22, gap: 16 }}>
      {!p.plan && <div className="tag tag-accent-2" style={{ alignSelf: 'flex-start', fontSize: 12 }}>Szablon na start — popraw go i wyślij</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="seg">
          {PLAN_DAYS.map(k => (
            <label key={k} className="seg-opt" style={{ padding: '8px 16px' }}>
              <input type="radio" name="pday" checked={day === k} onChange={() => setDay(k)} />{k === 'K' ? 'Cardio' : 'Trening ' + k}
            </label>
          ))}
        </div>
        <span className="muted" style={{ fontSize: 13 }}>{d.rows.length} ćw.</span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: '1 1 240px' }}>
          <label htmlFor="plan-title">Nazwa treningu</label>
          <input id="plan-title" className="input on-bg" value={d.title} onChange={e => { const v = e.target.value; edit(x => { x.title = v; }); }} />
        </div>
        <div className="field">
          <label htmlFor="plan-weekday">Dzień tygodnia</label>
          <select id="plan-weekday" className="input on-bg select" value={d.weekday} onChange={e => { const v = e.target.value; edit(x => { x.weekday = v; }); }}>
            <option value="">nie w tym tygodniu</option>
            {WEEKDAYS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <div className="plan-grid thead"><span /><span>Ćwiczenie</span><span>Serie</span><span>Powt.</span><span>Ciężar</span><span>Wskazówka dla klienta</span><span /></div>
        <div className="col" style={{ gap: 8 }}>
          {d.rows.map((r, i) => (
            <div key={i} className="plan-grid">
              <span className="num-badge">{i + 1}</span>
              <input className="input on-bg" aria-label={`Ćwiczenie ${i + 1}`} value={r.name} onChange={field(i, 'name')} style={{ fontWeight: 600 }} />
              <input className="input on-bg" aria-label={`Serie, ćwiczenie ${i + 1}`} value={r.sets} onChange={field(i, 'sets')} style={{ textAlign: 'center' }} />
              <input className="input on-bg" aria-label={`Powtórzenia, ćwiczenie ${i + 1}`} value={r.reps} onChange={field(i, 'reps')} style={{ textAlign: 'center' }} />
              <input className="input on-bg" aria-label={`Ciężar, ćwiczenie ${i + 1}`} value={r.load} onChange={field(i, 'load')} style={{ textAlign: 'center' }} />
              <input className="input on-bg" aria-label={`Wskazówka, ćwiczenie ${i + 1}`} value={r.note} placeholder="opcjonalnie" onChange={field(i, 'note')} />
              <button className="btn btn-icon btn-ghost icon-del" aria-label={`Usuń ćwiczenie ${i + 1}`} onClick={() => edit(x => { x.rows.splice(i, 1); })}><Icon name="trash" /></button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => edit(x => { x.rows.push({ name: 'Nowe ćwiczenie', sets: '3', reps: '10', load: '', note: '' }); })}><Icon name="plus" />Dodaj ćwiczenie</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {dirty && <span className="muted" style={{ fontSize: 13 }}>Niezapisane zmiany</span>}
          <button className="btn btn-primary" disabled={busy || !dirty} onClick={save}>{busy ? 'Zapisuję…' : `Zapisz i wyślij do ${dative(firstName(cur.name))}`}</button>
        </div>
      </div>
    </div>
  );
}

// ─── diet editor ─────────────────────────────────────────────────────────

const DIET_DAYS: DietDay[] = ['A', 'B', 'C'];

export function DietTab({ p }: { p: PanelState }) {
  const cur = p.cur!;
  const [draft, setDraft] = useState<DietPlan>(() => structuredClone(p.diet ?? dietTemplate()));
  const [day, setDay] = useState<DietDay>('A');
  const [dirty, setDirty] = useState(!p.diet);
  const [busy, setBusy] = useState(false);

  const edit = (fn: (d: DietPlan) => void) => {
    setDraft(x => { const n = structuredClone(x); fn(n); return n; });
    setDirty(true);
  };
  const kcal = Math.round(4 * num(draft.p) + 9 * num(draft.f) + 4 * num(draft.c));
  const macros: ['p' | 'f' | 'c', string, number, string][] = [
    ['p', 'Białko', 4, 'var(--color-accent)'], ['f', 'Tłuszcze', 9, 'var(--color-accent-2-600)'], ['c', 'Węglowodany', 4, 'var(--color-neutral-600)'],
  ];
  const menu = draft.days[day] ?? [];
  const menuKcal = Math.round(menu.reduce((a, m) => a + num(m.kcal), 0));
  const diff = menuKcal - kcal;
  const onTarget = Math.abs(diff) <= 50;
  const field = (i: number, k: 'time' | 'label' | 'name' | 'kcal' | 'p' | 'f' | 'c' | 'ing') =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const v = e.target.value; edit(d => { d.days[day][i][k] = v; }); };

  const save = async () => {
    setBusy(true);
    try {
      await p.saveDiet(draft);
      setDirty(false);
      p.flash(`Jadłospis wysłany — ${firstName(cur.name)} widzi go już w aplikacji`);
    } catch {
      p.flash('Nie udało się zapisać. Sprawdź internet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="split split-diet">
      <div className="card" style={{ padding: 22, gap: 14 }}>
        <div className="card-title">Cel dzienny</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="fh" style={{ fontSize: 36 }}>{kcal}</span><span className="muted">kcal</span>
        </div>
        {macros.map(([k, label, m, color]) => {
          const share = kcal ? Math.round(num(draft[k]) * m / kcal * 100) : 0;
          return (
            <div key={k} className="field">
              <label htmlFor={`macro-${k}`}>{label} (g) · {share}% energii</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input id={`macro-${k}`} className="input on-bg" inputMode="numeric" value={draft[k]} onChange={e => { const v = e.target.value; edit(d => { d[k] = v; }); }} style={{ fontWeight: 700, maxWidth: 100 }} />
                <div className="bar" style={{ height: 8 }}><div style={{ background: color, width: Math.min(100, share) + '%' }} /></div>
              </div>
            </div>
          );
        })}
        <div className="muted" style={{ fontSize: 12 }}>Kalorie liczone automatycznie: 4 kcal/g białka i węglowodanów, 9 kcal/g tłuszczu.</div>
        <div className="field">
          <label htmlFor="diet-note">Wskazówka pod jadłospisem</label>
          <textarea id="diet-note" className="input on-bg" style={{ borderRadius: 20, minHeight: 80 }} value={draft.note} onChange={e => { const v = e.target.value; edit(d => { d.note = v; }); }} />
        </div>
      </div>

      <div className="card" style={{ padding: 22, gap: 14, minWidth: 0 }}>
        {!p.diet && <div className="tag tag-accent-2" style={{ alignSelf: 'flex-start', fontSize: 12 }}>Szablon na start — popraw go i wyślij</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="seg">
            {DIET_DAYS.map(d => (
              <label key={d} className="seg-opt" style={{ padding: '8px 16px' }}>
                <input type="radio" name="dday" checked={day === d} onChange={() => setDay(d)} />Dzień {d}
              </label>
            ))}
          </div>
          <span className={`tag ${onTarget ? 'tag-accent-2' : 'tag-accent'}`} style={{ fontSize: 12 }}>
            {menuKcal} kcal · {onTarget ? 'zgodne z celem' : (diff > 0 ? '+' : '−') + Math.abs(diff) + ' kcal od celu'}
          </span>
        </div>
        <div className="table-scroll">
          <div className="meal-grid thead"><span>Godz.</span><span>Posiłek</span><span>Nazwa</span><span>kcal</span><span>B</span><span>T</span><span>W</span><span /></div>
          <div className="col" style={{ gap: 12 }}>
            {menu.map((m, i) => (
              <div key={i} className="meal-grid meal-row">
                <input className="input on-bg" aria-label={`Godzina, posiłek ${i + 1}`} value={m.time} onChange={field(i, 'time')} style={{ textAlign: 'center' }} />
                <input className="input on-bg" aria-label={`Rodzaj, posiłek ${i + 1}`} value={m.label} onChange={field(i, 'label')} />
                <input className="input on-bg" aria-label={`Nazwa, posiłek ${i + 1}`} value={m.name} onChange={field(i, 'name')} style={{ fontWeight: 600 }} />
                <input className="input on-bg" aria-label={`Kalorie, posiłek ${i + 1}`} inputMode="numeric" value={m.kcal} onChange={field(i, 'kcal')} style={{ textAlign: 'center' }} />
                <input className="input on-bg" aria-label={`Białko, posiłek ${i + 1}`} inputMode="numeric" value={m.p} onChange={field(i, 'p')} style={{ textAlign: 'center' }} />
                <input className="input on-bg" aria-label={`Tłuszcze, posiłek ${i + 1}`} inputMode="numeric" value={m.f} onChange={field(i, 'f')} style={{ textAlign: 'center' }} />
                <input className="input on-bg" aria-label={`Węglowodany, posiłek ${i + 1}`} inputMode="numeric" value={m.c} onChange={field(i, 'c')} style={{ textAlign: 'center' }} />
                <button className="btn btn-icon btn-ghost icon-del" aria-label={`Usuń posiłek ${i + 1}`} onClick={() => edit(d => { d.days[day].splice(i, 1); })}><Icon name="trash" /></button>
                <textarea className="input on-bg meal-ing" rows={2} aria-label={`Składniki, posiłek ${i + 1}`} placeholder={'Składniki, każdy w osobnej linii, np.\nPłatki owsiane: 60 g'} value={m.ing} onChange={field(i, 'ing')} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => edit(d => { (d.days[day] ??= []).push({ time: '', label: '', name: 'Nowy posiłek', kcal: '0', p: '', f: '', c: '', ing: '' }); })}><Icon name="plus" />Dodaj posiłek</button>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {dirty && <span className="muted" style={{ fontSize: 13 }}>Niezapisane zmiany</span>}
            <button className="btn btn-primary" disabled={busy || !dirty} onClick={save}>{busy ? 'Zapisuję…' : `Zapisz i wyślij do ${dative(firstName(cur.name))}`}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
