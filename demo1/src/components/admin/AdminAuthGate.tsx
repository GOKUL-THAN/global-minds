import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { User } from '../../types';

export function AdminAuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    let active = true;
    authService.getCurrentUser()
      .then(currentUser => {
        if (active) setUser(currentUser && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'TRAINER'].includes(currentUser.role) ? currentUser : null);
      })
      .catch(() => {
        if (active) setError('Unable to verify your admin session. Check that the authentication service is running.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-surface-600">Verifying admin access...</div>;
  }
  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-red-700">{error}</p>
        <button className="btn-primary btn" onClick={() => window.location.reload()}>Try again</button>
      </main>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  return <Outlet context={user} />;
}
