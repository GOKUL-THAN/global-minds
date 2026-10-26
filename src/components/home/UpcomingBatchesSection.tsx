import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const upcomingBatches = [
  {
    course: 'Full Stack Development',
    date: 'Oct 28, 2026',
    time: 'Mon–Fri, 7:00 PM IST',
    mode: 'Online',
    seats: 12,
    href: '/courses/full-stack-development',
    color: 'bg-brand-50 border-brand-200',
    modeColor: 'bg-brand-100 text-brand-700',
  },
  {
    course: 'AWS / Cloud',
    date: 'Nov 04, 2026',
    time: 'Mon–Fri, 8:00 PM IST',
    mode: 'Online',
    seats: 8,
    href: '/courses/aws-training',
    color: 'bg-amber-50 border-amber-200',
    modeColor: 'bg-amber-100 text-amber-700',
  },
  {
    course: 'Data Science',
    date: 'Nov 11, 2026',
    time: 'Sat–Sun, 10:00 AM IST',
    mode: 'Weekend',
    seats: 15,
    href: '/courses/data-science',
    color: 'bg-purple-50 border-purple-200',
    modeColor: 'bg-purple-100 text-purple-700',
  },
  {
    course: 'Software Testing',
    date: 'Nov 18, 2026',
    time: 'Mon–Fri, 6:30 PM IST',
    mode: 'Chennai Classroom',
    seats: 20,
    href: '/courses/software-testing',
    color: 'bg-cyan-50 border-cyan-200',
    modeColor: 'bg-cyan-100 text-cyan-700',
  },
];

export function UpcomingBatchesSection() {
  return (
    <section className="section bg-surface-50" aria-label="Upcoming batches">
      <div className="container-xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-3">
              Start learning soon
            </p>
            <h2 className="display-md">
              Upcoming{' '}
              <span className="text-gradient">Batch Schedule</span>
            </h2>
            <p className="text-surface-500 mt-3 max-w-xl">
              Reserve your seat in our next batch. Limited seats available for personalised mentorship.
            </p>
          </div>
          <Link to="/batch-schedule" className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            View full schedule <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {upcomingBatches.map((batch) => (
            <Link
              key={batch.course}
              to={batch.href}
              className={cn(
                'group rounded-2xl border p-5 transition-all duration-300',
                'hover:shadow-card-md hover:-translate-y-1',
                batch.color,
              )}
            >
              <span className={cn('inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3', batch.modeColor)}>
                {batch.mode}
              </span>
              <h3 className="font-display font-bold text-surface-900 mb-3 group-hover:text-brand-700 transition-colors">
                {batch.course}
              </h3>
              <div className="space-y-2 text-sm text-surface-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-surface-400 shrink-0" />
                  <span>{batch.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-surface-400 shrink-0" />
                  <span>{batch.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-surface-400 shrink-0" />
                  <span className="font-semibold text-green-600">{batch.seats} seats left</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-200 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                Reserve seat →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
