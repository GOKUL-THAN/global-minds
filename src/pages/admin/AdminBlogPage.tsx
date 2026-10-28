import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Plus, Edit2, Trash2, Search, Calendar, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
import type { BlogPost } from '../../types';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

type LocalPost = BlogPost & { status: 'published' | 'draft' };

type StatusFilter = 'all' | 'published' | 'draft';

const emptyForm = {
  title: '',
  slug: '',
  category: '',
  authorName: '',
  excerpt: '',
  status: 'published' as 'published' | 'draft',
};

function deriveSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<LocalPost[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LocalPost | null>(null);
  const [form, setForm] = useState(emptyForm);

  const categories = ['all', ...Array.from(new Set(items.map(p => p.category).filter(Boolean)))];

  const filtered = items.filter(p => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (post: LocalPost) => {
    setEditItem(post);
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      authorName: post.author.name,
      excerpt: post.excerpt,
      status: post.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const slug = form.slug.trim() || deriveSlug(form.title);
    if (editItem) {
      setItems(prev =>
        prev.map(p =>
          p.id === editItem.id
            ? {
                ...p,
                title: form.title,
                slug,
                category: form.category,
                author: { ...p.author, name: form.authorName },
                excerpt: form.excerpt,
                status: form.status,
              }
            : p
        )
      );
    } else {
      const newPost: LocalPost = {
        id: crypto.randomUUID(),
        slug,
        title: form.title,
        category: form.category,
        author: { name: form.authorName, photo: '', role: '' },
        excerpt: form.excerpt,
        content: '',
        tags: [],
        featuredImage: '',
        readTime: '',
        featured: false,
        publishedAt: new Date().toISOString().split('T')[0],
        status: form.status,
      };
      setItems(prev => [newPost, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id));
    setConfirmDeleteId(null);
  };

  const toggleStatus = (id: string) => {
    setItems(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, status: p.status === 'published' ? 'draft' : 'published' }
          : p
      )
    );
  };

  const counts = {
    all: items.length,
    published: items.filter(p => p.status === 'published').length,
    draft: items.filter(p => p.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">
            <ShinyText text="Blog" shinyColor="rgba(23, 108, 115, 0.9)" />
          </h1>
          <p className="text-surface-500 text-sm mt-0.5 font-medium">
            {counts.published} published · {counts.draft} drafts
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..."
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
        </div>
        <div className="flex gap-1.5">
          {(['all', 'published', 'draft'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {s === 'all' ? `All (${counts.all})` : s === 'published' ? `Published (${counts.published})` : `Drafts (${counts.draft})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <SpotlightCard>
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Post</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden lg:table-cell">Author</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(post => (
                <tr key={post.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.featuredImage}
                        alt=""
                        className="w-12 h-10 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-medium text-surface-900 line-clamp-1">{post.title}</p>
                        <p className="text-xs text-surface-400">{post.readTime}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="brand">{post.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-surface-600 hidden lg:table-cell">{post.author.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-surface-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.publishedAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {post.status === 'published' ? (
                      <Badge variant="green">Published</Badge>
                    ) : (
                      <Badge variant="yellow">Draft</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {confirmDeleteId === post.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-surface-600">Are you sure?</span>
                        <button
                          onClick={() => handleDelete(post.id)}
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
                        <Link to={`/blog/${post.slug}`} target="_blank">
                          <button className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => openEdit(post)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(post.id)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50"
                          title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(post.id)}
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
            <div className="text-center py-12 text-surface-500">No posts found.</div>
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
                {editItem ? 'Edit Post' : 'New Post'}
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
                  placeholder="Post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Slug <span className="text-surface-400 font-normal">(auto-derived if blank)</span>
                </label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="form-input w-full"
                  placeholder={form.title ? deriveSlug(form.title) : 'post-slug'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                <input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. Technology, Career"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Author Name</label>
                <input
                  value={form.authorName}
                  onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                  className="form-input w-full"
                  placeholder="Author's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  className="form-input w-full resize-none"
                  rows={3}
                  placeholder="Short summary of the post"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as 'published' | 'draft' }))}
                  className="form-select w-full"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
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
                disabled={!form.title.trim()}
              >
                {editItem ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
