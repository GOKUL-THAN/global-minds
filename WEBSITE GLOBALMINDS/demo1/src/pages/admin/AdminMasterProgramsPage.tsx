import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Plus, Edit2, Trash2, Clock, Search, X } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import type { MasterProgram } from '../../types';

type LocalMP = MasterProgram & { hidden: boolean };

const emptyForm = {
  title: '',
  tagline: '',
  duration: '',
  price: 0,
  discountPrice: 0,
  status: 'active' as MasterProgram['status'],
};

export default function AdminMasterProgramsPage() {
  const [items, setItems] = useState<LocalMP[]>([]);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LocalMP | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = items.filter(mp =>
    mp.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (mp: LocalMP) => {
    setEditItem(mp);
    setForm({
      title: mp.title,
      tagline: mp.tagline,
      duration: mp.duration,
      price: mp.price,
      discountPrice: mp.discountPrice,
      status: mp.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editItem) {
      setItems(prev =>
        prev.map(mp =>
          mp.id === editItem.id
            ? { ...mp, ...form }
            : mp
        )
      );
    } else {
      const newItem: LocalMP = {
        id: crypto.randomUUID(),
        slug: form.title.toLowerCase().replace(/\s+/g, '-'),
        title: form.title,
        tagline: form.tagline,
        shortDescription: '',
        longDescription: '',
        duration: form.duration,
        totalHours: 0,
        modules: [],
        skills: [],
        tools: [],
        projects: 0,
        certification: '',
        careerOutcomes: [],
        jobRoles: [],
        targetAudience: [],
        prerequisites: [],
        level: 'Intermediate',
        price: form.price,
        discountPrice: form.discountPrice,
        currency: 'INR',
        thumbnail: '',
        banner: '',
        featured: false,
        learnerCount: 0,
        rating: 0,
        reviewCount: 0,
        placementSupport: false,
        faqs: [],
        status: form.status,
        hidden: false,
      };
      setItems(prev => [...prev, newItem]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(mp => mp.id !== id));
    setConfirmDeleteId(null);
  };

  const toggleHidden = (id: string) => {
    setItems(prev =>
      prev.map(mp =>
        mp.id === id ? { ...mp, hidden: !mp.hidden } : mp
      )
    );
  };

  const visibleCount = items.filter(mp => !mp.hidden).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Master Programs</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {visibleCount} visible · {items.length} total
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Program
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search programs..."
            className="form-input pl-9 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Duration</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden lg:table-cell">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(mp => (
                <React.Fragment key={mp.id}>
                  <tr className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={mp.thumbnail}
                          alt=""
                          className="w-14 h-10 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                          loading="lazy"
                        />
                        <div>
                          <p className="font-medium text-surface-900 line-clamp-1">{mp.title}</p>
                          <p className="text-xs text-surface-400 line-clamp-1">{mp.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-surface-600">
                        <Clock className="w-3.5 h-3.5" />
                        {mp.duration}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div>
                        <p className="font-semibold text-brand-700">{formatPrice(mp.discountPrice, mp.currency)}</p>
                        <p className="text-xs text-surface-400 line-through">{formatPrice(mp.price, mp.currency)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {mp.hidden ? (
                        <Badge variant="gray">Hidden</Badge>
                      ) : mp.status === 'active' ? (
                        <Badge variant="green">Active</Badge>
                      ) : (
                        <Badge variant="yellow">{mp.status}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {confirmDeleteId === mp.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-surface-600">Are you sure?</span>
                          <button
                            onClick={() => handleDelete(mp.id)}
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
                          <Link to={`/master-programs/${mp.slug}`} target="_blank">
                            <button className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => openEdit(mp)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleHidden(mp.id)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50"
                            title={mp.hidden ? 'Show' : 'Hide'}
                          >
                            {mp.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(mp.id)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-surface-500">No programs found.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-surface-900">
                {editItem ? 'Edit Program' : 'Add Program'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="form-input w-full"
                  placeholder="Program title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Tagline</label>
                <input
                  value={form.tagline}
                  onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                  className="form-input w-full"
                  placeholder="Short tagline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Duration</label>
                <input
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. 6 Months"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="form-input w-full"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={e => setForm(f => ({ ...f, discountPrice: Number(e.target.value) }))}
                    className="form-input w-full"
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as MasterProgram['status'] }))}
                  className="form-select w-full"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="coming-soon">Coming Soon</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary btn"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary btn"
                disabled={!form.title.trim()}
              >
                {editItem ? 'Save Changes' : 'Add Program'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
