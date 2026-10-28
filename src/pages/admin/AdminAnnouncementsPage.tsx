import { useEffect, useState } from 'react';
import { Megaphone, Pencil, Save, X } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

type Announcement = { id: string; title: string; body: string; status: 'draft' | 'published' | 'archived'; createdAt: string; updatedAt: string; publishedAt: string | null };
type ApiResponse<T> = { success?: boolean; data?: T; error?: { message?: string }; message?: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'same-origin',
      ...init,
      headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    });
  } catch {
    throw new Error('The admin API is unavailable. Check the server and try again.');
  }
  const result = await response.json().catch(() => undefined) as ApiResponse<T> | undefined;
  if (!response.ok || !result?.success || result.data === undefined) {
    throw new Error(result?.error?.message ?? result?.message ?? `Announcement request failed (${response.status}).`);
  }
  return result.data;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await request<{ announcements: Announcement[] }>('/api/admin/announcements?page=1&pageSize=100');
      setAnnouncements(result.announcements);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    setError('');
    setNotice('');
    const form = new FormData(formElement);
    const payload = { title: form.get('title'), body: form.get('body'), status: form.get('status') };
    try {
      await request('/api/admin/announcements', { method: 'POST', body: JSON.stringify(payload) });
      formElement.reset();
      setNotice('Announcement saved.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save announcement.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (announcement: Announcement, status: Announcement['status']) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await request(`/api/admin/announcements/${encodeURIComponent(announcement.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setNotice('Announcement status updated.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update announcement.');
    } finally {
      setSaving(false);
    }
  };

  const updateAnnouncement = async (event: React.FormEvent<HTMLFormElement>, announcement: Announcement) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await request(`/api/admin/announcements/${encodeURIComponent(announcement.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: form.get('title'), body: form.get('body') }),
      });
      setEditingId(null);
      setNotice('Announcement updated.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update announcement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          <ShinyText text="Student announcements" shinyColor="rgba(23, 108, 115, 0.9)" />
        </h1>
        <p className="mt-1 text-sm text-surface-500 font-medium">Published announcements appear in student dashboards. Drafts and archived messages remain private.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      <SpotlightCard>
        <form onSubmit={event => { void create(event); }} className="space-y-4 rounded-2xl border border-surface-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold text-surface-900"><Megaphone className="h-5 w-5 text-brand-600" /> Write announcement</h2>
          <label className="block"><span className="form-label">Title</span><input name="title" required minLength={2} maxLength={160} className="form-input w-full" /></label>
          <label className="block"><span className="form-label">Message</span><textarea name="body" required maxLength={10000} rows={5} className="form-input w-full" /></label>
          <div className="flex flex-wrap items-center gap-3"><label><span className="form-label">Initial status</span><select name="status" className="form-select"><option value="draft">Draft</option><option value="published">Publish now</option></select></label><button type="submit" disabled={saving} className="btn-primary btn mt-5 inline-flex items-center gap-2"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save announcement'}</button></div>
        </form>
      </SpotlightCard>

      <section className="space-y-3">
        <h2 className="font-semibold text-surface-900">Announcements</h2>
        {loading ? <p role="status" className="rounded-xl bg-white p-6 text-sm text-surface-500">Loading announcements...</p> : announcements.length ? announcements.map(announcement => (
          <SpotlightCard key={announcement.id}>
            <article className="rounded-2xl border border-surface-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-surface-900">{announcement.title}</h3><time className="mt-1 block text-xs text-surface-500">{new Date(announcement.updatedAt).toLocaleString()}</time></div><div className="flex items-center gap-2"><select aria-label={`Status for ${announcement.title}`} disabled={saving} value={announcement.status} onChange={event => void updateStatus(announcement, event.target.value as Announcement['status'])} className="form-select w-auto"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select>{editingId !== announcement.id && <button type="button" onClick={() => setEditingId(announcement.id)} className="btn-secondary btn inline-flex items-center gap-1"><Pencil className="h-4 w-4" /> Edit</button>}</div></div>
              {editingId === announcement.id ? <form className="mt-4 space-y-3" onSubmit={event => { void updateAnnouncement(event, announcement); }}><label className="block"><span className="form-label">Title</span><input name="title" required minLength={2} maxLength={160} defaultValue={announcement.title} className="form-input w-full" /></label><label className="block"><span className="form-label">Message</span><textarea name="body" required maxLength={10000} rows={4} defaultValue={announcement.body} className="form-input w-full" /></label><div className="flex gap-2"><button type="submit" disabled={saving} className="btn-primary btn inline-flex items-center gap-2"><Save className="h-4 w-4" /> Save</button><button type="button" disabled={saving} onClick={() => setEditingId(null)} className="btn-secondary btn inline-flex items-center gap-2"><X className="h-4 w-4" /> Cancel</button></div></form> : <p className="mt-3 whitespace-pre-wrap text-sm text-surface-700">{announcement.body}</p>}
            </article>
          </SpotlightCard>
        )) : <p className="rounded-xl bg-white p-6 text-sm text-surface-500">No announcements yet.</p>}
      </section>
    </div>
  );
}
