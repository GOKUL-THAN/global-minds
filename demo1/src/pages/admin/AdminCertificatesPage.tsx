import { useState } from 'react';
import { Award, Search, Download, CheckCircle, Clock } from 'lucide-react';
import { mockStudents } from '../../data/adminMockData';
import { MockDataNotice } from '../../components/admin/MockDataNotice';
import { Badge } from '../../components/ui/Badge';

// Generate certificate records from students who have earned them + some pending
const allCertificates = [
  ...mockStudents.filter(s => s.certificateEarned).map(s => ({
    id: `cert-${s.id}`,
    studentId: s.id,
    studentName: s.name,
    studentEmail: s.email,
    course: s.activeCourse,
    issueDate: new Date(s.lastActive).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: 'issued' as const,
    certNumber: `GMA-${new Date().getFullYear()}-${s.id.toUpperCase()}`,
    avatar: s.avatar,
    avatarColor: s.avatarColor,
  })),
  ...mockStudents.filter(s => s.progress >= 90 && !s.certificateEarned).map(s => ({
    id: `cert-pending-${s.id}`,
    studentId: s.id,
    studentName: s.name,
    studentEmail: s.email,
    course: s.activeCourse,
    issueDate: '—',
    status: 'pending' as const,
    certNumber: '—',
    avatar: s.avatar,
    avatarColor: s.avatarColor,
  })),
];

const statsData = [
  { label: 'Total Issued', value: allCertificates.filter(c => c.status === 'issued').length, color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle },
  { label: 'Pending Issuance', value: allCertificates.filter(c => c.status === 'pending').length, color: 'text-orange-700', bg: 'bg-orange-50', icon: Clock },
  { label: 'Total Students', value: mockStudents.length, color: 'text-brand-700', bg: 'bg-brand-50', icon: Award },
];

export default function AdminCertificatesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'pending'>('all');

  const filtered = allCertificates.filter(c => {
    const matchSearch = !search ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.course.toLowerCase().includes(search.toLowerCase()) ||
      c.certNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <MockDataNotice>Certificate recipients and completion status are generated from sample student data.</MockDataNotice>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Certificates</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage course completion certificates</p>
        </div>
        <button className="btn-primary btn flex items-center gap-2 opacity-50 cursor-not-allowed" disabled title="Requires backend + PDF generation service">
          <Award className="w-4 h-4" /> Issue Certificate
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {statsData.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 flex items-center gap-4 border border-white`}>
            <s.icon className={`w-8 h-8 ${s.color} flex-shrink-0`} />
            <div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-surface-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, course or cert number..."
            className="form-input pl-9 w-full" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'issued', 'pending'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-sm text-surface-400">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-4 py-3">Course</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Certificate No.</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Issued On</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(cert => (
                <tr key={cert.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${cert.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {cert.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{cert.studentName}</p>
                        <p className="text-xs text-surface-400">{cert.studentEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-surface-700 font-medium">{cert.course}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs font-mono text-surface-600">{cert.certNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-surface-600 hidden lg:table-cell">{cert.issueDate}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cert.status === 'issued' ? 'green' : 'yellow'}>
                      {cert.status === 'issued' ? '✓ Issued' : '⏳ Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-40"
                      title={cert.status === 'issued' ? 'Download certificate' : 'Not yet issued'}
                      disabled={cert.status !== 'issued'}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-surface-500">No certificates match your search.</div>
          )}
        </div>
      </div>
      <p className="text-xs text-surface-400">
        Certificate PDF generation, verification links and bulk issuance require a backend API and PDF generation service.
      </p>
    </div>
  );
}
