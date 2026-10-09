import { useState } from 'react';
import { Star, Search, CheckCircle, XCircle } from 'lucide-react';
import { testimonials } from '../../data/testimonials';
import { Badge } from '../../components/ui/Badge';

export default function AdminTestimonialsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const filtered = testimonials.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.course.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.featured;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Testimonials</h1>
          <p className="text-surface-500 text-sm mt-0.5">{testimonials.length} reviews · {testimonials.filter(t => t.featured).length} featured</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or course..." className="form-input pl-9 w-full" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'featured'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>
              {f === 'all' ? 'All Reviews' : 'Featured Only'}
            </button>
          ))}
        </div>
        <span className="text-sm text-surface-400 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Course</th>
                <th className="text-left px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Source</th>
                <th className="text-left px-4 py-3">Featured</th>
                <th className="text-left px-4 py-3">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-surface-900">{t.name}</p>
                    <p className="text-xs text-surface-400">{t.role}{t.company ? ` · ${t.company}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="brand">{t.course}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs text-surface-500 ml-1">{t.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-surface-600 hidden lg:table-cell">{t.location}, {t.country}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-surface-500">{t.source ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {t.featured
                      ? <CheckCircle className="w-4 h-4 text-green-600" />
                      : <XCircle className="w-4 h-4 text-surface-300" />}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs text-surface-600 line-clamp-2">{t.review}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-surface-500">No testimonials match your search.</div>
          )}
        </div>
      </div>
      <p className="text-xs text-surface-400">Testimonials sourced from Google Reviews (globalmindsacademy.in). Edit/add requires backend API.</p>
    </div>
  );
}
