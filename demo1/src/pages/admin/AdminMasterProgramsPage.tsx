import { Link } from 'react-router-dom';
import { Eye, Plus, Clock, Users } from 'lucide-react';
import { masterPrograms } from '../../data/masterPrograms';
import { formatPrice } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';

export default function AdminMasterProgramsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Master Programs</h1>
          <p className="text-surface-500 text-sm mt-0.5">{masterPrograms.length} programs (placeholder data)</p>
        </div>
        <button className="btn-primary btn flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
          <Plus className="w-4 h-4" /> Add Program
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {masterPrograms.map(mp => (
          <div key={mp.id} className="bg-white rounded-2xl border border-surface-100 p-5 flex gap-4">
            <img src={mp.thumbnail} alt={mp.title} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" loading="lazy" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-surface-900 text-sm line-clamp-1">{mp.title}</h3>
                <Badge variant={mp.status === 'active' ? 'green' : 'gray'}>{mp.status}</Badge>
              </div>
              <p className="text-xs text-surface-500 line-clamp-1 mb-2">{mp.tagline}</p>
              <div className="flex flex-wrap gap-3 text-xs text-surface-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mp.duration}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{mp.learnerCount.toLocaleString()}</span>
                <span className="font-semibold text-brand-700">{formatPrice(mp.discountPrice, mp.currency)}</span>
              </div>
            </div>
            <Link to={`/master-programs/${mp.slug}`} target="_blank" className="flex-shrink-0">
              <button className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50">
                <Eye className="w-4 h-4" />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
