import { ArrowRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCmsCollection } from '../hooks/useCmsCollection';
import { DecryptedText } from '../components/ui/DecryptedText';

interface PlacementRecord {
  id: string;
  title?: string;
  studentName?: string;
  course?: string;
  company?: string;
  role?: string;
  package?: string;
  location?: string;
  summary?: string;
  quote?: string;
}

export default function PlacementPage() {
  const placementRecords = useCmsCollection<PlacementRecord>('placement-records');

  usePageMeta({
    title: 'Placement Records & Career Outcomes',
    description: 'View placement records and career outcomes published by Global Minds Technologies.',
  });

  return (
    <div className="min-h-screen bg-white">
      <section className="page-hero-premium py-16 sm:py-20 lg:py-24">
        <div className="container-xl relative z-10">
          <div className="max-w-3xl">
            <Breadcrumbs items={[{ label: 'Placement Records' }]} className="mb-5" />
            <div className="page-hero-badge mb-6">Published placement updates</div>
            <h1 className="mb-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-surface-900">
              Placement Records &amp; <DecryptedText text="Career Outcomes" speed={30} maxIterations={10} className="page-hero-highlight" />
            </h1>
            <p className="page-hero-desc max-w-2xl text-lg sm:text-xl leading-relaxed">
              Explore placement updates and learner outcomes published by our administrators.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 font-bold text-white transition-colors hover:bg-teal-800 shadow-md shadow-teal-900/15"
              >
                Start Your Journey <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-xl border border-teal-600/30 bg-white px-6 py-3.5 font-bold text-teal-800 transition-colors hover:bg-teal-50 shadow-sm"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-surface-50" aria-label="Published placement records">
        <div className="container-xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-700">Career outcomes</p>
            <h2 className="display-md mb-4">Placement Updates</h2>
          </div>
          {placementRecords.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {placementRecords.map(record => (
                <article key={record.id} className="flex h-full flex-col rounded-2xl border border-surface-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Briefcase className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-surface-950">{record.title || record.studentName || record.company || 'Placement update'}</h3>
                      {record.course && <p className="text-sm text-surface-500">{record.course}</p>}
                    </div>
                  </div>
                  {(record.role || record.company || record.location || record.package) && (
                    <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
                      {record.role && <div><dt className="text-surface-500">Role</dt><dd className="font-semibold text-surface-800">{record.role}</dd></div>}
                      {record.company && <div><dt className="text-surface-500">Company</dt><dd className="font-semibold text-surface-800">{record.company}</dd></div>}
                      {record.location && <div><dt className="text-surface-500">Location</dt><dd className="font-semibold text-surface-800">{record.location}</dd></div>}
                      {record.package && <div><dt className="text-surface-500">Package</dt><dd className="font-semibold text-surface-800">{record.package}</dd></div>}
                    </dl>
                  )}
                  {(record.summary || record.quote) && (
                    <p className="mt-auto text-sm leading-relaxed text-surface-600">{record.summary || record.quote}</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-surface-300 bg-white p-8 text-center text-surface-600">
              No placement updates have been published yet.
            </p>
          )}
        </div>
      </section>

      <CTASection
        title="Ready to Launch Your Career?"
        subtitle="Explore published courses and contact our team to learn about available career support."
        primaryLabel="Explore Courses"
        primaryHref="/courses"
        secondaryLabel="Start Your Journey"
        secondaryHref="/contact"
        variant="dark"
      />
    </div>
  );
}
