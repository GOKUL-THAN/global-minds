import { Link } from 'react-router-dom';
import { useCourseCatalog } from '../../hooks/useCourseCatalog';
import {
  BookOpen, Users, MessageSquare, Briefcase, TrendingUp,
  ArrowUpRight, DollarSign, Award, Calendar, Clock,
  AlertCircle, Activity,
  GraduationCap, Target, BarChart2,
} from 'lucide-react';
import { masterPrograms } from '../../data/masterPrograms';
import { instructors } from '../../data/instructors';
import { internships } from '../../data/internships';
import {
  mockStudents, mockEnquiries, mockBatches,
  mockSiteActivity, enrollmentTrend, topCourses,
} from '../../data/adminMockData';
import { MockDataNotice } from '../../components/admin/MockDataNotice';

// ── Mini bar chart ─────────────────────────────────────────
function MiniBarChart({ data }: { data: { month: string; enrollments: number }[] }) {
  const max = Math.max(...data.map(d => d.enrollments));
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-brand-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
            style={{ height: `${(d.enrollments / max) * 52}px` }}
            title={`${d.month}: ${d.enrollments} enrollments`}
          />
          <span className="text-xs text-surface-400">{d.month.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────
function StatCard({
  label, value, change, icon: Icon, color, href, trend,
}: {
  label: string; value: string | number; change?: string;
  icon: React.ElementType; color: string; href: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Link to={href} className="bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-card-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-surface-300 group-hover:text-brand-500 transition-colors" />
      </div>
      <div className="text-3xl font-black text-surface-900 mb-1">{value}</div>
      <div className="text-sm text-surface-500">{label}</div>
      {change && (
        <div className={`text-xs mt-1 flex items-center gap-1 ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-surface-400'
        }`}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {change}
        </div>
      )}
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { courses } = useCourseCatalog();
  const newEnquiries = mockEnquiries.filter(e => e.status === 'new').length;
  const activeStudents = mockStudents.filter(s => s.status === 'active').length;
  const pendingFees = mockStudents.reduce((a, s) => a + s.feePending, 0);
  const activeBatches = mockBatches.filter(b => b.status === 'ongoing' || b.status === 'upcoming').length;
  const recentActivity = [...mockSiteActivity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  return (
    <div className="min-w-0 space-y-7">
      <MockDataNotice>Dashboard student counts, balances, batch totals, and activity are illustrative mock values, not live operational data.</MockDataNotice>
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-1">
            Global Minds Academy Admin Portal ·{' '}
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/students">
            <button className="btn-secondary btn text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Students</button>
          </Link>
          <Link to="/">
            <button className="btn-secondary btn text-sm">View Website ↗</button>
          </Link>
        </div>
      </div>

      {/* KPI Cards — row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Students" value={mockStudents.length} change={`${activeStudents} active now`} icon={Users} color="bg-brand-50 text-brand-600" href="/admin/students" trend="up" />
        <StatCard label="New Enquiries" value={newEnquiries} change="Needs response" icon={MessageSquare} color="bg-blue-50 text-blue-600" href="/admin/enquiries" trend={newEnquiries > 0 ? 'up' : 'neutral'} />
        <StatCard label="Active Batches" value={activeBatches} change={`${mockBatches.filter(b => b.status === 'upcoming').length} upcoming`} icon={Calendar} color="bg-green-50 text-green-600" href="/admin/batches" trend="up" />
        <StatCard label="Pending Fees" value={`₹${(pendingFees / 1000).toFixed(0)}K`} change={pendingFees > 0 ? 'Follow up needed' : 'All clear'} icon={DollarSign} color={pendingFees > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'} href="/admin/payments" trend={pendingFees > 0 ? 'down' : 'up'} />
      </div>

      {/* KPI Cards — row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Courses" value={courses.length} icon={BookOpen} color="bg-purple-50 text-purple-600" href="/admin/courses" />
        <StatCard label="Master Programs" value={masterPrograms.length} icon={Award} color="bg-accent-50 text-accent-600" href="/admin/master-programs" />
        <StatCard label="Expert Instructors" value={instructors.length} icon={GraduationCap} color="bg-sky-50 text-sky-600" href="/admin/instructors" />
        <StatCard label="Open Internships" value={internships.filter(i => i.status === 'open').length} icon={Briefcase} color="bg-teal-50 text-teal-600" href="/admin/internships" />
      </div>

      {/* Middle row: Chart + Quick actions + Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Enrollment trend chart */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-surface-900">Enrollment Trend</h2>
              <p className="text-xs text-surface-400 mt-0.5">Last 6 months</p>
            </div>
            <BarChart2 className="w-5 h-5 text-surface-300" />
          </div>
          <MiniBarChart data={enrollmentTrend} />
          <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between text-xs text-surface-500">
            <span>This month: <strong className="text-surface-900">{enrollmentTrend[enrollmentTrend.length - 1].enrollments}</strong></span>
            <span className="text-green-600 font-medium">+21% vs last month</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6">
          <h2 className="font-semibold text-surface-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Add New Course', href: '/admin/courses', icon: BookOpen, color: 'bg-brand-600' },
              { label: 'View New Enquiries', href: '/admin/enquiries', icon: MessageSquare, color: 'bg-blue-600', badge: newEnquiries > 0 ? `${newEnquiries} new` : undefined },
              { label: 'Manage Batches', href: '/admin/batches', icon: Calendar, color: 'bg-green-600' },
              { label: 'Student Activity', href: '/admin/activity', icon: Activity, color: 'bg-purple-600' },
              { label: 'View Payments', href: '/admin/payments', icon: DollarSign, color: 'bg-orange-500' },
              { label: 'Manage Certificates', href: '/admin/certificates', icon: Award, color: 'bg-yellow-500' },
            ].map(a => (
              <Link key={a.label} to={a.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-50 transition-colors group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color} flex-shrink-0`}>
                  <a.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-surface-700 group-hover:text-surface-900 flex-1">{a.label}</span>
                {a.badge && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">{a.badge}</span>}
                <ArrowUpRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-brand-500" />
              </Link>
            ))}
          </div>
        </div>

        {/* Needs attention */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6">
          <h2 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" /> Needs Attention
          </h2>
          <div className="space-y-3">
            {mockStudents.filter(s => s.status === 'inactive' || s.attendance < 70 || s.feePending > 0).slice(0, 4).map(s => (
              <div key={s.id} className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                <div className={`w-8 h-8 ${s.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{s.name}</p>
                  {s.status === 'inactive' && <p className="text-xs text-red-600">Inactive since {new Date(s.lastActive).toLocaleDateString('en-IN')}</p>}
                  {s.attendance < 70 && <p className="text-xs text-orange-600">Attendance: {s.attendance}%</p>}
                  {s.feePending > 0 && <p className="text-xs text-red-600">Fee due: ₹{s.feePending.toLocaleString()}</p>}
                </div>
                <Link to={`/admin/students/${s.id}`}>
                  <button className="text-xs text-brand-600 hover:underline">View</button>
                </Link>
              </div>
            ))}
            {mockEnquiries.filter(e => !e.assignedTo).slice(0, 2).map(e => (
              <div key={e.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {e.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{e.name}</p>
                  <p className="text-xs text-blue-700">New enquiry — {e.course}</p>
                </div>
                <Link to="/admin/enquiries">
                  <button className="text-xs text-blue-600 hover:underline">Assign</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Recent activity + Top courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live activity feed */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-surface-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" /> Live Activity Feed
            </h2>
            <Link to="/admin/activity" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map(activity => {
              const icons: Record<string, string> = {
                login: '🔐', lesson: '📖', quiz: '📝', assignment: '📋',
                certificate: '🏆', enquiry: '💬', enrollment: '🎓',
                payment: '💳', download: '⬇️', forum: '💭',
              };
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-surface-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                    {icons[activity.type] ?? '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-700 leading-snug truncate">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-surface-400">{activity.actor}</span>
                      <span className="text-xs text-surface-300">·</span>
                      <span className="text-xs text-surface-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top courses */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-surface-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-500" /> Top Courses
            </h2>
            <Link to="/admin/courses" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {topCourses.map((c, i) => (
              <div key={c.course}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-surface-400 w-5">#{i + 1}</span>
                    <span className="text-sm text-surface-800 font-medium">{c.course}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-500">
                    <span className="text-green-700 font-medium">{c.completion}% complete</span>
                    <span className="font-semibold text-surface-900">{c.enrollments}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${(c.enrollments / topCourses[0].enrollments) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-surface-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-black text-surface-900">{courses.length}</p>
                <p className="text-xs text-surface-400">Active</p>
              </div>
              <div>
                <p className="text-lg font-black text-brand-600">{courses.filter(course => course.featured).length}</p>
                <p className="text-xs text-surface-400">Featured</p>
              </div>
              <div>
                <p className="text-lg font-black text-accent-600">{courses.filter(course => course.trending).length}</p>
                <p className="text-xs text-surface-400">Trending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student progress summary */}
      <div className="bg-white rounded-2xl border border-surface-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-surface-900">Student Progress Overview</h2>
          <Link to="/admin/students" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-surface-400 uppercase tracking-wide border-b border-surface-100">
                <th className="text-left pb-3 pr-4">Student</th>
                <th className="text-left pb-3 px-4">Course</th>
                <th className="text-left pb-3 px-4 min-w-28">Progress</th>
                <th className="text-left pb-3 px-4 min-w-28">Attendance</th>
                <th className="text-left pb-3 px-4">Status</th>
                <th className="text-left pb-3 pl-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {mockStudents.slice(0, 6).map(s => {
                const statusColors: Record<string, string> = {
                  active: 'bg-green-100 text-green-700', inactive: 'bg-red-100 text-red-700',
                  completed: 'bg-brand-100 text-brand-700', trial: 'bg-yellow-100 text-yellow-700',
                  suspended: 'bg-surface-100 text-surface-600',
                };
                return (
                  <tr key={s.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 ${s.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {s.avatar}
                        </div>
                        <span className="font-medium text-surface-900 whitespace-nowrap">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-surface-600 whitespace-nowrap">{s.activeCourse}</td>
                    <td className="py-3 px-4 min-w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.progress >= 80 ? 'bg-green-500' : s.progress >= 50 ? 'bg-brand-500' : 'bg-orange-400'}`} style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-xs text-surface-500 w-8 text-right">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 min-w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.attendance >= 80 ? 'bg-green-500' : s.attendance >= 60 ? 'bg-orange-400' : 'bg-red-500'}`} style={{ width: `${s.attendance}%` }} />
                        </div>
                        <span className="text-xs text-surface-500 w-8 text-right">{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[s.status]}`}>{s.status}</span>
                    </td>
                    <td className="py-3 pl-4 text-xs text-surface-400">
                      {new Date(s.lastActive).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
