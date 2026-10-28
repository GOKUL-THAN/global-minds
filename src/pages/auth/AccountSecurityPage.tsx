import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Shield, Smartphone } from 'lucide-react';
import { authService } from '../../services/authService';
import type { User } from '../../types';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

type AccountSession = Awaited<ReturnType<typeof authService.getSessions>>[number];

export default function AccountSecurityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const loadSessions = useCallback(async () => {
    const account = await authService.getCurrentUser();
    if (!account) {
      navigate('/login', { replace: true });
      return;
    }
    setUser(account);
    setSessions(await authService.getSessions());
  }, [navigate]);

  useEffect(() => {
    let active = true;
    void loadSessions()
      .catch(() => {
        if (active) setError('Unable to load your account security details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [loadSessions]);

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (newPassword.length < 12 || new TextEncoder().encode(newPassword).length > 72) {
      setError('Use a password between 12 and 72 UTF-8 bytes long.');
      return;
    }
    setBusy(true);
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setMessage(`${result.message} Redirecting to sign in...`);
      window.setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch {
      setError('Unable to change your password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const revokeSession = async (id: string) => {
    setError('');
    setMessage('');
    try {
      await authService.revokeSession(id);
      setSessions(items => items.filter(session => session.id !== id));
      setMessage('Session revoked.');
    } catch {
      setError('Unable to revoke this session. Refresh the page and try again.');
    }
  };

  const revokeAll = async () => {
    setError('');
    setBusy(true);
    try {
      await authService.logoutAll();
      navigate('/login', { replace: true });
    } catch {
      setError('Unable to sign out all sessions. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-brand-600" /></main>;
  }

  return (
    <main className="min-h-screen bg-surface-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to={user?.role === 'STUDENT' ? '/dashboard' : '/admin'} className="inline-flex items-center gap-2 text-sm text-brand-700 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to account
        </Link>
        <SpotlightCard>
          <header className="bg-white rounded-2xl p-6 shadow-card border border-surface-200">
            <div className="flex items-center gap-3">
              <Shield className="w-7 h-7 text-brand-600" />
              <div>
                <h1 className="font-display font-bold text-2xl">
                  <ShinyText text="Account security" shinyColor="rgba(23, 108, 115, 0.9)" />
                </h1>
                <p className="text-sm text-surface-600 font-medium">{user?.email}</p>
              </div>
            </div>
          </header>
        </SpotlightCard>

        {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
        {message && <p role="status" className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-4 py-3">{message}</p>}

        <SpotlightCard>
          <section className="bg-white rounded-2xl p-6 shadow-card border border-surface-200">
            <h2 className="font-semibold text-lg mb-4">Change password</h2>
            <form onSubmit={event => void changePassword(event)} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="current-password" className="form-label">Current password</label>
                <input id="current-password" type="password" autoComplete="current-password" required className="form-input" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} />
              </div>
              <div>
                <label htmlFor="new-password" className="form-label">New password</label>
                <input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required className="form-input" value={newPassword} onChange={event => setNewPassword(event.target.value)} />
              </div>
              <button type="submit" disabled={busy} className="btn-primary btn justify-center sm:col-span-2">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Change password'}
              </button>
            </form>
          </section>
        </SpotlightCard>

        <SpotlightCard>
          <section className="bg-white rounded-2xl p-6 shadow-card border border-surface-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-lg">Active sessions</h2>
                <p className="text-sm text-surface-600 font-medium">Revoke devices you no longer use. Sessions expire automatically.</p>
              </div>
              <button type="button" disabled={busy || sessions.length === 0} onClick={() => void revokeAll()} className="btn-secondary btn">
                Sign out all sessions
              </button>
            </div>
            {sessions.length === 0
              ? <p className="text-sm text-surface-600 font-medium">No active sessions were found.</p>
              : <ul className="divide-y divide-surface-100">
                {sessions.map(session => (
                  <li key={session.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Smartphone className="w-5 h-5 text-surface-500 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-surface-900 break-all">{session.user_agent || 'Unknown device'}</p>
                        <p className="text-xs text-surface-600 font-medium">IP {session.ip_address || 'unknown'} · Last active {new Date(session.last_seen_at).toLocaleString()}</p>
                        <p className="text-xs text-surface-600 font-medium">Expires {new Date(session.expires_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => void revokeSession(session.id)} className="text-sm text-red-700 hover:text-red-900 font-semibold hover:underline">Revoke</button>
                  </li>
                ))}
              </ul>}
          </section>
        </SpotlightCard>
      </div>
    </main>
  );
}
