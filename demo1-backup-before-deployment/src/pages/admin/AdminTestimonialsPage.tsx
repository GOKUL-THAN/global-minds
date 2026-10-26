import { useState } from 'react';
import { Star, Search, Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import type { Testimonial } from '../../types';

type LocalT = Testimonial & { hidden: boolean };

const emptyForm = {
  name: '',
  role: '',
  company: '',
  course: '',
  rating: 5 as number,
  review: '',
  location: '',
  featured: false,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<LocalT[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LocalT | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = items.filter(t => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.course.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.featured;
    return matchSearch && matchFilter;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: LocalT) => {
    setEditItem(t);
    setForm({
      name: t.name,
      role: t.role,
      company: t.company,
      course: t.course,
      rating: t.rating,
      review: t.review,
      location: t.location,
      featured: t.featured,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.review.trim()) return;
    if (editItem) {
      setItems(prev =>
        prev.map(t =>
          t.id === editItem.id
            ? { ...t, ...form }
            : t
        )
      );
    } else {
      const newItem: LocalT = {
        id: crypto.randomUUID(),
        name: form.name,
        role: form.role,
        company: form.company,
        course: form.course,
        rating: form.rating,
        review: form.review,
        location: form.location,
        country: 'India',
        date: new Date().toISOString().split('T')[0],
        featured: form.featured,
        type: 'text',
        hidden: false,
      };
      setItems(prev => [newItem, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(t => t.id !== id));
    setConfirmDeleteId(null);
  };

  const toggleFeatured = (id: string) => {
    setItems(prev =>
      prev.map(t => (t.id === id ? { ...t, featured: !t.featured } : t))
    );
  };

  const toggleHidden = (id: string) => {
    setItems(prev =>
      prev.map(t => (t.id === id ? { ...t, hidden: !t.hidden } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Testimonials</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {items.length} reviews · {items.filter(t => t.featured).length} featured
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or course..."
            className="form-input pl-9 w-full"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'featured'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
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
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Review</th>
                <th className="text-left px-4 py-3">Actions</th>
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
                  <td className="px-4 py-3 text-xs text-surface-600 hidden lg:table-cell">
                    {t.location}, {t.country}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {t.featured && <Badge variant="accent">Featured</Badge>}
                      {t.hidden && <Badge variant="gray">Hidden</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs text-surface-600 line-clamp-2">{t.review}</p>
                  </td>
                  <td className="px-4 py-3">
                    {confirmDeleteId === t.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-surface-600">Are you sure?</span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFeatured(t.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            t.featured
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-surface-300 hover:text-amber-400 hover:bg-amber-50'
                          }`}
                          title={t.featured ? 'Unfeature' : 'Feature'}
                        >
                          <Star className={`w-4 h-4 ${t.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => toggleHidden(t.id)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50"
                          title={t.hidden ? 'Show' : 'Hide'}
                        >
                          {t.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(t.id)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-surface-900">
                {editItem ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="form-input w-full"
                    placeholder="Student name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Role</label>
                  <input
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="form-input w-full"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Company</label>
                  <input
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="form-input w-full"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Location</label>
                  <input
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="form-input w-full"
                    placeholder="City"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Course</label>
                <input
                  value={form.course}
                  onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                  className="form-input w-full"
                  placeholder="Course enrolled in"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Rating</label>
                <select
                  value={form.rating}
                  onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
                  className="form-select w-full"
                >
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Review *</label>
                <textarea
                  value={form.review}
                  onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
                  className="form-input w-full resize-none"
                  rows={4}
                  placeholder="Student's review"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={form.featured}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="featured-check" className="text-sm text-surface-700">
                  Mark as Featured
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary btn">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary btn"
                disabled={!form.name.trim() || !form.review.trim()}
              >
                {editItem ? 'Save Changes' : 'Add Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
