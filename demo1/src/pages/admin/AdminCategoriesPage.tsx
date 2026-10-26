import { categories as staticCategories } from '../../data/categories';
import { Cloud, GitBranch, Cpu, Layers, BarChart2, Shield, Code2, Database, PenTool, TrendingUp, Kanban, Wifi, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCmsCollection } from '../../hooks/useCmsCollection';

const iconMap: Record<string, React.ElementType> = {
  cloud: Cloud, 'git-branch': GitBranch, cpu: Cpu, layers: Layers,
  'bar-chart-2': BarChart2, shield: Shield, 'code-2': Code2,
  database: Database, 'pen-tool': PenTool, 'trending-up': TrendingUp,
  kanban: Kanban, wifi: Wifi, zap: Zap, 'check-circle': Shield,
};

export default function AdminCategoriesPage() {
  const categories = useCmsCollection('categories', staticCategories);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Categories</h1>
          <p className="text-surface-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...categories].sort((a, b) => a.order - b.order).map(cat => {
          const Icon = iconMap[cat.icon] || Code2;
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-surface-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.bgColor }}>
                <Icon className="w-6 h-6" style={{ color: cat.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-900">{cat.title}</p>
                <p className="text-sm text-surface-500">{cat.courseCount} courses</p>
              </div>
              <Link to={`/categories/${cat.slug}`} target="_blank">
                <button className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
