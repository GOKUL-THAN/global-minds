import { Link } from 'react-router-dom';
import { Clock, BookOpen, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { masterPrograms } from '../../data/masterPrograms';
import { formatPrice } from '../../utils/formatters';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CTASection } from '../../components/home/CTASection';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export default function MasterProgramsPage() {
  const programs = useCmsCollection('master-programs', masterPrograms);
  usePageMeta({
    title: 'Master Programs — Complete Career Tracks',
    description: 'Structured multi-month programs in full stack, cloud, DevOps, data science, AI and more with real projects and placement support.',
  });
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="page-hero-premium py-16">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Master Programs' }]} className="mb-4" />
          <div className="max-w-3xl">
            <div className="page-hero-badge mb-4">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Complete Career Tracks</span>
            </div>
            <h1 className="page-hero-title display-lg font-extrabold mb-4">
              Master <span className="page-hero-highlight">Programs</span>
            </h1>
            <p className="page-hero-desc text-lg sm:text-xl">
              Structured multi-month programs designed to take you from fundamentals to job-ready in your chosen technology domain. With real projects, placement support and certification guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <section className="section" aria-label="Master Programs list">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {programs.filter(mp => mp.status === 'active').map(program => (
              <Link
                key={program.id}
                to={`/master-programs/${program.slug}`}
                className="card-hover group block overflow-hidden"
                aria-label={`View ${program.title} details`}
              >
                {/* Banner */}
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-100">
                  <img
                    src={program.thumbnail}
                    alt={program.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                      {program.duration}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="heading-lg mb-2 text-surface-900 group-hover:text-brand-700 transition-colors">{program.title}</h2>
                  <p className="text-brand-700 text-sm font-bold mb-3">{program.tagline}</p>
                  <p className="text-surface-600 text-sm leading-relaxed mb-5">{program.shortDescription}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 text-sm text-surface-600 font-medium mb-5">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-brand-600" />
                      {program.modules.length} modules
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-600" />
                      {program.totalHours} hours
                    </span>
                  </div>

                  {/* Skills preview */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {program.skills.slice(0, 6).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-surface-100 text-surface-700 font-medium rounded-lg text-xs">{skill}</span>
                    ))}
                    {program.skills.length > 6 && (
                      <span className="px-2 py-0.5 bg-surface-100 text-surface-600 font-medium rounded-lg text-xs">+{program.skills.length - 6} more</span>
                    )}
                  </div>

                  {/* Placement support badge */}
                  {program.placementSupport && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700 mb-5">
                      <CheckCircle className="w-4 h-4" />
                      Placement support included
                    </div>
                  )}

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                    <div>
                      <div className="text-xl font-bold text-surface-900">{formatPrice(program.discountPrice, program.currency)}</div>
                      <div className="text-sm text-surface-500 line-through">{formatPrice(program.price, program.currency)}</div>
                    </div>
                    <span className="btn-primary btn flex items-center gap-2">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Not sure which program to choose?"
        subtitle="Our career counselors will guide you to the right program based on your background, goals and budget."
        primaryLabel="Get Free Counseling"
        primaryHref="/contact"
        secondaryLabel="Browse All Courses"
        secondaryHref="/courses"
      />
    </div>
  );
}
