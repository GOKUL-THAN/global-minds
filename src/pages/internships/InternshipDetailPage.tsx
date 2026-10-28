import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, CheckCircle, Calendar, ArrowRight, Users } from 'lucide-react';
import { allowedInternshipCategories, internships } from '../../data/internships';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
import { ShinyText } from '../../components/ui/ShinyText';
import { DecryptedText } from '../../components/ui/DecryptedText';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { usePageMeta } from '../../hooks/usePageMeta';
import { formatDate } from '../../utils/formatters';
import NotFoundPage from '../NotFoundPage';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export default function InternshipDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const visibleInternships = useCmsCollection('internships', internships)
    .filter(item => allowedInternshipCategories.includes(item.category));
  const internship = visibleInternships.find(item => item.slug === (slug || ''));

  usePageMeta({
    title: internship ? `${internship.title} Internship` : undefined,
    description: internship
      ? `${internship.title} internship opportunity at ${internship.company}. Duration: ${internship.duration}. Location: ${internship.location}.`
      : undefined,
  });

  if (!internship) return <NotFoundPage />;

  const statusVariant = internship.status === 'open' ? 'green' : internship.status === 'coming-soon' ? 'yellow' : 'gray';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="page-hero-premium py-14 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs
            items={[
              { label: 'Internships', href: '/internships' },
              { label: internship.title },
            ]}
            className="mb-4"
          />
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <div className="page-hero-badge">
                  <ShinyText text={internship.category} shinyColor="rgba(23, 108, 115, 0.9)" />
                </div>
                <Badge variant={statusVariant}>
                  {internship.status === 'open' ? '✓ Open' : internship.status === 'coming-soon' ? 'Coming Soon' : 'Closed'}
                </Badge>
              </div>
              <h1 className="page-hero-title mb-3">
                <DecryptedText
                  text={internship.title}
                  speed={40}
                  maxIterations={15}
                  sequential={true}
                  revealDirection="start"
                />
              </h1>
              <p className="page-hero-desc text-lg mb-6 font-semibold text-teal-900">{internship.company}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="page-hero-chip flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-teal-600" />{internship.duration}
                </span>
                <span className="page-hero-chip flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-teal-600" />{internship.location}
                </span>
                <span className="page-hero-chip flex items-center gap-2 font-medium">
                  <Briefcase className="w-4 h-4 text-teal-600" />{internship.mode}
                </span>
                {internship.certificate && (
                  <span className="page-hero-chip flex items-center gap-2 font-semibold text-emerald-800 border-emerald-300 bg-emerald-50">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />Certificate included
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <section aria-labelledby="overview-h">
              <h2 id="overview-h" className="heading-xl mb-4">Internship Overview</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Duration', value: internship.duration, icon: Clock },
                  { label: 'Location', value: internship.location, icon: MapPin },
                  { label: 'Mode', value: internship.mode, icon: Briefcase },
                  { label: 'Stipend', value: internship.stipend, icon: Users },
                  { label: 'Application Deadline', value: formatDate(internship.applicationDeadline), icon: Calendar },
                  { label: 'Certificate', value: internship.certificate ? 'Yes — included' : 'Not included', icon: CheckCircle },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-4 bg-surface-50 border border-surface-200 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-600 font-semibold">{item.label}</p>
                      <p className="text-sm font-bold text-surface-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Eligibility */}
            <section aria-labelledby="elig-h">
              <h2 id="elig-h" className="heading-xl mb-4">Eligibility</h2>
              <ul className="space-y-2">
                {internship.eligibility.map((e, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-surface-800 font-medium">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    {e}
                  </li>
                ))}
              </ul>
            </section>

            {/* Skills Required */}
            <section aria-labelledby="skills-h">
              <h2 id="skills-h" className="heading-xl mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {internship.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 bg-brand-50 text-brand-800 border border-brand-200 rounded-xl text-sm font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </section>

            {/* Responsibilities */}
            <section aria-labelledby="resp-h">
              <h2 id="resp-h" className="heading-xl mb-4">Responsibilities</h2>
              <ul className="space-y-2">
                {internship.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-surface-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0 mt-2" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            {/* Application Form */}
            <div id="apply-form" className="bg-white border border-surface-200 rounded-3xl p-8 shadow-card">
              <EnquiryForm
                title="Apply for This Internship"
                subtitle="Fill in your details and our team will reach out with the next steps."
                preselectedCourse={internship.title}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24 space-y-6">
              <SpotlightCard className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-surface-900">Quick Info</h3>
                  <Badge variant={statusVariant}>{internship.status}</Badge>
                </div>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-surface-600 font-medium">Duration</span><span className="font-bold text-surface-900">{internship.duration}</span></div>
                  <div className="flex justify-between"><span className="text-surface-600 font-medium">Mode</span><span className="font-bold text-surface-900">{internship.mode}</span></div>
                  <div className="flex justify-between"><span className="text-surface-600 font-medium">Stipend</span><span className="font-bold text-surface-900">{internship.stipend}</span></div>
                  <div className="flex justify-between"><span className="text-surface-600 font-medium">Deadline</span><span className="font-bold text-surface-900">{formatDate(internship.applicationDeadline)}</span></div>
                </div>

                {internship.status === 'open' ? (
                  <a href="#apply-form">
                    <button className="btn-primary btn w-full flex items-center justify-center gap-2">
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </a>
                ) : (
                  <button className="btn w-full bg-surface-100 text-surface-500 font-medium cursor-not-allowed border border-surface-200" disabled>
                    {internship.status === 'coming-soon' ? 'Opening Soon' : 'Closed'}
                  </button>
                )}
              </SpotlightCard>

              <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5">
                <h3 className="font-semibold text-brand-900 mb-2">Complete a Course First</h3>
                <p className="text-brand-800 font-medium text-sm mb-4 leading-relaxed">
                  Most internships require completing a relevant Global Minds Academy course. Browse our courses to get started.
                </p>
                <Link to="/courses">
                  <button className="btn-secondary btn w-full text-sm">Browse Courses</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
