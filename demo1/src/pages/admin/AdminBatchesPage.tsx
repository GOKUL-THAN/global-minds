import { useState, useMemo } from 'react';
import {
  Calendar, Users, Monitor, MapPin, TrendingUp, Clock,
  CheckCircle, Search, Plus, Eye, Edit3,
} from 'lucide-react';
import { mockBatches, type BatchStatus } from '../../data/adminMockData';
import { cn } from '../../utils/cn';
import { MockDataNotice } from '../../components/admin/MockDataNotice';

const statusConfig: Record<BatchStatus, { label: string; color: string; dot: string }> = {
  upcoming:  { label: 'Upcoming',  color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  ongoing:   { label: 'Ongoing',   color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  completed: { label: 'Completed', color: 'bg-surface-100 text-surface-600', dot: 'bg-surface-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
};

function ProgressBar({ value, color = 'bg-brand-500' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-surface-500 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function AdminBatchesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BatchStatus | 'all'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'Online' | 'Classroom' | 'Hybrid'>('all');
  const [view, setView] = useState<'table' | 'cards'>('cards');

  const filtered = useMemo(() => {
    let list = [...mockBatches];
    if (search) list = list.filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.course.toLowerCase().includes(search.toLowerCase()) ||
      b.instructor.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter);
    if (modeFilter !== 'all') list = list.filter(b => b.mode === modeFilter);
    return list;
  }, [search, statusFilter, modeFilter]);

  const ongoing = mockBatches.filter(b => b.status === 'ongoing').length;
  const upcoming = mockBatches.filter(b => b.status === 'upcoming').length;
  const totalStudents = mockBatches.reduce((a, b) => a + b.enrolled, 0);
  const avgAttendance = Math.round(mockBatches.filter(b => b.avgAttendance > 0).reduce((a, b) => a + b.avgAttendance, 0) / mockBatches.filter(b => b.avgAttendance > 0).length);

  return (
    <div className="space-y-6">
      <MockDataNotice>Batch, enrollment, attendance, and fee totals below are illustrative sample data.</MockDataNotice>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Batches</h1>
          <p className="text-surface-500 text-sm mt-1">{mockBatches.length} batches · {ongoing} active, {upcoming} upcoming</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-surface-100 rounded-xl p-1 gap-1">
            {(['cards', 'table'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1.5 text-xs rounded-lg font-medium transition-colors capitalize', view === v ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500')}>
                {v}
              </button>
            ))}
          </div>
          <button className="btn-primary btn text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Batch
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Batches', value: mockBatches.length, icon: Calendar, color: 'text-surface-900', bg: 'bg-white' },
          { label: 'Active Batches', value: ongoing, icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Total Enrolled', value: totalStudents, icon: Users, color: 'text-brand-700', bg: 'bg-brand-50' },
          { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: TrendingUp, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-5 border border-surface-100 flex items-center gap-4`}>
            <k.icon className={`w-8 h-8 ${k.color} flex-shrink-0`} />
            <div>
              <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
              <div className="text-xs text-surface-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batches, courses, instructors..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'ongoing', 'upcoming', 'completed', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              {s === 'all' ? 'All' : statusConfig[s as BatchStatus]?.label ?? s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'Online', 'Classroom', 'Hybrid'] as const).map(m => (
            <button key={m} onClick={() => setModeFilter(m)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                modeFilter === m ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              {m === 'all' ? 'All Modes' : m}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-surface-400">{filtered.length} shown</span>
      </div>

      {/* Cards view */}
      {view === 'cards' && (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(batch => {
            const sc = statusConfig[batch.status];
            const fillPct = Math.round((batch.enrolled / batch.capacity) * 100);
            return (
              <div key={batch.id} className="bg-white rounded-2xl border border-surface-100 hover:shadow-card-md transition-shadow overflow-hidden">
                <div className={`h-1 w-full ${batch.status === 'ongoing' ? 'bg-green-500' : batch.status === 'upcoming' ? 'bg-blue-400' : batch.status === 'completed' ? 'bg-surface-300' : 'bg-red-400'}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-display font-bold text-surface-900 leading-snug">{batch.name}</h3>
                      <p className="text-sm text-surface-500 mt-0.5">{batch.course} · {batch.category}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-surface-600">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} →{' '}
                      {new Date(batch.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-600">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      {batch.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-600">
                      {batch.mode === 'Classroom' ? <MapPin className="w-3.5 h-3.5 text-brand-400" /> : <Monitor className="w-3.5 h-3.5 text-brand-400" />}
                      {batch.mode}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-600">
                      <Users className="w-3.5 h-3.5 text-brand-400" />
                      {batch.enrolled}/{batch.capacity} enrolled
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl mb-4">
                    <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {batch.instructor.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm text-surface-700">{batch.instructor}</span>
                    <span className="ml-auto text-xs text-surface-500">₹{batch.fee.toLocaleString()}/student</span>
                  </div>

                  {/* Seat fill */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-surface-500 mb-1">
                      <span>Seat Capacity</span>
                      <span className={fillPct >= 90 ? 'text-red-600 font-medium' : fillPct >= 70 ? 'text-orange-600' : 'text-green-600'}>
                        {fillPct}% full
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-orange-400' : 'bg-green-500'}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Live stats (only for ongoing) */}
                  {batch.status === 'ongoing' && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-surface-100">
                      <div>
                        <p className="text-xs text-surface-500 mb-1">Avg Progress</p>
                        <ProgressBar value={batch.avgProgress} color="bg-brand-500" />
                      </div>
                      <div>
                        <p className="text-xs text-surface-500 mb-1">Avg Attendance</p>
                        <ProgressBar value={batch.avgAttendance}
                          color={batch.avgAttendance >= 80 ? 'bg-green-500' : 'bg-orange-400'} />
                      </div>
                    </div>
                  )}

                  {batch.status === 'completed' && (
                    <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between text-xs text-surface-500">
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3.5 h-3.5" />{batch.completed} completed</span>
                      <span>{batch.enrolled - batch.completed} dropped</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 btn-secondary btn text-xs flex items-center justify-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> View Students
                    </button>
                    <button className="flex-1 btn-secondary btn text-xs flex items-center justify-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Batch
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Batch</th>
                  <th className="text-left px-4 py-3">Instructor</th>
                  <th className="text-left px-4 py-3">Dates</th>
                  <th className="text-left px-4 py-3">Mode</th>
                  <th className="text-left px-4 py-3">Enrolled</th>
                  <th className="text-left px-4 py-3">Progress</th>
                  <th className="text-left px-4 py-3">Attendance</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filtered.map(batch => {
                  const sc = statusConfig[batch.status];
                  return (
                    <tr key={batch.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-surface-900 whitespace-nowrap">{batch.name}</p>
                        <p className="text-xs text-surface-400">{batch.category}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-700 whitespace-nowrap">{batch.instructor}</td>
                      <td className="px-4 py-3 text-xs text-surface-600 whitespace-nowrap">
                        {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(batch.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-600">{batch.mode}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={batch.enrolled / batch.capacity >= 0.9 ? 'text-red-600 font-medium' : 'text-surface-700'}>
                          {batch.enrolled}/{batch.capacity}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-24">
                        {batch.status === 'ongoing' ? <ProgressBar value={batch.avgProgress} /> : <span className="text-xs text-surface-400">—</span>}
                      </td>
                      <td className="px-4 py-3 min-w-24">
                        {batch.avgAttendance > 0 ? <ProgressBar value={batch.avgAttendance} color={batch.avgAttendance >= 80 ? 'bg-green-500' : 'bg-orange-400'} /> : <span className="text-xs text-surface-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-surface-500">No batches match your filters.</div>
      )}
    </div>
  );
}
