import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Check, ChevronLeft, ChevronRight, Edit2, Eye, EyeOff, Filter, Loader2, Plus, RotateCcw, Search, Send } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';
import { cmsService, type CmsRecord, type CmsStatus } from '../../services/cmsService';

function contentString(content: Record<string, unknown>, field: string, fallback = ''): string {
  return typeof content[field] === 'string' ? content[field] as string : fallback;
}

const PAGE_SIZE = 20;

export default function AdminCoursesPage() {
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CmsStatus>('all');
  const [sortOrder, setSortOrder] = useState<'title-asc' | 'title-desc'>('title-asc');
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);

  const refresh = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setRecords(await cmsService.listAdmin('courses'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load courses from the API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const entries = useMemo(() => {
    return records.map(record => ({ slug: record.slug, content: record.content, record }));
  }, [records]);

  const categories = useMemo(() => Array.from(new Set(
    entries.map(entry => contentString(entry.content, 'category')).filter(Boolean),
  )).sort(), [entries]);
  const levels = useMemo(() => Array.from(new Set(
    entries.map(entry => contentString(entry.content, 'level')).filter(Boolean),
  )).sort(), [entries]);

  const filtered = useMemo(() => entries.filter(entry => {
    const title = contentString(entry.content, 'title', entry.slug);
    const subCategory = contentString(entry.content, 'subCategory');
    const category = contentString(entry.content, 'category');
    const level = contentString(entry.content, 'level');
    const query = search.trim().toLowerCase();
    const instructor = entry.content.instructor && typeof entry.content.instructor === 'object'
      ? (entry.content.instructor as Record<string, unknown>).name
      : '';
    const matchesSearch = !query || [
      title,
      subCategory,
      entry.slug,
      contentString(entry.content, 'shortDescription'),
      contentString(entry.content, 'longDescription'),
      contentString(entry.content, 'level'),
      typeof instructor === 'string' ? instructor : '',
      ...(Array.isArray(entry.content.tags) ? entry.content.tags.filter((tag): tag is string => typeof tag === 'string') : []),
    ].join(' ').toLowerCase().includes(query);
    const matchesCategory = catFilter === 'all' || category === catFilter;
    const matchesLevel = levelFilter === 'all' || level === levelFilter;
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'draft' && (entry.record.status === 'draft' || entry.record.hasDraft))
      || entry.record.status === statusFilter;
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  }).sort((first, second) => {
    const firstTitle = contentString(first.content, 'title', first.slug);
    const secondTitle = contentString(second.content, 'title', second.slug);
    return sortOrder === 'title-asc'
      ? firstTitle.localeCompare(secondTitle)
      : secondTitle.localeCompare(firstTitle);
  }), [entries, search, catFilter, levelFilter, statusFilter, sortOrder]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageEntries = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, catFilter, levelFilter, statusFilter, sortOrder]);

  const updateStatus = async (record: CmsRecord, action: 'publish' | 'unpublish' | 'archive' | 'restore') => {
    setError('');
    setNotice('');
    setBusySlug(record.slug);
    try {
      if (action === 'publish') await cmsService.publish('courses', record.slug);
      else if (action === 'unpublish') await cmsService.unpublish('courses', record.slug);
      else if (action === 'archive') await cmsService.archive('courses', record.slug);
      else await cmsService.restore('courses', record.slug);
      setNotice(`Course "${contentString(record.content, 'title', record.slug)}" ${
        action === 'publish' ? 'published' : action === 'unpublish' ? 'unpublished' : action === 'archive' ? 'archived' : 'restored'
      }.`);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update course status.');
    } finally {
      setBusySlug('');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold mb-2">
            <ShinyText text="Courses Database Management" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Courses</h1>
          <p className="text-surface-500 text-sm mt-0.5">{entries.length} database courses.</p>
        </div>
        <Link to="/admin/studio?section=courses&new=1" className="btn-primary btn flex items-center gap-2" title="Create a course in Content Studio">
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

      <SpotlightCard className="bg-white rounded-2xl border border-surface-200 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search courses..." className="form-input pl-9" aria-label="Search courses" />
        </div>
        <div className="flex items-center gap-2">
          <Filter aria-hidden="true" className="w-4 h-4 text-surface-400" />
          <select value={catFilter} onChange={event => setCatFilter(event.target.value)} className="form-select min-w-[160px]" aria-label="Filter by category">
            <option value="all">All Categories</option>
            {categories.map(category => <option key={category} value={category}>{category.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}</option>)}
          </select>
        </div>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'all' | CmsStatus)} className="form-select sm:w-40" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select value={levelFilter} onChange={event => setLevelFilter(event.target.value)} className="form-select sm:w-40" aria-label="Filter by level">
          <option value="all">All levels</option>
          {levels.map(level => <option key={level} value={level}>{level}</option>)}
        </select>
        <select value={sortOrder} onChange={event => setSortOrder(event.target.value as typeof sortOrder)} className="form-select sm:w-40" aria-label="Sort courses">
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
        </select>
        <p className="text-sm text-surface-500 flex items-center" aria-live="polite">{filtered.length} results</p>
      </SpotlightCard>

      <SpotlightCard className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        {loading
          ? <div className="flex items-center justify-center gap-2 py-12 text-surface-500"><Loader2 className="w-5 h-5 animate-spin" /> Loading courses...</div>
          : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-surface-600">Course</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Category</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-surface-600 hidden lg:table-cell">Level</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-surface-600">Status</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-surface-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {pageEntries.map(entry => {
                  const { record } = entry;
                  const title = contentString(entry.content, 'title', entry.slug);
                  const thumbnail = contentString(entry.content, 'thumbnail');
                  const hasPublishedDraft = record.status === 'published' && record.hasDraft;
                  const displayedStatus = hasPublishedDraft ? 'published · draft changes' : record.status;
                  const badgeVariant = record.status === 'draft'
                    ? 'yellow'
                    : record.status === 'published' ? 'green' : 'gray';
                  return (
                    <tr key={entry.slug} className="hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {thumbnail && <img src={thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />}
                          <div>
                            <p className="font-medium text-surface-900 line-clamp-1">{title}</p>
                            <p className="text-xs text-surface-400">{entry.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {contentString(entry.content, 'category')
                          ? <Badge variant="brand" className="text-xs">{contentString(entry.content, 'category').replace(/-/g, ' ')}</Badge>
                          : <span className="text-surface-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-surface-600 hidden lg:table-cell">{contentString(entry.content, 'level') || '—'}</td>
                      <td className="px-4 py-3"><Badge variant={badgeVariant}>{displayedStatus}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {record.status === 'published' && (
                            <a href={`/courses/${entry.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50" aria-label={`View ${title} on website`}>
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                          <Link to={`/admin/studio?section=courses&slug=${encodeURIComponent(entry.slug)}`} className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50" aria-label={`Edit ${title}`}>
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          {record.status === 'archived'
                            ? <button type="button" disabled={busySlug === record.slug} onClick={() => void updateStatus(record, 'restore')} className="p-1.5 rounded-lg text-surface-400 hover:text-green-600 disabled:opacity-50" aria-label={`Restore ${title}`}><RotateCcw className="w-4 h-4" /></button>
                            : <>
                              {record.status === 'published' && (
                                <button type="button" disabled={busySlug === record.slug} onClick={() => void updateStatus(record, 'unpublish')} className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 disabled:opacity-50" aria-label={`Unpublish ${title}`}>
                                  <EyeOff className="w-4 h-4" />
                                </button>
                              )}
                              {record.status === 'published' && !record.hasDraft
                                ? <button type="button" disabled={busySlug === record.slug} onClick={() => void updateStatus(record, 'archive')} className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 disabled:opacity-50" aria-label={`Archive ${title}`}><Archive className="w-4 h-4" /></button>
                                : <button type="button" disabled={busySlug === record.slug} onClick={() => void updateStatus(record, 'publish')} className="p-1.5 rounded-lg text-surface-400 hover:text-green-600 disabled:opacity-50" aria-label={`Publish ${title}`}>
                                  {busySlug === record.slug ? <Loader2 className="w-4 h-4 animate-spin" /> : hasPublishedDraft ? <Send className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </button>}
                            </>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12"><p className="text-surface-500">No courses match your filters.</p></div>}
          </div>}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-3 border-t border-surface-100 px-4 py-3">
            <p className="text-sm text-surface-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={currentPage === 1} onClick={() => setPage(value => Math.max(1, value - 1))}
                className="btn-secondary btn-sm inline-flex items-center gap-1 disabled:opacity-50" aria-label="Previous course page">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}
                className="btn-secondary btn-sm inline-flex items-center gap-1 disabled:opacity-50" aria-label="Next course page">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </SpotlightCard>

      <p className="text-xs text-surface-400">
        Editing a built-in course creates a CMS draft; saved CMS records override built-in course details on the public catalog.
      </p>
    </div>
  );
}
