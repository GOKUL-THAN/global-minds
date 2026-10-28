import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, Award, Calendar, Bell, FileText, CreditCard,
  User, LogOut, BarChart2, Briefcase, Download,
  MessageSquare, ChevronRight, Clock, CheckCircle,
  Play, Target, GraduationCap, Menu, X, Settings, Search,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { siteConfig } from '../../data/siteConfig';

// Demo student data — replace with real API data when backend is connected
const mockStudent = {
  name: 'Demo Student',
  email: 'demo@globalacademy.com',
  phone: '+91 99999 00000',
  country: 'India',
  city: 'Chennai',
  education: "Bachelor's Degree",
  joinedDate: 'October 2026',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  enrolledCourses: 2,
  completedCourses: 0,
  certificates: 0,
  totalHoursLearned: 12,
};

// Demo enrolled courses
const demoCourses = [
  {
    id: 'ec1',
    title: 'AWS / Cloud',
    progress: 35,
    nextLesson: 'IAM & Security',
    totalLessons: 48,
    completedLessons: 17,
    thumbnail: '/images/courses/aws-training.jpg',
    instructor: 'Alex Johnson',
    status: 'in-progress',
    nextClassDate: 'Tomorrow, 7:00 AM',
  },
  {
    id: 'ec2',
    title: 'Python Training',
    progress: 60,
    nextLesson: 'Advanced Python',
    totalLessons: 36,
    completedLessons: 22,
    thumbnail: '/images/courses/python-training.jpg',
    instructor: 'Priya Sharma',
    status: 'in-progress',
    nextClassDate: 'Monday, 7:00 PM',
  },
];

// Demo schedule
const demoSchedule = [
  { id: 's1', course: 'AWS / Cloud', topic: 'EC2 Instances & Auto Scaling', date: 'Tomorrow', time: '7:00 AM – 9:00 AM', mode: 'Online', status: 'upcoming' },
  { id: 's2', course: 'Python Training', topic: 'OOP — Classes & Inheritance', date: 'Monday', time: '7:00 PM – 9:00 PM', mode: 'Online', status: 'upcoming' },
  { id: 's3', course: 'AWS / Cloud', topic: 'S3 Storage Services', date: 'Wednesday', time: '7:00 AM – 9:00 AM', mode: 'Online', status: 'upcoming' },
  { id: 's4', course: 'Python Training', topic: 'File Handling', date: 'Thursday', time: '7:00 PM – 9:00 PM', mode: 'Online', status: 'upcoming' },
];

type NavSection = 'overview' | 'courses' | 'schedule' | 'assignments' | 'projects' | 'certificates' | 'payments' | 'downloads' | 'notifications' | 'profile' | 'support' | 'settings';

const sidebarNav: { icon: React.ElementType; label: string; id: NavSection; badge?: string; href?: string }[] = [
  { icon: BarChart2, label: 'Overview', id: 'overview' },
  { icon: BookOpen, label: 'My Courses', id: 'courses' },
  { icon: Search, label: 'Browse Courses', id: 'courses', href: '/courses' },
  { icon: Calendar, label: 'Schedule', id: 'schedule' },
  { icon: Target, label: 'Assignments', id: 'assignments', badge: '2' },
  { icon: Briefcase, label: 'Projects', id: 'projects' },
  { icon: Award, label: 'Certificates', id: 'certificates' },
  { icon: CreditCard, label: 'Payments', id: 'payments' },
  { icon: Download, label: 'Downloads', id: 'downloads' },
  { icon: Bell, label: 'Notifications', id: 'notifications', badge: '3' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: MessageSquare, label: 'Support', id: 'support' },
];

function DemoNote({ message }: { message?: string }) {
  return (
    <div className="px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-medium">
      ⚠️ {message ?? 'Demo data — connect backend API to show real student data.'}
    </div>
  );
}

// ── Section components ──────────────────────────────────────

function OverviewSection() {
  return (
    <div className="space-y-6">
      <DemoNote message="This dashboard shows demo data. Real course progress and stats will appear after backend integration." />

      {/* Welcome */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-6 text-white">
        <p className="text-teal-100 text-sm mb-1 font-medium">Welcome back 👋</p>
        <h2 className="font-display font-bold text-2xl mb-4">{mockStudent.name}</h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-teal-100 font-medium">Enrolled Courses</p>
            <p className="text-xl font-bold">{mockStudent.enrolledCourses}</p>
          </div>
          <div>
            <p className="text-teal-100 font-medium">Hours Learned</p>
            <p className="text-xl font-bold">{mockStudent.totalHoursLearned}</p>
          </div>
          <div>
            <p className="text-teal-100 font-medium">Certificates</p>
            <p className="text-xl font-bold">{mockStudent.certificates}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled', value: mockStudent.enrolledCourses, icon: BookOpen, color: 'bg-brand-50 text-brand-600' },
          { label: 'Completed', value: mockStudent.completedCourses, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Certificates', value: mockStudent.certificates, icon: Award, color: 'bg-purple-50 text-purple-600' },
          { label: 'Hours Learned', value: mockStudent.totalHoursLearned, icon: Clock, color: 'bg-accent-50 text-accent-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-surface-200">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-surface-900 mb-0.5">{s.value}</div>
            <p className="text-sm text-surface-600 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div>
        <h3 className="font-semibold text-surface-900 mb-4">Continue Learning</h3>
        <div className="space-y-4">
          {demoCourses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border border-surface-200 p-4 flex gap-4">
              <img src={course.thumbnail} alt={course.title} className="w-16 h-12 rounded-xl object-cover flex-shrink-0" loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-surface-900 text-sm">{course.title}</h4>
                  <span className="text-xs text-brand-700 font-bold flex-shrink-0">{course.progress}%</span>
                </div>
                <p className="text-xs text-surface-600 font-medium mb-2">Next: {course.nextLesson}</p>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-surface-600 font-medium">
                  <span>{course.completedLessons} / {course.totalLessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.nextClassDate}</span>
                </div>
              </div>
              <button className="hidden sm:flex w-9 h-9 rounded-xl bg-brand-600 items-center justify-center flex-shrink-0 hover:bg-brand-700 transition-colors" aria-label="Resume course">
                <Play className="w-4 h-4 text-white fill-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming class */}
      <div>
        <h3 className="font-semibold text-surface-900 mb-4">Upcoming Classes</h3>
        <div className="space-y-3">
          {demoSchedule.slice(0, 2).map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-surface-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900">{s.topic}</p>
                <p className="text-xs text-surface-600 font-medium">{s.course} · {s.date} · {s.time}</p>
              </div>
              <span className="text-xs text-brand-700 font-semibold hidden sm:block">{s.mode}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoursesSection() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-surface-900">My Courses</h2>
        <Link to="/courses"><button className="btn-secondary btn text-sm">Browse More</button></Link>
      </div>
      <DemoNote />
      {demoCourses.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {demoCourses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
              <div className="p-5">
                <h3 className="font-semibold text-surface-900 mb-1">{course.title}</h3>
                <p className="text-xs text-surface-600 font-medium mb-3">Instructor: {course.instructor}</p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-surface-600 font-medium mb-1">
                    <span>Progress</span><span className="font-bold text-brand-700">{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-surface-600 font-medium mb-4">
                  <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                  <span>Next: {course.nextClassDate}</span>
                </div>
                <button className="btn-primary btn w-full text-sm flex items-center justify-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-white" /> Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-200 p-10 text-center">
          <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="font-bold text-surface-900 mb-2">No courses enrolled yet</h3>
          <p className="text-surface-600 font-medium text-sm mb-4">Explore our course catalog to start learning.</p>
          <Link to="/courses"><button className="btn-primary btn">Browse Courses</button></Link>
        </div>
      )}
    </div>
  );
}

function ScheduleSection() {
  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-surface-900">Class Schedule</h2>
      <DemoNote />
      <div className="space-y-3">
        {demoSchedule.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-surface-900">{s.topic}</p>
              <p className="text-sm text-surface-600 font-medium mt-0.5">{s.course}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-surface-600 font-medium">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</span>
                <span className="bg-brand-50 border border-brand-200 text-brand-800 px-2 py-0.5 rounded-full font-semibold">{s.mode}</span>
              </div>
            </div>
            <button className="hidden sm:block btn-secondary btn text-xs">Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericSection({ title, icon: Icon, message }: { title: string; icon: React.ElementType; message: string }) {
  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-surface-900">{title}</h2>
      <DemoNote />
      <div className="bg-white rounded-2xl border border-surface-200 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-surface-600" />
        </div>
        <h3 className="font-bold text-surface-900 mb-2">{title}</h3>
        <p className="text-surface-700 font-medium text-sm max-w-sm mx-auto">{message}</p>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-surface-900">My Profile</h2>
      <DemoNote message="Demo profile data — real profile will load after login and backend integration." />
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-200">
          <img src={mockStudent.avatar} alt={mockStudent.name} className="w-16 h-16 rounded-2xl object-cover" />
          <div>
            <h3 className="font-bold text-surface-900 text-lg">{mockStudent.name}</h3>
            <p className="text-surface-600 font-medium text-sm">{mockStudent.email}</p>
            <p className="text-xs text-surface-600 font-medium mt-0.5">Member since {mockStudent.joinedDate}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Phone', value: mockStudent.phone },
            { label: 'Country', value: mockStudent.country },
            { label: 'City', value: mockStudent.city },
            { label: 'Education', value: mockStudent.education },
          ].map(f => (
            <div key={f.label} className="bg-surface-50 border border-surface-200 rounded-xl p-3">
              <p className="text-xs text-surface-600 font-medium mb-0.5">{f.label}</p>
              <p className="text-sm font-semibold text-surface-900">{f.value}</p>
            </div>
          ))}
        </div>
        <button className="btn-secondary btn mt-4 text-sm opacity-50 cursor-not-allowed" disabled>
          Edit Profile — Requires Backend
        </button>
      </div>
    </div>
  );
}

function SupportSection() {
  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-surface-900">Support</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: MessageSquare, title: 'Chat Support', desc: 'Get instant help from our support team.', label: 'Start Chat', color: 'bg-brand-50 text-brand-600' },
          { icon: FileText, title: 'Submit Ticket', desc: 'Report a technical issue or request assistance.', label: 'Submit', color: 'bg-purple-50 text-purple-600' },
          { icon: BookOpen, title: 'Knowledge Base', desc: 'Browse FAQs and how-to guides.', label: 'Browse', color: 'bg-green-50 text-green-600' },
          { icon: MessageSquare, title: 'Contact Us', desc: 'Reach us by email or phone.', label: 'Contact', color: 'bg-accent-50 text-accent-600', href: '/contact' },
        ].map(item => (
          <div key={item.title} className="bg-white rounded-2xl border border-surface-200 p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', item.color)}>
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-surface-900 mb-1">{item.title}</h3>
            <p className="text-surface-600 font-medium text-sm mb-4">{item.desc}</p>
            {item.href ? (
              <Link to={item.href}><button className="btn-secondary btn text-sm">{item.label}</button></Link>
            ) : (
              <button className="btn-secondary btn text-sm opacity-50 cursor-not-allowed" disabled>{item.label}</button>
            )}
          </div>
        ))}
      </div>
      <div className="bg-white border border-surface-200 rounded-2xl p-5 text-center">
        <p className="text-surface-700 font-medium text-sm mb-2">Need immediate help?</p>
        <a href={`tel:${siteConfig.phone}`} className="text-brand-700 font-bold hover:text-brand-800">{siteConfig.phone}</a>
        <p className="text-surface-600 font-medium text-xs mt-1">{siteConfig.businessHours}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────

export default function DashboardPage() {
  const [active, setActive] = useState<NavSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [sidebarOpen]);

  const renderSection = () => {
    switch (active) {
      case 'overview':    return <OverviewSection />;
      case 'courses':     return <CoursesSection />;
      case 'schedule':    return <ScheduleSection />;
      case 'profile':     return <ProfileSection />;
      case 'support':     return <SupportSection />;
      case 'assignments': return <GenericSection title="Assignments" icon={Target} message="Your assignments will appear here once enrolled in a course and connected to the backend." />;
      case 'projects':    return <GenericSection title="Projects" icon={Briefcase} message="Your capstone projects will be tracked here." />;
      case 'certificates': return <GenericSection title="Certificates" icon={Award} message="Course completion certificates will appear here once earned." />;
      case 'payments':    return <GenericSection title="Payments" icon={CreditCard} message="Payment history and invoices will appear here after backend integration." />;
      case 'downloads':   return <GenericSection title="Downloads" icon={Download} message="Downloadable resources, syllabi and study materials will appear here." />;
      case 'notifications': return <GenericSection title="Notifications" icon={Bell} message="Course updates, class reminders and announcements will appear here." />;
      case 'settings':     return <GenericSection title="Settings" icon={Settings} message="Account preferences will be available when student account services are connected." />;
      default:            return <OverviewSection />;
    }
  };

  const Sidebar = () => (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-200 flex flex-col',
      'transition-transform duration-300',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    )}>
      {/* Header */}
      <div className="p-5 border-b border-surface-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-surface-900">My Dashboard</p>
            <p className="text-xs text-surface-600 font-medium">Global Minds Academy</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-surface-600 hover:text-surface-950">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Student card */}
      <div className="p-4 border-b border-surface-200">
        <div className="flex items-center gap-3 bg-surface-50 border border-surface-200 rounded-xl p-3">
          <img src={mockStudent.avatar} alt={mockStudent.name} className="w-9 h-9 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 truncate">{mockStudent.name}</p>
            <p className="text-xs text-surface-600 font-medium truncate">{mockStudent.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Student dashboard navigation">
        {sidebarNav.map((item, index) => {
          const content = (
            <>
            <span className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </span>
            {item.badge && (
              <span className="text-xs bg-brand-700 text-white px-1.5 py-0.5 rounded-full font-bold min-w-[1.25rem] text-center">
                {item.badge}
              </span>
            )}
            </>
          );
          const className = cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
            active === item.id && !item.href
              ? 'bg-brand-50 text-brand-800 font-bold border-l-4 border-brand-600'
              : 'text-surface-700 hover:bg-surface-100 hover:text-surface-950',
          );

          return item.href ? (
            <Link
              key={`${item.id}-${index}`}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={className}
              aria-current={location.pathname === item.href ? 'page' : undefined}
            >
              {content}
            </Link>
          ) : (
            <button
              key={`${item.id}-${index}`}
              onClick={() => { setActive(item.id); setSidebarOpen(false); }}
              className={className}
              aria-current={active === item.id ? 'page' : undefined}
            >
              {content}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-200 space-y-1">
        <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-surface-600 hover:text-surface-950 hover:bg-surface-50 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />

      {/* Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-surface-950/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close dashboard navigation"
        />
      )}

      {/* Main */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-surface-200 px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-surface-700 hover:bg-surface-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-surface-600 font-medium">
              <Link to="/" className="hover:text-brand-700">Home</Link>
              <ChevronRight className="w-4 h-4 text-surface-400" />
              <span className="font-bold text-surface-900">
                {sidebarNav.find(n => n.id === active)?.label ?? 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex text-xs bg-amber-50 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
              Demo Mode
            </span>
            <button
              onClick={() => setActive('notifications')}
              className="relative p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
            </button>
            <button
              onClick={() => setActive('profile')}
              className="p-0.5 rounded-full border-2 border-brand-300"
              aria-label="Profile"
            >
              <img src={mockStudent.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="min-w-0 p-4 sm:p-6 max-w-6xl">
          <h1 className="sr-only">{sidebarNav.find(n => n.id === active)?.label ?? 'Dashboard'}</h1>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
