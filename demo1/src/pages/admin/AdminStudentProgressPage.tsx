import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Award, BookOpen, Filter } from 'lucide-react';
import { mockStudents, mockBatches } from '../../data/adminMockData';
import { cn } from '../../utils/cn';
import { MockDataNotice } from '../../components/admin/MockDataNotice';

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-surface-600 w-8 text-right font-medium">{value}%</span>
    </div>
  );
}

function progressColor(v: number) {
  if (v >= 80) return 'bg-green-500';
  if (v >= 50) return 'bg-brand-500';
  if (v >= 25) return 'bg-orange-400';
  return 'bg-red-400';
}

export default function AdminStudentProgressPage() {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'progress-desc' | 'progress-asc' | 'name'>('progress-desc');

  const courses = Array.from(new Set(mockStudents.map(s => s.activeCourse)));

  const filtered = useMemo(() => {
    let list = [...mockStudents];
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
    if (courseFilter !== 'all') list = list.filter(s => s.activeCourse === courseFilter);
    list.sort((a, b) => {
      if (sortBy === 'progress-desc') return b.progress - a.progress;
      if (sortBy === 'progress-asc') return a.progress - b.progress;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [search, courseFilter, sortBy]);

  const avgProgress = Math.round(mockStudents.reduce((a, s) => a + s.progress, 0) / mockStudents.length);
  const completed = mockStudents.filter(s => s.progress === 100).length;
  const onTrack = mockStudents.filter(s => s.progress >= 50 && s.progress < 100).length;
  const atRisk = mockStudents.filter(s => s.progress < 50).length;

  return (
    <div className="space-y-6">
      <MockDataNotice>Student progress and completion figures below are illustrative sample data.</MockDataNotice>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Student Progress</h1>
          <p className="text-surface-500 text-sm mt-0.5">Track learning progress across all enrolled students</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-brand-700', bg: 'bg-brand-50', icon: TrendingUp },
          { label: 'Completed', value: completed, color: 'text-green-700', bg: 'bg-green-50', icon: Award },
          { label: 'On Track', value: onTrack, color: 'text-blue-700', bg: 'bg-blue-50', icon: BookOpen },
          { label: 'At Risk', value: atRisk, color: 'text-red-700', bg: 'bg-red-50', icon: Filter },
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

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="form-input pl-9 w-full" />
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="form-select text-sm">
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="form-select text-sm">
          <option value="progress-desc">Progress ↓ (High first)</option>
          <option value="progress-asc">Progress ↑ (Low first)</option>
          <option value="name">Name A–Z</option>
        </select>
        <span className="text-sm text-surface-400 ml-auto">{filtered.length} students</span>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Course</th>
                <th className="text-left px-4 py-3 min-w-36">Progress</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Assignments</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Quizzes</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Last Active</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${s.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {s.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{s.name}</p>
                        <p className="text-xs text-surface-400">{s.batchName || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-surface-700">{s.activeCourse}</td>
                  <td className="px-4 py-3 min-w-36">
                    <ProgressBar value={s.progress} color={progressColor(s.progress)} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-surface-700">{s.assignmentsSubmitted}/{s.assignmentsTotal}</span>
                    {s.assignmentsSubmitted < s.assignmentsTotal && (
                      <span className="text-xs text-red-500 ml-1">({s.assignmentsTotal - s.assignmentsSubmitted} due)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-surface-700">
                    {s.quizzesPassed}/{s.quizzesTotal}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-surface-500">
                    {new Date(s.lastActive).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/students/${s.id}`}>
                      <button className="text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline">View →</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-surface-500">No students match your filters.</div>
          )}
        </div>
      </div>

      {/* Progress distribution chart */}
      <div className="bg-white rounded-2xl border border-surface-100 p-6">
        <h2 className="font-semibold text-surface-900 mb-5">Progress Distribution by Batch</h2>
        <div className="space-y-4">
          {mockBatches.filter(b => b.status === 'ongoing').map(batch => (
            <div key={batch.id}>
              <div className="flex justify-between text-xs text-surface-600 mb-1.5">
                <span className="font-medium">{batch.name}</span>
                <span>{batch.avgProgress}% avg · {batch.enrolled} students</span>
              </div>
              <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', progressColor(batch.avgProgress))}
                  style={{ width: `${batch.avgProgress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
