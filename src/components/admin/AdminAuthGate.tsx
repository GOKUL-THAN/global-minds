import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { User } from '../../types';

const contentManagerRoutes = new Set([
  '/admin',
  '/admin/courses',
  '/admin/categories',
  '/admin/master-programs',
  '/admin/blog',
  '/admin/faqs',
  '/admin/testimonials',
  '/admin/studio',
  '/admin/instructors',
  '/admin/navigation',
  '/admin/locations',
]);

const contentManagerWebsiteSections = new Set([
  'website-menu',
  'live-projects',
  'events',
  'scholarships',
  'refer-earn',
  'corporate-training',
  'categories',
  'instructors',
  'blog',
  'faqs',
  'testimonials',
  'about',
  'contact',
  'locations',
  'master-programs',
  'online-training',
  'classroom-training',
  'certifications',
  'batches',
  'demo-class',
  'skill-assessment',
  'career',
  'placement-records',
  'interview-preparation',
  'mock-interview',
]);

const contentManagerStudioSections = new Set([
  'courses',
  'categories',
  'master-programs',
  'website-menu',
  'live-projects',
  'events',
  'scholarships',
  'refer-earn',
  'corporate-training',
  'instructors',
  'about',
  'contact',
  'online-training',
  'classroom-training',
  'certifications',
  'batches',
  'locations',
  'blog',
  'faqs',
  'testimonials',
  'demo-class',
  'skill-assessment',
  'career',
  'placement-records',
  'interview-preparation',
  'mock-interview',
]);

const trainerRoutes = new Set([
  '/admin',
  '/admin/batches',
  '/admin/attendance',
  '/admin/students',
]);

const routePermissions: Record<string, string> = {
  '/admin/students': 'students.read',
  '/admin/attendance': 'attendance.read',
  '/admin/batches': 'batches.read',
  '/admin/internships': 'internships.read',
  '/admin/activity': 'audit_logs.read',
  '/admin/certificates': 'certificates.read',
  '/admin/courses': 'courses.read',
  '/admin/categories': 'categories.manage',
  '/admin/master-programs': 'content.read',
  '/admin/instructors': 'content.read',
  '/admin/blog': 'content.read',
  '/admin/faqs': 'content.read',
  '/admin/testimonials': 'content.read',
  '/admin/enquiries': 'enquiries.read',
  '/admin/announcements': 'announcements.manage',
  '/admin/settings': 'settings.manage',
};

function canAccessRoute(user: User, pathname: string, search: string): boolean {
  if (pathname === '/admin/users') return user.role === 'SUPER_ADMIN';
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.permissions?.includes('ALL')) return true;
  const requiredPermission = routePermissions[pathname]
    ?? (pathname.startsWith('/admin/website/') ? 'content.read' : undefined)
    ?? (pathname === '/admin/navigation' || pathname === '/admin/studio' ? 'content.read' : undefined)
    ?? (pathname === '/account/security' ? 'profile.read' : undefined);
  if (requiredPermission && user.permissions?.includes(requiredPermission) !== true) return false;
  if (user.role === 'CONTENT_MANAGER') {
    if (pathname === '/admin/studio') {
      const section = new URLSearchParams(search).get('section');
      return !section || contentManagerStudioSections.has(section);
    }
    const websiteSection = pathname.startsWith('/admin/website/')
      ? pathname.slice('/admin/website/'.length)
      : '';
    return contentManagerRoutes.has(pathname) || contentManagerWebsiteSections.has(websiteSection);
  }
  if (user.role === 'TRAINER') {
    return trainerRoutes.has(pathname);
  }
  return false;
}

export function AdminAuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setAuthError('');
    authService.getCurrentUser()
      .then(currentUser => {
        if (!active) return;
        if (currentUser && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'TRAINER'].includes(currentUser.role)) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      }).catch(() => {
        if (active) {
          setUser(null);
          setAuthError('Unable to verify admin access because the sign-in server is unavailable.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [location.pathname, retryCount]);

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-card">
          <h1 className="font-display text-xl font-bold text-surface-900">Admin access is temporarily unavailable</h1>
          <p role="alert" className="mt-2 text-sm text-surface-600">{authError}</p>
          <button type="button" onClick={() => setRetryCount(count => count + 1)} className="btn-primary btn mt-5">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-surface-500 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!canAccessRoute(user, location.pathname, location.search)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet context={user} />;
}
