import { useState, useMemo } from 'react';
import { Search, Download, Clock, Shield } from 'lucide-react';
import { mockSiteActivity, type SiteActivity, type ActivityType } from '../../data/adminMockData';
import { cn } from '../../utils/cn';

const activityMeta: Record<ActivityType, { icon: string; color: string; label: string }> = {
  login:       { icon: '🔐', color: 'bg-surface-100 text-surface-600',   label: 'Login' },
  lesson:      { icon: '📖', color: 'bg-brand-50 text-brand-700',        label: 'Lesson' },
  quiz:        { icon: '📝', color: 'bg-purple-50 text-purple-700',      label: 'Quiz' },
  assignment:  { icon: '📋', color: 'bg-orange-50 text-orange-700',      label: 'Assignment' },
  certificate: { icon: '🏆', color: 'bg-yellow-50 text-yellow-700',      label: 'Certificate' },
  enquiry:     { icon: '💬', color: 'bg-blue-50 text-blue-700',          label: 'Enquiry' },
  enrollment:  { icon: '🎓', color: 'bg-green-50 text-green-700',        label: 'Enrollment' },
  payment:     { icon: '💳', color: 'bg-green-50 text-emerald-700',      label: 'Payment' },
  download:    { icon: '⬇️', color: 'bg-surface-50 text-surface-600',    label: 'Download' },
  forum:       { icon: '💭', color: 'bg-sky-50 text-sky-700',            label: 'Forum' },
};

const roleColors: Record<SiteActivity['actorRole'], string> = {
  student:    'bg-brand-100 text-brand-700',
  admin:      'bg-red-100 text-red-700',
  instructor: 'bg-purple-100 text-purple-700',
  system:     'bg-surface-100 text-surface-600',
};

export default function AdminActivityPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<SiteActivity['actorRole'] | 'all'>('all');

  const filtered = useMemo(() => {
    let list = [...mockSiteActivity];
    if (search) list = list.filter(a =>
      a.actor.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.module.toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter !== 'all') list = list.filter(a => a.type === typeFilter);
    if (roleFilter !== 'all') list = list.filter(a => a.actorRole === roleFilter);
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [search, typeFilter, roleFilter]);

  // Type counts
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    mockSiteActivity.forEach(a => { c[a.type] = (c[a.type] || 0) + 1; });
    return c;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Activity Log</h1>
          <p className="text-surface-500 text-sm mt-1">Site-wide audit trail — {mockSiteActivity.length} events recorded</p>
        </div>
        <button className="btn-secondary btn text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Log
        </button>
      </div>

      {/* Activity type pills with counts */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTypeFilter('all')}
          className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            typeFilter === 'all' ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
          All ({mockSiteActivity.length})
        </button>
        {(Object.keys(activityMeta) as ActivityType[]).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5',
              typeFilter === t ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
            {activityMeta[t].icon} {activityMeta[t].label} {typeCounts[t] ? `(${typeCounts[t]})` : ''}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actor, description, module..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-surface-500">Role:</span>
          {(['all', 'student', 'admin', 'instructor', 'system'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
                roleFilter === r ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-surface-400">{filtered.length} events</span>
      </div>

      {/* Activity list */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-4 py-3">Actor</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Module</th>
                <th className="text-left px-4 py-3">IP</th>
                <th className="text-left px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(activity => {
                const meta = activityMeta[activity.type];
                return (
                  <tr key={activity.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${meta.color}`}>
                        <span>{meta.icon}</span>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-surface-200 rounded-lg flex items-center justify-center text-xs font-bold text-surface-600 flex-shrink-0">
                          {activity.actor.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-surface-900 whitespace-nowrap">{activity.actor}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[activity.actorRole]}`}>
                            {activity.actorRole}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-700 max-w-xs">{activity.description}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full font-medium">
                        {activity.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400 font-mono">{activity.ip ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-surface-500 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-surface-500">No activity matches your filters.</div>
          )}
        </div>
      </div>

      {/* Summary by module */}
      <div className="bg-white rounded-2xl border border-surface-100 p-6">
        <h2 className="font-semibold text-surface-900 mb-5">Activity by Module</h2>
        <div className="space-y-3">
          {Object.entries(
            mockSiteActivity.reduce((acc, a) => {
              acc[a.module] = (acc[a.module] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1]).map(([module, count]) => {
            const pct = Math.round((count / mockSiteActivity.length) * 100);
            return (
              <div key={module} className="flex items-center gap-4">
                <span className="text-sm text-surface-700 w-28 flex-shrink-0">{module}</span>
                <div className="flex-1 h-2.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-surface-500 w-12 text-right">{count} events</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security notice */}
      <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-surface-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-surface-500">
          This activity log shows mock data for demonstration purposes. In production, all events are recorded with full IP addresses, session IDs, device information and are stored immutably for audit compliance.
        </p>
      </div>
    </div>
  );
}
