import { useEffect, useRef, useState } from 'react';

import { Icon } from '../icons';
import { ago, avatarBg, initials, programWeek, stamp } from '../lib';
import { isUnread, type PanelState } from '../store';

export function Messages({ p }: { p: PanelState }) {
  const [draft, setDraft] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const cur = p.chatClient;
  // Most recent conversations first.
  const threads = [...(p.clients ?? [])].sort((a, b) => (b.lastMsgAt?.toMillis() ?? 0) - (a.lastMsgAt?.toMillis() ?? 0));

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [p.msgs]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    p.sendMessage(t).catch(() => { setDraft(t); p.flash('Nie udało się wysłać. Sprawdź internet.'); });
  };

  return (
    <>
      <section className="list-col" style={{ gap: 12 }} aria-label="Rozmowy">
        <h3 style={{ margin: 0 }}>Wiadomości</h3>
        <div className="list-scroll">
          {threads.length === 0 && <p className="muted" style={{ fontSize: 13, padding: '8px 6px' }}>Rozmowy z podopiecznymi pojawią się tutaj.</p>}
          {threads.map(c => (
            <button key={c.id} className="person" aria-current={c.id === cur?.id} onClick={() => p.openChat(c.id)}>
              <div className="av" style={{ width: 40, height: 40, fontSize: 13, background: avatarBg(c.id) }}>{initials(c.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                  <span className="ellipsis" style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                  {isUnread(c) ? <span className="dot" aria-label="nieprzeczytane" /> : <span className="muted" style={{ fontSize: 11 }}>{ago(c.lastMsgAt)}</span>}
                </div>
                <div className="muted ellipsis" style={{ fontSize: 12 }}>{c.lastMsgFrom === 'trainer' ? 'Ty: ' : ''}{c.lastMsgText ?? '—'}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <main className="chat-main">
        {!cur ? (
          <p className="muted">Wybierz rozmowę.</p>
        ) : (
          <>
            <div className="row" style={{ paddingBottom: 14, flexWrap: 'wrap' }}>
              <div className="av" style={{ width: 44, height: 44, background: avatarBg(cur.id) }}>{initials(cur.name)}</div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 700 }}>{cur.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{cur.survey?.goal} · tydzień {programWeek(cur.createdAt)}</div>
              </div>
              <button className="btn btn-secondary" onClick={p.openProfile}>Otwórz profil</button>
            </div>
            <div ref={box} className="chat-box">
              {p.msgs.length === 0 && <p className="muted" style={{ margin: 'auto', fontSize: 14 }}>Jeszcze nie rozmawialiście. Napisz pierwsza.</p>}
              {p.msgs.map(m => {
                const mine = m.from === 'trainer';
                return (
                  <div key={m.id} className="bubble-wrap" style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
                    <div className={`bubble ${mine ? 'mine' : 'them'}`} style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    <span style={{ fontSize: 11, color: 'var(--color-neutral-600)', padding: '0 6px' }}>{stamp(m.createdAt)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 12 }}>
              <input id="chat-draft" className="input" placeholder="Napisz wiadomość…" aria-label="Wiadomość" value={draft} style={{ height: 44 }}
                onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} />
              <button className="btn btn-primary" style={{ flex: 'none', height: 44 }} onClick={send} disabled={!draft.trim()}><Icon name="send" />Wyślij</button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
