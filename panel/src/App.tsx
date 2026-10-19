import { CLIENTS } from './data';
import { Icon, type IconName } from './icons';
import { usePanel, type View } from './store';
import { Calendar } from './views/Calendar';
import { Clients } from './views/Clients';
import { Messages } from './views/Messages';

// The client app's web preview.
const CLIENT_APP_URL = 'https://claude.ai/artifact/GacVetj44iDWhCTqCXrBCo';

export default function App() {
  const p = usePanel();
  const pending = CLIENTS.filter(c => ['raport', 'ankieta'].includes(p.statusOf(c))).length;
  const nav: [View, string, IconName, number][] = [
    ['klienci', 'Podopieczni', 'users', pending],
    ['kalendarz', 'Kalendarz', 'cal', 0],
    ['czat', 'Wiadomości', 'chat', p.unread.length],
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
          <div className="av" style={{ width: 34, height: 34, background: 'var(--color-accent-300)', fontSize: 13 }}>GM</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Gabriela Mazur</div>
            <div className="muted" style={{ fontSize: 11 }}>Trenerka personalna</div>
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
