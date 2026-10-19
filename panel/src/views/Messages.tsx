import { useEffect, useRef, useState } from 'react';

import { CLIENTS } from '../data';
import { Icon } from '../icons';
import type { PanelState } from '../store';

export function Messages({ p }: { p: PanelState }) {
  const [draft, setDraft] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const cur = CLIENTS.find(c => c.id === p.chatSel)!;
  const msgs = p.threads[p.chatSel];

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [msgs]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    p.sendMessage(t);
    setDraft('');
  };

  return (
    <>
      <section className="list-col" style={{ gap: 12 }} aria-label="Rozmowy">
        <h3 style={{ margin: 0 }}>Wiadomości</h3>
        <div className="list-scroll">
          {CLIENTS.map(c => {
            const th = p.threads[c.id];
            return (
              <button key={c.id} className="person" aria-current={c.id === p.chatSel} onClick={() => p.openChat(c.id)}>
                <div className="av" style={{ width: 40, height: 40, fontSize: 13, background: c.avBg }}>{c.ini}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{c.full}</span>
                    {p.unread.includes(c.id) && <span className="dot" aria-label="nieprzeczytane" />}
                  </div>
                  <div className="muted ellipsis" style={{ fontSize: 12 }}>{th[th.length - 1].text}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <main className="chat-main">
        <div className="row" style={{ paddingBottom: 14, flexWrap: 'wrap' }}>
          <div className="av" style={{ width: 44, height: 44, background: cur.avBg }}>{cur.ini}</div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontWeight: 700 }}>{cur.full}</div>
            <div className="muted" style={{ fontSize: 12 }}>{cur.goal} · tydzień {cur.week}</div>
          </div>
          <button className="btn btn-secondary" onClick={p.openProfile}>Otwórz profil</button>
        </div>
        <div ref={box} className="chat-box">
          {msgs.map((m, i) => (
            <div key={i} className="bubble-wrap" style={{ alignItems: m.me ? 'flex-end' : 'flex-start' }}>
              <div className={`bubble ${m.me ? 'mine' : 'them'}`}>{m.text}</div>
              <span style={{ fontSize: 11, color: 'var(--color-neutral-600)', padding: '0 6px' }}>{m.time}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, paddingTop: 12 }}>
          <input id="chat-draft" className="input" placeholder="Napisz wiadomość…" aria-label="Wiadomość" value={draft} style={{ height: 44 }}
            onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} />
          <button className="btn btn-primary" style={{ flex: 'none', height: 44 }} onClick={send}><Icon name="send" />Wyślij</button>
        </div>
      </main>
    </>
  );
}
