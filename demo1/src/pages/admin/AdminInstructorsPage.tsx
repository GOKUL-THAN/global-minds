import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

type LocalInstructor = {
  id: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  linkedIn: string;
  twitter: string;
  status: 'active' | 'inactive';
  hidden: boolean;
};

const emptyForm = {
  name: '',
  title: '',
  bio: '',
  expertise: '',
  linkedIn: '',
  twitter: '',
  status: 'active' as 'active' | 'inactive',
};

export default function AdminInstructorsPage() {
  const [items, setItems] = useState<LocalInstructor[]>([]);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LocalInstructor | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = items.filter(inst => {
    return (
      !search ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.title.toLowerCase().includes(search.toLowerCase())
    );
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (inst: LocalInstructor) => {
    setEditItem(inst);
    setForm({
      name: inst.name,
      title: inst.title,
      bio: inst.bio,
      expertise: inst.expertise.join(', '),
      linkedIn: inst.linkedIn,
      twitter: inst.twitter,
      status: inst.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const expertiseArray = form.expertise
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editItem) {
      setItems(prev =>
        prev.map(inst =>
          inst.id === editItem.id
            ? {
                ...inst,
                name: form.name,
                title: form.title,
                bio: form.bio,
                expertise: expertiseArray,
                linkedIn: form.linkedIn,
                twitter: form.twitter,
                status: form.status,
              }
            : inst
        )
      );
    } else {
      const newItem: LocalInstructor = {
        id: crypto.randomUUID(),
        name: form.name,
        title: form.title,
        bio: form.bio,
        expertise: expertiseArray,
        linkedIn: form.linkedIn,
        twitter: form.twitter,
        status: form.status,
        hidden: false,
      };
      setItems(prev => [newItem, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(inst => inst.id !== id));
    setConfirmDeleteId(null);
  };

  const toggleHidden = (id: string) => {
    setItems(prev =>
      prev.map(inst => (inst.id === id ? { ...inst, hidden: !inst.hidden } : inst))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Instructors</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {items.filter(i => !i.hidden).length} visible · {items.length} total
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Instructor
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or title..."
            className="form-input pl-9 w-full"
          />
        </div>
        <span className="text-sm text-surface-400 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Title / Expertise</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Bio</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(inst => (
                <tr key={inst.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-surface-900">{inst.name}</p>
                    {inst.hidden && (
                      <Badge variant="gray">Hidden</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-surface-700 font-medium text-xs mb-1">{inst.title}</p>
                    <div className="flex flex-wrap gap-1">
                      {inst.expertise.slice(0, 3).map(e => (
                        <Badge key={e} variant="brand">{e}</Badge>
                      ))}
                      {inst.expertise.length > 3 && (
                        <span className="text-xs text-surface-400">+{inst.expertise.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell max-w-xs">
                    <p className="text-xs text-surface-600">
                      {inst.bio.length > 60 ? `${inst.bio.slice(0, 60)}…` : inst.bio}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {inst.status === 'active' ? (
                      <Badge variant="green">Active</Badge>
                    ) : (
                      <Badge variant="gray">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {confirmDeleteId === inst.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-surface-600">Are you sure?</span>
                        <button
                          onClick={() => handleDelete(inst.id)}
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
                          onClick={() => openEdit(inst)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleHidden(inst.id)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50"
                          title={inst.hidden ? 'Show' : 'Hide'}
                        >
                          {inst.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(inst.id)}
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
            <div className="text-center py-12 text-surface-500">
              {items.length === 0
                ? 'No instructors yet. Click "Add Instructor" to get started.'
                : 'No instructors match your search.'}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-surface-900">
                {editItem ? 'Edit Instructor' : 'Add Instructor'}
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
                <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="form-input w-full"
                  placeholder="Instructor full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. Senior DevOps Trainer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="form-input w-full resize-none"
                  rows={4}
                  placeholder="Short biography"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Expertise</label>
                <input
                  value={form.expertise}
                  onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. AWS, DevOps, Docker (comma-separated)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">LinkedIn URL</label>
                  <input
                    value={form.linkedIn}
                    onChange={e => setForm(f => ({ ...f, linkedIn: e.target.value }))}
                    className="form-input w-full"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Twitter URL</label>
                  <input
                    value={form.twitter}
                    onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))}
                    className="form-input w-full"
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e =>
                    setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))
                  }
                  className="form-select w-full"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary btn">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary btn"
                disabled={!form.name.trim()}
              >
                {editItem ? 'Save Changes' : 'Add Instructor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
