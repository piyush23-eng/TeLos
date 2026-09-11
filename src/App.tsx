import { useCallback, useState } from 'react';
import './roadmap.css';
import { safeStorage } from './apiConfig';
import type { Page } from './types';
import { TopNav } from './components/layout/TopNav';
import { SiteFooter } from './components/layout/SiteFooter';
import { Studio } from './features/interview/Studio';
import { CompanyPrep } from './features/company-prep/CompanyPrep';
import { Bank } from './features/drills/Bank';
import { Community } from './features/community/Community';
import { Analytics } from './features/analytics/Analytics';
import { Assessment } from './Assessment';
import { AuthModal, type AuthUser } from './AuthModal';
import { UserDashboard } from './UserDashboard';

export default function App() {
  const [page, setPage] = useState<Page>('studio');
  const [authOpen, setAuthOpen] = useState(false);
  const [assessmentLocked, setAssessmentLocked] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      return JSON.parse(safeStorage.get('telos-user') || 'null');
    } catch {
      return null;
    }
  });

  const handleAssessmentActivity = useCallback((active: boolean) => setAssessmentLocked(active), []);
  const syncUser = useCallback((nextUser: AuthUser) => {
    safeStorage.set('telos-user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);
  const logout = useCallback(() => {
    safeStorage.remove('telos-token');
    safeStorage.remove('telos-user');
    setUser(null);
    setPage('studio');
  }, []);

  const currentPage =
    page === 'dashboard'
      ? user
        ? <UserDashboard user={user} onNavigate={setPage} onRequireAuth={() => setAuthOpen(true)} onUserUpdated={syncUser} />
        : <Studio />
      : page === 'studio'
      ? <Studio />
      : page === 'prep'
      ? <CompanyPrep />
      : page === 'community'
      ? <Community />
      : page === 'analytics'
      ? <Analytics />
      : page === 'assessment'
      ? <Assessment user={user} onRequireAuth={() => setAuthOpen(true)} onActivityChange={handleAssessmentActivity} />
      : <Bank />;

  return (
    <div className="app-shell">
      <TopNav
        page={page}
        setPage={setPage}
        user={user}
        onAuth={() => setAuthOpen(true)}
        onLogout={logout}
        locked={assessmentLocked}
      />
      <div className="page-stage">
        {currentPage}
      </div>
      {!assessmentLocked && <SiteFooter onNavigate={setPage} />}
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuthenticated={(nextUser) => {
            syncUser(nextUser);
            setPage('dashboard');
            setAuthOpen(false);
          }}
        />
      )}
    </div>
  );
}
