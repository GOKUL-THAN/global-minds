import React from 'react';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { useDateSystem } from '../../services/dateService';

interface DateCycleBadgeProps {
  variant?: 'banner' | 'pill' | 'compact' | 'admin';
  className?: string;
  showProgress?: boolean;
}

export const DateCycleBadge: React.FC<DateCycleBadgeProps> = ({
  variant = 'pill',
  className = '',
  showProgress = true,
}) => {
  const { dateInfo } = useDateSystem();

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs text-surface-600 bg-surface-100 px-2.5 py-1 rounded-full ${className}`}>
        <Calendar className="w-3.5 h-3.5 text-brand-600" />
        <span className="font-semibold text-surface-900">{dateInfo.currentWeekdayShort}, {dateInfo.currentDay} {dateInfo.currentMonthShort} {dateInfo.currentYear}</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-brand-50 to-teal-50 border border-brand-200/70 rounded-2xl p-4 shadow-sm ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {dateInfo.currentDay}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-700 tracking-wide uppercase">
                  {dateInfo.currentWeekday}, {dateInfo.currentMonthName} {dateInfo.currentYear}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live System Date
                </span>
              </div>
              <p className="text-sm font-bold text-surface-900">
                Current Batch &amp; Admission Window: {dateInfo.cycleLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:text-right">
            <div>
              <div className="text-xs text-surface-600 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-brand-600" />
                Next 15-Day Cycle: <span className="font-semibold text-surface-900">{dateInfo.nextUpdateDate}</span>
              </div>
              <div className="text-xs font-medium text-emerald-700">
                {dateInfo.daysRemainingInCycle} days remaining in current cycle
              </div>
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="mt-3 pt-3 border-t border-brand-100 flex items-center gap-3">
            <span className="text-xs text-surface-600 whitespace-nowrap">Cycle Progress:</span>
            <div className="flex-1 bg-brand-100/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${dateInfo.cycleProgressPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-brand-700">{dateInfo.cycleProgressPct}%</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <div className={`bg-white border border-surface-200 rounded-xl p-4 shadow-sm ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
            15-Day Operational Cycle
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
            {dateInfo.cycleId}
          </span>
        </div>
        <div className="text-base font-bold text-surface-900 mb-1">
          {dateInfo.cycleLabel}
        </div>
        <div className="text-xs text-surface-600 flex items-center justify-between">
          <span>Today: {dateInfo.currentWeekday}, {dateInfo.currentDay} {dateInfo.currentMonthShort} {dateInfo.currentYear}</span>
          <span className="font-semibold text-brand-700">{dateInfo.daysRemainingInCycle} days left</span>
        </div>
      </div>
    );
  }

  // Default 'pill'
  return (
    <div className={`inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-800 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}>
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>{dateInfo.currentWeekdayShort}, {dateInfo.currentDay} {dateInfo.currentMonthShort} {dateInfo.currentYear}</span>
      <span className="text-brand-300">|</span>
      <span>{dateInfo.cycleLabel}</span>
    </div>
  );
};

