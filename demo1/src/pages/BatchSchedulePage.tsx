import { useState } from 'react';
import { Calendar, Clock, Monitor, MapPin, Users, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { CTASection } from '../components/home/CTASection';
import { usePageMeta } from '../hooks/usePageMeta';

type Mode = 'All' | 'Online' | 'Classroom' | 'Hybrid' | 'Both';
type BatchType = 'All' | 'Weekday' | 'Weekend' | 'Fast-Track';

interface Batch {
  id: string;
  course: string;
  category: string;
  instructor: string;
  startDate: string;
  days: string;
  time: string;
  duration: string;
  mode: 'Online' | 'Classroom' | 'Hybrid' | 'Both';
  type: 'Weekday' | 'Weekend' | 'Fast-Track';
  seatsTotal: number;
  seatsLeft: number;
  fee: string;
  badge?: string;
}

const upcomingBatches: Batch[] = [
  { id: 'b1', course: 'AWS Solutions Architect', category: 'Cloud Computing', instructor: 'Rajesh Kumar', startDate: '2026-10-15', days: 'Mon / Wed / Fri', time: '7:00 AM – 9:00 AM', duration: '60 Hrs', mode: 'Online', type: 'Weekday', seatsTotal: 25, seatsLeft: 8, fee: '₹18,999', badge: 'Filling Fast' },
  { id: 'b2', course: 'Full Stack Development (MERN)', category: 'Full Stack', instructor: 'Priya Nair', startDate: '2026-10-18', days: 'Sat / Sun', time: '10:00 AM – 1:00 PM', duration: '90 Hrs', mode: 'Both', type: 'Weekend', seatsTotal: 20, seatsLeft: 14, fee: '₹22,999', badge: 'New Batch' },
  { id: 'b3', course: 'DevOps with Kubernetes', category: 'DevOps', instructor: 'Suresh Anand', startDate: '2026-10-20', days: 'Tue / Thu', time: '7:00 PM – 9:00 PM', duration: '50 Hrs', mode: 'Online', type: 'Weekday', seatsTotal: 30, seatsLeft: 20, fee: '₹16,999' },
  { id: 'b4', course: 'Data Science & Machine Learning', category: 'AI / ML', instructor: 'Anitha Reddy', startDate: '2026-10-22', days: 'Mon – Fri', time: '10:00 AM – 4:00 PM', duration: '80 Hrs', mode: 'Classroom', type: 'Fast-Track', seatsTotal: 15, seatsLeft: 5, fee: '₹24,999', badge: 'Last 5 Seats' },
  { id: 'b5', course: 'Selenium Automation Testing', category: 'Software Testing', instructor: 'Kiran Babu', startDate: '2026-10-25', days: 'Sat / Sun', time: '2:00 PM – 5:00 PM', duration: '40 Hrs', mode: 'Online', type: 'Weekend', seatsTotal: 25, seatsLeft: 18, fee: '₹12,999' },
  { id: 'b6', course: 'Microsoft Azure Administrator', category: 'Cloud Computing', instructor: 'Meena Pillai', startDate: '2026-11-01', days: 'Mon / Wed / Fri', time: '8:00 AM – 10:00 AM', duration: '55 Hrs', mode: 'Online', type: 'Weekday', seatsTotal: 25, seatsLeft: 22, fee: '₹17,999', badge: 'New Batch' },
  { id: 'b7', course: 'Python Full Stack', category: 'Full Stack', instructor: 'Arjun Singh', startDate: '2026-11-05', days: 'Mon – Fri', time: '9:00 AM – 12:00 PM', duration: '70 Hrs', mode: 'Classroom', type: 'Fast-Track', seatsTotal: 15, seatsLeft: 11, fee: '₹20,999' },
  { id: 'b8', course: 'Generative AI & Prompt Engineering', category: 'AI / ML', instructor: 'Deepa Krishnan', startDate: '2026-11-08', days: 'Sat / Sun', time: '11:00 AM – 2:00 PM', duration: '30 Hrs', mode: 'Online', type: 'Weekend', seatsTotal: 30, seatsLeft: 24, fee: '₹9,999', badge: 'Trending' },
  { id: 'b9', course: 'Cyber Security Fundamentals', category: 'Cyber Security', instructor: 'Venkat Rao', startDate: '2026-11-12', days: 'Tue / Thu', time: '6:00 PM – 8:00 PM', duration: '45 Hrs', mode: 'Hybrid', type: 'Weekday', seatsTotal: 20, seatsLeft: 15, fee: '₹15,999' },
  { id: 'b10', course: 'React JS + Next.js', category: 'Full Stack', instructor: 'Priya Nair', startDate: '2026-11-15', days: 'Sat / Sun', time: '9:00 AM – 12:00 PM', duration: '45 Hrs', mode: 'Online', type: 'Weekend', seatsTotal: 25, seatsLeft: 20, fee: '₹13,999', badge: 'New Batch' },
  { id: 'b11', course: 'Data Analytics with Power BI', category: 'Data & BI', instructor: 'Ramya Subramanian', startDate: '2026-11-18', days: 'Mon / Wed / Fri', time: '7:00 PM – 9:00 PM', duration: '40 Hrs', mode: 'Online', type: 'Weekday', seatsTotal: 25, seatsLeft: 19, fee: '₹11,999' },
  { id: 'b12', course: 'Java Full Stack Development', category: 'Full Stack', instructor: 'Vikram Sharma', startDate: '2026-11-20', days: 'Mon – Fri', time: '2:00 PM – 6:00 PM', duration: '100 Hrs', mode: 'Classroom', type: 'Fast-Track', seatsTotal: 15, seatsLeft: 9, fee: '₹26,999', badge: 'Filling Fast' },
];

const categories = ['All', 'Cloud Computing', 'Full Stack', 'DevOps', 'AI / ML', 'Software Testing', 'Cyber Security', 'Data & BI'];

function seatColor(left: number, total: number) {
  const pct = left / total;
  if (pct <= 0.2) return 'text-red-600 bg-red-50';
  if (pct <= 0.5) return 'text-orange-600 bg-orange-50';
  return 'text-green-600 bg-green-50';
}

function badgeColor(badge?: string) {
  if (!badge) return '';
  if (badge.includes('Fast') || badge.includes('Seats')) return 'bg-red-100 text-red-700';
  if (badge.includes('Trending')) return 'bg-orange-100 text-orange-700';
  return 'bg-brand-100 text-brand-700';
}

export default function BatchSchedulePage() {
  usePageMeta({
    title: 'Batch Schedule & Upcoming Classes',
    description: 'View all upcoming training batch schedules at Global Minds Academy. Online, classroom and hybrid batches for all courses. Enroll now — limited seats.',
  });

  const [modeFilter, setModeFilter] = useState<Mode>('All');
  const [typeFilter, setTypeFilter] = useState<BatchType>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = upcomingBatches.filter(b => {
    if (modeFilter !== 'All' && modeFilter !== 'Both') {
      if (b.mode !== modeFilter && b.mode !== 'Both') return false;
    }
    if (typeFilter !== 'All' && b.type !== typeFilter) return false;
    if (categoryFilter !== 'All' && b.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Batch Schedule' }]} className="text-white/50 mb-4" />
          <h1 className="display-lg text-white mb-4">Upcoming Batch Schedules</h1>
          <p className="text-white/70 text-xl max-w-2xl">
            Find the right batch that fits your schedule — weekday, weekend, or fast-track. Online, classroom, and hybrid options available.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white border-b border-surface-100 shadow-sm">
        <div className="container-xl py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-surface-400 flex-shrink-0" />

            {/* Mode */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-surface-500 mr-1">Mode:</span>
              {(['All', 'Online', 'Classroom', 'Hybrid'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    modeFilter === m ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-surface-200 hidden sm:block" />

            {/* Type */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-surface-500 mr-1">Type:</span>
              {(['All', 'Weekday', 'Weekend', 'Fast-Track'] as BatchType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    typeFilter === t ? 'bg-accent-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-surface-200 hidden sm:block" />

            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <span className="ml-auto text-sm text-surface-500">{filtered.length} batch{filtered.length !== 1 ? 'es' : ''} found</span>
          </div>
        </div>
      </div>

      {/* Batch List */}
      <section className="section bg-surface-50">
        <div className="container-xl">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="font-display font-bold text-xl mb-2">No batches match your filters</h3>
              <p className="text-surface-500 mb-6">Try adjusting the filters or contact us for a custom schedule.</p>
              <Button onClick={() => { setModeFilter('All'); setTypeFilter('All'); setCategoryFilter('All'); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map(batch => {
                const seatsLeftPct = batch.seatsLeft / batch.seatsTotal;
                const sc = seatColor(batch.seatsLeft, batch.seatsTotal);
                return (
                  <div
                    key={batch.id}
                    className="bg-white rounded-2xl border border-surface-100 p-5 hover:shadow-card-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-display font-bold text-surface-900">{batch.course}</h3>
                              {batch.badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor(batch.badge)}`}>
                                  {batch.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-surface-500">{batch.category} · Trainer: {batch.instructor}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                          <div className="flex items-center gap-2 text-sm text-surface-600">
                            <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            <span>{new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-surface-600">
                            <Clock className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            <span>{batch.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-surface-600">
                            {batch.mode === 'Classroom' ? (
                              <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            ) : (
                              <Monitor className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            )}
                            <span>{batch.mode === 'Both' ? 'Online + Classroom' : batch.mode}</span>                          </div>
                          <div className="flex items-center gap-2 text-sm text-surface-600">
                            <Users className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            <span>{batch.days}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-2 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-display font-bold text-xl text-surface-900">{batch.fee}</div>
                          <div className="text-xs text-surface-400">{batch.duration} · {batch.type}</div>
                        </div>
                        <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${sc}`}>
                          {batch.seatsLeft} seats left
                        </div>
                        {/* Seat bar */}
                        <div className="w-24 bg-surface-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${seatsLeftPct <= 0.2 ? 'bg-red-500' : seatsLeftPct <= 0.5 ? 'bg-orange-400' : 'bg-green-400'}`}
                            style={{ width: `${seatsLeftPct * 100}%` }}
                          />
                        </div>
                        <Link to="/register">
                          <Button size="sm" className="whitespace-nowrap">
                            Enroll Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Benefits strip */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🎯', title: 'Small Batch Sizes', desc: 'Max 25 students per batch for personalised attention.' },
              { icon: '🔄', title: 'Batch Flexibility', desc: 'Switch batches once during the course if needed.' },
              { icon: '📹', title: 'Recorded Sessions', desc: 'All live classes recorded — watch at your own pace.' },
              { icon: '🤝', title: 'Doubt Sessions', desc: 'Weekend doubt-clearing sessions included for every batch.' },
            ].map(b => (
              <div key={b.title} className="p-6 rounded-2xl bg-surface-50">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-semibold text-surface-900 mb-2">{b.title}</h3>
                <p className="text-sm text-surface-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom batch CTA */}
      <section className="section bg-brand-50">
        <div className="container-xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="display-sm mb-4">Can't find a suitable batch?</h2>
            <p className="text-surface-600 mb-8">
              We offer one-to-one and small group training sessions tailored to your schedule. Get a custom batch just for you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button>Request Custom Batch</Button>
              </Link>
              <Link to="/demo-class">
                <Button variant="secondary">Book a Free Demo First</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
