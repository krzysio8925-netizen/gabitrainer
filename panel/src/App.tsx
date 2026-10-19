import { TRAINER } from './backend/config';
import { Icon, type IconName } from './icons';
import { isUnread, statusOf, usePanel, type View } from './store';
import { Calendar } from './views/Calendar';
import { Clients } from './views/Clients';
import { Login } from './views/Login';
import { Messages } from './views/Messages';

// The client app is published one level up from the panel (site root vs /panel/).
const CLIENT_APP_URL = '../';

export default function App() {
  const p = usePanel();

  if (p.user === undefined) return <div className="login-wrap"><p className="muted">Ładowanie…</p></div>;
  if (!p.ready) return <Login p={p} />;

  const list = p.clients ?? [];
  const pending = list.filter(c => ['raport', 'ankieta'].includes(statusOf(c))).length;
  const unread = list.filter(isUnread).length;
  const nav: [View, string, IconName, number][] = [
    ['klienci', 'Podopieczni', 'users', pending],
    ['kalendarz', 'Kalendarz', 'cal', 0],
    ['czat', 'Wiadomości', 'chat', unread],
  ];

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <div className="brand-mark">G</div>
          <div className="brand-name">GabiTrainer</div>
        </div>
        <nav className="side-nav" aria-label="Sekcje panelu">
          {nav.map(([id, label, icon, count]) => (
            <button key={id} className="nav-btn" aria-current={p.view === id ? 'page' : undefined} onClick={() => p.setView(id)}>
              <Icon name={icon} />
              <span style={{ flex: 1 }}>{label}</span>
              {count > 0 && <span className="count" aria-label={`${count} nowych`}>{count}</span>}
            </button>
          ))}
        </nav>
        <div className="side-spacer" style={{ flex: 1 }} />
        <a className="side-link" href={CLIENT_APP_URL} target="_blank" rel="noreferrer">Podgląd aplikacji klienta →</a>
        <div className="me">
          <div className="av" style={{ width: 34, height: 34, background: 'var(--color-accent-300)', fontSize: 13 }}>{TRAINER.initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{TRAINER.fullName}</div>
            <button className="link-btn" onClick={() => p.session.logout()}>Wyloguj</button>
          </div>
        </div>
      </aside>

      {p.view === 'klienci' && <Clients p={p} />}
      {p.view === 'kalendarz' && <Calendar p={p} />}
      {p.view === 'czat' && <Messages p={p} />}

      {p.toast && (
        <div className="toast" role="status"><Icon name="check" />{p.toast}</div>
      )}
    </div>
  );
}
