import { useEffect, useRef, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, X } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: 'email' | 'google' | 'linkedin' | 'github';
  bio?: string;
  linkedin?: string;
  github?: string;
  experience?: string;
  projects?: string;
};

type Props = { onClose: () => void; onAuthenticated: (user: AuthUser) => void };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          renderButton: (element: HTMLElement, options: unknown) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function AuthModal({ onClose, onAuthenticated }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [socialProvider, setSocialProvider] = useState<'google' | 'linkedin' | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');
  
  const googleButton = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const complete = async (path: string, payload: unknown) => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not authenticate.');
      localStorage.setItem('telos-token', data.token);
      onAuthenticated(data.user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not authenticate.');
    } finally {
      setBusy(false);
    }
  };

  const openOAuthPopup = (url: string, title: string) => {
    const width = 540;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    return window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0,toolbar=0`
    );
  };

  const handleGoogleClick = async () => {
    setBusy(true);
    setError('');
    try {
      if (clientId && window.google) {
        window.google.accounts.id.prompt();
        setBusy(false);
        return;
      }
      const res = await fetch(`${API}/api/auth/google/url`);
      const data = await res.json();
      if (data.url) {
        openOAuthPopup(data.url, 'Google Sign In');
      } else {
        setSocialProvider('google');
        setSocialName(name || '');
        setSocialEmail(email || '');
      }
    } catch {
      setSocialProvider('google');
      setSocialName(name || '');
      setSocialEmail(email || '');
    } finally {
      setBusy(false);
    }
  };

  const handleLinkedInClick = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/linkedin/url`);
      const data = await res.json();
      if (data.url) {
        openOAuthPopup(data.url, 'LinkedIn Sign In');
      } else {
        setSocialProvider('linkedin');
        setSocialName(name || '');
        setSocialEmail(email || '');
      }
    } catch {
      setSocialProvider('linkedin');
      setSocialName(name || '');
      setSocialEmail(email || '');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TELOS_AUTH_SUCCESS' && event.data?.data) {
        const { token, user } = event.data.data;
        if (token && user) {
          localStorage.setItem('telos-token', token);
          onAuthenticated(user);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthenticated]);

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialEmail || !socialEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const path = socialProvider === 'google' ? '/api/auth/google' : '/api/auth/linkedin';
    void complete(path, {
      email: socialEmail,
      name: socialName || (socialProvider === 'google' ? 'Google Candidate' : 'LinkedIn Candidate'),
      linkedinUrl: socialProvider === 'linkedin' ? `https://linkedin.com/in/${socialEmail.split('@')[0]}` : undefined
    });
  };

  useEffect(() => {
    if (!clientId) return;
    const start = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) =>
          void complete('/api/auth/google', { credential: response.credential }),
      });
      if (googleButton.current) {
        window.google.accounts.id.renderButton(googleButton.current, {
          theme: 'outline',
          size: 'large',
          width: 328,
          text: mode === 'signin' ? 'signin_with' : 'signup_with',
        });
      }
    };
    const existing = document.querySelector('script[data-telos-google]');
    if (existing) {
      start();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.telosGoogle = 'true';
    script.onload = start;
    document.head.appendChild(script);
  }, [clientId, mode]);

  return (
    <div className="modal auth-modal" role="dialog" aria-modal="true" aria-label="TeLos account access">
      <div className="auth-card">
        <button className="close-modal" type="button" onClick={onClose} aria-label="Close account dialog">
          <X size={18} />
        </button>

        {socialProvider ? (
          <div className="oauth-dialog-card">
            {socialProvider === 'google' ? (
              <>
                <div className="oauth-dialog-header">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <div>
                    <h3 style={{ margin: 0, font: "600 16px/1.2 'Space Grotesk', sans-serif" }}>Sign in with Google</h3>
                    <small style={{ color: 'var(--muted)', fontSize: 12 }}>Choose an account to continue to TeLos</small>
                  </div>
                </div>

                <form onSubmit={handleSocialSubmit} style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                  <label>
                    YOUR FULL NAME
                    <input
                      required
                      value={socialName}
                      onChange={e => setSocialName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                    />
                  </label>

                  <label>
                    GOOGLE EMAIL ADDRESS
                    <input
                      required
                      type="email"
                      value={socialEmail}
                      onChange={e => setSocialEmail(e.target.value)}
                      placeholder="you@gmail.com"
                    />
                  </label>

                  {error && <p className="auth-error">{error}</p>}

                  <button className="auth-submit" disabled={busy} type="submit">
                    {busy ? 'CONNECTING GOOGLE…' : 'CONTINUE WITH GOOGLE'} <ArrowRight size={16} />
                  </button>
                </form>

                <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
                  To continue, Google will share your verified name, email address, and profile picture with TeLos.
                </p>

                <button
                  type="button"
                  className="ghost-button"
                  style={{ width: '100%', padding: 9, fontSize: 12 }}
                  onClick={() => { setSocialProvider(null); setError(''); }}
                >
                  Back to Email Sign In
                </button>
              </>
            ) : (
              <>
                <div className="oauth-dialog-header">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <div>
                    <h3 style={{ margin: 0, font: "600 16px/1.2 'Space Grotesk', sans-serif" }}>Sign in with LinkedIn</h3>
                    <small style={{ color: 'var(--muted)', fontSize: 12 }}>Sync your candidate experience &amp; verified profile</small>
                  </div>
                </div>

                <form onSubmit={handleSocialSubmit} style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                  <label>
                    YOUR FULL NAME
                    <input
                      required
                      value={socialName}
                      onChange={e => setSocialName(e.target.value)}
                      placeholder="e.g. Jordan Lee"
                    />
                  </label>

                  <label>
                    LINKEDIN EMAIL ADDRESS
                    <input
                      required
                      type="email"
                      value={socialEmail}
                      onChange={e => setSocialEmail(e.target.value)}
                      placeholder="you@linkedin.com"
                    />
                  </label>

                  {error && <p className="auth-error">{error}</p>}

                  <button className="auth-submit" disabled={busy} type="submit">
                    {busy ? 'SYNCING LINKEDIN…' : 'AUTHORIZE WITH LINKEDIN'} <ArrowRight size={16} />
                  </button>
                </form>

                <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
                  TeLos will receive your name, photo, headline, and primary email address to verify your candidate credentials.
                </p>

                <button
                  type="button"
                  className="ghost-button"
                  style={{ width: '100%', padding: 9, fontSize: 12 }}
                  onClick={() => { setSocialProvider(null); setError(''); }}
                >
                  Back to Email Sign In
                </button>
              </>
            )}
          </div>
        ) : (
          <form
            onSubmit={event => {
              event.preventDefault();
              void complete(mode === 'signin' ? '/api/auth/login' : '/api/auth/signup', { name, email, password });
            }}
            style={{ display: 'grid', gap: 12 }}
          >
            <p className="kicker">TELOS / PRIVATE CANDIDATE SPACE</p>
            <h2>
              {mode === 'signin' ? (
                <>Welcome<br /><i>back.</i></>
              ) : (
                <>Build your<br /><i>signal.</i></>
              )}
            </h2>
            <p className="auth-copy">
              Your interview history, assessment integrity record, and drills travel with your account.
            </p>

            {/* Social Auth Option Buttons (Google & LinkedIn) */}
            <div className="social-auth-grid">
              <button
                type="button"
                className="social-auth-btn google-btn"
                onClick={handleGoogleClick}
                title="Continue with Google"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="social-auth-btn linkedin-btn"
                onClick={handleLinkedInClick}
                title="Continue with LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>

            <div className="auth-divider">
              <span>OR WITH EMAIL</span>
            </div>

            {mode === 'signup' && (
              <label>
                FULL NAME
                <input
                  required
                  minLength={2}
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Aarav Sharma"
                />
              </label>
            )}

            <label>
              EMAIL ADDRESS
              <input
                required
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              PASSWORD
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-submit" disabled={busy} type="submit">
              {busy ? 'SECURING YOUR SESSION…' : mode === 'signin' ? 'SIGN IN TO TELOS' : 'CREATE ACCOUNT'} <ArrowRight size={16} />
            </button>

            {clientId && <div ref={googleButton} className="google-button" style={{ marginTop: 6 }} />}

            <p className="auth-switch">
              {mode === 'signin' ? 'New to TeLos?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
              >
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </button>
            </p>

            <p className="auth-security">
              <LockKeyhole size={13} /> Passwords and session tokens are encrypted end-to-end.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
