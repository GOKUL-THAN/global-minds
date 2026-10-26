import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Magnetic } from '../ui/Magnetic';
import { publicCourseCatalog } from '../../data/publicCourseCatalog';

const proofPoints = ['Practical, mentor-led training', 'Live online learning', 'Classroom training in Chennai'];

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <section className="home-hero relative overflow-hidden" aria-label="Global Minds Academy">
        <div className="home-hero-pattern" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb-left" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb-right" aria-hidden="true" />
        <motion.div
          className="container-xl relative mx-auto px-4 py-16 text-center sm:py-20 lg:py-24"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="home-hero-badge mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:text-sm"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.55, delay: 0.12, ease: 'easeOut' }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Global Minds Tech Training
          </motion.div>
          <h1 className="home-hero-title mx-auto mt-7 max-w-5xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <motion.span
              className="block"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
            >
              Build Skills.
            </motion.span>
            <motion.span
              className="home-hero-highlight block"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: 'easeOut' }}
            >
              Own the Future.
            </motion.span>
          </h1>
          <motion.p
            className="home-hero-description mx-auto mt-6 max-w-4xl text-base leading-relaxed sm:text-lg"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.43, ease: 'easeOut' }}
          >
            Build job-ready skills through practical, career-focused technology training designed to help you move forward.
          </motion.p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/courses">
              <Magnetic>
                <Button
                  size="lg"
                  className="home-hero-primary w-full rounded-full px-8 sm:w-auto"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Explore Programs
                </Button>
              </Magnetic>
            </Link>
            <Link to="/corporate-training" className="home-hero-enterprise-link">
              Enterprise Services
            </Link>
          </div>
          <p className="mt-4 text-sm text-surface-500">
            Want to try a class first?{' '}
            <Link to="/demo-class" className="home-hero-demo-link font-semibold">
              Book a free demo
            </Link>
          </p>
          <ul className="home-hero-proof-list mx-auto mt-8 flex max-w-4xl flex-col items-center justify-center gap-4 border-t border-brand-100 pt-6 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {proofPoints.map(point => (
              <li key={point} className="home-hero-proof inline-flex items-center gap-2 text-sm font-semibold">
                <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <div className="home-popular-links mx-auto mt-8 max-w-5xl border-t pt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-surface-500">Explore popular programs</p>
            <div className="flex flex-wrap justify-center gap-2">
              {publicCourseCatalog.map(course => (
                <Link
                  key={course.sourceSlug}
                  to={`/courses/${course.sourceSlug}`}
                  className="home-popular-link rounded-full px-4 py-2 text-sm font-medium transition-colors"
                >
                  {course.title}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
