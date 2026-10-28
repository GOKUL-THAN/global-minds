import { Award, Briefcase, MapPin, MonitorPlay } from 'lucide-react';
import { useIntersection } from '../../hooks/useIntersection';
import { motion, useReducedMotion } from 'framer-motion';
import { CountUp } from '../ui/CountUp';

const stats = [
  { label: 'Hiring Partners', value: '50+', detail: 'Career partnership network', icon: Briefcase },
  { label: 'Placement Success', value: '80%', detail: 'Career placement support', icon: Award },
  { label: 'Learning Mode', value: 'Online', detail: 'Learn from anywhere', icon: MonitorPlay },
  { label: 'Classroom Training', value: 'Chennai', detail: 'Our in-person location', icon: MapPin },
];

export function StatsSection() {
  const { ref, isVisible } = useIntersection();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="home-stats section relative overflow-hidden"
      aria-label="Global Minds Academy statistics"
    >
      <div className="container-xl relative">
        <div className="home-stats-heading mb-8 text-center">
          <h2 className="display-md text-surface-900">
            Learning that moves your career <span className="home-hero-highlight">forward</span>
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="home-stat-card group rounded-2xl border p-3 text-center transition-all duration-200 sm:p-6"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion || isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: shouldReduceMotion ? 0 : index * 0.07,
                ease: 'easeOut',
              }}
            >
              <div className="home-stat-icon mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="home-stat-value mb-1 font-display text-2xl font-bold sm:text-3xl">
                {stat.value === '50+' ? <CountUp end={50} suffix="+" start={isVisible} />
                  : stat.value === '80%' ? <CountUp end={80} suffix="%" start={isVisible} />
                    : stat.value}
              </div>
              <p className="mb-0.5 text-sm font-bold text-surface-900">{stat.label}</p>
              <p className="home-stat-detail text-sm text-surface-600 font-medium">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
