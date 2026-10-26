import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCmsCollection } from '../../hooks/useCmsCollection';
import { masterPrograms } from '../../data/masterPrograms';
import { LazyImage } from '../ui/LazyImage';
import { formatPrice } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const homepageMasterProgramImages: Record<string, string> = {
  'freshers-master-program': '/images/master-programs/freshers-master-program.jpg',
  'full-stack-master-program': '/images/master-programs/full-stack-master-program.jpg',
  'ai-ml-master-program': '/images/master-programs/data-science-master-program.jpg',
  'data-science-business-intelligence': '/images/master-programs/data-science-master-program.jpg',
  'software-testing-master-program': '/images/master-programs/software-testing-master-program.jpg',
};

export function MasterProgramsSection() {
  const programs = useCmsCollection('master-programs', masterPrograms);
  const featuredPrograms = programs.filter(program => program.status === 'active' && program.featured).slice(0, 4);

  return (
    <section className="home-master-programs section bg-surface-50" aria-label="Master programs">
      <div className="container-xl">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-600">Complete career tracks</p>
            <h2 className="display-md text-surface-900">
              Master Programs — <span className="text-gradient">Complete Career Tracks</span>
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-surface-500">
              Structured multi-month programs to deepen your skills, build real projects, and support your career growth.
            </p>
          </div>
          <Link to="/master-programs">
            <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />} className="home-course-view-all">
              View All Programs
            </Button>
          </Link>
        </div>

        {featuredPrograms.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredPrograms.map(program => (
            <Link
              key={program.id}
              to={`/master-programs/${program.slug}`}
              className={cn('home-course-card group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1')}
              aria-label={`Explore ${program.title}`}
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-100">
                <LazyImage
                  src={homepageMasterProgramImages[program.slug] ?? program.thumbnail}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-surface-900/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  <Clock className="h-3 w-3" aria-hidden="true" />{program.duration}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 line-clamp-2 font-display text-base font-bold text-surface-900 transition-colors group-hover:text-brand-700">{program.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-surface-500">{program.shortDescription}</p>
                <div className="mb-4 flex items-center gap-2 text-xs text-surface-500">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  {program.modules.length} modules
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-surface-100 pt-4">
                  <div>
                    <div className="text-base font-bold text-surface-900">{formatPrice(program.discountPrice, program.currency)}</div>
                    {program.price !== program.discountPrice && (
                      <div className="text-xs text-surface-400 line-through">{formatPrice(program.price, program.currency)}</div>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    Learn more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        ) : null}
      </div>
    </section>
  );
}
