import { Link } from 'react-router-dom';
import { Eye, MapPin, Clock } from 'lucide-react';
import { internships } from '../../data/internships';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';

export default function AdminInternshipsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Internships</h1>
          <p className="text-surface-500 text-sm mt-0.5">{internships.length} listings (placeholder data)</p>
        </div>
      </div>

      <div className="table-scroll bg-white rounded-2xl border border-surface-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-100">
              <th className="text-left px-4 py-3 font-semibold text-surface-600">Internship</th>
              <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden lg:table-cell">Duration</th>
              <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden lg:table-cell">Deadline</th>
              <th className="text-left px-4 py-3 font-semibold text-surface-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-surface-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {internships.map(i => (
              <tr key={i.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-surface-900">{i.title}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{i.location}</span>
                    <span>{i.mode}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-surface-600 hidden md:table-cell">{i.category}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-surface-500">
                    <Clock className="w-3.5 h-3.5" />{i.duration}
                  </div>
                </td>
                <td className="px-4 py-3 text-surface-500 hidden lg:table-cell">{formatDate(i.applicationDeadline)}</td>
                <td className="px-4 py-3">
                  <Badge variant={i.status === 'open' ? 'green' : i.status === 'coming-soon' ? 'yellow' : 'gray'}>{i.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/internships/${i.slug}`} target="_blank">
                    <button className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50">
                      <Eye className="w-4 h-4" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
