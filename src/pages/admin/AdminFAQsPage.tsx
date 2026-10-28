import React, { useState } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Eye, EyeOff, Search, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import type { FAQ } from '../../types';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

type LocalFAQ = FAQ & { hidden: boolean };

const emptyForm = { question: '', answer: '', category: '' };

export default function AdminFAQsPage() {
  const [items, setItems] = useState<LocalFAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LocalFAQ | null>(null);
  const [form, setForm] = useState(emptyForm);

  const categories = ['all', ...Array.from(new Set(items.map(f => f.category ?? 'General').filter(Boolean)))];

  const filtered = items.filter(faq => {
    const matchSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || (faq.category ?? 'General') === catFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (faq: LocalFAQ) => {
    setEditItem(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category ?? '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editItem) {
      setItems(prev =>
        prev.map(f =>
          f.id === editItem.id
            ? { ...f, question: form.question, answer: form.answer, category: form.category || undefined }
            : f
        )
      );
    } else {
      const newItem: LocalFAQ = {
        id: crypto.randomUUID(),
        question: form.question,
        answer: form.answer,
        category: form.category || undefined,
        hidden: false,
      };
      setItems(prev => [...prev, newItem]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(f => f.id !== id));
    setConfirmDeleteId(null);
  };

  const toggleHidden = (id: string) => {
    setItems(prev => prev.map(f => (f.id === id ? { ...f, hidden: !f.hidden } : f)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">
            <ShinyText text="FAQs" shinyColor="rgba(23, 108, 115, 0.9)" />
          </h1>
          <p className="text-surface-500 text-sm mt-0.5 font-medium">
            {items.filter(f => !f.hidden).length} visible · {items.length} total
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="form-input pl-9 w-full"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="form-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
        <span className="text-sm text-surface-400 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      <SpotlightCard>
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Question</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(faq => (
                <React.Fragment key={faq.id}>
                  <tr className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="brand">{faq.category ?? 'General'}</Badge>
                    </td>
                    <td
                      className="px-4 py-3 cursor-pointer select-none"
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronDown
                          className={`w-4 h-4 text-surface-400 flex-shrink-0 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`}
                        />
                        <span className="font-medium text-surface-900 line-clamp-2">{faq.question}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {faq.hidden ? (
                        <Badge variant="gray">Hidden</Badge>
                      ) : (
                        <Badge variant="green">Visible</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {confirmDeleteId === faq.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-surface-600">Are you sure?</span>
                          <button
                            onClick={() => handleDelete(faq.id)}
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
                            onClick={() => openEdit(faq)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleHidden(faq.id)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50"
                            title={faq.hidden ? 'Show' : 'Hide'}
                          >
                            {faq.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(faq.id)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {openId === faq.id && (
                    <tr key={`${faq.id}-answer`} className="bg-surface-50">
                      <td colSpan={4} className="px-4 py-3 border-t border-surface-100">
                        <p className="text-sm text-surface-600 leading-relaxed">{faq.answer}</p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-surface-500">No FAQs found.</div>
          )}
        </div>
      </div>
      </SpotlightCard>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-surface-900">
                {editItem ? 'Edit FAQ' : 'Add FAQ'}
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
                <label className="block text-sm font-medium text-surface-700 mb-1">Question *</label>
                <textarea
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  className="form-input w-full resize-none"
                  rows={3}
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Answer *</label>
                <textarea
                  value={form.answer}
                  onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  className="form-input w-full resize-none"
                  rows={5}
                  placeholder="Enter the answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                <input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. General, Courses, Career"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary btn">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary btn"
                disabled={!form.question.trim() || !form.answer.trim()}
              >
                {editItem ? 'Save Changes' : 'Add FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
