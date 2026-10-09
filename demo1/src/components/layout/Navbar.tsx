import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, ChevronDown, Search, User, Phone,
  Cloud, GitBranch, Cpu, Layers, BarChart2, Shield,
  Code2, Database, PenTool, TrendingUp, Kanban, Wifi, Zap,
  Award, BookOpen, Briefcase,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { siteConfig } from '../../data/siteConfig';
import { categories } from '../../data/categories';
import { Button } from '../ui/Button';

const categoryIcons: Record<string, React.ElementType> = {
  'cloud-computing': Cloud,
  'devops': GitBranch,
  'artificial-intelligence': Cpu,
  'full-stack-development': Layers,
  'data-science-analytics': BarChart2,
  'software-testing': Shield,
  'programming': Code2,
  'cyber-security': Shield,
  'database': Database,
  'ui-ux-design': PenTool,
  'digital-marketing': TrendingUp,
  'project-management': Kanban,
  'iot': Wifi,
  'automation-rpa': Zap,
};

const megaMenuData = [
  {
    categorySlug: 'cloud-computing',
    title: 'Cloud Computing',
    courses: [
      { title: 'AWS Training', href: '/courses/aws-training', badge: 'Popular' },
      { title: 'Microsoft Azure', href: '/courses/microsoft-azure' },
      { title: 'Google Cloud (GCP)', href: '/courses/google-cloud' },
      { title: 'Cloud Computing', href: '/courses/cloud-computing' },
      { title: 'AWS DevOps', href: '/courses/aws-devops' },
      { title: 'Cloud Security', href: '/courses/cloud-security' },
      { title: 'Azure DevOps', href: '/courses/azure-devops' },
    ],
  },
  {
    categorySlug: 'devops',
    title: 'DevOps',
    courses: [
      { title: 'DevOps Training', href: '/courses/devops-training', badge: 'Trending' },
      { title: 'Kubernetes', href: '/courses/kubernetes' },
      { title: 'Docker', href: '/courses/docker' },
      { title: 'Jenkins', href: '/courses/jenkins' },
      { title: 'Terraform', href: '/courses/terraform' },
      { title: 'Ansible', href: '/courses/ansible' },
      { title: 'CI/CD Pipeline', href: '/courses/devops-training' },
    ],
  },
  {
    categorySlug: 'artificial-intelligence',
    title: 'AI & Machine Learning',
    courses: [
      { title: 'Data Science', href: '/courses/data-science', badge: 'Hot' },
      { title: 'Machine Learning', href: '/courses/machine-learning' },
      { title: 'Generative AI', href: '/courses/generative-ai', badge: 'New' },
      { title: 'Deep Learning', href: '/courses/deep-learning' },
      { title: 'Artificial Intelligence', href: '/courses/artificial-intelligence' },
      { title: 'NLP', href: '/courses/nlp' },
      { title: 'Computer Vision', href: '/courses/computer-vision' },
    ],
  },
  {
    categorySlug: 'full-stack-development',
    title: 'Full Stack Dev',
    courses: [
      { title: 'Full Stack Development', href: '/courses/full-stack-development', badge: 'Popular' },
      { title: 'React JS', href: '/courses/react-js' },
      { title: 'Next.js', href: '/courses/next-js', badge: 'New' },
      { title: 'Node.js', href: '/courses/node-js' },
      { title: 'NestJS', href: '/courses/nest-js', badge: 'New' },
      { title: 'Vue.js', href: '/courses/vue-js' },
      { title: 'MERN Stack', href: '/courses/mern-stack' },
      { title: 'GraphQL', href: '/courses/graphql' },
    ],
  },
  {
    categorySlug: 'data-science-analytics',
    title: 'Data & BI',
    courses: [
      { title: 'Data Science', href: '/courses/data-science' },
      { title: 'Data Analytics', href: '/courses/data-analytics' },
      { title: 'Power BI', href: '/courses/power-bi' },
      { title: 'Tableau', href: '/courses/tableau' },
      { title: 'Big Data', href: '/courses/big-data' },
      { title: 'Data Engineering', href: '/courses/data-engineering' },
      { title: 'Business Intelligence', href: '/courses/business-intelligence' },
    ],
  },
  {
    categorySlug: 'software-testing',
    title: 'Software Testing',
    courses: [
      { title: 'Software Testing', href: '/courses/software-testing', badge: 'Popular' },
      { title: 'Automation Testing', href: '/courses/automation-testing' },
      { title: 'Selenium', href: '/courses/selenium' },
      { title: 'API Testing', href: '/courses/api-testing' },
      { title: 'Performance Testing', href: '/courses/performance-testing' },
      { title: 'ETL Testing', href: '/courses/etl-testing' },
    ],
  },
  {
    categorySlug: 'cyber-security',
    title: 'Cyber Security',
    courses: [
      { title: 'Cyber Security', href: '/courses/cyber-security', badge: 'Trending' },
      { title: 'Ethical Hacking', href: '/courses/ethical-hacking' },
      { title: 'Cloud Security', href: '/courses/cloud-security' },
      { title: 'CompTIA Security+', href: '/courses/comptia-security-plus', badge: 'New' },
      { title: 'SOC Analyst', href: '/courses/splunk' },
    ],
  },
  {
    categorySlug: 'programming',
    title: 'Programming',
    courses: [
      { title: 'Python', href: '/courses/python-training', badge: 'Popular' },
      { title: 'Java', href: '/courses/java-training' },
      { title: 'JavaScript', href: '/courses/javascript' },
      { title: 'Spring Boot', href: '/courses/spring-boot' },
      { title: 'Django', href: '/courses/django' },
      { title: 'Go (Golang)', href: '/courses/go-programming', badge: 'New' },
      { title: 'Rust', href: '/courses/rust-programming', badge: 'New' },
      { title: 'Salesforce', href: '/courses/salesforce' },
      { title: 'DSA', href: '/courses/data-structures-algorithms', badge: 'Hot' },
      { title: 'System Design', href: '/courses/system-design', badge: 'New' },
    ],
  },
  {
    categorySlug: 'full-stack-development',
    title: 'Mobile Dev',
    courses: [
      { title: 'Flutter', href: '/courses/flutter', badge: 'Popular' },
      { title: 'React Native', href: '/courses/react-native' },
      { title: 'Android (Kotlin)', href: '/courses/android-development' },
      { title: 'iOS (Swift)', href: '/courses/ios-development' },
      { title: 'Kotlin', href: '/courses/kotlin' },
      { title: 'Swift', href: '/courses/swift' },
    ],
  },
  {
    categorySlug: 'database',
    title: 'Database',
    courses: [
      { title: 'SQL', href: '/courses/sql' },
      { title: 'MySQL', href: '/courses/mysql' },
      { title: 'PostgreSQL', href: '/courses/postgresql' },
      { title: 'SQL Server (MSSQL)', href: '/courses/sql-server', badge: 'New' },
      { title: 'MongoDB', href: '/courses/mongodb' },
      { title: 'Redis', href: '/courses/redis' },
      { title: 'Oracle', href: '/courses/oracle' },
      { title: 'Cassandra', href: '/courses/cassandra' },
      { title: 'Snowflake', href: '/courses/snowflake', badge: 'New' },
    ],
  },
  {
    categorySlug: 'ui-ux-design',
    title: 'Design & Others',
    courses: [
      { title: 'UI/UX Design', href: '/courses/ui-ux-design' },
      { title: 'Figma', href: '/courses/figma' },
      { title: 'Digital Marketing', href: '/courses/digital-marketing' },
      { title: 'Advanced Excel', href: '/courses/excel-advanced', badge: 'New' },
      { title: 'SAP ABAP', href: '/courses/sap-abap', badge: 'New' },
      { title: 'SAP FICO', href: '/courses/sap-fico', badge: 'New' },
      { title: 'ServiceNow', href: '/courses/servicenow', badge: 'New' },
      { title: 'PMP Certification', href: '/courses/pmp-certification', badge: 'New' },
      { title: 'ITIL 4', href: '/courses/itil', badge: 'New' },
    ],
  },
  {
    categorySlug: 'devops',
    title: 'Networking',
    courses: [
      { title: 'CCNA', href: '/courses/ccna', badge: 'Popular' },
      { title: 'CCNP', href: '/courses/ccnp' },
      { title: 'CompTIA A+', href: '/courses/comptia-a-plus' },
      { title: 'CompTIA Network+', href: '/courses/comptia-network-plus' },
      { title: 'Computer Networks', href: '/courses/computer-networks' },
    ],
  },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [selectedMegaCategory, setSelectedMegaCategory] = useState(megaMenuData[0].title);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaMenuPanelRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setMegaMenuOpen(false);
        if (mobileOpen) menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    mobileMenuRef.current?.querySelector<HTMLElement>('a, button')?.focus();
  }, [mobileOpen]);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        megaRef.current &&
        !megaRef.current.contains(target) &&
        !megaMenuPanelRef.current?.contains(target)
      ) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { label: 'Courses', href: '/courses', hasMega: true },
    { label: 'Master Programs', href: '/master-programs' },
    { label: 'Batch Schedule', href: '/batch-schedule' },
    { label: 'Certifications', href: '/certifications' },
    { label: 'Placement', href: '/placement-records' },
    { label: 'Events', href: '/events' },
    { label: 'Corporate', href: '/corporate-training' },
    { label: 'About', href: '/about' },
  ];
  const isRouteActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`)
      || (href === '/courses' && location.pathname.startsWith('/categories/'));
  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-200',
        location.pathname === '/' && 'home-navbar',
        scrolled
          ? 'bg-white shadow-card border-b border-surface-100'
          : 'bg-white border-b border-surface-100',
      )}
    >
      <div className="container-xl">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="Global Minds Academy home">
            <img
              src={siteConfig.logoUrl}
              alt="Global Minds Academy logo"
              className="h-14 w-14 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem] object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1" aria-label="Main navigation">
            {navLinks.map(link => {
              const active = link.hasMega
                ? location.pathname === '/courses' || location.pathname.startsWith('/courses/') || location.pathname.startsWith('/categories/')
                : location.pathname === link.href || location.pathname.startsWith(`${link.href}/`);
              return (
              link.hasMega ? (
                <div key={link.label} ref={megaRef} className="relative">
                  <button
                    onClick={() => setMegaMenuOpen(prev => !prev)}
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold',
                      'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:text-white',
                      'transition-colors duration-200',
                      (megaMenuOpen || active) && 'bg-brand-700 shadow-md',
                    )}
                    aria-expanded={megaMenuOpen}
                    aria-haspopup="true"
                    aria-controls="course-mega-menu"
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', megaMenuOpen && 'rotate-180')} />
                  </button>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium',
                    'text-surface-700 hover:text-brand-600 hover:bg-brand-50',
                    'transition-colors duration-200',
                    active && 'text-brand-700 bg-brand-50',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 rounded-lg p-2 text-surface-500 hover:bg-brand-50 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Search courses"
            >
              <Search className="w-5 h-5" />
              <span className="hidden 2xl:inline text-sm">Search</span>
            </Link>

            <a
              href={`tel:${siteConfig.phone}`}
              className="flex items-center gap-1.5 text-sm text-surface-600 hover:text-brand-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium hidden 2xl:block">{siteConfig.phone}</span>
            </a>

            <Link to="/login">
              <Button variant="ghost" size="sm" leftIcon={<User className="w-4 h-4" />}>
                Login
              </Button>
            </Link>

            <Link to="/register">
              <Button size="sm">Enroll Now</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileOpen(prev => !prev)}
            className="xl:hidden p-2 rounded-xl text-surface-700 hover:bg-surface-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mega Menu */}
      {megaMenuOpen && (
        <div
          id="course-mega-menu"
          ref={megaMenuPanelRef}
          className="hidden xl:block absolute top-full left-0 w-full max-h-[calc(100vh-5rem)] overflow-y-auto bg-white shadow-card-lg border-t border-surface-100 z-50 animate-slide-down"
          onMouseLeave={() => setMegaMenuOpen(false)}
        >
          <div className="container-xl py-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-surface-200 pb-5">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                  Learn with Global Minds
                </p>
                <h2 className="text-xl font-bold text-surface-900">Explore courses by topic</h2>
                <p className="mt-1 text-sm text-surface-600">
                  Choose a topic to see its courses and subtopics.
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                View all courses
              </Link>
            </div>
            <div className="grid gap-5 xl:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]">
              <div className="grid content-start grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
              {megaMenuData.map(section => {
                const Icon = categoryIcons[section.categorySlug] || BookOpen;
                return (
                  <button
                    key={section.title}
                    type="button"
                    onClick={() => setSelectedMegaCategory(section.title)}
                    className={cn(
                      'flex min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition-colors',
                      selectedMegaCategory === section.title
                        ? 'border-brand-300 bg-brand-50 text-brand-800 shadow-sm'
                        : 'border-surface-200 bg-white text-surface-700 hover:border-brand-200 hover:bg-surface-50',
                    )}
                    aria-pressed={selectedMegaCategory === section.title}
                    aria-controls="course-subtopics"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                      <Icon className="h-4 w-4 text-brand-600" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-tight">
                      {section.title}
                    </span>
                    <span className="text-xs text-surface-500">{section.courses.length}</span>
                  </button>
                );
              })}
              </div>
              {(() => {
                const selectedSection = megaMenuData.find(section => section.title === selectedMegaCategory) ?? megaMenuData[0];
                return (
                  <section
                    id="course-subtopics"
                    aria-live="polite"
                    className="rounded-xl border border-surface-200 bg-surface-50/70 p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                          {(() => {
                            const Icon = categoryIcons[selectedSection.categorySlug] || BookOpen;
                            return <Icon className="h-5 w-5 text-brand-600" />;
                          })()}
                        </span>
                        <div>
                          <h3 className="font-bold text-surface-900">{selectedSection.title}</h3>
                          <p className="text-xs text-surface-500">
                            {selectedSection.courses.length} courses and subtopics
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/categories/${selectedSection.categorySlug}`}
                        className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Browse topic →
                      </Link>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {selectedSection.courses.map(course => (
                        <li key={`${selectedSection.title}-${course.title}`}>
                          <Link
                            to={course.href}
                            className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                          >
                            <span className="min-w-0 truncate">{course.title}</span>
                            {course.badge && (
                              <span className="shrink-0 rounded-full bg-accent-50 px-1.5 py-0.5 text-xs font-medium text-accent-700">
                                {course.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })()}
            </div>

            {/* Bottom bar in mega menu */}
            <div className="mt-8 pt-6 border-t border-surface-100 flex items-center justify-between">
              <div className="flex gap-6 flex-wrap">
                <Link to="/master-programs" className="flex items-center gap-2 text-sm font-semibold text-surface-700 hover:text-brand-600">
                  <Award className="w-4 h-4 text-brand-500" />
                  Master Programs
                </Link>
                <Link to="/certifications" className="flex items-center gap-2 text-sm font-semibold text-surface-700 hover:text-brand-600">
                  <Award className="w-4 h-4 text-accent-500" />
                  Certifications
                </Link>
                <Link to="/placement-records" className="flex items-center gap-2 text-sm font-semibold text-surface-700 hover:text-brand-600">
                  <Briefcase className="w-4 h-4 text-green-500" />
                  Placement Records
                </Link>
                <Link to="/live-projects" className="flex items-center gap-2 text-sm font-semibold text-surface-700 hover:text-brand-600">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  Live Projects
                </Link>
                <Link to="/batch-schedule" className="flex items-center gap-2 text-sm font-semibold text-surface-700 hover:text-brand-600">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  Batch Schedule
                </Link>
                <Link to="/demo-class" className="flex items-center gap-2 text-sm font-semibold text-surface-700 hover:text-brand-600">
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  Free Demo Class
                </Link>
              </div>
              <Link to="/courses">
                <Button size="sm" variant="secondary">
                  View All Courses →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <>
        <button
          type="button"
          className="xl:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-surface-950/40"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        />
        <div
          id="public-mobile-menu"
          ref={mobileMenuRef}
          className="xl:hidden fixed top-16 right-0 bottom-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-card-lg"
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setMobileOpen(false);
              menuButtonRef.current?.focus();
              return;
            }
            if (event.key !== 'Tab' || !mobileMenuRef.current) return;
            const focusable = Array.from(mobileMenuRef.current.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])',
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
        >
          <div className="container-xl py-4">
            {/* Search */}
            <Link
              to="/courses"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 mb-4 text-surface-600"
            >
              <Search className="w-5 h-5" />
              <span className="text-sm">Search courses...</span>
            </Link>

            {/* Nav Links */}
            <nav className="space-y-1">
              {/* Courses with sub-items */}
              <div>
                <div className="flex items-center">
                  <Link
                    to="/courses"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex-1 p-3 rounded-xl font-semibold hover:bg-surface-50',
                      isRouteActive('/courses') ? 'text-brand-700 bg-brand-50' : 'text-surface-900',
                    )}
                    aria-current={isRouteActive('/courses') ? 'page' : undefined}
                  >
                    Courses
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === 'courses' ? null : 'courses')}
                    className="p-3 rounded-xl text-surface-600 hover:bg-surface-50"
                    aria-label={mobileExpanded === 'courses' ? 'Collapse course categories' : 'Expand course categories'}
                    aria-expanded={mobileExpanded === 'courses'}
                  >
                    <ChevronDown className={cn('w-5 h-5 transition-transform', mobileExpanded === 'courses' && 'rotate-180')} />
                  </button>
                </div>
                {mobileExpanded === 'courses' && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-brand-100 pl-4">
                    {categories.slice(0, 8).map(cat => {
                      const Icon = categoryIcons[cat.slug] || BookOpen;
                      return (
                        <Link
                          key={cat.id}
                          to={`/categories/${cat.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-surface-700 hover:text-brand-600 hover:bg-brand-50"
                        >
                          <Icon className="w-4 h-4" />
                          {cat.title}
                        </Link>
                      );
                    })}
                    <Link to="/courses" onClick={() => setMobileOpen(false)} className="block p-2.5 text-sm font-semibold text-brand-600">
                      View All Courses →
                    </Link>
                  </div>
                )}
              </div>

              {[
                { label: 'Master Programs', href: '/master-programs' },
                { label: 'Online Training', href: '/online-training' },
                { label: 'Classroom Training', href: '/classroom-training' },
                { label: 'Certifications', href: '/certifications' },
                { label: 'Batch Schedule', href: '/batch-schedule' },
                { label: 'Free Demo Class', href: '/demo-class' },
                { label: 'Skill Assessment', href: '/skill-assessment' },
                { label: 'Career & Placement', href: '/career' },
                { label: 'Placement Records', href: '/placement-records' },
                { label: 'Interview Prep', href: '/career/interview-preparation' },
                { label: 'Mock Interview', href: '/career/mock-interview' },
                { label: 'Internships', href: '/internships' },
                { label: 'Live Projects', href: '/live-projects' },
                { label: 'Events & Webinars', href: '/events' },
                { label: 'Scholarships', href: '/scholarships' },
                { label: 'Refer & Earn', href: '/refer-earn' },
                { label: 'Corporate Training', href: '/corporate-training' },
                { label: 'Expert Trainers', href: '/trainers' },
                { label: 'Blog', href: '/blog' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Locations', href: '/locations' },
              ].map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block p-3 rounded-xl font-medium hover:bg-surface-50 hover:text-brand-600',
                    isRouteActive(link.href) ? 'text-brand-700 bg-brand-50' : 'text-surface-900',
                  )}
                  aria-current={isRouteActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div className="mt-6 space-y-3 pt-4 border-t border-surface-100">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 text-surface-700"
              >
                <Phone className="w-5 h-5 text-brand-500" />
                <span className="font-medium">{siteConfig.phone}</span>
              </a>
              <Link to="/login" className="block">
                <Button variant="secondary" size="lg" fullWidth leftIcon={<User className="w-4 h-4" />}>
                  Login
                </Button>
              </Link>
              <Link to="/register" className="block">
                <Button size="lg" fullWidth>
                  Enroll Now — Free Counseling
                </Button>
              </Link>
            </div>
          </div>
        </div>
        </>
      )}
    </header>
  );
}
