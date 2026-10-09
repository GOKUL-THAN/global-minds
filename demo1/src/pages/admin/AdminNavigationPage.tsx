import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, GripVertical, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface NavItem {
  id: string;
  label: string;
  href: string;
  section: 'primary' | 'more';
  visible: boolean;
  order: number;
}

const seedItems: NavItem[] = [
  // Primary nav
  { id: 'n1', label: 'Courses', href: '/courses', section: 'primary', visible: true, order: 1 },
  { id: 'n2', label: 'Master Programs', href: '/master-programs', section: 'primary', visible: true, order: 2 },
  { id: 'n3', label: 'Certifications', href: '/certifications', section: 'primary', visible: true, order: 3 },
  { id: 'n4', label: 'Placement', href: '/placement-records', section: 'primary', visible: true, order: 4 },
  { id: 'n5', label: 'Corporate', href: '/corporate-training', section: 'primary', visible: true, order: 5 },
  { id: 'n6', label: 'Colleges', href: '/colleges', section: 'primary', visible: true, order: 6 },
  // More menu
  { id: 'n7', label: 'Batch Schedule', href: '/batch-schedule', section: 'more', visible: true, order: 1 },
  { id: 'n8', label: 'Events', href: '/events', section: 'more', visible: true, order: 2 },
  { id: 'n9', label: 'About', href: '/about', section: 'more', visible: true, order: 3 },
  { id: 'n10', label: 'Blog', href: '/blog', section: 'more', visible: true, order: 4 },
  { id: 'n11', label: 'Contact', href: '/contact', section: 'more', visible: true, order: 5 },
  { id: 'n12', label: 'Trainers', href: '/trainers', section: 'more', visible: true, order: 6 },
  { id: 'n13', label: 'Internships', href: '/internships', section: 'more', visible: true, order: 7 },
  { id: 'n14', label: 'Scholarships', href: '/scholarships', section: 'more', visible: true, order: 8 },
];

const emptyForm = { label: '', href: '', section: 'primary' as 'primary' | 'more', visible: true };

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[]>(seedItems);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<NavItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const primaryItems = items
    .filter(i => i.section === 'primary')
    .sort((a, b) => a.order - b.order);

  const moreItems = items
    .filter(i => i.section === 'more')
    .sort((a, b) => a.order - b.order);

  const openAdd = (section: 'primary' | 'more') => {
    setEditItem(null);
    const sectionItems = items.filter(i => i.section === section);
    setForm({ ...emptyForm, section });
    setShowModal(true);
  };

  const openEdit = (item: NavItem) => {
    setEditItem(item);
    setForm({ label: item.label, href: item.href, section: item.section, visible: item.visible });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.href.trim()) return;
    if (editItem) {
      setItems(prev =>
        prev.map(i =>
          i.id === editItem.id
            ? { ...i, label: form.label, href: form.href, section: form.section, visible: form.visible }
            : i
        )
      );
    } else {
      const sectionItems = items.filter(i => i.section === form.section);
      const maxOrder = sectionItems.length > 0 ? Math.max(...sectionItems.map(i => i.order)) : 0;
      const newItem: NavItem = {
        id: crypto.randomUUID(),
        label: form.label,
        href: form.href,
        section: form.section,
        visible: form.visible,
        order: maxOrder + 1,
      };
      setItems(prev => [...prev, newItem]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirmDeleteId(null);
  };

  const toggleVisible = (id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, visible: !i.visible } : i)));
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const sectionItems = items
      .filter(i => i.section === item.section)
      .sort((a, b) => a.order - b.order);
    const idx = sectionItems.findIndex(i => i.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sectionItems.length) return;
    const swapItem = sectionItems[swapIdx];
    setItems(prev =>
      prev.map(i => {
        if (i.id === id) return { ...i, order: swapItem.order };
        if (i.id === swapItem.id) return { ...i, order: item.order };
        return i;
      })
    );
  };

  const SectionTable = ({
    title,
    sectionItems,
    sectionKey,
  }: {
    title: string;
    sectionItems: NavItem[];
    sectionKey: 'primary' | 'more';
  }) => (
    <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
        <h2 className="font-semibold text-surface-900">{title}</h2>
        <button
          onClick={() => openAdd(sectionKey)}
          className="btn-primary btn flex items-center gap-1.5 text-sm py-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2.5 w-10">#</th>
              <th className="text-left px-4 py-2.5">Label</th>
              <th className="text-left px-4 py-2.5 hidden md:table-cell">Href</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {sectionItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3 text-surface-400">
                  <div className="flex items-center gap-1">
                    <GripVertical className="w-3.5 h-3.5 text-surface-300" />
                    <span>{idx + 1}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-surface-900">{item.label}</td>
                <td className="px-4 py-3 text-surface-500 hidden md:table-cell text-xs font-mono">{item.href}</td>
                <td className="px-4 py-3">
                  {item.visible ? (
                    <Badge variant="green">Visible</Badge>
                  ) : (
                    <Badge variant="gray">Hidden</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-surface-600">Are you sure?</span>
                      <button
                        onClick={() => handleDelete(item.id)}
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
                        onClick={() => moveItem(item.id, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(item.id, 'down')}
                        disabled={idx === sectionItems.length - 1}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleVisible(item.id)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50"
                        title={item.visible ? 'Hide' : 'Show'}
                      >
                        {item.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
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
            {sectionItems.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-surface-400">
                  No items yet. Click "Add Item" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const visiblePrimary = primaryItems.filter(i => i.visible);
  const visibleMore = moreItems.filter(i => i.visible);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">Navigation Menu</h1>
        <p className="text-surface-500 text-sm mt-0.5">
          Changes apply to this session only — no persistence
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionTable
          title="Primary Navigation"
          sectionItems={primaryItems}
          sectionKey="primary"
        />
        <SectionTable
          title="More Menu"
          sectionItems={moreItems}
          sectionKey="more"
        />
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-2xl border border-surface-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-surface-900">Live Preview</h2>
          <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-lg">
            Preview only — changes apply to this session only, reload to reset
          </span>
        </div>
        <nav
          className="flex items-center gap-1 flex-wrap p-3 bg-surface-950 rounded-xl pointer-events-none select-none"
          aria-label="Navigation preview"
        >
          {visiblePrimary.map(item => (
            <a
              key={item.id}
              href="#"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-200 hover:text-white hover:bg-surface-800 transition-colors"
            >
              {item.label}
            </a>
          ))}
          {visibleMore.length > 0 && (
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-200 bg-surface-800 flex items-center gap-1">
              More ▾
              <span className="text-xs text-surface-400 ml-1">({visibleMore.length})</span>
            </span>
          )}
        </nav>
        {visibleMore.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs font-medium text-surface-500 self-center">More menu items:</span>
            {visibleMore.map(item => (
              <span
                key={item.id}
                className="text-xs bg-surface-100 text-surface-600 px-2 py-1 rounded-full"
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-surface-900">
                {editItem ? 'Edit Nav Item' : 'Add Nav Item'}
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
                <label className="block text-sm font-medium text-surface-700 mb-1">Label *</label>
                <input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. Courses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Href *</label>
                <input
                  value={form.href}
                  onChange={e => setForm(f => ({ ...f, href: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. /courses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Section</label>
                <select
                  value={form.section}
                  onChange={e => setForm(f => ({ ...f, section: e.target.value as 'primary' | 'more' }))}
                  className="form-select w-full"
                >
                  <option value="primary">Primary Navigation</option>
                  <option value="more">More Menu</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="nav-visible"
                  checked={form.visible}
                  onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="nav-visible" className="text-sm text-surface-700">
                  Visible
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
                disabled={!form.label.trim() || !form.href.trim()}
              >
                {editItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
