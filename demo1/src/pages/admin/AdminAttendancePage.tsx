import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import { mockStudents, mockBatches } from '../../data/adminMockData';
import { cn } from '../../utils/cn';
import { MockDataNotice } from '../../components/admin/MockDataNotice';

function AttBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-orange-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={cn('text-xs font-medium w-8 text-right', value >= 80 ? 'text-green-700' : value >= 60 ? 'text-orange-600' : 'text-red-600')}>
        {value}%
      </span>
    </div>
  );
}

export default function AdminAttendancePage() {
  const [view, setView] = useState<'students' | 'batches'>('students');
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'att-desc' | 'att-asc' | 'name'>('att-desc');

  const batchNames = Array.from(new Set(mockStudents.map(s => s.batchName).filter(Boolean)));

  const filteredStudents = useMemo(() => {
    let list = [...mockStudents];
    if (search) list = list.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.activeCourse.toLowerCase().includes(search.toLowerCase())
    );
    if (batchFilter !== 'all') list = list.filter(s => s.batchName === batchFilter);
    list.sort((a, b) => {
      if (sortBy === 'att-desc') return b.attendance - a.attendance;
      if (sortBy === 'att-asc') return a.attendance - b.attendance;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [search, batchFilter, sortBy]);

  const avgAtt = Math.round(mockStudents.reduce((a, s) => a + s.attendance, 0) / mockStudents.length);
  const highAtt = mockStudents.filter(s => s.attendance >= 80).length;
  const lowAtt = mockStudents.filter(s => s.attendance < 60).length;

  return (
    <div className="space-y-6">
      <MockDataNotice>Student and batch attendance below is illustrative sample data.</MockDataNotice>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Attendance</h1>
          <p className="text-surface-500 text-sm mt-0.5">Monitor attendance across all batches and students</p>
        </div>
        <div className="flex bg-surface-100 rounded-xl p-1 gap-1">
          {(['students', 'batches'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                view === v ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700')}>
              {v === 'students' ? 'By Student' : 'By Batch'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Average Attendance', value: `${avgAtt}%`, color: 'text-brand-700', bg: 'bg-brand-50', icon: Calendar },
          { label: 'Good (≥80%)', value: highAtt, color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle },
          { label: 'At Risk (<60%)', value: lowAtt, color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-5 flex items-center gap-4`}>
            <k.icon className={`w-7 h-7 ${k.color}`} />
            <div>
              <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
              <div className="text-xs text-surface-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Student view */}
      {view === 'students' && (
        <>
          <div className="bg-white rounded-2xl border border-surface-100 p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search students..." className="form-input pl-9 w-full" />
            </div>
            <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="form-select text-sm">
              <option value="all">All Batches</option>
              {batchNames.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="form-select text-sm">
              <option value="att-desc">Attendance ↓</option>
              <option value="att-asc">Attendance ↑ (At risk first)</option>
              <option value="name">Name A–Z</option>
            </select>
            <span className="text-sm text-surface-400 ml-auto">{filteredStudents.length} students</span>
          </div>

          <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Student</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Course / Batch</th>
                    <th className="text-left px-4 py-3 min-w-36">Attendance</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Progress</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {filteredStudents.map(s => {
                    const risk = s.attendance < 60;
                    const warn = s.attendance >= 60 && s.attendance < 80;
                    return (
                      <tr key={s.id} className={cn('hover:bg-surface-50 transition-colors', risk && 'bg-red-50/20')}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${s.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {s.avatar}
                            </div>
                            <div>
                              <p className="font-medium text-surface-900">{s.name}</p>
                              <p className="text-xs text-surface-400">{s.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs text-surface-700 font-medium">{s.activeCourse}</p>
                          <p className="text-xs text-surface-400">{s.batchName || '—'}</p>
                        </td>
                        <td className="px-4 py-3 min-w-36">
                          <AttBar value={s.attendance} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${s.progress}%` }} />
                            </div>
                            <span className="text-xs text-surface-500">{s.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {risk
                            ? <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><AlertCircle className="w-3.5 h-3.5" />At Risk</span>
                            : warn
                              ? <span className="flex items-center gap-1 text-xs text-orange-600"><AlertCircle className="w-3.5 h-3.5" />Warning</span>
                              : <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3.5 h-3.5" />Good</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/students/${s.id}`}>
                            <button className="text-xs text-brand-600 hover:underline font-medium">View →</button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-surface-500">No students match your filters.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Batch view */}
      {view === 'batches' && (
        <div className="grid md:grid-cols-2 gap-5">
          {mockBatches.map(batch => {
            const batchStudents = mockStudents.filter(s => s.batchId === batch.id);
            const batchAvg = batchStudents.length > 0
              ? Math.round(batchStudents.reduce((a, s) => a + s.attendance, 0) / batchStudents.length)
              : batch.avgAttendance;
            const atRiskCount = batchStudents.filter(s => s.attendance < 60).length;
            return (
              <div key={batch.id} className="bg-white rounded-2xl border border-surface-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-surface-900">{batch.name}</h3>
                    <p className="text-xs text-surface-500 mt-0.5">{batch.course} · {batch.instructor}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    batch.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                    batch.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    'bg-surface-100 text-surface-600'
                  )}>{batch.status}</span>
                </div>
                <div className="flex items-center gap-3 mb-3 text-xs text-surface-500">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{batch.enrolled} enrolled</span>
                  {atRiskCount > 0 && <span className="text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{atRiskCount} at risk</span>}
                </div>
                <div className="mb-1.5 flex justify-between text-xs text-surface-500">
                  <span>Average Attendance</span>
                  <span className={batchAvg >= 80 ? 'text-green-600 font-semibold' : batchAvg >= 60 ? 'text-orange-600 font-semibold' : 'text-red-600 font-semibold'}>{batchAvg}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', batchAvg >= 80 ? 'bg-green-500' : batchAvg >= 60 ? 'bg-orange-400' : 'bg-red-500')}
                    style={{ width: `${batchAvg}%` }} />
                </div>
                {batchStudents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {batchStudents.slice(0, 3).map(s => (
                      <div key={s.id} className="flex items-center gap-2">
                        <div className={`w-5 h-5 ${s.avatarColor} rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{s.avatar[0]}</div>
                        <span className="text-xs text-surface-600 flex-1 truncate">{s.name}</span>
                        <span className={cn('text-xs font-medium', s.attendance >= 80 ? 'text-green-600' : s.attendance >= 60 ? 'text-orange-500' : 'text-red-600')}>{s.attendance}%</span>
                      </div>
                    ))}
                    {batchStudents.length > 3 && (
                      <p className="text-xs text-surface-400">+{batchStudents.length - 3} more students</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-surface-400">
        Live attendance marking requires backend API. Data shown is from mock database. Mark present/absent feature will be enabled once backend is connected.
      </p>
    </div>
  );
}
