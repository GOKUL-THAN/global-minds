import { useEffect, useState } from 'react';
import { Activity, BookOpen, Briefcase, Calendar, ClipboardCheck, FileText, MessageSquare, Navigation, Shield, Users } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import type { User } from '../../types';
import { adminOperationsService, type OperationalModule, type OperationalStatus, type OperationalSummary, type SystemHealth } from '../../services/adminOperationsService';
import { CountUp } from '../../components/ui/CountUp';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

const adminTools = [
  {
    title: 'Courses',
    description: 'Create, update, and publish course records.',
    href: '/admin/courses',
    icon: BookOpen,
  },
  {
    title: 'Website content',
    description: 'Edit website sections with structured forms.',
    href: '/admin/studio',
    icon: FileText,
  },
  {
    title: 'Navigation menu',
    description: 'Manage visible menu links and nested items.',
    href: '/admin/navigation',
    icon: Navigation,
  },
  {
    title: 'Enquiries',
    description: 'Review and update submitted enquiries.',
    href: '/admin/enquiries',
    icon: MessageSquare,
  },
];

const operationalLinks: Array<{ module: OperationalModule; title: string; href: string; icon: typeof Users }> = [
  { module: 'students', title: 'Students', href: '/admin/students', icon: Users },
  { module: 'attendance', title: 'Attendance', href: '/admin/attendance', icon: Calendar },
  { module: 'batches', title: 'Batches', href: '/admin/batches', icon: Calendar },
  { module: 'internships', title: 'Internships', href: '/admin/internships', icon: Briefcase },
  { module: 'activity', title: 'Activity history', href: '/admin/activity', icon: Activity },
  { module: 'certificates', title: 'Certificates', href: '/admin/certificates', icon: ClipboardCheck },
];

export default function AdminDashboardPage() {
  const user = useOutletContext<User>();
  const [operations, setOperations] = useState<OperationalStatus | null>(null);
  const [operationsError, setOperationsError] = useState('');
  const [summary, setSummary] = useState<OperationalSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemHealthError, setSystemHealthError] = useState('');
  useEffect(() => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return;
    let active = true;
    adminOperationsService.getStatus()
      .then(status => { if (active) setOperations(status); })
      .catch(cause => {
        if (!active) return;
        setOperations(null);
        setOperationsError(cause instanceof Error ? cause.message : 'Unable to check operational API status.');
      });
    adminOperationsService.getSummary()
      .then(result => { if (active) setSummary(result); })
      .catch(cause => {
        if (!active) return;
        setSummary(null);
        setSummaryError(cause instanceof Error ? cause.message : 'Unable to load database statistics.');
      });
    if (user.role === 'SUPER_ADMIN') {
      adminOperationsService.getSystemHealth()
        .then(result => { if (active) setSystemHealth(result); })
        .catch(cause => {
          if (!active) return;
          setSystemHealth(null);
          setSystemHealthError(cause instanceof Error ? cause.message : 'Unable to confirm system health.');
        });
    }
    return () => { active = false; };
  }, [user.role]);
  const tools = user.role === 'CONTENT_MANAGER'
    ? adminTools.filter(tool => tool.href !== '/admin/enquiries')
    : user.role === 'TRAINER'
      ? []
      : adminTools;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-surface-900">Admin home</h1>
        <p className="mt-1 text-sm text-surface-600 font-medium">
          Signed in as {user.fullName} ({user.role.replace(/_/g, ' ').toLowerCase()}).
        </p>
      </header>

      {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && <section className="rounded-2xl border border-surface-200 bg-white p-4">
        <h2 className="font-semibold text-surface-900">Operational module status</h2>
        {operationsError ? (
          <p role="alert" className="mt-2 text-sm text-red-700">{operationsError}</p>
        ) : operations ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {operationalLinks.map(({ module, title, href, icon: Icon }) => (
              <Link key={module} to={href} className="flex items-center justify-between rounded-xl border border-surface-200 p-3 hover:border-brand-300 hover:bg-brand-50">
                <span className="flex items-center gap-2 text-sm font-semibold text-surface-900"><Icon className="h-4 w-4 text-brand-700" />{title}</span>
                <span className={`text-xs font-bold ${operations.modules[module] ? 'text-emerald-700' : 'text-amber-800'}`}>
                  {operations.modules[module] ? 'Enabled' : 'Needs database configuration'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p role="status" className="mt-2 text-sm text-surface-600 font-medium">Checking database and API readiness...</p>
        )}
        {operations && Object.values(operations.modules).some(enabled => !enabled) && (
          <p className="mt-3 text-xs text-amber-900 font-medium">Apply or repair the operational database migration, then refresh to check readiness again.</p>
        )}
      </section>}

      {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
        <section className="space-y-3">
          <div><h2 className="font-semibold text-surface-900">Database-backed overview</h2><p className="text-xs text-surface-600 font-medium">Live record counts from the operational database.</p></div>
          {summaryError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{summaryError}</p> : summary ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ['Active students', summary.students],
                ['Active batches', summary.activeBatches],
                ["Today's attendance", summary.todayAttendance],
                ['Open internships', summary.openInternships],
                ['Active certificates', summary.activeCertificates],
              ].map(([label, value]) => (
                <SpotlightCard key={label}>
                  <article className="rounded-2xl border border-surface-200 bg-white p-4 transition-all duration-300 hover:shadow-card-md">
                    <p className="text-xs text-surface-600 font-medium">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-surface-900">{typeof value === 'number' ? <CountUp end={value} start /> : value}</p>
                  </article>
                </SpotlightCard>
              ))}
            </div>
          ) : <p role="status" className="text-sm text-surface-600 font-medium">Loading database statistics...</p>}
        </section>
      )}

      {user.role === 'SUPER_ADMIN' && (
        <section className="rounded-2xl border border-surface-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-semibold text-surface-900"><Shield className="h-4 w-4 text-brand-700" /> System health</h2>
          {systemHealthError ? <p role="alert" className="mt-2 text-sm text-red-700">{systemHealthError}</p> : systemHealth ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[['API', systemHealth.api], ['Database', systemHealth.database], ['Database driver', systemHealth.databaseDriver], ['Migrations applied', String(systemHealth.migrationsApplied)]].map(([label, value]) => <p key={label} className="rounded-lg bg-surface-50 border border-surface-200 p-3 text-sm"><span className="text-surface-600 font-medium">{label}: </span><span className="font-bold text-surface-900">{value}</span></p>)}
            </div>
          ) : <p role="status" className="mt-2 text-sm text-surface-600 font-medium">Checking API and database connectivity...</p>}
        </section>
      )}

      {tools.length > 0 ? (
        <section aria-label="Available admin tools" className="grid gap-4 sm:grid-cols-2">
          {tools.map(({ title, description, href, icon: Icon }) => (
            <SpotlightCard key={href}>
              <Link to={href} className="group block rounded-2xl border border-surface-200 bg-white p-5 transition-all duration-300 hover:border-brand-300 hover:shadow-card-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">{title}</h2>
                <p className="mt-1 text-sm text-surface-600 font-medium">{description}</p>
              </Link>
            </SpotlightCard>
          ))}
        </section>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-white p-4 text-sm text-surface-700 font-medium">
          No live admin modules are currently assigned to this role. Contact an administrator for access.
        </p>
      )}
    </div>
  );
}
