import { useEffect, useRef, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, X } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

export type AuthUser = { id: string; name: string; email: string; provider: 'email' | 'google'; bio?: string; linkedin?: string; github?: string; experience?: string; projects?: string };

type Props = { onClose: () => void; onAuthenticated: (user: AuthUser) => void };

declare global {
  interface Window { google?: { accounts: { id: { initialize: (config: unknown) => void; renderButton: (element: HTMLElement, options: unknown) => void } } } }
}

export function AuthModal({ onClose, onAuthenticated }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const googleButton = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const complete = async (path: string, payload: unknown) => {
    setBusy(true); setError('');
    try {
      const response = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not authenticate.');
      localStorage.setItem('telos-token', data.token);
      onAuthenticated(data.user);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not authenticate.'); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    if (!clientId || !googleButton.current) return;
    const start = () => {
      if (!window.google || !googleButton.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: (response: { credential: string }) => void complete('/api/auth/google', { credential: response.credential }) });
      window.google.accounts.id.renderButton(googleButton.current, { theme: 'outline', size: 'large', width: 328, text: mode === 'signin' ? 'signin_with' : 'signup_with' });
    };
    const existing = document.querySelector('script[data-telos-google]');
    if (existing) { start(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.defer = true; script.dataset.telosGoogle = 'true'; script.onload = start;
    document.head.appendChild(script);
  }, [clientId, mode]);

  return <div className="modal auth-modal" role="dialog" aria-modal="true" aria-label="TeLos account access">
    <form className="auth-card" onSubmit={event => { event.preventDefault(); void complete(mode === 'signin' ? '/api/auth/login' : '/api/auth/signup', { name, email, password }); }}>
      <button className="close-modal" type="button" onClick={onClose} aria-label="Close account dialog"><X size={18}/></button>
      <p className="kicker">TELOS / PRIVATE CANDIDATE SPACE</p>
      <h2>{mode === 'signin' ? <>Welcome<br/><i>back.</i></> : <>Build your<br/><i>signal.</i></>}</h2>
      <p className="auth-copy">Your interview history, assessment integrity record, and drills travel with your account.</p>
      {mode === 'signup' && <label>FULL NAME<input required minLength={2} value={name} onChange={event => setName(event.target.value)} placeholder="Aarav Sharma"/></label>}
      <label>EMAIL ADDRESS<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label>
      <label>PASSWORD<input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters"/></label>
      {error && <p className="auth-error">{error}</p>}
      <button className="auth-submit" disabled={busy}>{busy ? 'SECURING YOUR SESSION…' : mode === 'signin' ? 'SIGN IN TO TELOS' : 'CREATE ACCOUNT'} <ArrowRight size={16}/></button>
      <div className="auth-divider"><span>OR</span></div>
      {clientId ? <div ref={googleButton} className="google-button"/> : <p className="google-config"><Mail size={15}/> Google sign-in is ready when <code>VITE_GOOGLE_CLIENT_ID</code> is configured.</p>}
      <p className="auth-switch">{mode === 'signin' ? 'New to TeLos?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</button></p>
      <p className="auth-security"><LockKeyhole size={13}/> Passwords are never stored in the browser.</p>
    </form>
  </div>;
}
