import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SpotlightCard } from '../ui/SpotlightCard';
import { dateService } from '../../services/dateService';
import { DateCycleBadge } from '../common/DateCycleBadge';
import { usePublicBatches } from '../../hooks/usePublicBatches';

const cardStyles = [
  ['bg-brand-50 border-brand-200', 'bg-brand-100 text-brand-700'],
  ['bg-amber-50 border-amber-200', 'bg-amber-100 text-amber-700'],
  ['bg-purple-50 border-purple-200', 'bg-purple-100 text-purple-700'],
  ['bg-cyan-50 border-cyan-200', 'bg-cyan-100 text-cyan-700'],
];

export function UpcomingBatchesSection() {
  const batches = usePublicBatches().slice(0, 4);
  if (!batches.length) return null;

  return (
    <section className="section bg-surface-50" aria-label="Upcoming batches">
      <div className="container-xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm text-brand-700 font-bold uppercase tracking-wider mb-3">Start learning soon</p>
            <h2 className="display-md">Upcoming <span className="text-gradient">Batch Schedule</span></h2>
            <p className="text-surface-700 font-medium mt-3 max-w-xl">
              View the upcoming batches published by our administrators.
            </p>
            <div className="mt-3"><DateCycleBadge variant="pill" /></div>
          </div>
          <Link to="/batch-schedule" className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800 transition-colors">
            View full schedule <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {batches.map((batch, index) => {
            const [color, modeColor] = cardStyles[index % cardStyles.length]!;
            const schedule = batch.schedule;
            const mode = typeof schedule.mode === 'string' ? schedule.mode : '';
            const time = typeof schedule.time === 'string' ? schedule.time : '';
            const days = Array.isArray(schedule.days) ? schedule.days.join(' / ') : '';
            const seats = typeof schedule.seatsLeft === 'number' ? schedule.seatsLeft : null;
            return (
              <SpotlightCard key={batch.id} className="h-full">
                <Link
                  to="/batch-schedule"
                  className={cn('group rounded-2xl border p-5 transition-all duration-300 block h-full', 'hover:shadow-card-md hover:-translate-y-1', color)}
                >
                  {mode && <span className={cn('inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3', modeColor)}>{mode}</span>}
                  <h3 className="font-display font-bold text-surface-900 mb-3 group-hover:text-brand-700 transition-colors">{batch.name}</h3>
                  <div className="space-y-2 text-sm text-surface-700 font-medium">
                    {batch.startDate && <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-surface-600 shrink-0" />
                      <span>{dateService.formatDate(batch.startDate, 'short')}</span>
                    </div>}
                    {(days || time) && <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-surface-600 shrink-0" />
                      <span>{[days, time].filter(Boolean).join(' · ')}</span>
                    </div>}
                    {seats !== null && <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-surface-600 shrink-0" />
                      <span className="font-bold text-emerald-800">{seats} seats left</span>
                    </div>}
                  </div>
                  <div className="mt-4 pt-3 border-t border-surface-200 text-xs font-bold text-brand-700 group-hover:text-brand-800">
                    View schedule →
                  </div>
                </Link>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
