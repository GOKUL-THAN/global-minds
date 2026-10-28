import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Magnetic } from '../ui/Magnetic';
import { publicCourseCatalog } from '../../data/publicCourseCatalog';

const proofPoints = ['Practical, mentor-led training', 'Live online learning', 'Classroom training in Chennai'];

export function HeroSection() {
  return (
    <>
      <section className="home-hero relative overflow-hidden bg-white text-surface-900" aria-label="Global Minds Academy">
        <div className="home-hero-pattern" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb-left" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb-right" aria-hidden="true" />
        <div className="container-xl relative z-10 mx-auto px-4 py-10 text-center sm:py-12 lg:py-14">
          <div className="home-hero-badge mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold sm:text-sm">
            <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />
            <span>Global Minds Tech Training</span>
          </div>
          <h1 className="home-hero-title mx-auto mt-7 max-w-5xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-surface-900">
            <span className="block text-surface-900">
              Build Skills.
            </span>
            <span className="home-hero-highlight block">
              Own the Future.
            </span>
          </h1>
          <p className="home-hero-description mx-auto mt-6 max-w-4xl text-base leading-relaxed sm:text-lg text-surface-700 font-medium">
            Build job-ready skills through practical, career-focused technology training designed to help you move forward.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/courses">
              <Magnetic>
                <Button
                  size="lg"
                  className="home-hero-primary w-full rounded-full px-8 sm:w-auto font-bold"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Explore Programs
                </Button>
              </Magnetic>
            </Link>
            <Link to="/corporate-training" className="home-hero-enterprise-link font-semibold">
              Enterprise Services
            </Link>
          </div>
          <p className="mt-4 text-sm text-surface-700 font-medium">
            Want to try a class first?{' '}
            <Link to="/demo-class" className="home-hero-demo-link font-bold text-brand-700 hover:text-brand-900 underline underline-offset-4">
              Book a free demo
            </Link>
          </p>
          <ul className="home-hero-proof-list mx-auto mt-8 flex max-w-4xl flex-col items-center justify-center gap-4 border-t border-brand-200 pt-6 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {proofPoints.map(point => (
              <li key={point} className="home-hero-proof inline-flex items-center gap-2 text-sm font-semibold text-surface-800">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="home-popular-links mx-auto mt-8 max-w-5xl border-t border-surface-200 pt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-surface-800">Explore popular programs</p>
            <div className="flex flex-wrap justify-center gap-2">
              {publicCourseCatalog.map(course => (
                <Link
                  key={course.sourceSlug}
                  to={`/courses/${course.sourceSlug}`}
                  className="home-popular-link rounded-full px-4 py-2 text-sm font-semibold text-surface-800 border border-surface-200 bg-white hover:border-brand-500 hover:text-brand-800 transition-colors shadow-sm"
                >
                  {course.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
