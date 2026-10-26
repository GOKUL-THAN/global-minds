import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, CheckCircle, Calendar, ArrowRight, Users } from 'lucide-react';
import { allowedInternshipCategories, internships } from '../../data/internships';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { EnquiryForm } from '../../components/ui/EnquiryForm';
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
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-14">
        <div className="container-xl">
          <Breadcrumbs
            items={[
              { label: 'Internships', href: '/internships' },
              { label: internship.title },
            ]}
            className="text-white/50 mb-4"
          />
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={statusVariant}>
                  {internship.status === 'open' ? '✓ Open' : internship.status === 'coming-soon' ? 'Coming Soon' : 'Closed'}
                </Badge>
                <Badge variant="brand">{internship.category}</Badge>
              </div>
              <h1 className="display-md text-white mb-3">{internship.title}</h1>
              <p className="text-white/70 text-lg mb-6">{internship.company}</p>
              <div className="flex flex-wrap gap-5 text-sm text-white/70">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{internship.duration}</span>
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{internship.location}</span>
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{internship.mode}</span>
                {internship.certificate && (
                  <span className="flex items-center gap-2 text-green-400"><CheckCircle className="w-4 h-4" />Certificate included</span>
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
                  <div key={item.label} className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-400 font-medium">{item.label}</p>
                      <p className="text-sm font-semibold text-surface-900">{item.value}</p>
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
                  <li key={i} className="flex items-start gap-2.5 text-sm text-surface-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
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
                  <span key={s} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-sm font-medium">
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
                  <li key={i} className="flex items-start gap-2.5 text-sm text-surface-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-2" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            {/* Application Form */}
            <div id="apply-form" className="bg-surface-50 rounded-3xl p-8">
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
              <div className="bg-white border border-surface-100 rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-surface-900">Quick Info</h3>
                  <Badge variant={statusVariant}>{internship.status}</Badge>
                </div>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-surface-500">Duration</span><span className="font-semibold">{internship.duration}</span></div>
                  <div className="flex justify-between"><span className="text-surface-500">Mode</span><span className="font-semibold">{internship.mode}</span></div>
                  <div className="flex justify-between"><span className="text-surface-500">Stipend</span><span className="font-semibold">{internship.stipend}</span></div>
                  <div className="flex justify-between"><span className="text-surface-500">Deadline</span><span className="font-semibold">{formatDate(internship.applicationDeadline)}</span></div>
                </div>

                {internship.status === 'open' ? (
                  <a href="#apply-form">
                    <button className="btn-primary btn w-full flex items-center justify-center gap-2">
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </a>
                ) : (
                  <button className="btn w-full bg-surface-100 text-surface-400 cursor-not-allowed" disabled>
                    {internship.status === 'coming-soon' ? 'Opening Soon' : 'Closed'}
                  </button>
                )}
              </div>

              <div className="bg-brand-50 rounded-2xl p-5">
                <h3 className="font-semibold text-brand-900 mb-2">Complete a Course First</h3>
                <p className="text-brand-700 text-sm mb-4">
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
