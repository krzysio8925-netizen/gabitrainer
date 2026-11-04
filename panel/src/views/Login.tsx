import { useState, type FormEvent } from 'react';

import { TRAINER_EMAIL } from '../backend/config';
import { authError, type PanelState } from '../store';
import sigPlum from '../assets/sig-plum.svg';

/** Sign-in, first-time sign-up and e-mail verification for the trainer. */
export function Login({ p }: { p: PanelState }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError(''); setInfo('');
    try { await fn(); } catch (e) { setError(authError(e)); } finally { setBusy(false); }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && email.trim().toLowerCase() !== TRAINER_EMAIL.toLowerCase()) {
      setError('Konto w panelu może założyć tylko trenerka, na swój adres e-mail.');
      return;
    }
    run(() => mode === 'login' ? p.session.login(email, password) : p.session.signup(email, password));
  };

  let body;
  if (p.user && !p.isTrainer) {
    body = (
      <>
        <h2 style={{ margin: 0 }}>Brak dostępu</h2>
        <p className="muted" style={{ margin: 0 }}>Konto {p.user.email} nie ma dostępu do panelu trenera. Podopieczni korzystają z aplikacji.</p>
        <button className="btn btn-primary" onClick={() => p.session.logout()}>Wyloguj się</button>
      </>
    );
  } else if (p.user && !p.verified) {
    body = (
      <>
        <h2 style={{ margin: 0 }}>Potwierdź e-mail</h2>
        <p className="muted" style={{ margin: 0 }}>Wysłaliśmy link na <b>{p.user.email}</b>. Kliknij go (sprawdź też spam), a potem wróć tutaj.</p>
        {error && <p className="form-error">{error}</p>}
        {info && <p className="form-info">{info}</p>}
        <button className="btn btn-primary" disabled={busy} onClick={() => run(async () => {
          if (!(await p.session.checkVerified())) setError('Adres nie jest jeszcze potwierdzony. Kliknij link w e-mailu.');
        })}>Potwierdziłam, wchodzę</button>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => run(async () => { await p.session.resendVerification(); setInfo('Wysłano ponownie.'); })}>Wyślij link jeszcze raz</button>
          <button className="btn btn-ghost" onClick={() => p.session.logout()}>Wyloguj</button>
        </div>
      </>
    );
  } else {
    body = (
      <form onSubmit={submit} className="col" style={{ gap: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>{mode === 'login' ? 'Panel trenera' : 'Załóż konto trenerki'}</h2>
          <p className="muted" style={{ margin: 0 }}>{mode === 'login' ? 'Zaloguj się, żeby zobaczyć podopiecznych.' : `Tylko dla adresu ${TRAINER_EMAIL}. Po założeniu potwierdzisz e-mail.`}</p>
        </div>
        <div className="field"><label htmlFor="login-email">E-mail</label>
          <input id="login-email" className="input on-bg" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div className="field"><label htmlFor="login-password">Hasło{mode === 'signup' ? ' (min. 6 znaków)' : ''}</label>
          <input id="login-password" className="input on-bg" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} required /></div>
        {error && <p className="form-error">{error}</p>}
        {info && <p className="form-info">{info}</p>}
        <button className="btn btn-primary" style={{ height: 46 }} disabled={busy}>{busy ? 'Chwila…' : mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}</button>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); }}>
            {mode === 'login' ? 'Pierwsze logowanie? Załóż konto' : 'Mam już konto'}
          </button>
          {mode === 'login' && (
            <button type="button" className="btn btn-ghost" onClick={() => {
              if (!email.trim()) { setError('Wpisz najpierw swój e-mail.'); return; }
              run(async () => { await p.session.resetPassword(email); setInfo('Wysłaliśmy link do zmiany hasła.'); });
            }}>Nie pamiętam hasła</button>
          )}
        </div>
      </form>
    );
  }

  return (
    <div className="login-wrap">
      <div className="login-card card">
        <div className="brand" style={{ padding: 0 }}>
          <img className="brand-sig" src={sigPlum} alt="GabiTrainer" />
        </div>
        {body}
      </div>
    </div>
  );
}
