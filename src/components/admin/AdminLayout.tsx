import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, UserCheck, MessageSquare,
  Briefcase, Calendar, MapPin, Star, Newspaper, HelpCircle,
  Award, Settings, ChevronDown, Menu, X, ClipboardCheck,
  LogOut, Shield, Activity,
  BarChart2,
  PenTool,
  Navigation2,
  Megaphone,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { authService } from '../../services/authService';
import type { User } from '../../types';
import { PageTransition } from '../layout/PageTransition';
import { ShinyText } from '../ui/ShinyText';

interface NavGroup {
  label: string;
  items: { icon: React.ElementType; label: string; href: string; badge?: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: Users, label: 'Students', href: '/admin/students' },
      { icon: Calendar, label: 'Attendance', href: '/admin/attendance' },
      { icon: Calendar, label: 'Batches', href: '/admin/batches' },
      { icon: Briefcase, label: 'Internships', href: '/admin/internships' },
      { icon: Activity, label: 'Activity History', href: '/admin/activity' },
      { icon: ClipboardCheck, label: 'Certificates', href: '/admin/certificates' },
    ],
  },
  {
    label: 'Content',
    items: [
    { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
    { icon: Navigation2, label: 'Navigation Menu', href: '/admin/navigation' },
    { icon: Briefcase, label: 'Live Projects', href: '/admin/website/live-projects' },
    { icon: Calendar, label: 'Events & Webinars', href: '/admin/website/events' },
    { icon: Award, label: 'Scholarships', href: '/admin/website/scholarships' },
      { icon: Star, label: 'Refer & Earn', href: '/admin/website/refer-earn' },
      { icon: Briefcase, label: 'Corporate Training', href: '/admin/website/corporate-training' },
      { icon: UserCheck, label: 'Expert Trainers', href: '/admin/website/instructors' },
      { icon: Newspaper, label: 'Blog', href: '/admin/website/blog' },
      { icon: Activity, label: 'About Us', href: '/admin/website/about' },
      { icon: MessageSquare, label: 'Contact', href: '/admin/website/contact' },
      { icon: MapPin, label: 'Locations', href: '/admin/website/locations' },
      { icon: Award, label: 'Master Programs', href: '/admin/website/master-programs' },
      { icon: BookOpen, label: 'Online Training', href: '/admin/website/online-training' },
      { icon: BookOpen, label: 'Classroom Training', href: '/admin/website/classroom-training' },
      { icon: Award, label: 'Certifications', href: '/admin/website/certifications' },
      { icon: Calendar, label: 'Batch Schedule', href: '/admin/website/batches' },
      { icon: Calendar, label: 'Free Demo Class', href: '/admin/website/demo-class' },
      { icon: BarChart2, label: 'Skill Assessment', href: '/admin/website/skill-assessment' },
      { icon: Briefcase, label: 'Career & Placement', href: '/admin/website/career' },
      { icon: Award, label: 'Placement Records', href: '/admin/website/placement-records' },
      { icon: BookOpen, label: 'Interview Preparation', href: '/admin/website/interview-preparation' },
      { icon: Users, label: 'Mock Interview', href: '/admin/website/mock-interview' },
      { icon: BookOpen, label: 'Categories', href: '/admin/website/categories' },
      { icon: HelpCircle, label: 'FAQs', href: '/admin/website/faqs' },
      { icon: Star, label: 'Testimonials', href: '/admin/website/testimonials' },
      { icon: PenTool, label: 'Content Studio', href: '/admin/studio' },
    ],
  },
  {
    label: 'People',
    items: [
      { icon: UserCheck, label: 'Instructors', href: '/admin/instructors' },
      { icon: MessageSquare, label: 'Enquiries', href: '/admin/enquiries' },
      { icon: Megaphone, label: 'Student announcements', href: '/admin/announcements' },
      { icon: Shield, label: 'Accounts & permissions', href: '/admin/users' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'Settings', href: '/admin/settings' },
      { icon: Shield, label: 'Account security', href: '/account/security' },
    ],
  },
];

const navPermissions: Record<string, string> = {
  '/admin/students': 'students.read',
  '/admin/attendance': 'attendance.read',
  '/admin/batches': 'batches.read',
  '/admin/internships': 'internships.read',
  '/admin/activity': 'audit_logs.read',
  '/admin/certificates': 'certificates.read',
  '/admin/courses': 'courses.read',
  '/admin/categories': 'categories.manage',
  '/admin/enquiries': 'enquiries.read',
  '/admin/announcements': 'announcements.manage',
  '/admin/settings': 'settings.manage',
  '/admin/users': 'users.update',
  '/account/security': 'profile.read',
};

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useOutletContext<User>();

  const signOut = async () => {
    try {
      await authService.logout();
      navigate('/admin/login', { replace: true });
    } catch {
      window.alert('Unable to sign out. Please try again.');
    }
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) sidebarRef.current?.querySelector<HTMLElement>('a[href], button')?.focus();
  }, [sidebarOpen]);

  const permittedRoutes = user.role === 'SUPER_ADMIN'
    ? undefined
    : user.role === 'ADMIN'
      ? new Set(navGroups.flatMap(group => group.items).filter(item => item.href !== '/admin/users').map(item => item.href))
      : user.role === 'CONTENT_MANAGER'
    ? new Set([
      '/admin', '/admin/courses', '/admin/categories', '/admin/master-programs',
      '/admin/blog', '/admin/faqs', '/admin/testimonials', '/admin/studio',
      '/admin/instructors', '/admin/navigation', '/account/security',
    ])
    : user.role === 'TRAINER'
      ? new Set(['/admin', '/admin/batches', '/admin/attendance', '/admin/students', '/account/security'])
      : undefined;
  const visibleNavGroups = navGroups
    .map(group => ({
      ...group,
      items: permittedRoutes ? group.items.filter(item =>
        permittedRoutes.has(item.href) || (item.href.startsWith('/admin/website/') && permittedRoutes.has('/admin/studio')),
      ) : group.items,
    }))
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.permissions?.includes('ALL')) return true;
        const permission = navPermissions[item.href]
          ?? (item.href.startsWith('/admin/website/') || item.href === '/admin/studio' || item.href === '/admin/navigation'
            ? 'content.read'
            : undefined);
        return !permission || user.permissions?.includes(permission) === true;
      }),
    }))
    .filter(group => group.items.length > 0);

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (href: string) =>
    href === '/admin'
      ? location.pathname === '/admin'
      : href.startsWith('/admin/website/')
        ? location.pathname === href
        : location.pathname.startsWith(href);

  const Sidebar = () => (
    <aside
      id="admin-sidebar"
      ref={sidebarRef}
      onKeyDown={event => {
        if (event.key !== 'Tab' || !sidebarOpen || !sidebarRef.current) return;
        const focusable = Array.from(sidebarRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      className={cn(
      'fixed inset-y-0 left-0 z-50 w-64 bg-surface-950 text-white flex flex-col',
      'transition-transform duration-300',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-surface-800">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Global Minds Academy logo" className="h-14 w-auto max-w-[115px] object-contain" />
          <div>
            <p className="font-display font-bold text-sm">Global Minds Academy</p>
            <p className="text-xs text-brand-300 font-semibold">
              <ShinyText text="Admin Portal" shinyColor="rgba(45, 212, 191, 0.95)" />
            </p>
          </div>
        </Link>
        <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close admin navigation" className="lg:hidden rounded-lg p-2 text-surface-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleNavGroups.map(group => (
          <div key={group.label} className="mb-4">
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              aria-expanded={!collapsedGroups.has(group.label)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-surface-300 uppercase tracking-wider hover:text-surface-100 transition-colors"
            >
              {group.label}
              {group.items.length > 1 && (
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', collapsedGroups.has(group.label) && '-rotate-90')} />
              )}
            </button>

            {!collapsedGroups.has(group.label) && (
              <div className="mt-1 space-y-0.5">
                {group.items.map(item => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                      isActive(item.href)
                        ? 'bg-brand-600 text-white'
                        : 'text-surface-300 hover:bg-surface-800 hover:text-white',
                    )}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <span className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                        item.badge === 'New' ? 'bg-accent-500 text-white' : 'bg-surface-700 text-surface-300',
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-800 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-900">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'CONTENT_MANAGER' ? 'Content Manager' : user.role === 'TRAINER' ? 'Trainer' : 'Admin'}
            </p>
            <p className="text-xs text-surface-300 truncate">{user.email}</p>
          </div>
        </div>
        <button type="button" onClick={signOut} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-surface-300 hover:text-white rounded-xl hover:bg-surface-800 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
        <Link to="/" className="flex items-center gap-2.5 px-3 py-2 text-sm text-surface-300 hover:text-white rounded-xl hover:bg-surface-800 transition-colors">
          Exit to Website
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />

      {/* Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-surface-950/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close admin navigation"
        />
      )}

      {/* Main */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-surface-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-surface-700 hover:bg-surface-100"
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="font-semibold text-surface-900 text-sm">
                {visibleNavGroups.flatMap(g => g.items).find(i => isActive(i.href))?.label ?? 'Admin'}
              </p>
              <p className="text-xs text-surface-600 font-medium">Global Minds Academy Admin Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
              Course changes sync through CMS
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <PageTransition>
            <Outlet context={user} />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
