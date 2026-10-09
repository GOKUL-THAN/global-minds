import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, UserPlus, Download, Eye, Mail, Phone,
  TrendingUp, CheckCircle, Clock, AlertCircle,
  BookOpen, Award, ChevronDown,
} from 'lucide-react';
import { mockStudents, type StudentStatus } from '../../data/adminMockData';
import { cn } from '../../utils/cn';
import { MockDataNotice } from '../../components/admin/MockDataNotice';

const statusConfig: Record<StudentStatus, { label: string; color: string; dot: string }> = {
  active:    { label: 'Active',     color: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  inactive:  { label: 'Inactive',   color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  completed: { label: 'Completed',  color: 'bg-brand-100 text-brand-700',   dot: 'bg-brand-500' },
  suspended: { label: 'Suspended',  color: 'bg-surface-100 text-surface-600', dot: 'bg-surface-400' },
  trial:     { label: 'Trial',      color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
};

function ProgressBar({ value, color = 'bg-brand-500' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-surface-600 w-8 text-right">{value}%</span>
    </div>
  );
}

function ActivityBadge({ lastActive }: { lastActive: string }) {
  const diff = Date.now() - new Date(lastActive).getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 24) return <span className="flex items-center gap-1 text-xs text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Today</span>;
  if (hours < 72) return <span className="flex items-center gap-1 text-xs text-orange-600"><span className="w-1.5 h-1.5 rounded-full bg-orange-400" />{Math.floor(hours / 24)}d ago</span>;
  return <span className="flex items-center gap-1 text-xs text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{Math.floor(hours / 24)}d ago</span>;
}

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'attendance' | 'lastActive' | 'joinedDate'>('lastActive');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let list = [...mockStudents];
    if (search) list = list.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.activeCourse.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (sourceFilter !== 'all') list = list.filter(s => s.source === sourceFilter);
    list.sort((a, b) => {
      let va: string | number, vb: string | number;
      if (sortBy === 'progress') { va = a.progress; vb = b.progress; }
      else if (sortBy === 'attendance') { va = a.attendance; vb = b.attendance; }
      else if (sortBy === 'lastActive') { va = a.lastActive; vb = b.lastActive; }
      else if (sortBy === 'joinedDate') { va = a.joinedDate; vb = b.joinedDate; }
      else { va = a.name; vb = b.name; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [search, statusFilter, sourceFilter, sortBy, sortDir]);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const allSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(s => s.id)));

  // Summary stats
  const active = mockStudents.filter(s => s.status === 'active').length;
  const inactive = mockStudents.filter(s => s.status === 'inactive').length;
  const completed = mockStudents.filter(s => s.status === 'completed').length;
  const avgProgress = Math.round(mockStudents.reduce((a, s) => a + s.progress, 0) / mockStudents.length);
  const avgAttendance = Math.round(mockStudents.reduce((a, s) => a + s.attendance, 0) / mockStudents.length);

  return (
    <div className="space-y-6">
      <MockDataNotice>Student profiles and activity shown here are sample records; actual enquiries are managed separately.</MockDataNotice>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Students</h1>
          <p className="text-surface-500 text-sm mt-1">{mockStudents.length} students · Monitor activity, progress and attendance</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary btn text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="btn-primary btn text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: mockStudents.length, color: 'text-surface-900', icon: BookOpen, bg: 'bg-surface-50' },
          { label: 'Active', value: active, color: 'text-green-700', icon: CheckCircle, bg: 'bg-green-50' },
          { label: 'Inactive', value: inactive, color: 'text-red-600', icon: AlertCircle, bg: 'bg-red-50' },
          { label: 'Completed', value: completed, color: 'text-brand-700', icon: Award, bg: 'bg-brand-50' },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-purple-700', icon: TrendingUp, bg: 'bg-purple-50' },
          { label: 'Avg Attendance', value: `${avgAttendance}%`, color: 'text-orange-700', icon: Clock, bg: 'bg-orange-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-4 text-center border border-white`}>
            <k.icon className={`w-5 h-5 ${k.color} mx-auto mb-1`} />
            <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
            <div className="text-xs text-surface-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, course..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Filter className="w-3.5 h-3.5" /> Status:
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'active', 'inactive', 'completed', 'trial', 'suspended'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize',
                  statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                )}
              >
                {s === 'all' ? 'All' : statusConfig[s].label}
              </button>
            ))}
          </div>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="text-xs border border-surface-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="all">All Sources</option>
            {['organic', 'referral', 'google', 'social', 'direct'].map(s => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <span className="ml-auto text-xs text-surface-400">{filtered.length} of {mockStudents.length} shown</span>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-brand-800">{selected.size} student{selected.size > 1 ? 's' : ''} selected</span>
          <button className="text-xs bg-white border border-brand-200 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100">Send Email</button>
          <button className="text-xs bg-white border border-brand-200 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100">Export Selected</button>
          <button className="ml-auto text-xs text-surface-400 hover:text-surface-700" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-brand-600 w-4 h-4 rounded" />
                </th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-surface-900" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">Student <ChevronDown className={cn('w-3 h-3 transition-transform', sortBy === 'name' && sortDir === 'asc' && 'rotate-180')} /></div>
                </th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Course / Batch</th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-surface-900 min-w-28" onClick={() => toggleSort('progress')}>
                  <div className="flex items-center gap-1">Progress <ChevronDown className={cn('w-3 h-3 transition-transform', sortBy === 'progress' && sortDir === 'asc' && 'rotate-180')} /></div>
                </th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-surface-900 min-w-28" onClick={() => toggleSort('attendance')}>
                  <div className="flex items-center gap-1">Attendance <ChevronDown className={cn('w-3 h-3 transition-transform', sortBy === 'attendance' && sortDir === 'asc' && 'rotate-180')} /></div>
                </th>
                <th className="text-left px-4 py-3">Assignments</th>
                <th className="text-left px-4 py-3">Fee Status</th>
                <th className="text-left px-4 py-3 cursor-pointer hover:text-surface-900" onClick={() => toggleSort('lastActive')}>
                  <div className="flex items-center gap-1">Last Active <ChevronDown className={cn('w-3 h-3 transition-transform', sortBy === 'lastActive' && sortDir === 'asc' && 'rotate-180')} /></div>
                </th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(student => {
                const sc = statusConfig[student.status];
                const feePct = student.feePaid + student.feePending > 0
                  ? Math.round((student.feePaid / (student.feePaid + student.feePending)) * 100)
                  : 100;
                return (
                  <tr key={student.id} className={cn('hover:bg-surface-50 transition-colors', selected.has(student.id) && 'bg-brand-50/30')}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(student.id)} onChange={() => toggleSelect(student.id)} className="accent-brand-600 w-4 h-4 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${student.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {student.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 whitespace-nowrap">{student.name}</p>
                          <p className="text-xs text-surface-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      {student.certificateEarned && (
                        <span className="ml-1.5 text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full">🏆 Cert</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-surface-900 whitespace-nowrap">{student.activeCourse}</p>
                      <p className="text-xs text-surface-400 whitespace-nowrap">{student.batchName || '—'}</p>
                    </td>
                    <td className="px-4 py-3 min-w-32">
                      <ProgressBar
                        value={student.progress}
                        color={student.progress >= 80 ? 'bg-green-500' : student.progress >= 50 ? 'bg-brand-500' : 'bg-orange-400'}
                      />
                    </td>
                    <td className="px-4 py-3 min-w-32">
                      <ProgressBar
                        value={student.attendance}
                        color={student.attendance >= 80 ? 'bg-green-500' : student.attendance >= 60 ? 'bg-orange-400' : 'bg-red-500'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-surface-700">
                        {student.assignmentsSubmitted}/{student.assignmentsTotal}
                      </span>
                      {student.assignmentsSubmitted < student.assignmentsTotal && (
                        <span className="ml-1 text-xs text-red-500">
                          ({student.assignmentsTotal - student.assignmentsSubmitted} due)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {student.feePending > 0 ? (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            ₹{student.feePending.toLocaleString()} due
                          </div>
                          <div className="w-16 h-1.5 bg-surface-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${feePct}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ActivityBadge lastActive={student.lastActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/students/${student.id}`}>
                          <button className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="View profile">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <a href={`mailto:${student.email}`}>
                          <button className="p-1.5 text-surface-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Send email">
                            <Mail className="w-4 h-4" />
                          </button>
                        </a>
                        <a href={`tel:${student.phone}`}>
                          <button className="p-1.5 text-surface-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Call">
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
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500">No students match your filters.</p>
          </div>
        )}
      </div>

      {/* Attention needed */}
      <div className="bg-white rounded-2xl border border-surface-100 p-6">
        <h2 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Needs Attention
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockStudents.filter(s => s.attendance < 70 || s.feePending > 0 || (s.status === 'inactive')).map(s => (
            <div key={s.id} className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl border border-surface-100">
              <div className={`w-8 h-8 ${s.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {s.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900">{s.name}</p>
                <div className="space-y-0.5 mt-1">
                  {s.attendance < 70 && <p className="text-xs text-orange-600">⚠ Attendance: {s.attendance}%</p>}
                  {s.feePending > 0 && <p className="text-xs text-red-600">💰 Fee pending: ₹{s.feePending.toLocaleString()}</p>}
                  {s.status === 'inactive' && <p className="text-xs text-red-600">❌ Inactive since {new Date(s.lastActive).toLocaleDateString('en-IN')}</p>}
                </div>
              </div>
              <Link to={`/admin/students/${s.id}`}>
                <button className="text-xs text-brand-600 hover:underline flex-shrink-0">View</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
