import { Link } from 'react-router-dom';
import {
  Cloud, GitBranch, Cpu, Layers, BarChart2, Shield,
  Code2, Database, PenTool, TrendingUp, Kanban, Wifi,
  Zap, ArrowRight,
} from 'lucide-react';
import { categories } from '../../data/categories';
import { cn } from '../../utils/cn';
import { useCmsCollection } from '../../hooks/useCmsCollection';

const iconMap: Record<string, React.ElementType> = {
  cloud: Cloud,
  'git-branch': GitBranch,
  cpu: Cpu,
  layers: Layers,
  'bar-chart-2': BarChart2,
  shield: Shield,
  'code-2': Code2,
  database: Database,
  'pen-tool': PenTool,
  'trending-up': TrendingUp,
  kanban: Kanban,
  wifi: Wifi,
  zap: Zap,
  'check-circle': Shield,
};

export function PopularCategories() {
  const visibleCategories = useCmsCollection('categories', categories);
  const displayCategories = [...visibleCategories].sort((a, b) => a.order - b.order).slice(0, 10);

  return (
    <section className="section bg-surface-50" aria-label="Course categories">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-3">
            All technology domains
          </p>
          <h2 className="display-md">
            Explore by{' '}
            <span className="text-gradient">Category</span>
          </h2>
          <p className="text-surface-500 mt-4 max-w-xl mx-auto">
            From cloud computing and AI to full stack development and cyber security — find the right technology domain for your career goals.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayCategories.map(cat => {
            const Icon = iconMap[cat.icon] || Code2;
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className={cn(
                  'group flex flex-col items-center text-center p-5 rounded-2xl border border-transparent',
                  'bg-white hover:border-brand-200 hover:shadow-card-md',
                  'transition-all duration-300 hover:-translate-y-1',
                )}
                aria-label={`Explore ${cat.title} courses`}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
                    'group-hover:scale-110 transition-transform duration-300',
                  )}
                  style={{ backgroundColor: cat.bgColor }}
                >
                  <Icon className="w-7 h-7" style={{ color: cat.color }} />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 text-sm mb-1 transition-colors">
                  {cat.title}
                </h3>

                {/* Course count */}
                <p className="text-xs text-surface-400">
                  {cat.courseCount}+ courses
                </p>
              </Link>
            );
          })}

          {/* View all card */}
          <Link
            to="/courses"
            className={cn(
              'group flex flex-col items-center text-center p-5 rounded-2xl',
              'border-2 border-dashed border-brand-200 hover:border-brand-400',
              'hover:bg-brand-50 transition-all duration-300 hover:-translate-y-1',
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center mb-4 transition-colors">
              <ArrowRight className="w-7 h-7 text-brand-500" />
            </div>
            <h3 className="font-semibold text-brand-600 text-sm mb-1">
              All Categories
            </h3>
            <p className="text-xs text-surface-400">
              14+ domains
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
