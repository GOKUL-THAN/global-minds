import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Archive, Check, FileText, Plus, RotateCcw, Save, Send, Trash2 } from 'lucide-react';
import { cmsSections, cmsSeeds, type CmsSection } from '../../data/cmsSeeds';
import { cmsService, type CmsRecord, type CmsStatus } from '../../services/cmsService';
import type { User } from '../../types';
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';

interface StudioEntry {
  slug: string;
  content: Record<string, unknown>;
  record?: CmsRecord;
}

function slugify(value: string): string {
  return value.toLowerCase().trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function asContent(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : { value };
}

function staticEntries(section: CmsSection): StudioEntry[] {
  return (cmsSeeds[section] ?? []).flatMap((value, index) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const item = value as Record<string, unknown>;
    const key = [item.slug, item.id, item.name, item.title, item.question]
      .find(part => typeof part === 'string' && part.trim());
    const slug = slugify(typeof key === 'string' ? key : `item-${index + 1}`);
    return slug ? [{ slug, content: item }] : [];
  });
}

function newRecordTemplate(section: CmsSection): string {
  if (section === 'courses') {
    return JSON.stringify({
      title: 'New Course',
      category: 'programming',
      subCategory: '',
      level: 'Beginner',
      duration: '',
      shortDescription: '',
      longDescription: '',
      thumbnail: '',
      price: 0,
      discountPrice: 0,
      currency: 'INR',
      modules: [{ id: 'module-1', title: 'Module 1', topics: ['Add a topic'] }],
    }, null, 2);
  }
  return '{}';
}

function statusLabel(record?: CmsRecord): string {
  if (!record) return 'Static seed · not saved';
  return record.status === 'published' && record.hasDraft
    ? 'Published · draft changes'
    : record.status;
}

const statusStyles: Record<CmsStatus, string> = {
  draft: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-surface-200 text-surface-700',
};

export default function AdminContentStudioPage() {
  const user = useOutletContext<User>();
  const { section: routeSection } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedSection = cmsSections.find(item => item.id === (routeSection ?? searchParams.get('section')))?.id;
  const [section, setSection] = useState<CmsSection>(requestedSection ?? 'courses');
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [recordSearch, setRecordSearch] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [editor, setEditor] = useState('{}');
  const [savedSlug, setSavedSlug] = useState('');
  const [savedEditor, setSavedEditor] = useState('{}');
  const [statusFilter, setStatusFilter] = useState<'all' | CmsStatus>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const newRequestHandled = useRef(false);
  const hasUnsavedChanges = editor !== savedEditor || slugInput !== savedSlug;

  const refresh = useCallback(async (nextSection = section) => {
    setLoading(true);
    setError('');
    try {
      setRecords(await cmsService.listAdmin(nextSection));
    } catch (cause) {
      setRecords([]);
      setError(cause instanceof Error ? cause.message : 'Unable to load CMS records.');
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    const validRouteSection = cmsSections.find(item => item.id === routeSection)?.id;
    if (validRouteSection && validRouteSection !== section) setSection(validRouteSection);
  }, [routeSection, section]);

  useEffect(() => {
    setSelectedSlug('');
    setSlugInput('');
    setEditor('{}');
    setNotice('');
    void refresh(section);
  }, [section, refresh]);

  const entries = useMemo(() => {
    const staticItems = staticEntries(section);
    const known = new Set<string>();
    const merged: StudioEntry[] = records.map(record => {
      known.add(record.slug);
      return { slug: record.slug, content: record.content, record };
    });
    for (const item of staticItems) {
      if (!known.has(item.slug)) merged.push(item);
    }
    return merged.filter(item => {
      const query = recordSearch.trim().toLowerCase();
      const searchable = `${item.slug} ${String(item.content.title ?? '')} ${String(item.content.name ?? '')} ${String(item.content.category ?? '')} ${String(item.content.id ?? '')}`.toLowerCase();
      if (query && !searchable.includes(query)) return false;
      if (statusFilter === 'all') return true;
      if (!item.record) return statusFilter === 'draft';
      if (statusFilter === 'draft') return item.record.status === 'draft'
        || (item.record.status === 'published' && item.record.hasDraft);
      return item.record.status === statusFilter;
    });
  }, [records, section, statusFilter, recordSearch]);

  const selected = entries.find(item => item.slug === selectedSlug);
  const courseDraft = useMemo(() => {
    if (section !== 'courses') return {};
    try {
      const value: unknown = JSON.parse(editor);
      return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
    } catch {
      return {};
    }
  }, [editor, section]);

  const updateCourseField = (field: string, value: string | number) => {
    setEditor(JSON.stringify({ ...courseDraft, [field]: value }, null, 2));
  };

  const updateInstructorField = (field: string, value: string) => {
    const instructor = courseDraft.instructor && typeof courseDraft.instructor === 'object'
      && !Array.isArray(courseDraft.instructor)
      ? courseDraft.instructor as Record<string, unknown>
      : {};
    setEditor(JSON.stringify({
      ...courseDraft,
      instructor: { ...instructor, [field]: value },
    }, null, 2));
  };

  useEffect(() => {
    if (!selected) return;
    const content = JSON.stringify(selected.content, null, 2);
    setSlugInput(selected.slug);
    setSavedSlug(selected.slug);
    setEditor(content);
    setSavedEditor(content);
  }, [selectedSlug, selected]);

  useEffect(() => {
    const requestedSlug = searchParams.get('slug');
    if (section === 'courses' && !selectedSlug && requestedSlug
      && entries.some(item => item.slug === requestedSlug)) {
      setSelectedSlug(requestedSlug);
    }
  }, [entries, searchParams, section, selectedSlug]);

  const startNew = useCallback((confirmDiscard = true) => {
    if (confirmDiscard && hasUnsavedChanges && !window.confirm('Discard your unsaved course changes?')) return;
    setSelectedSlug('');
    setSlugInput('');
    const content = newRecordTemplate(section);
    setEditor(content);
    setSavedEditor(content);
    setSavedSlug('');
    setNotice('');
  }, [hasUnsavedChanges, section]);

  useEffect(() => {
    if (searchParams.get('new') === '1' && !loading && !newRequestHandled.current) {
      newRequestHandled.current = true;
      startNew();
    }
  }, [loading, searchParams, startNew]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasUnsavedChanges]);

  const runAction = async (action: 'save' | 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete') => {
    setError('');
    setNotice('');
    if (action === 'unpublish' && hasUnsavedChanges
      && !window.confirm('Unpublish the last saved version and discard your unsaved editor changes?')) return;
    let content: Record<string, unknown> | undefined;
    if (action !== 'delete' && action !== 'restore' && action !== 'unpublish') {
      try {
        const parsed: unknown = JSON.parse(editor);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
        content = asContent(parsed);
      } catch {
        setError('Content must be valid JSON with an object at the top level.');
        return;
      }
    }
    const title = typeof content?.title === 'string' ? content.title : '';
    const slug = slugify(slugInput || (section === 'courses' ? title : ''));
    if (!slug) {
      setError('Enter a slug using lowercase letters, numbers, hyphens, or underscores.');
      return;
    }
    if (section === 'courses') {
      if (title.trim().length < 2 || title.trim().length > 160) {
        setError('Course title must be between 2 and 160 characters.');
        return;
      }
      if (typeof content?.category !== 'string' || !/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(content.category)) {
        setError('Enter a valid category slug, such as cloud-computing.');
        return;
      }
      if (typeof content.price !== 'number' || !Number.isFinite(content.price) || content.price < 0
        || typeof content.discountPrice !== 'number' || !Number.isFinite(content.discountPrice)
        || content.discountPrice < 0 || content.discountPrice > content.price) {
        setError('Enter valid prices. The discount price must be zero or less than or equal to the full price.');
        return;
      }
      if (action === 'publish'
        && (!content.shortDescription || typeof content.shortDescription !== 'string' || !content.shortDescription.trim()
          || !content.longDescription || typeof content.longDescription !== 'string' || !content.longDescription.trim()
          || !content.duration || typeof content.duration !== 'string' || !content.duration.trim()
          || !content.thumbnail || typeof content.thumbnail !== 'string' || !content.thumbnail.trim()
          || !Array.isArray(content.modules) || content.modules.length === 0)) {
        setError('To publish, provide the short and full descriptions, duration, thumbnail, and at least one module.');
        return;
      }
    }
    if (action === 'delete' && !window.confirm(`Permanently delete "${slug}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      if (action === 'delete') {
        await cmsService.remove(section, slug);
        setNotice(`Permanently deleted ${slug}.`);
        startNew(false);
      } else if (action === 'restore') {
        const record = await cmsService.restore(section, slug);
        const contentJson = JSON.stringify(record.content, null, 2);
        setSelectedSlug(record.slug);
        setSlugInput(record.slug);
        setSavedSlug(record.slug);
        setEditor(contentJson);
        setSavedEditor(contentJson);
        setNotice('Record restored.');
      } else if (action === 'unpublish') {
        const record = await cmsService.unpublish(section, slug);
        const contentJson = JSON.stringify(record.content, null, 2);
        setSelectedSlug(record.slug);
        setSlugInput(record.slug);
        setSavedSlug(record.slug);
        setEditor(contentJson);
        setSavedEditor(contentJson);
        setNotice('Record unpublished and saved as a draft.');
      } else {
        let record = selected?.record
          ? await cmsService.update(section, slug, content!)
          : await cmsService.create(section, slug, content!);
        if (action === 'publish') record = await cmsService.publish(section, slug);
        if (action === 'archive') {
          if (!record.publishedContent) await cmsService.publish(section, slug);
          record = await cmsService.archive(section, slug);
        }
        const contentJson = JSON.stringify(record.content, null, 2);
        setSelectedSlug(record.slug);
        setSlugInput(record.slug);
        setSavedSlug(record.slug);
        setEditor(contentJson);
        setSavedEditor(contentJson);
        setNotice(action === 'save' ? 'Draft saved.' : `Record ${action === 'publish' ? 'published' : 'archived'}.`);
      }
      await refresh(section);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'CMS operation failed.');
    } finally {
      setBusy(false);
    }
  };

  const seedOnlySections = ['students', 'enquiries', 'batches', 'payments', 'certificates'];
  const selectedStatus = selected?.record?.status;
  const instructorDraft = courseDraft.instructor && typeof courseDraft.instructor === 'object'
    && !Array.isArray(courseDraft.instructor)
    ? courseDraft.instructor as Record<string, unknown>
    : {};

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display font-bold text-2xl text-surface-900">Content Studio</h1>
        <p className="mt-1 text-sm text-surface-500">
          Edit website content as drafts, publish explicitly, or archive to hide it from public pages.
        </p>
      </header>

      {seedOnlySections.includes(section) && (
        <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            This CMS section has no demo rows. {section === 'enquiries'
              ? 'Submitted enquiries remain in the separate Enquiries screen and are not copied into CMS records.'
              : 'No student, batch, finance, or other admin mock data is seeded here.'}
          </p>
        </div>
      )}

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
        <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
          <div className="space-y-3 border-b border-surface-100 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-surface-500" htmlFor="cms-section">Section</label>
            <select id="cms-section" className="form-select" value={section} onChange={event => {
              const nextSection = event.target.value as CmsSection;
              if (routeSection) navigate(`/admin/website/${nextSection}`);
              else setSection(nextSection);
            }}>
              {cmsSections.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <label className="sr-only" htmlFor="cms-search">Search CMS records</label>
            <input id="cms-search" type="search" className="form-input" value={recordSearch}
              onChange={event => setRecordSearch(event.target.value)} placeholder="Search title, slug, category or ID" />
            <div className="flex items-center gap-2">
              <select aria-label="Filter records by status" className="form-select flex-1" value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}>
                <option value="all">All records</option>
                <option value="draft">Drafts / unsaved seeds</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <button type="button" onClick={() => startNew()} className="btn-primary btn inline-flex shrink-0 items-center gap-2 text-sm">
                <Plus className="h-4 w-4" /> New
              </button>
            </div>
          </div>
          <div className="max-h-[65vh] overflow-y-auto p-2">
            {loading ? <p className="p-4 text-sm text-surface-500">Loading records…</p> : entries.length === 0 ? (
              <p className="p-4 text-sm text-surface-500">No records in this section yet. Create one with New.</p>
            ) : entries.map(item => (
              <button key={item.slug} type="button" onClick={() => {
                if (hasUnsavedChanges && !window.confirm('Discard your unsaved course changes?')) return;
                setSelectedSlug(item.slug);
              }}
                className={`mb-1 w-full rounded-xl p-3 text-left transition-colors ${selectedSlug === item.slug ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-surface-50'}`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-sm text-surface-900">{item.slug}</span>
                  {item.record
                    ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyles[item.record.status]}`}>{statusLabel(item.record)}</span>
                    : <span className="shrink-0 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-600">STATIC SEED</span>}
                </span>
                <span className="mt-1 block truncate text-xs text-surface-500">
                  {typeof item.content.title === 'string' ? item.content.title : typeof item.content.name === 'string' ? item.content.name : 'JSON content'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-surface-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-100 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600" />
              <h2 className="font-semibold text-surface-900">{selected ? `Edit ${selected.slug}` : 'Create content record'}</h2>
            </div>
            {selected?.record && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${statusStyles[selected.record.status]}`}>
                {statusLabel(selected.record)}
              </span>
            )}
          </div>
          <div className="space-y-4 p-4">
            <div>
              <label htmlFor="cms-slug" className="mb-1.5 block text-sm font-medium text-surface-700">Slug</label>
              <input id="cms-slug" className="form-input font-mono" value={slugInput}
                disabled={Boolean(selected)}
                onChange={event => setSlugInput(event.target.value)} placeholder="my-content-item" maxLength={120} />
              <p className="mt-1 text-xs text-surface-400">Unique within section; lowercase letters, numbers, hyphens and underscores only.</p>
            </div>
            {section === 'courses' && (
              <fieldset className="grid gap-4 rounded-xl border border-surface-200 p-4 sm:grid-cols-2">
                <legend className="px-1 text-sm font-semibold text-surface-700">Course details</legend>
                <label className="text-sm font-medium text-surface-700">
                  Course title <span aria-hidden="true" className="text-red-600">*</span>
                  <input className="form-input mt-1.5" value={typeof courseDraft.title === 'string' ? courseDraft.title : ''}
                    onChange={event => updateCourseField('title', event.target.value)} maxLength={160} required />
                </label>
                <label className="text-sm font-medium text-surface-700">
                  Category slug <span aria-hidden="true" className="text-red-600">*</span>
                  <input className="form-input mt-1.5" value={typeof courseDraft.category === 'string' ? courseDraft.category : ''}
                    onChange={event => updateCourseField('category', event.target.value)} placeholder="cloud-computing" maxLength={120} required />
                </label>
                <label className="text-sm font-medium text-surface-700">
                  Subcategory
                  <input className="form-input mt-1.5" value={typeof courseDraft.subCategory === 'string' ? courseDraft.subCategory : ''}
                    onChange={event => updateCourseField('subCategory', event.target.value)} />
                </label>
                <label className="text-sm font-medium text-surface-700">
                  Level
                  <select className="form-select mt-1.5" value={typeof courseDraft.level === 'string' ? courseDraft.level : 'Beginner'}
                    onChange={event => updateCourseField('level', event.target.value)}>
                    {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(level => <option key={level}>{level}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-surface-700">
                  Duration <span aria-hidden="true" className="text-red-600">*</span>
                  <input className="form-input mt-1.5" value={typeof courseDraft.duration === 'string' ? courseDraft.duration : ''}
                    onChange={event => updateCourseField('duration', event.target.value)} placeholder="40 Hours" maxLength={120} required />
                </label>
                <label className="text-sm font-medium text-surface-700">
                  Thumbnail URL
                  <input type="url" className="form-input mt-1.5" value={typeof courseDraft.thumbnail === 'string' ? courseDraft.thumbnail : ''}
                    onChange={event => updateCourseField('thumbnail', event.target.value)} />
                </label>
                <label className="text-sm font-medium text-surface-700 sm:col-span-2">
                  Short description <span aria-hidden="true" className="text-red-600">*</span>
                  <textarea className="form-input mt-1.5 min-h-20" value={typeof courseDraft.shortDescription === 'string' ? courseDraft.shortDescription : ''}
                    onChange={event => updateCourseField('shortDescription', event.target.value)} maxLength={500} required />
                </label>
                <label className="text-sm font-medium text-surface-700 sm:col-span-2">
                  Full description <span aria-hidden="true" className="text-red-600">*</span>
                  <textarea className="form-input mt-1.5 min-h-28" value={typeof courseDraft.longDescription === 'string' ? courseDraft.longDescription : ''}
                    onChange={event => updateCourseField('longDescription', event.target.value)} maxLength={20000} required />
                </label>
                <label className="text-sm font-medium text-surface-700">
                  Price
                  <input type="number" min="0" className="form-input mt-1.5" value={typeof courseDraft.price === 'number' ? courseDraft.price : 0}
                    onChange={event => updateCourseField('price', Number(event.target.value))} />
                </label>
                <label className="text-sm font-medium text-surface-700">
                  Discount price
                  <input type="number" min="0" className="form-input mt-1.5" value={typeof courseDraft.discountPrice === 'number' ? courseDraft.discountPrice : 0}
                    onChange={event => updateCourseField('discountPrice', Number(event.target.value))} />
                </label>
              </fieldset>
            )}
            {section === 'courses' && (
              <fieldset className="grid gap-4 rounded-xl border border-surface-200 p-4 sm:grid-cols-2">
                <legend className="px-1 text-sm font-semibold text-surface-700">Trainer and discoverability</legend>
                <label className="text-sm font-medium text-surface-700">
                  Trainer name
                  <input className="form-input mt-1.5"
                    value={typeof instructorDraft.name === 'string' ? instructorDraft.name : ''}
                    onChange={event => updateInstructorField('name', event.target.value)} maxLength={160} />
                </label>
                <label className="text-sm font-medium text-surface-700">
                  Trainer designation
                  <input className="form-input mt-1.5"
                    value={typeof instructorDraft.designation === 'string' ? instructorDraft.designation : ''}
                    onChange={event => updateInstructorField('designation', event.target.value)} maxLength={160} />
                </label>
                {([
                  ['learningObjectives', 'Learning objectives'],
                  ['prerequisites', 'Prerequisites'],
                  ['tags', 'Search tags'],
                ] as const).map(([field, label]) => (
                  <label key={field} className="text-sm font-medium text-surface-700">
                    {label} <span className="font-normal text-surface-400">(one per line)</span>
                    <textarea className="form-input mt-1.5 min-h-20"
                      value={Array.isArray(courseDraft[field])
                        ? courseDraft[field].filter((item): item is string => typeof item === 'string').join('\n')
                        : ''}
                      onChange={event => {
                        const values = event.target.value.split('\n');
                        setEditor(JSON.stringify({ ...courseDraft, [field]: values }, null, 2));
                      }}
                      maxLength={5000} />
                  </label>
                ))}
              </fieldset>
            )}
            <div>
              <label htmlFor="cms-json" className="mb-1.5 block text-sm font-medium text-surface-700">Content JSON</label>
              <textarea id="cms-json" value={editor} onChange={event => setEditor(event.target.value)}
                className="min-h-[360px] w-full rounded-xl border border-surface-200 bg-surface-950 p-4 font-mono text-xs leading-5 text-green-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                spellCheck={false} />
              <p className="mt-1 text-xs text-surface-400">
                {section === 'courses'
                  ? 'Edit modules, topics, skills, pricing options and other advanced course data here. Saving creates a draft; publishing makes it live.'
                  : 'Top-level JSON object; API limit is 64 KB. Static seeds become server records when saved.'}
              </p>
            </div>
            {selected?.record && (
              <dl className="grid gap-x-5 gap-y-1 rounded-xl bg-surface-50 p-3 text-xs sm:grid-cols-2">
                <div><dt className="inline text-surface-500">Created by: </dt><dd className="inline text-surface-700">{selected.record.createdBy} ({selected.record.createdRole})</dd></div>
                <div><dt className="inline text-surface-500">Updated by: </dt><dd className="inline text-surface-700">{selected.record.updatedBy} ({selected.record.updatedRole})</dd></div>
                <div><dt className="inline text-surface-500">Created: </dt><dd className="inline text-surface-700">{new Date(selected.record.createdAt).toLocaleString()}</dd></div>
                <div><dt className="inline text-surface-500">Published: </dt><dd className="inline text-surface-700">{selected.record.publishedAt ? new Date(selected.record.publishedAt).toLocaleString() : 'Never'}</dd></div>
              </dl>
            )}
            <div className="flex flex-wrap gap-2 border-t border-surface-100 pt-4">
              {section === 'courses' && (
                <Link to="/admin/courses" onClick={event => {
                  if (hasUnsavedChanges && !window.confirm('Discard your unsaved course changes?')) event.preventDefault();
                }} className="btn-secondary btn inline-flex items-center gap-2 text-sm">
                  Cancel
                </Link>
              )}
              {selectedStatus !== 'archived' && (
                <button type="button" disabled={busy} onClick={() => void runAction('save')} className="btn-secondary btn inline-flex items-center gap-2 text-sm">
                  <Save className="h-4 w-4" /> Save draft
                </button>
              )}
              {selectedStatus !== 'archived' && (
                <>
                  <button type="button" disabled={busy} onClick={() => void runAction('publish')} className="btn-primary btn inline-flex items-center gap-2 text-sm">
                    <Send className="h-4 w-4" /> Publish
                  </button>
                  <button type="button" disabled={busy || !slugInput} onClick={() => void runAction('archive')} className="btn-secondary btn inline-flex items-center gap-2 text-sm">
                    <Archive className="h-4 w-4" /> Archive
                  </button>
                  {selectedStatus === 'published' && (
                    <button type="button" disabled={busy} onClick={() => void runAction('unpublish')} className="btn-secondary btn inline-flex items-center gap-2 text-sm">
                      <RotateCcw className="h-4 w-4" /> Unpublish
                    </button>
                  )}
                </>
              )}
              {selectedStatus === 'archived' && (
                <button type="button" disabled={busy} onClick={() => void runAction('restore')} className="btn-secondary btn inline-flex items-center gap-2 text-sm">
                  <RotateCcw className="h-4 w-4" /> Restore
                </button>
              )}
              {user.role === 'SUPER_ADMIN' && selected?.record && (
                <button type="button" disabled={busy} onClick={() => void runAction('delete')} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Delete permanently
                </button>
              )}
              {selected?.record?.status === 'published' && !selected.record.hasDraft && (
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-green-700"><Check className="h-4 w-4" /> Live on website</span>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
