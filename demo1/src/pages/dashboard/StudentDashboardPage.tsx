import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, LogOut, User } from 'lucide-react';
import type { User as Account } from '../../types';
import { authService } from '../../services/authService';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    authService.getCurrentUser()
      .then(account => {
        if (!active) return;
        if (account?.role === 'STUDENT') setUser(account);
        else if (account && ['ADMIN', 'SUPER_ADMIN'].includes(account.role)) {
          navigate('/admin', { replace: true });
        }
      })
      .catch(() => {
        if (active) setError('Unable to verify your session. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [navigate]);

  const signOut = async () => {
    try {
      await authService.logout();
      navigate('/login', { replace: true });
    } catch {
      setError('Unable to sign out. Please try again.');
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center text-surface-600">Verifying your account...</main>;
  }
  if (error && !user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-red-700">{error}</p>
        <button className="btn-primary btn" onClick={() => window.location.reload()}>Try again</button>
      </main>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-100">
        <div className="container-xl py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-surface-900">
            <GraduationCap className="w-6 h-6 text-brand-600" />
            Global Minds Academy
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/account/security" className="btn-secondary btn flex items-center gap-2 text-sm">
              <User className="w-4 h-4" /> Security
            </Link>
            <button onClick={signOut} className="btn-secondary btn flex items-center gap-2 text-sm">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="container-xl py-10 space-y-6">
        <section className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-7 text-white">
          <p className="text-brand-100 text-sm">Student account</p>
          <h1 className="font-display font-bold text-3xl mt-1">Welcome, {user.fullName}</h1>
          <p className="text-brand-100 mt-2">{user.email}</p>
        </section>
        <section className="bg-white rounded-2xl border border-surface-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-surface-900">Your learning space is being set up</h2>
              <p className="text-sm text-surface-600 mt-1">
                Course enrollment, lesson progress, schedules, assignments, and certificates are not connected to live APIs yet.
                No demo course or progress data is shown here.
              </p>
              <Link to="/courses" className="btn-primary btn inline-flex mt-4">Browse courses</Link>
            </div>
          </div>
        </section>
        <section className="bg-white rounded-2xl border border-surface-100 p-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-surface-400" />
            <div>
              <h2 className="font-semibold text-surface-900">Account profile</h2>
              <p className="text-sm text-surface-500">{user.phone || 'Phone not provided'} · {user.country || 'Country not provided'}</p>
            </div>
          </div>
        </section>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
    </main>
  );
}
