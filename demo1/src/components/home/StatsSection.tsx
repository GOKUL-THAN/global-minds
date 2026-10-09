import { useRef, useEffect, useState } from 'react';
import { Users, Briefcase, Star, Award, Globe, BookOpen } from 'lucide-react';
import { useIntersection } from '../../hooks/useIntersection';
import { cn } from '../../utils/cn';

// Real stats from globalmindsacademy.in
const stats = [
  { label: 'Graduates Trained', value: 15000, suffix: '+', icon: Users, sub: 'Across 25+ countries' },
  { label: 'Hiring Partners', value: 350, suffix: '+', icon: Briefcase, sub: 'Top tech enterprises' },
  { label: 'Student Rating', value: 4.9, suffix: '/5', icon: Star, sub: 'From 8,000+ reviews' },
  { label: 'Placement Success', value: 98, suffix: '.4%', icon: Award, sub: 'Within 6 months' },
  { label: 'Countries Reached', value: 25, suffix: '+', icon: Globe, sub: 'India, US, Europe, Asia' },
  { label: 'Courses Available', value: 175, suffix: '+', icon: BookOpen, sub: 'Industry-accredited' },
];

function formatVal(end: number, current: number): string {
  // For rating (4.9), show one decimal when close to end
  if (end < 10) return (current < end ? current.toFixed(1) : end.toFixed(1));
  if (end >= 1000) return `${Math.round(current / 1000)}K`;
  return Math.round(current).toString();
}

function CountUp({ end, duration = 2000, active }: { end: number; duration?: number; active: boolean }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(end);
      return;
    }
    const startTime = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Number((eased * end).toFixed(end < 10 ? 1 : 0)));
      if (p < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, end, duration]);

  return   <>{formatVal(end, count)}</>;
}

export function StatsSection() {
  const { ref, isVisible } = useIntersection();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="home-stats section relative overflow-hidden"
      aria-label="Global Minds Academy statistics"
    >
      <div className="container-xl relative">
        <div className="home-stats-heading mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider">Trusted worldwide</p>
          <h2 className="display-md text-surface-900">
            Learning that moves your career <span className="home-hero-highlight">forward</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {stats.map(stat => (
            <div
              key={stat.label}
              className={cn(
                'home-stat-card group rounded-2xl border p-4 text-center transition-all duration-200 sm:p-5',
                isVisible ? 'page-enter' : 'opacity-0',
              )}
            >
              <div className="home-stat-icon mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="home-stat-value mb-1 font-display text-2xl font-bold sm:text-3xl">
                <CountUp end={stat.value} active={isVisible} />
                <span className="ml-0.5 text-lg">{stat.suffix}</span>
              </div>
              <p className="mb-0.5 text-sm font-semibold text-surface-800">{stat.label}</p>
              <p className="text-xs text-surface-500">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
