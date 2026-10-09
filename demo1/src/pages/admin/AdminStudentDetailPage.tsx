import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen,
  Clock, TrendingUp, MessageSquare, Download, Edit3,
} from 'lucide-react';
import { mockStudents, type ActivityType } from '../../data/adminMockData';
import { MockDataNotice } from '../../components/admin/MockDataNotice';

const activityIcon: Record<ActivityType, { icon: string; color: string }> = {
  login:       { icon: '🔐', color: 'bg-surface-100' },
  lesson:      { icon: '📖', color: 'bg-brand-50' },
  quiz:        { icon: '📝', color: 'bg-purple-50' },
  assignment:  { icon: '📋', color: 'bg-orange-50' },
  certificate: { icon: '🏆', color: 'bg-yellow-50' },
  enquiry:     { icon: '💬', color: 'bg-green-50' },
  enrollment:  { icon: '🎓', color: 'bg-brand-50' },
  payment:     { icon: '💳', color: 'bg-green-50' },
  download:    { icon: '⬇️', color: 'bg-surface-50' },
  forum:       { icon: '💭', color: 'bg-sky-50' },
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-surface-50 rounded-xl p-4 text-center">
      <div className={`text-2xl font-black mb-0.5 ${color ?? 'text-surface-900'}`}>{value}</div>
      <div className="text-xs font-medium text-surface-700">{label}</div>
      {sub && <div className="text-xs text-surface-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const student = mockStudents.find(s => s.id === id);

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-surface-500 mb-4">Student not found.</p>
        <Link to="/admin/students" className="text-brand-600 hover:underline">← Back to Students</Link>
      </div>
    );
  }

  const feePct = student.feePaid + student.feePending > 0
    ? Math.round((student.feePaid / (student.feePaid + student.feePending)) * 100)
    : 100;

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    completed: 'bg-brand-100 text-brand-700',
    trial: 'bg-yellow-100 text-yellow-700',
    suspended: 'bg-surface-100 text-surface-600',
  };

  return (
    <div className="space-y-6">
      <MockDataNotice>This student profile, progress, and fee information is sample data.</MockDataNotice>
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/admin/students">
          <button className="p-2 rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-surface-600" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-surface-900">{student.name}</h1>
          <p className="text-surface-500 text-sm">Student ID: {student.id} · Joined {new Date(student.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary btn text-sm flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
          <button className="btn-primary btn text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Message
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="space-y-5">
          {/* Profile */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-16 h-16 ${student.avatarColor} rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                {student.avatar}
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-surface-900">{student.name}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[student.status]}`}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
                {student.certificateEarned && (
                  <span className="ml-2 text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium">🏆 Certified</span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-surface-600">
                <Mail className="w-4 h-4 text-surface-400 flex-shrink-0" />
                <a href={`mailto:${student.email}`} className="hover:text-brand-600 truncate">{student.email}</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-surface-600">
                <Phone className="w-4 h-4 text-surface-400 flex-shrink-0" />
                <a href={`tel:${student.phone}`} className="hover:text-brand-600">{student.phone}</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-surface-600">
                <MapPin className="w-4 h-4 text-surface-400 flex-shrink-0" />
                {student.location}
              </div>
              <div className="flex items-center gap-3 text-sm text-surface-600">
                <Calendar className="w-4 h-4 text-surface-400 flex-shrink-0" />
                Joined {new Date(student.joinedDate).toLocaleDateString('en-IN')}
              </div>
              <div className="flex items-center gap-3 text-sm text-surface-600">
                <TrendingUp className="w-4 h-4 text-surface-400 flex-shrink-0" />
                Source: <span className="capitalize font-medium ml-1">{student.source}</span>
              </div>
            </div>
          </div>

          {/* Fee card */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Fee Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Total Fee</span>
                <span className="font-semibold text-surface-900">₹{(student.feePaid + student.feePending).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Paid</span>
                <span className="font-semibold text-green-700">₹{student.feePaid.toLocaleString()}</span>
              </div>
              {student.feePending > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Pending</span>
                  <span className="font-semibold text-red-700">₹{student.feePending.toLocaleString()}</span>
                </div>
              )}
              <div>
                <div className="flex justify-between text-xs text-surface-500 mb-1">
                  <span>Payment progress</span>
                  <span>{feePct}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${feePct === 100 ? 'bg-green-500' : 'bg-orange-400'}`}
                    style={{ width: `${feePct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled courses */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-500" /> Enrolled Courses
            </h3>
            {student.enrolledCourses.length === 0 ? (
              <p className="text-sm text-surface-500">No courses enrolled yet.</p>
            ) : (
              <div className="space-y-2">
                {student.enrolledCourses.map(c => (
                  <div key={c} className="flex items-center gap-2 text-sm p-2 bg-surface-50 rounded-xl">
                    <BookOpen className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <span className="text-surface-700">{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <h3 className="font-semibold text-surface-900 mb-3">Admin Notes</h3>
            <p className="text-sm text-surface-600 leading-relaxed">{student.notes || 'No notes yet.'}</p>
            <button className="mt-3 text-xs text-brand-600 hover:underline flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Edit notes
            </button>
          </div>
        </div>

        {/* Right: Stats + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance stats */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <h3 className="font-semibold text-surface-900 mb-5">Performance Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard label="Course Progress" value={`${student.progress}%`}
                color={student.progress >= 80 ? 'text-green-700' : student.progress >= 50 ? 'text-brand-700' : 'text-orange-600'}
              />
              <StatCard label="Attendance" value={`${student.attendance}%`}
                color={student.attendance >= 80 ? 'text-green-700' : student.attendance >= 60 ? 'text-orange-600' : 'text-red-600'}
              />
              <StatCard label="Assignments" value={`${student.assignmentsSubmitted}/${student.assignmentsTotal}`}
                sub={`${student.assignmentsTotal - student.assignmentsSubmitted} pending`}
                color="text-purple-700"
              />
              <StatCard label="Quizzes Passed" value={`${student.quizzesPassed}/${student.quizzesTotal}`}
                sub={student.quizzesPassed === student.quizzesTotal ? 'All passed!' : `${student.quizzesTotal - student.quizzesPassed} failed`}
                color="text-sky-700"
              />
            </div>

            {/* Progress bars */}
            <div className="space-y-4">
              {[
                { label: 'Overall Progress', value: student.progress, color: student.progress >= 80 ? 'bg-green-500' : student.progress >= 50 ? 'bg-brand-500' : 'bg-orange-400' },
                { label: 'Attendance Rate', value: student.attendance, color: student.attendance >= 80 ? 'bg-green-500' : student.attendance >= 60 ? 'bg-orange-400' : 'bg-red-500' },
                { label: 'Assignment Completion', value: student.assignmentsTotal > 0 ? Math.round((student.assignmentsSubmitted / student.assignmentsTotal) * 100) : 0, color: 'bg-purple-500' },
                { label: 'Quiz Pass Rate', value: student.quizzesTotal > 0 ? Math.round((student.quizzesPassed / student.quizzesTotal) * 100) : 0, color: 'bg-sky-500' },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs text-surface-600 mb-1">
                    <span>{bar.label}</span>
                    <span className="font-medium">{bar.value}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar.color} transition-all duration-700`} style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current batch */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Current Batch</h3>
            {student.batchName ? (
              <div className="flex items-center gap-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900">{student.batchName}</p>
                  <p className="text-sm text-surface-500">{student.activeCourse}</p>
                </div>
                <Link to={`/admin/batches`} className="ml-auto text-xs text-brand-600 hover:underline">View Batch →</Link>
              </div>
            ) : (
              <p className="text-sm text-surface-500">No active batch.</p>
            )}
          </div>

          {/* Activity timeline */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-surface-900">Activity Timeline</h3>
              <button className="text-xs text-surface-400 flex items-center gap-1 hover:text-surface-700">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            {student.activityLog.length === 0 ? (
              <p className="text-sm text-surface-500">No activity recorded yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-surface-100" />
                <div className="space-y-4">
                  {student.activityLog.map(entry => {
                    const cfg = activityIcon[entry.type];
                    return (
                      <div key={entry.id} className="flex items-start gap-4 relative">
                        <div className={`w-10 h-10 ${cfg.color} rounded-xl flex items-center justify-center text-lg flex-shrink-0 border-2 border-white shadow-sm z-10`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0 pb-4">
                          <p className="text-sm text-surface-800">{entry.description}</p>
                          {entry.meta && (
                            <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full mt-1 inline-block">{entry.meta}</span>
                          )}
                          <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
