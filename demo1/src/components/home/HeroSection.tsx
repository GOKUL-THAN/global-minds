import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

const highlights = [
  { label: '100% Practical Labs', href: '/courses' },
  { label: 'Global Certification', href: '/certifications' },
  { label: '1-on-1 Mentorship', href: '/trainers' },
];

const popularPrograms = [
  { label: 'Java Full Stack', href: '/courses/java-training' },
  { label: 'AWS Cloud', href: '/courses/aws-training' },
  { label: 'AI & Machine Learning', href: '/courses/machine-learning' },
  { label: 'Data Science', href: '/courses/data-science' },
  { label: 'DevOps Engineering', href: '/courses/devops-training' },
];

export function HeroSection() {
  return (
    <section className="home-hero relative overflow-hidden" aria-label="Global Minds Academy">
      <div className="home-hero-orb home-hero-orb-left" aria-hidden="true" />
      <div className="home-hero-orb home-hero-orb-right" aria-hidden="true" />
      <div className="container-xl relative py-12 sm:py-20 lg:py-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="home-hero-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Global Minds Tech Training &amp; IT Solutions
          </div>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-surface-900 sm:mt-7 sm:text-5xl lg:text-6xl">
            Build Skills.
            <span className="home-hero-highlight block"> Own the Future.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-surface-600 sm:mt-5 sm:text-lg">
            Build job-ready skills in full-stack development, AI, data science and cloud
            through practical, career-focused training.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row">
            <Link to="/courses">
              <Button
                size="lg"
                className="home-hero-primary w-full rounded-full px-8 sm:w-auto"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Explore Programs
              </Button>
            </Link>
            <Link to="/corporate-training">
              <Button
                size="lg"
                variant="outline"
                className="home-hero-secondary w-full rounded-full px-8 sm:w-auto"
              >
                Enterprise Services
              </Button>
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 sm:mt-8">
            {highlights.map(item => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className="home-hero-proof inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                >
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <nav className="home-popular-links mx-auto mt-8 hidden max-w-5xl border-t pt-6 sm:block" aria-label="Popular programs">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-surface-500">
            Explore popular programs
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularPrograms.map(item => (
              <Link key={item.href} to={item.href} className="home-popular-link rounded-full px-4 py-2 text-sm font-medium transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
