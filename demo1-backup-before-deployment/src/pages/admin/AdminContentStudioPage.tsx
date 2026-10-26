import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AlertTriangle, Archive, Check, FileText, Plus, RotateCcw, Save, Send, Trash2, X } from 'lucide-react';
import { cmsSections, type CmsSection } from '../../data/cmsSeeds';
import { cmsService, type CmsRecord, type CmsStatus } from '../../services/cmsService';
import type { User } from '../../types';
import { Link, Navigate, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';

interface StudioEntry {
  slug: string;
  content: Record<string, unknown>;
  record: CmsRecord;
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

function newRecordTemplate(section: CmsSection): Record<string, unknown> {
  if (section === 'courses') {
    return {
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
      modules: [{ id: 'module-1', title: 'Module 1', duration: '', topics: ['Add a topic'] }],
    };
  }
  return {};
}

function statusLabel(record: CmsRecord): string {
  return record.status === 'published' && record.hasDraft
    ? 'Published · draft changes'
    : record.status;
}

const statusStyles: Record<CmsStatus, string> = {
  draft: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-surface-200 text-surface-700',
};

type ContentPath = Array<string | number>;

function setContentValue(
  content: Record<string, unknown>,
  path: ContentPath,
  value: unknown,
): Record<string, unknown> {
  const [key, ...rest] = path;
  if (key === undefined) return content;
  if (rest.length === 0) return { ...content, [key]: value };
  const current = content[key];
  if (Array.isArray(current)) {
    const index = rest[0];
    if (typeof index !== 'number') return content;
    const next = [...current];
    next[index] = rest.length === 1
      ? value
      : setContentValue(asContent(current[index]), rest.slice(1), value);
    return { ...content, [key]: next };
  }
  return {
    ...content,
    [key]: setContentValue(asContent(current), rest, value),
  };
}

function removeContentValue(content: Record<string, unknown>, path: ContentPath): Record<string, unknown> {
  const [key, ...rest] = path;
  if (key === undefined) return content;
  if (rest.length === 0) {
    const next = { ...content };
    delete next[key];
    return next;
  }
  const current = content[key];
  if (Array.isArray(current)) {
    const index = rest[0];
    if (typeof index !== 'number' || rest.length !== 1) return content;
    return { ...content, [key]: current.filter((_, itemIndex) => itemIndex !== index) };
  }
  return { ...content, [key]: removeContentValue(asContent(current), rest) };
}

function createEmptyValue(valueType: string): unknown {
  if (valueType === 'number') return 0;
  if (valueType === 'boolean') return false;
  if (valueType === 'array') return [];
  if (valueType === 'object') return {};
  return '';
}

function isImageFieldName(name: string): boolean {
  return /(image|thumbnail|banner|photo|avatar|icon|logo|file|picture|cover)/i.test(name);
}

function fieldNameForType(name: string, type: string): string {
  return type === 'image' && !isImageFieldName(name) ? `${name}Image` : name;
}

function emptyLike(value: unknown): unknown {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, emptyLike(child)]));
  }
  return typeof value === 'number' ? 0 : typeof value === 'boolean' ? false : '';
}

function StructuredContentFields({
  value,
  path = [],
  restrictedFields,
  onChange,
}: {
  value: Record<string, unknown>;
  path?: ContentPath;
  restrictedFields?: ReadonlySet<string>;
  onChange: (path: ContentPath, next: unknown) => void;
}) {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const entries = Object.entries(value).filter(([name]) => !restrictedFields?.has(name.toLowerCase()));

  const addField = () => {
    const name = fieldNameForType(newFieldName.trim(), newFieldType);
    if (!name || Object.prototype.hasOwnProperty.call(value, name)
      || restrictedFields?.has(name.toLowerCase())) return;
    onChange([...path, name], createEmptyValue(newFieldType === 'image' ? 'text' : newFieldType));
    setNewFieldName('');
  };

  return (
    <div className="space-y-3">
      {entries.map(([name, fieldValue]) => (
        <div key={name} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <StructuredContentField name={name} value={fieldValue} path={[...path, name]} restrictedFields={restrictedFields} onChange={onChange} />
          <button type="button" onClick={() => onChange(path, removeContentValue(value, [name]))}
            aria-label={`Remove ${name}`} title={`Remove ${name}`}
            className="self-start rounded-lg p-2 text-surface-500 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-end gap-2 border-t border-surface-100 pt-3">
        <label className="min-w-40 flex-1 text-xs font-medium text-surface-600">
          Add field
          <input className="form-input mt-1" value={newFieldName} onChange={event => setNewFieldName(event.target.value)} placeholder="Field name" />
        </label>
        <label className="text-xs font-medium text-surface-600">
          Type
          <select className="form-select mt-1" value={newFieldType} onChange={event => setNewFieldType(event.target.value)}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Yes / no</option>
            <option value="array">List</option>
            <option value="object">Group</option>
            <option value="image">Image</option>
          </select>
        </label>
        <button type="button" onClick={addField} disabled={!newFieldName.trim()
          || Object.prototype.hasOwnProperty.call(value, fieldNameForType(newFieldName.trim(), newFieldType))
          || restrictedFields?.has(fieldNameForType(newFieldName.trim(), newFieldType).toLowerCase())}
          className="btn-secondary btn inline-flex items-center gap-1 text-sm">
          <Plus className="h-4 w-4" /> Add field
        </button>
      </div>
    </div>
  );
}

function StructuredContentField({
  name,
  value,
  path,
  restrictedFields,
  onChange,
}: {
  name: string;
  value: unknown;
  path: ContentPath;
  restrictedFields?: ReadonlySet<string>;
  onChange: (path: ContentPath, next: unknown) => void;
}) {
  const [emptyArrayItemType, setEmptyArrayItemType] = useState('text');
  if (Array.isArray(value)) {
    const objectItems = value.some(item => item !== null && typeof item === 'object' && !Array.isArray(item));
    const itemKind = value.find(item => item !== null && item !== undefined);
    return (
      <fieldset className="space-y-3 rounded-xl border border-surface-200 p-3">
        <legend className="px-1 text-sm font-semibold text-surface-700">{name}</legend>
        {value.map((item, index) => (
          <div key={`${path.join('.')}-${index}`} className="rounded-lg bg-surface-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-surface-500">{objectItems ? `Item ${index + 1}` : `Value ${index + 1}`}</span>
              <button type="button" onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}
                aria-label={`Remove ${name} item ${index + 1}`} className="rounded p-1 text-surface-500 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {objectItems
              ? <StructuredContentFields value={asContent(item)} path={[...path, index]} restrictedFields={restrictedFields} onChange={onChange} />
              : <PrimitiveContentField
                  name={`${name} ${index + 1}`}
                  value={item}
                  onChange={next => onChange([...path, index], next)}
                />}
          </div>
        ))}
        {value.length === 0 ? (
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-medium text-surface-600">
              New item type
              <select className="form-select mt-1" value={emptyArrayItemType}
                onChange={event => setEmptyArrayItemType(event.target.value)}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Yes / no</option>
                <option value="object">Group</option>
              </select>
            </label>
            <button type="button"
              onClick={() => onChange(path, [...value, createEmptyValue(emptyArrayItemType)])}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-brand-700 hover:bg-brand-50">
              <Plus className="h-4 w-4" /> Add item
            </button>
          </div>
        ) : (
          <button type="button"
            onClick={() => onChange(path, [...value, objectItems ? emptyLike(itemKind) : createEmptyValue(typeof itemKind)])}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-brand-700 hover:bg-brand-50">
            <Plus className="h-4 w-4" /> Add {objectItems ? 'item' : 'value'}
          </button>
        )}
      </fieldset>
    );
  }
  if (value && typeof value === 'object') {
    return (
      <fieldset className="space-y-3 rounded-xl border border-surface-200 p-3">
        <legend className="px-1 text-sm font-semibold text-surface-700">{name}</legend>
        <StructuredContentFields value={asContent(value)} path={path} restrictedFields={restrictedFields} onChange={onChange} />
      </fieldset>
    );
  }
  return <PrimitiveContentField name={name} value={value} onChange={next => onChange(path, next)} />;
}

function PrimitiveContentField({
  name,
  value,
  onChange,
}: {
  name: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [uploadError, setUploadError] = useState('');
  const isImageField = isImageFieldName(name);
  const previewSrc = typeof value === 'string'
    && /^(data:image\/(png|jpeg|webp);base64,|https?:\/\/|\/)/i.test(value)
    ? value
    : '';
  const label = name.replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ').replace(/^./, letter => letter.toUpperCase());

  const uploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Choose a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > 12 * 1024) {
      setUploadError('Images must be 12 KB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setUploadError('Unable to read the selected image.');
        return;
      }
      setUploadError('');
      onChange(reader.result);
    };
    reader.onerror = () => setUploadError('Unable to read the selected image.');
    reader.readAsDataURL(file);
  };

  return (
    <label className="block text-sm font-medium text-surface-700">
      {label}
      {typeof value === 'boolean' ? (
        <input type="checkbox" checked={value} onChange={event => onChange(event.target.checked)} className="ml-2" />
      ) : typeof value === 'number' ? (
        <input type="number" className="form-input mt-1.5" value={value}
          onChange={event => onChange(Number(event.target.value))} />
      ) : typeof value === 'string' && (/(description|content|message|body|summary|text)/i.test(name) || value.length > 160) ? (
        <textarea className="form-input mt-1.5 min-h-24" value={value} maxLength={20000}
          onChange={event => onChange(event.target.value)} />
      ) : (
        <input type="text" className="form-input mt-1.5"
          value={typeof value === 'string' ? value : value == null ? '' : String(value)}
          maxLength={20000}
          onChange={event => onChange(event.target.value)} />
      )}
      {isImageField && (
        <span className="mt-2 block space-y-2">
          <input type="file" accept="image/png,image/jpeg,image/webp" className="form-input" onChange={uploadFile} />
          <span className="block text-xs font-normal text-surface-400">Optional PNG, JPEG, or WebP file, up to 12 KB.</span>
          {uploadError && <span role="alert" className="block text-xs text-red-700">{uploadError}</span>}
          {previewSrc && (
            <span className="flex items-center gap-3">
              <img src={previewSrc} alt={`${label} preview`} className="h-12 w-12 rounded-lg border border-surface-200 object-contain p-1" />
              <button type="button" onClick={event => { event.preventDefault(); onChange(''); }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-700 hover:bg-red-50">
                <X className="h-3.5 w-3.5" /> Remove file
              </button>
            </span>
          )}
        </span>
      )}
    </label>
  );
}

function AdminContentStudioEditor() {
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
  const [editor, setEditor] = useState<Record<string, unknown>>({});
  const [savedSlug, setSavedSlug] = useState('');
  const [savedEditor, setSavedEditor] = useState<Record<string, unknown>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | CmsStatus>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const newRequestHandled = useRef(false);
  const hasUnsavedChanges = JSON.stringify(editor) !== JSON.stringify(savedEditor) || slugInput !== savedSlug;

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
    setEditor({});
    setNotice('');
    void refresh(section);
  }, [section, refresh]);

  const entries = useMemo(() => {
    return records.map(record => ({ slug: record.slug, content: record.content, record }))
      .filter(item => {
      const query = recordSearch.trim().toLowerCase();
      const searchable = `${item.slug} ${String(item.content.title ?? '')} ${String(item.content.name ?? '')} ${String(item.content.category ?? '')} ${String(item.content.id ?? '')}`.toLowerCase();
      if (query && !searchable.includes(query)) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'draft') return item.record.status === 'draft'
        || (item.record.status === 'published' && item.record.hasDraft);
      return item.record.status === statusFilter;
    });
  }, [records, section, statusFilter, recordSearch]);

  const selected = entries.find(item => item.slug === selectedSlug);
  const restrictedCourseFields = section === 'courses' || section === 'master-programs'
    ? new Set(['instructor', 'learnercount', 'learners', 'rating', 'reviewcount', 'reviews', 'stars'])
    : undefined;

  useEffect(() => {
    if (!selected) return;
    const content = selected.content;
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

  /** Persist a static seed as an archived CMS record so it stays hidden after reloads. */
  const hideSeedEntry = async (slug: string, content: Record<string, unknown>) => {
    if (!window.confirm(`Remove "${slug}" from the website? This will hide it from public pages.`)) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await cmsService.create(section, slug, content);
      await cmsService.archive(section, slug);
      await refresh(section);
      if (selectedSlug === slug) startNew(false);
      setNotice(`"${slug}" is now hidden from the website.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to hide this content.');
    } finally {
      setBusy(false);
    }
  };

  /** Discard an unsaved new entry and return to the blank editor */
  const discardEntry = () => {
    if (hasUnsavedChanges && !window.confirm('Discard this unsaved entry?')) return;
    startNew(false);
  };

  /** Quick remove from the record list — works for both CMS records and static seeds */
  const quickRemoveEntry = async (entry: StudioEntry) => {
    if (entry.record) {
      // CMS record — delete via API
      if (!window.confirm(`Permanently delete "${entry.slug}"? This cannot be undone.`)) return;
      setBusy(true);
      try {
        await cmsService.remove(section, entry.slug);
        setRecords(current => current.filter(record => record.slug !== entry.slug));
        if (selectedSlug === entry.slug) startNew(false);
        setNotice(`Permanently deleted "${entry.slug}".`);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Delete failed.');
      } finally {
        setBusy(false);
      }
    } else {
      await hideSeedEntry(entry.slug, entry.content);
    }
  };

  const runAction = async (action: 'save' | 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete') => {
    setError('');
    setNotice('');
    if (action === 'unpublish' && hasUnsavedChanges
      && !window.confirm('Unpublish the last saved version and discard your unsaved editor changes?')) return;
    const content = action !== 'delete' && action !== 'restore' && action !== 'unpublish'
    ? editor
    : undefined;
    const title = typeof content?.title === 'string' ? content.title : '';
    const name = typeof content?.name === 'string' ? content.name
      : typeof content?.question === 'string' ? content.question
        : typeof content?.title === 'string' ? content.title
          : '';
    const slug = slugify(slugInput || (section === 'courses' ? title : name));
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
    if (action === 'delete') {
      // Handle static seed entries (no CMS record)
      if (!selected?.record) {
        await hideSeedEntry(slug, content ?? {});
        return;
      }
      if (!window.confirm(`Permanently delete "${slug}"? This cannot be undone.`)) return;
    }
    setBusy(true);
    try {
      if (action === 'delete') {
        await cmsService.remove(section, slug);
        setRecords(current => current.filter(record => record.slug !== slug));
        setNotice(`Permanently deleted ${slug}.`);
        startNew(false);
      } else if (action === 'restore') {
        const record = await cmsService.restore(section, slug);
        setSelectedSlug(record.slug);
        setSlugInput(record.slug);
        setSavedSlug(record.slug);
        setEditor(record.content);
        setSavedEditor(record.content);
        setNotice('Record restored.');
      } else if (action === 'unpublish') {
        const record = await cmsService.unpublish(section, slug);
        setSelectedSlug(record.slug);
        setSlugInput(record.slug);
        setSavedSlug(record.slug);
        setEditor(record.content);
        setSavedEditor(record.content);
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
        setSelectedSlug(record.slug);
        setSlugInput(record.slug);
        setSavedSlug(record.slug);
        setEditor(record.content);
        setSavedEditor(record.content);
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
              <div key={item.slug} className={`group mb-1 flex items-center rounded-xl transition-colors ${selectedSlug === item.slug ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-surface-50'}`}>
                <button type="button" onClick={() => {
                  if (hasUnsavedChanges && !window.confirm('Discard your unsaved course changes?')) return;
                  setSelectedSlug(item.slug);
                }}
                  className="min-w-0 flex-1 p-3 text-left">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-sm text-surface-900">{item.slug}</span>
                    {item.record
                      ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyles[item.record.status]}`}>{statusLabel(item.record)}</span>
                      : <span className="shrink-0 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-600">STATIC SEED</span>}
                  </span>
                  <span className="mt-1 block truncate text-xs text-surface-500">
                    {typeof item.content.title === 'string' ? item.content.title
                      : typeof item.content.name === 'string' ? item.content.name
                        : typeof item.content.label === 'string' ? item.content.label
                          : 'Content record'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); void quickRemoveEntry(item); }}
                  aria-label={`Remove ${item.slug}`}
                  title={item.record ? 'Delete permanently' : 'Remove from website'}
                  className="mr-2 shrink-0 rounded-lg p-1.5 text-surface-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
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
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-surface-800">
                {section === 'courses' ? 'Course details and modules' : 'Content details'}
              </h3>
              <p className="text-xs text-surface-500">
                Add, edit, remove, and upload supported images using the fields below. Saving creates a draft; publishing makes it live.
              </p>
              <StructuredContentFields
                value={editor}
                restrictedFields={restrictedCourseFields}
                onChange={(path, value) => setEditor(current => path.length
                  ? setContentValue(current, path, value)
                  : asContent(value))}
              />
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
              {/* CMS records can be permanently deleted; static seeds are archived to hide them persistently. */}
              {selected && (selected.record ? (
                (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <button type="button" disabled={busy} onClick={() => void runAction('delete')} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" /> Delete permanently
                  </button>
                )
              ) : (
                <button type="button" disabled={busy} onClick={() => void runAction('delete')} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                  <Archive className="h-4 w-4" /> Hide from website
                </button>
              ))}
              {/* Discard button for new unsaved entries */}
              {!selected && (slugInput || Object.keys(editor).length > 0) && (
                <button type="button" onClick={discardEntry} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-semibold text-surface-600 hover:bg-surface-50">
                  <X className="h-4 w-4" /> Discard
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

export default function AdminContentStudioPage() {
  const { section } = useParams<{ section: string }>();
  const [searchParams] = useSearchParams();
  const selectedSection = section ?? searchParams.get('section');
  if (selectedSection === 'website-menu') return <Navigate to="/admin/navigation" replace />;
  return <AdminContentStudioEditor />;
}
