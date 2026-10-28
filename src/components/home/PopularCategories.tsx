import { Link } from 'react-router-dom';
import {
  Cloud, Cpu, Shield, Code2, TestTube2, BookOpen,
} from 'lucide-react';
import { publicCourseCatalog } from '../../data/publicCourseCatalog';
import { cn } from '../../utils/cn';

const iconMap: Record<string, React.ElementType> = {
  'aws-training': Cloud,
  'data-science': BookOpen,
  'machine-learning': Cpu,
  'full-stack-development': Code2,
  'cyber-security': Shield,
  'software-testing': TestTube2,
  'automation-testing': TestTube2,
};

export function PopularCategories() {
  const cardStyles: Record<string, { iconBg: string; iconColor: string; border: string }> = {
    'aws-training': { iconBg: 'bg-slate-100', iconColor: 'text-slate-700', border: 'border-slate-200' },
    'data-science': { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700', border: 'border-emerald-200' },
    'machine-learning': { iconBg: 'bg-pink-50', iconColor: 'text-pink-700', border: 'border-pink-200' },
    'full-stack-development': { iconBg: 'bg-blue-50', iconColor: 'text-blue-700', border: 'border-blue-200' },
    'cyber-security': { iconBg: 'bg-teal-50', iconColor: 'text-teal-700', border: 'border-teal-200' },
    'software-testing': { iconBg: 'bg-amber-50', iconColor: 'text-amber-700', border: 'border-amber-200' },
    'automation-testing': { iconBg: 'bg-violet-50', iconColor: 'text-violet-700', border: 'border-violet-200' },
  };

  return (
    <section className="section bg-surface-50" aria-label="Course categories">
      <div className="container-xl">
        <div className="mb-12 text-center">
          <h2 className="display-md text-surface-900">
            <span className="text-gradient">Courses</span>
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-lg text-surface-700 font-medium">
            AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Cyber Security, Software Testing, and Automation Testing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {publicCourseCatalog.map(course => {
            const Icon = iconMap[course.sourceSlug] || Code2;
            const styles = cardStyles[course.sourceSlug] || { iconBg: 'bg-brand-50', iconColor: 'text-brand-600', border: 'border-brand-200' };

            return (
              <Link
                key={course.sourceSlug}
                to={`/courses/${course.sourceSlug}`}
                className={cn(
                  'group flex min-h-[180px] flex-col items-center justify-center rounded-2xl border bg-white p-5 text-center',
                  'border-surface-200 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-md',
                  styles.border,
                )}
                aria-label={`Explore ${course.title}`}
              >
                <div className={cn('mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 shadow-sm', styles.iconBg, styles.iconColor)}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-surface-900 transition-colors group-hover:text-brand-700">
                  {course.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
