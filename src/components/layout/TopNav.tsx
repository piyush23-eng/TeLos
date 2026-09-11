import { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, ChevronDown, Code2, LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react';
import type { Page } from '../../types';
import type { AuthUser } from '../../AuthModal';
import { safeStorage } from '../../apiConfig';
import telosLogo from '../../assets/telos-logo.jpeg';

interface TopNavProps {
  page: Page;
  setPage: (p: Page) => void;
  user: AuthUser | null;
  onAuth: () => void;
  onLogout: () => void;
  locked: boolean;
}

export function TopNav({ page, setPage, user, onAuth, onLogout, locked }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => safeStorage.get('telos-theme') === 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    safeStorage.set('telos-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const go = (next: Page) => {
    if (!locked) {
      setPage(next);
      setMenuOpen(false);
    }
  };

  const accountAction = () => {
    if (!locked) {
      if (user) setMenuOpen(open => !open);
      else onAuth();
    }
  };

  const logout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className={`top-nav ${locked ? 'assessment-nav-locked' : ''}`}>
      <button className="wordmark" aria-label="Go to TeLos interview practice" disabled={locked} onClick={() => go('studio')}>
        <img className="brand-logo" src={telosLogo} alt="TeLos logo" />
        <span className="brand-name">TeLos</span>
        <sup>®</sup>
      </button>

      <nav className="nav-links" aria-label="Main navigation">
        <button disabled={locked} className={page === 'studio' ? 'selected' : ''} onClick={() => go('studio')}>
          Interview
        </button>
        <button disabled={locked} className={page === 'prep' ? 'selected' : ''} onClick={() => go('prep')}>
          Company prep
        </button>
        <button className={page === 'assessment' ? 'selected' : ''} onClick={() => go('assessment')}>
          Assessment
        </button>
        <button disabled={locked} className={page === 'community' ? 'selected' : ''} onClick={() => go('community')}>
          Discuss
        </button>
        <button disabled={locked} className={page === 'analytics' ? 'selected' : ''} onClick={() => go('analytics')}>
          Results
        </button>
        <button disabled={locked} className={page === 'bank' ? 'selected' : ''} onClick={() => go('bank')}>
          Drills
        </button>
      </nav>

      <div className="account-actions">
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setDarkMode(value => !value)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="account-menu">
          <button className="nav-cta account-cta" disabled={locked} onClick={accountAction}>
            {locked ? (
              'Assessment locked'
            ) : user ? (
              <>
                <span className="account-initial">{user.name.slice(0, 1).toUpperCase()}</span>
                {user.name.split(' ')[0]}
                <ChevronDown size={14} className={menuOpen ? 'rotated' : ''} />
              </>
            ) : (
              <>
                Sign in <ArrowRight size={15} />
              </>
            )}
          </button>

          {user && menuOpen && (
            <div className="account-popover" role="menu">
              <div className="account-popover-head">
                <span>{user.name.slice(0, 1).toUpperCase()}</span>
                <div>
                  <b>{user.name}</b>
                  <small>{user.email}</small>
                </div>
              </div>
              <button onClick={() => go('dashboard')}>
                <LayoutDashboard size={16} />
                <span>
                  <b>My dashboard</b>
                  <small>Profile, progress, and practice plan</small>
                </span>
              </button>
              <button onClick={() => go('analytics')}>
                <BarChart3 size={16} />
                <span>
                  <b>Performance</b>
                  <small>Readiness and interview results</small>
                </span>
              </button>
              <button onClick={() => go('bank')}>
                <Code2 size={16} />
                <span>
                  <b>Practice library</b>
                  <small>Drills and coding patterns</small>
                </span>
              </button>
              <button className="popover-logout" onClick={logout}>
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
