import { useState, useMemo } from 'react';
import { DollarSign, Search, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { mockStudents, mockBatches } from '../../data/adminMockData';
import { Badge } from '../../components/ui/Badge';
import { MockDataNotice } from '../../components/admin/MockDataNotice';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { CountUp } from '../../components/ui/CountUp';
import { ShinyText } from '../../components/ui/ShinyText';

type PayStatus = 'paid' | 'partial' | 'pending';

interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  course: string;
  batchName: string;
  totalFee: number;
  paid: number;
  pending: number;
  status: PayStatus;
  lastPaymentDate: string;
  avatar: string;
  avatarColor: string;
}

const paymentRecords: PaymentRecord[] = mockStudents.map(s => {
  const total = s.feePaid + s.feePending;
  const status: PayStatus = s.feePending === 0 ? 'paid' : s.feePaid > 0 ? 'partial' : 'pending';
  return {
    id: `pay-${s.id}`,
    studentId: s.id,
    studentName: s.name,
    email: s.email,
    course: s.activeCourse,
    batchName: s.batchName || '—',
    totalFee: total,
    paid: s.feePaid,
    pending: s.feePending,
    status,
    lastPaymentDate: status !== 'pending'
      ? new Date(s.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—',
    avatar: s.avatar,
    avatarColor: s.avatarColor,
  };
});

const totalRevenue = paymentRecords.reduce((a, r) => a + r.paid, 0);
const totalPending = paymentRecords.reduce((a, r) => a + r.pending, 0);
const paidCount = paymentRecords.filter(r => r.status === 'paid').length;
const partialCount = paymentRecords.filter(r => r.status === 'partial').length;

const statusConfig = {
  paid:    { label: 'Paid',     color: 'green' as const, icon: CheckCircle },
  partial: { label: 'Partial',  color: 'yellow' as const, icon: Clock },
  pending: { label: 'Pending',  color: 'red' as const,   icon: AlertCircle },
};

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayStatus | 'all'>('all');

  const filtered = useMemo(() => paymentRecords.filter(r => {
    const ms = !search || r.studentName.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()) || r.course.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === 'all' || r.status === statusFilter;
    return ms && mf;
  }), [search, statusFilter]);

  return (
    <div className="space-y-6">
      <MockDataNotice>Payment rows and totals are generated from sample student data and are not real transactions.</MockDataNotice>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">
            <ShinyText text="Payments" shinyColor="rgba(23, 108, 115, 0.9)" />
          </h1>
          <p className="text-surface-500 text-sm mt-0.5 font-medium">Fee collection overview — {paymentRecords.length} records</p>
        </div>
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          ⚠ Payment gateway integration (Razorpay/Stripe) pending
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: totalRevenue, prefix: '₹', isCurrency: true, icon: DollarSign, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Pending Fees', value: totalPending, prefix: '₹', isCurrency: true, icon: AlertCircle, color: 'text-orange-700', bg: 'bg-orange-50' },
          { label: 'Fully Paid', value: paidCount, prefix: '', isCurrency: false, icon: CheckCircle, color: 'text-brand-700', bg: 'bg-brand-50' },
          { label: 'Partial / Due', value: partialCount + paymentRecords.filter(r => r.status === 'pending').length, prefix: '', isCurrency: false, icon: TrendingUp, color: 'text-red-700', bg: 'bg-red-50' },
        ].map(k => (
          <SpotlightCard key={k.label}>
            <div className={`${k.bg} rounded-2xl p-5 flex items-center gap-4 border border-white h-full`}>
              <k.icon className={`w-7 h-7 ${k.color} flex-shrink-0`} />
              <div>
                <div className={`text-2xl font-black ${k.color}`}>
                  {k.prefix}
                  <CountUp end={k.isCurrency ? Math.round(k.value / 1000) : k.value} start={true} duration={1.2} suffix={k.isCurrency ? 'K' : ''} />
                </div>
                <div className="text-xs text-surface-500 font-medium">{k.label}</div>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-surface-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, email, course..."
            className="form-input pl-9 w-full" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'paid', 'partial', 'pending'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-sm text-surface-400 ml-auto">{filtered.length} records</span>
      </div>

      {/* Table */}
      <SpotlightCard>
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Course / Batch</th>
                  <th className="text-right px-4 py-3">Total Fee</th>
                  <th className="text-right px-4 py-3">Paid</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Pending</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Last Payment</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filtered.map(rec => {
                  const sc = statusConfig[rec.status];
                  const pct = rec.totalFee > 0 ? Math.round((rec.paid / rec.totalFee) * 100) : 0;
                  return (
                    <tr key={rec.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${rec.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {rec.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{rec.studentName}</p>
                            <p className="text-xs text-surface-400">{rec.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-surface-700 font-medium">{rec.course}</p>
                        <p className="text-xs text-surface-400">{rec.batchName}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-surface-900">₹{rec.totalFee.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">₹{rec.paid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600 hidden md:table-cell">
                        {rec.pending > 0 ? `₹${rec.pending.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-500 hidden lg:table-cell">{rec.lastPaymentDate}</td>
                      <td className="px-4 py-3">
                        <div>
                          <Badge variant={sc.color}>{sc.label}</Badge>
                          {rec.totalFee > 0 && (
                            <div className="w-16 h-1.5 bg-surface-100 rounded-full mt-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${rec.status === 'paid' ? 'bg-green-500' : rec.status === 'partial' ? 'bg-amber-400' : 'bg-red-400'}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-surface-500">No payment records match your search.</div>
            )}
          </div>
        </div>
      </SpotlightCard>

      {/* Batch revenue summary */}
      <SpotlightCard>
        <div className="bg-white rounded-2xl border border-surface-100 p-6">
          <h2 className="font-semibold text-surface-900 mb-5">Revenue by Batch</h2>
          <div className="space-y-3">
            {mockBatches.filter(b => b.enrolled > 0).map(batch => {
              const batchRevenue = batch.enrolled * batch.fee;
              const maxRev = Math.max(...mockBatches.map(b => b.enrolled * b.fee));
              const pct = Math.round((batchRevenue / maxRev) * 100);
              return (
                <div key={batch.id} className="flex items-center gap-4">
                  <span className="text-xs text-surface-700 w-52 flex-shrink-0 truncate">{batch.name}</span>
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-surface-900 w-24 text-right">₹{(batchRevenue / 1000).toFixed(0)}K</span>
                </div>
              );
            })}
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
