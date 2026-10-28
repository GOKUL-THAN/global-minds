import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Activity, Award, BookOpen, Briefcase, CalendarDays, Check, GraduationCap,
  Loader2, LogOut, Pencil, RefreshCw, Save, User, X,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { studentPortalService, type StudentPortalData, type StudentProfile } from '../../services/studentPortalService';
import { CountUp } from '../../components/ui/CountUp';

const formatDate = (value: string | null | undefined) => value
  ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  : 'Not scheduled';

const formatSchedule = (value: unknown): string => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const schedule = value as Record<string, unknown>;
  const days = Array.isArray(schedule.days) ? schedule.days.filter(day => typeof day === 'string').join(', ') : '';
  const time = typeof schedule.time === 'string' ? schedule.time : '';
  return [days, time].filter(Boolean).join(' · ');
};

const fieldClass = 'form-input w-full';

export default function StudentDashboardPage() {
  const [portal, setPortal] = useState<StudentPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draft, setDraft] = useState<Partial<StudentProfile>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const loadPortal = useCallback(async (isActive: () => boolean = () => true) => {
    setError('');
    const account = await authService.getCurrentUser();
    if (!isActive()) return;
    if (!account) {
      navigate('/login', { replace: true });
      return;
    }
    if (account.role === 'ADMIN' || account.role === 'SUPER_ADMIN' || account.role === 'CONTENT_MANAGER' || account.role === 'TRAINER') {
      navigate('/admin', { replace: true });
      return;
    }
    if (account.role !== 'STUDENT') {
      navigate('/login', { replace: true });
      return;
    }
    const data = await studentPortalService.getDashboard();
    if (!isActive()) return;
    setPortal(data);
    setDraft(data.profile);
  }, [navigate]);

  useEffect(() => {
    let active = true;
    void loadPortal(() => active).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unable to load your student data.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [loadPortal]);

  const refresh = async () => {
    setLoading(true);
    setNotice('');
    try {
      await loadPortal();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to refresh your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError('');
    try {
      await authService.logout();
      navigate('/login', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign out. Please try again.');
    }
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.firstName?.trim()) {
      setError('Enter your first name before saving.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const profile = await studentPortalService.updateProfile(draft);
      setPortal(current => current ? { ...current, profile } : current);
      setDraft(profile);
      setEditingProfile(false);
      setNotice('Your profile was saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !portal) {
    return <main className="min-h-screen flex items-center justify-center text-surface-600"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your student dashboard...</main>;
  }
  if (error && !portal) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-red-700">{error}</p>
        <button className="btn-primary btn" onClick={() => void refresh()}>Try again</button>
        <Link to="/login" className="text-sm text-brand-700">Sign in</Link>
      </main>
    );
  }
  if (!portal) return <Navigate to="/login" replace />;

  const { profile } = portal;
  const setField = (field: keyof StudentProfile, value: string) => setDraft(current => ({ ...current, [field]: value }));

  return (
    <main className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-100">
        <div className="container-xl py-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-surface-900">
            <GraduationCap className="w-6 h-6 text-brand-600" />
            Global Minds Academy
          </Link>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void refresh()} disabled={loading} className="btn-secondary btn flex items-center gap-2 text-sm">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link to="/account/security" className="btn-secondary btn flex items-center gap-2 text-sm">
              <User className="w-4 h-4" /> Security
            </Link>
            <button onClick={() => void signOut()} className="btn-secondary btn flex items-center gap-2 text-sm">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="container-xl py-8 space-y-6">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        <section className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-7 text-white">
          <p className="text-brand-100 text-sm">Student dashboard</p>
          <h1 className="font-display font-bold text-3xl mt-1">Welcome, {profile.firstName} {profile.lastName}</h1>
          <p className="text-brand-100 mt-2">{profile.email}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Learning overview">
          {[
            { label: 'Enrolled courses', count: portal.courses.length, icon: BookOpen },
            { label: 'Assigned batches', count: portal.batches.length, icon: CalendarDays },
            { label: 'Attendance records', count: portal.attendanceTotal, icon: Check },
            { label: 'Certificates', count: portal.certificates.length, icon: Award },
          ].map(({ label, count, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-surface-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-surface-600">{label}</p>
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-surface-900"><CountUp end={count} start /></p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="font-semibold text-surface-900">Your profile</h2><p className="text-sm text-surface-600 font-medium">Edit contact and learning profile details.</p></div>
            {!editingProfile && <button type="button" onClick={() => { setDraft(profile); setEditingProfile(true); }} className="btn-secondary btn flex items-center gap-2"><Pencil className="h-4 w-4" /> Edit profile</button>}
          </div>
          {editingProfile ? (
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              {([
                ['firstName', 'First name'], ['lastName', 'Last name'], ['phone', 'Phone'],
                ['country', 'Country'], ['city', 'City'], ['education', 'Education'],
              ] as const).map(([field, label]) => (
                <label key={field}><span className="form-label">{label}</span><input className={fieldClass} maxLength={field === 'firstName' || field === 'lastName' ? 120 : 200} value={String(draft[field] ?? '')} onChange={event => setField(field, event.target.value)} /></label>
              ))}
              <label className="sm:col-span-2"><span className="form-label">Experience</span><textarea className={fieldClass} rows={3} maxLength={2000} value={String(draft.experience ?? '')} onChange={event => setField('experience', event.target.value)} /></label>
              <label className="sm:col-span-2"><span className="form-label">Career goal</span><textarea className={fieldClass} rows={2} maxLength={1000} value={String(draft.careerGoal ?? '')} onChange={event => setField('careerGoal', event.target.value)} /></label>
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <button type="submit" disabled={saving} className="btn-primary btn flex items-center gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile</button>
                <button type="button" disabled={saving} onClick={() => { setDraft(profile); setEditingProfile(false); }} className="btn-secondary btn flex items-center gap-2"><X className="h-4 w-4" /> Cancel</button>
              </div>
            </form>
          ) : (
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ['Phone', profile.phone], ['Country', profile.country], ['City', profile.city],
                ['Education', profile.education], ['Experience', profile.experience], ['Career goal', profile.careerGoal],
              ].map(([label, value]) => <div key={label}><dt className="text-surface-600 font-semibold">{label}</dt><dd className="mt-0.5 whitespace-pre-wrap text-surface-900 font-medium">{value || 'Not provided'}</dd></div>)}
            </dl>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-surface-900"><BookOpen className="h-5 w-5 text-brand-600" /> Enrolled courses</h2>
            {portal.courses.length ? <ul className="divide-y divide-surface-100">{portal.courses.map(course => (
              <li key={course.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                {course.thumbnail && <img src={course.thumbnail} alt="" className="h-16 w-24 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1"><Link to={`/courses/${course.slug}`} className="font-semibold text-brand-700 hover:underline">{course.title}</Link><p className="mt-1 line-clamp-2 text-sm text-surface-600 font-medium">{course.shortDescription || `Enrollment: ${course.status}`}</p><p className="mt-1 text-xs text-surface-600 font-medium">Enrolled {formatDate(course.enrolledAt)} · {course.status}</p></div>
              </li>
            ))}</ul> : <p className="text-sm text-surface-600 font-medium">You do not have any course enrollments yet. Contact the academy if you think this is a mistake.</p>}
          </article>

          <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-surface-900"><CalendarDays className="h-5 w-5 text-brand-600" /> Your batches & schedules</h2>
            {portal.batches.length ? <ul className="space-y-3">{portal.batches.map(batch => <li key={batch.id} className="rounded-xl border border-surface-200 p-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold text-surface-900">{batch.name}</h3><span className="text-xs font-bold capitalize text-brand-700">{batch.status}</span></div><p className="mt-1 text-xs text-surface-600 font-medium">{batch.code} · {formatDate(batch.startDate)} – {formatDate(batch.endDate)}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-surface-700 font-medium">{formatSchedule(batch.schedule) || batch.description || 'Schedule details will be shared by your trainer.'}</p></li>)}</ul> : <p className="text-sm text-surface-600 font-medium">No batch has been assigned to your account yet.</p>}
          </article>

          <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-surface-900"><Check className="h-5 w-5 text-brand-600" /> Attendance</h2>
            {portal.attendance.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-surface-200 text-surface-700 font-bold"><th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Batch</th><th className="py-2">Status</th></tr></thead><tbody className="divide-y divide-surface-100">{portal.attendance.slice(0, 10).map(item => <tr key={item.id} className="text-surface-800 font-medium"><td className="py-3 pr-3">{formatDate(item.attendanceDate)}</td><td className="py-3 pr-3">{item.batchName}</td><td className="py-3 capitalize font-semibold">{item.status}</td></tr>)}</tbody></table><p className="mt-3 text-xs text-surface-600 font-medium">Showing {Math.min(10, portal.attendance.length)} of {portal.attendanceTotal} attendance records.</p></div> : <p className="text-sm text-surface-600 font-medium">Attendance will appear here after your class records are submitted.</p>}
          </article>

          <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-surface-900"><Briefcase className="h-5 w-5 text-brand-600" /> Internships</h2>
            {portal.internships.length ? <ul className="space-y-3">{portal.internships.map(item => <li key={item.id} className="rounded-xl border border-surface-200 p-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold text-surface-900">{item.title}</h3><span className="text-xs font-bold capitalize text-brand-700">{item.status.replace(/_/g, ' ')}</span></div><p className="mt-1 text-sm text-surface-600 font-medium">{item.company || 'Company to be confirmed'} · Applied {formatDate(item.appliedAt)}</p>{item.supervisorName && <p className="mt-1 text-xs text-surface-600 font-medium">Supervisor: {item.supervisorName}</p>}            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-100"><div className="reactbits-progress-fill h-full bg-brand-600" style={{ width: `${item.progress}%` }} /></div><p className="mt-1 text-right text-xs text-surface-600 font-medium">{item.progress}% complete</p></li>)}</ul> : <p className="text-sm text-surface-600 font-medium">No internship applications are linked to your account.</p>}
          </article>

          <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-surface-900"><Award className="h-5 w-5 text-brand-600" /> Certificates</h2>
            {portal.certificates.length ? <ul className="space-y-3">{portal.certificates.map(certificate => <li key={certificate.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-200 p-4"><div><h3 className="font-semibold text-surface-900">{certificate.courseName}</h3><p className="mt-1 text-xs text-surface-600 font-medium">Issued {formatDate(certificate.issuedAt)} · ID {certificate.certificateId}</p></div><Link to={`/certificates/${encodeURIComponent(certificate.certificateId)}`} className="btn-secondary btn text-sm">View / print</Link></li>)}</ul> : <p className="text-sm text-surface-600 font-medium">Issued certificates will be available here.</p>}
          </article>

          <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-surface-900">Announcements</h2>
            {portal.announcements.length ? <ul className="space-y-3">{portal.announcements.map(announcement => <li key={announcement.id} className="rounded-xl border border-surface-200 p-4"><h3 className="font-semibold text-surface-900">{announcement.title}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-surface-700 font-medium">{announcement.body}</p><time className="mt-2 block text-xs text-surface-600 font-medium">{formatDate(announcement.publishedAt)}</time></li>)}</ul> : <p className="text-sm text-surface-600 font-medium">There are no current announcements.</p>}
          </article>
        </section>

        <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-surface-900"><Activity className="h-5 w-5 text-brand-600" /> Account activity</h2>
          {portal.activity.length ? <ul className="divide-y divide-surface-100">{portal.activity.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 first:pt-0 last:pb-0"><span className="text-sm text-surface-800 font-medium">{item.action.replace(/[._]/g, ' ')}</span><time className="text-xs text-surface-600 font-medium">{formatDate(item.createdAt)}</time></li>)}</ul> : <p className="text-sm text-surface-600 font-medium">No account activity has been recorded yet.</p>}
        </section>
      </div>
    </main>
  );
}
