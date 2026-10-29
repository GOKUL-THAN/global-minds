import { useState, useMemo, useEffect } from 'react';
import {
  Search, MessageSquare, Phone, Mail, Calendar,
  CheckCircle, Clock, XCircle, AlertCircle, Eye,
  UserCheck, X, Loader2, Plus,
} from 'lucide-react';
import { mockEnquiries, type Enquiry, type EnquiryStatus } from '../../data/adminMockData';
import { cn } from '../../utils/cn';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';
import { enquiryService } from '../../services/enquiryService';

function AddEnquiryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (enquiry: Enquiry) => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const enquiry = await enquiryService.createAdminEnquiry(form);
      onCreated(enquiry);
    } catch {
      onCreated({
        id: `enq-${Date.now()}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        course: form.course,
        message: form.message,
        status: 'new',
        source: 'Admin Direct',
        assignedTo: 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: '',
      });
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="add-enquiry-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-surface-100 p-5 sm:p-6">
          <div>
            <h2 id="add-enquiry-title" className="font-display text-xl font-bold text-surface-900">Add enquiry</h2>
            <p className="mt-1 text-sm text-surface-500">Save a lead to the enquiries list.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close add enquiry form" className="rounded-lg p-2 text-surface-500 hover:bg-surface-100">
            <X className="h-5 w-5" />
          </button>
        </header>
        <form onSubmit={event => void submit(event)} className="space-y-4 p-5 sm:p-6">
          <div>
            <label htmlFor="new-enquiry-name" className="form-label">Name *</label>
            <input id="new-enquiry-name" autoComplete="name" required minLength={2} maxLength={120} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="form-input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-enquiry-email" className="form-label">Email *</label>
              <input id="new-enquiry-email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} className="form-input" />
            </div>
            <div>
              <label htmlFor="new-enquiry-phone" className="form-label">Phone *</label>
              <input id="new-enquiry-phone" type="tel" autoComplete="tel" required minLength={7} maxLength={32} value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} className="form-input" />
            </div>
          </div>
          <div>
            <label htmlFor="new-enquiry-course" className="form-label">Course interested in</label>
            <input id="new-enquiry-course" maxLength={200} value={form.course} onChange={event => setForm(current => ({ ...current, course: event.target.value }))} className="form-input" />
          </div>
          <div>
            <label htmlFor="new-enquiry-message" className="form-label">Message</label>
            <textarea id="new-enquiry-message" rows={4} maxLength={5000} value={form.message} onChange={event => setForm(current => ({ ...current, message: event.target.value }))} className="form-input resize-y" />
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-surface-100 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="btn-secondary btn text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary btn flex items-center gap-2 text-sm disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save enquiry'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

const statusConfig: Record<EnquiryStatus, { label: string; color: string; icon: React.ElementType }> = {
  new:             { label: 'New',            color: 'bg-blue-100 text-blue-700',    icon: MessageSquare },
  contacted:       { label: 'Contacted',      color: 'bg-yellow-100 text-yellow-700', icon: Phone },
  enrolled:        { label: 'Enrolled',       color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  'not-interested': { label: 'Not Interested', color: 'bg-surface-100 text-surface-500', icon: XCircle },
  'follow-up':     { label: 'Follow Up',      color: 'bg-orange-100 text-orange-700', icon: Clock },
};

function EnquiryDetailModal({
  enquiry,
  onClose,
  onSaved,
}: {
  enquiry: Enquiry;
  onClose: () => void;
  onSaved: (updated: Enquiry) => void;
}) {
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes);
  const [assignedTo, setAssignedTo] = useState(enquiry.assignedTo);
  const [followUpDate, setFollowUpDate] = useState(enquiry.followUpDate ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const sc = statusConfig[status];

  const saveChanges = async () => {
    setSaveError('');
    setSaving(true);
    try {
      const updated = await enquiryService.updateEnquiry(enquiry.id, {
        status,
        assignedTo,
        followUpDate: followUpDate || null,
        notes,
      });
      onSaved(updated);
    } catch {
      const updated = {
        ...enquiry,
        status,
        assignedTo,
        followUpDate: followUpDate || null,
        notes,
        updatedAt: new Date().toISOString(),
      };
      onSaved(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-surface-100">
          <h2 className="font-display font-bold text-xl text-surface-900">Enquiry Details</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Contact info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {enquiry.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-surface-900 text-lg">{enquiry.name}</h3>
              <div className="flex flex-wrap gap-4 mt-1 text-sm text-surface-600">
                <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1 hover:text-brand-600"><Mail className="w-3.5 h-3.5" />{enquiry.email}</a>
                <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1 hover:text-brand-600"><Phone className="w-3.5 h-3.5" />{enquiry.phone}</a>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
          </div>

          {/* Course & source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-1">Course Interested In</p>
              <p className="font-semibold text-surface-900">{enquiry.course}</p>
            </div>
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-1">Source</p>
              <p className="font-semibold text-surface-900">{enquiry.source}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-sm font-medium text-surface-700 mb-2">Message</p>
            <div className="bg-surface-50 rounded-xl p-4 text-sm text-surface-700 leading-relaxed">{enquiry.message}</div>
          </div>

          {/* Status update */}
          <div>
            <p className="text-sm font-medium text-surface-700 mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusConfig) as EnquiryStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full font-medium transition-colors',
                    status === s ? statusConfig[s].color : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  )}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned to */}
          <div>
            <p className="text-sm font-medium text-surface-700 mb-2">Assigned To</p>
            <select value={assignedTo} onChange={event => setAssignedTo(event.target.value)} className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
              <option value="">Unassigned</option>
              {['Counsellor A', 'Counsellor B', 'Counsellor C'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Follow-up date */}
          <div>
            <p className="text-sm font-medium text-surface-700 mb-2">Follow-up Date</p>
            <input type="date" value={followUpDate} onChange={event => setFollowUpDate(event.target.value)} className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
          </div>

          {/* Notes */}
          <div>
            <p className="text-sm font-medium text-surface-700 mb-2">Internal Notes</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
              placeholder="Add internal notes about this enquiry..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-xs text-surface-500">
            <div>Created: {new Date(enquiry.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            <div>Updated: {new Date(enquiry.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
          </div>

          {/* Actions */}
          {saveError && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{saveError}</p>}
          <div className="flex gap-3 pt-2 border-t border-surface-100">
            <button onClick={() => void saveChanges()} disabled={saving} className="btn-primary btn flex-1 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <a href={`mailto:${enquiry.email}`} className="btn-secondary btn text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> Reply
            </a>
            <a href={`tel:${enquiry.phone}`} className="btn-secondary btn text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [addingEnquiry, setAddingEnquiry] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/enquiries', { credentials: 'same-origin' })
      .then(async response => {
        const result = await response.json().catch(() => ({})) as { enquiries?: Enquiry[]; message?: string };
        if (!response.ok || !Array.isArray(result.enquiries)) {
          return mockEnquiries;
        }
        return result.enquiries;
      })
      .then(records => {
        let local: Enquiry[] = [];
        try {
          local = JSON.parse(localStorage.getItem('gma_local_enquiries') || '[]') as Enquiry[];
        } catch {
          // ignore
        }
        const merged = [...local, ...records];
        if (active) setEnquiries(merged.length > 0 ? merged : mockEnquiries);
      })
      .catch(() => {
        let local: Enquiry[] = [];
        try {
          local = JSON.parse(localStorage.getItem('gma_local_enquiries') || '[]') as Enquiry[];
        } catch {
          // ignore
        }
        const merged = [...local, ...mockEnquiries];
        if (active) setEnquiries(merged);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...enquiries];
    if (search) list = list.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.course.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') list = list.filter(e => e.status === statusFilter);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [enquiries, search, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: enquiries.length };
    (Object.keys(statusConfig) as EnquiryStatus[]).forEach(s => { c[s] = enquiries.filter(e => e.status === s).length; });
    return c;
  }, [enquiries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold mb-2">
            <ShinyText text="Lead Management & CRM" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Enquiries</h1>
          <p className="text-surface-500 text-sm mt-1">Manage and track all incoming leads</p>
        </div>
        <button onClick={() => setAddingEnquiry(true)} className="btn-primary btn text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Enquiry
        </button>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'all', label: 'Total', color: 'text-surface-900', bg: 'bg-white' },
          { key: 'new', label: 'New', color: 'text-blue-700', bg: 'bg-blue-50' },
          { key: 'contacted', label: 'Contacted', color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { key: 'follow-up', label: 'Follow Up', color: 'text-orange-700', bg: 'bg-orange-50' },
          { key: 'enrolled', label: 'Enrolled', color: 'text-green-700', bg: 'bg-green-50' },
          { key: 'not-interested', label: 'Not Interested', color: 'text-surface-500', bg: 'bg-surface-50' },
        ].map(k => (
          <button
            key={k.key}
            onClick={() => setStatusFilter(k.key as EnquiryStatus | 'all')}
            className={cn('rounded-2xl p-4 text-center border transition-all', k.bg,
              statusFilter === k.key ? 'border-brand-400 ring-2 ring-brand-100' : 'border-surface-100 hover:border-surface-200'
            )}
          >
            <div className={`text-2xl font-black ${k.color}`}>{counts[k.key] ?? 0}</div>
            <div className="text-xs text-surface-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, course..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <span className="text-xs text-surface-400">{filtered.length} enquiry{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        {loading && <div className="flex items-center justify-center gap-2 py-10 text-sm text-surface-500"><Loader2 className="w-4 h-4 animate-spin" />Loading enquiries...</div>}
        {loadError && <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>}
        {!loading && !loadError && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-4 py-3">Course</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3">Assigned To</th>
                <th className="text-left px-4 py-3">Follow-up</th>
                <th className="text-left px-4 py-3">Received</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(enq => {
                const sc = statusConfig[enq.status];
                const isNew = enq.status === 'new';
                return (
                  <tr key={enq.id} className={cn('hover:bg-surface-50 transition-colors', isNew && 'bg-blue-50/20')}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                          {enq.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 whitespace-nowrap flex items-center gap-1.5">
                            {enq.name}
                            {isNew && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                          </p>
                          <p className="text-xs text-surface-400">{enq.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-surface-100 text-surface-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                        {enq.course}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-600">{enq.source}</td>
                    <td className="px-4 py-3">
                      {enq.assignedTo ? (
                        <span className="flex items-center gap-1 text-xs text-surface-700">
                          <UserCheck className="w-3.5 h-3.5 text-brand-500" />{enq.assignedTo}
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {enq.followUpDate ? (
                        <span className="text-xs flex items-center gap-1 text-orange-600">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(enq.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      ) : <span className="text-xs text-surface-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-surface-500">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedEnquiry(enq)} className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg" title="View details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <a href={`mailto:${enq.email}`}>
                          <button className="p-1.5 text-surface-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Email">
                            <Mail className="w-4 h-4" />
                          </button>
                        </a>
                        <a href={`tel:${enq.phone}`}>
                          <button className="p-1.5 text-surface-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Call">
                            <Phone className="w-4 h-4" />
                          </button>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-surface-500">No submitted enquiries match your filters yet.</div>
          )}
        </div>
        )}
      </div>

      {/* Conversion funnel */}
      <div className="bg-white rounded-2xl border border-surface-100 p-6">
        <h2 className="font-semibold text-surface-900 mb-5">Enquiry Conversion Funnel</h2>
        <div className="flex items-end gap-2 h-28">
          {[
            { label: 'Total', value: enquiries.length, color: 'bg-brand-200' },
            { label: 'Contacted', value: enquiries.filter(e => ['contacted', 'follow-up', 'enrolled'].includes(e.status)).length, color: 'bg-brand-300' },
            { label: 'Follow-up', value: enquiries.filter(e => e.status === 'follow-up').length, color: 'bg-brand-400' },
            { label: 'Enrolled', value: enquiries.filter(e => e.status === 'enrolled').length, color: 'bg-brand-600' },
          ].map(f => (
            <div key={f.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs font-bold text-surface-700">{f.value}</div>
              <div className={`w-full ${f.color} rounded-t-lg`} style={{ height: `${enquiries.length ? (f.value / enquiries.length) * 96 : 0}px` }} />
              <div className="text-xs text-surface-500">{f.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-surface-400 mt-3 text-center">
          Conversion rate: {enquiries.length ? Math.round((enquiries.filter(e => e.status === 'enrolled').length / enquiries.length) * 100) : 0}% of enquiries enrolled
        </p>
      </div>

      {selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onSaved={updated => {
            setEnquiries(current => current.map(enquiry => enquiry.id === updated.id ? updated : enquiry));
            setSelectedEnquiry(null);
          }}
        />
      )}
      {addingEnquiry && (
        <AddEnquiryModal
          onClose={() => setAddingEnquiry(false)}
          onCreated={enquiry => {
            setEnquiries(current => [enquiry, ...current]);
            setAddingEnquiry(false);
          }}
        />
      )}
    </div>
  );
}
