import { Link } from 'react-router-dom';
import { Clock, Users, Award, ArrowRight, BookOpen } from 'lucide-react';
import { masterPrograms } from '../../data/masterPrograms';
import { formatPrice } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export function MasterProgramsSection() {
  const programs = useCmsCollection('master-programs', masterPrograms);
  const featured = programs.filter(mp => mp.featured && mp.status === 'active').slice(0, 4);

  return (
    <section className="home-master-programs section bg-surface-50" aria-label="Master Programs">
      <div className="container-xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="home-section-badge inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-4">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">Comprehensive Learning Paths</span>
            </div>
            <h2 className="display-md text-surface-900">
              Master Programs —{' '}
              <span className="home-hero-highlight">
                Complete Career Tracks
              </span>
            </h2>
            <p className="text-surface-600 mt-4 max-w-xl">
              Structured multi-month programs covering everything you need for a career transition or major skill upgrade — with real projects and placement support.
            </p>
          </div>
          <Link to="/master-programs">
            <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Programs
            </Button>
          </Link>
        </div>

        {/* Program cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(program => (
            <Link
              key={program.id}
              to={`/master-programs/${program.slug}`}
              className={cn(
                'group relative flex flex-col rounded-2xl border border-surface-200 overflow-hidden',
                'bg-white hover:shadow-card-md',
                'transition-all duration-300 hover:-translate-y-1',
              )}
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden">
                <img
                  src={program.thumbnail}
                  alt={program.title}
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  loading="lazy"
                />
                <div className="master-program-image-overlay absolute inset-0" />

                {/* Duration badge */}
                <div className="home-program-duration absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Clock className="w-3 h-3" />
                  {program.duration}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <h3 className="font-display font-bold text-surface-900 text-base mb-2 group-hover:text-brand-700 transition-colors line-clamp-2">
                  {program.title}
                </h3>
                <p className="text-surface-600 text-xs line-clamp-2 mb-4">
                  {program.tagline}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-surface-500 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {program.modules.length} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {program.learnerCount.toLocaleString()}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                  <div>
                    <div className="text-base font-bold text-surface-900">
                      {formatPrice(program.discountPrice, program.currency)}
                    </div>
                    <div className="text-xs text-surface-400 line-through">
                      {formatPrice(program.price, program.currency)}
                    </div>
                  </div>
                  <span className="home-program-link text-xs font-semibold transition-colors">
                    Learn more →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 p-8 rounded-2xl border border-surface-200 bg-white text-center">
          <h3 className="font-display font-bold text-surface-900 text-xl mb-2">
            Not sure which program to choose?
          </h3>
          <p className="text-surface-600 mb-6">
            Get free career counseling from our experts and find the right path for you.
          </p>
          <Link to="/contact">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Talk to a Career Expert
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
