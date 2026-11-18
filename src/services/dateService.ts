/**
 * Centralized Date & Time Service for Global Minds Academy
 * Handles dynamic current date, day, month, year, weekday, timezone (IST),
 * relative formatting, and the 15-day automatic recurring cycle engine.
 */

import { useState, useEffect } from 'react';

export interface DateCycleInfo {
  // Calendar fields
  currentDate: string;           // YYYY-MM-DD (e.g., '2026-11-18')
  currentDay: number;            // 1-31
  currentMonth: number;          // 1-12
  currentMonthName: string;      // 'November'
  currentMonthShort: string;     // 'Nov'
  currentYear: number;           // 2026
  currentWeekday: string;        // 'Wednesday'
  currentWeekdayShort: string;   // 'Wed'
  currentTimestamp: string;      // ISO 8601
  timezone: string;              // 'Asia/Kolkata'

  // Semi-Monthly 15-Day Cycle (1st-15th, 16th-End of Month)
  cycleIndex: 1 | 2;             // 1 = 1st-15th, 2 = 16th-End
  cycleId: string;               // e.g. "2026-11-C2"
  cycleLabel: string;            // e.g. "Cycle 2 (16 Nov – 30 Nov 2026)"
  cycleStartDate: string;        // '2026-11-16'
  cycleEndDate: string;          // '2026-11-30'
  nextUpdateDate: string;        // '2026-12-01'
  totalDaysInCycle: number;      // 15
  elapsedDaysInCycle: number;    // 3
  daysRemainingInCycle: number;  // 12
  cycleProgressPct: number;      // 20 (%)

  // Continuous Rolling 15-Day Cycle (from fixed anchor epoch)
  rollingCycleId: string;        // e.g. "ROLL-21"
  rollingStartDate: string;      // YYYY-MM-DD
  rollingEndDate: string;        // YYYY-MM-DD
  nextRollingUpdateDate: string; // YYYY-MM-DD
  daysRemainingInRollingCycle: number;

  // Reporting Periods
  reportingPeriod: string;       // "November 2026"
  reportingQuarter: string;      // "Q4 2026"
  academicYear: string;          // "2026-2027"
  isLeapYear: boolean;           // false
}

export interface UpcomingBatchSchedule {
  id: string;
  course: string;
  category: string;
  instructor: string;
  startDate: string;             // YYYY-MM-DD
  formattedStartDate: string;    // e.g. "20 Nov 2026"
  days: string;
  time: string;
  duration: string;
  mode: 'Online' | 'Classroom' | 'Both';
  type: 'Weekday' | 'Weekend' | 'Fast-Track';
  seatsTotal: number;
  seatsLeft: number;
  fee: string;
  badge?: string;
}

export interface UpcomingDemoSlot {
  id: string;
  course: string;
  trainer: string;
  date: string;                  // e.g. "Nov 20, 2026"
  dateValue: string;             // YYYY-MM-DD
  dayOfWeek: string;             // e.g. "Friday"
  time: string;
  mode: string;
  seats: number;
}

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAY_NAMES_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Default to Indian Standard Time (IST) for Global Minds Academy
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

// Anchor epoch for deterministic 15-day rolling cycles (Jan 1, 2026 00:00:00 UTC)
const ROLLING_ANCHOR_EPOCH_MS = Date.UTC(2026, 0, 1);
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

class DateService {
  private timezone: string = DEFAULT_TIMEZONE;
  private subscribers = new Set<() => void>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startMidnightWatcher();
  }

  /**
   * Watches for date changes (checks every minute) and notifies listeners when day changes.
   */
  private startMidnightWatcher(): void {
    if (typeof window === 'undefined') return;
    let lastDate = this.getTodayString();

    this.timer = setInterval(() => {
      const currentDate = this.getTodayString();
      if (currentDate !== lastDate) {
        lastDate = currentDate;
        this.notifySubscribers();
      }
    }, 30000); // Check every 30 seconds
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(cb => {
      try { cb(); } catch (e) { console.error('DateService subscriber error:', e); }
    });
  }

  public setTimezone(tz: string): void {
    this.timezone = tz;
    this.notifySubscribers();
  }

  public getTimezone(): string {
    return this.timezone;
  }

  public isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  public getDaysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  /**
   * Returns current Date in configured timezone.
   */
  public now(): Date {
    return new Date();
  }

  /**
   * Returns today as 'YYYY-MM-DD' in configured timezone.
   */
  public getTodayString(refDate?: Date): string {
    const d = refDate || this.now();
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: this.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(d);
    } catch {
      return d.toISOString().slice(0, 10);
    }
  }

  /**
   * Computes complete, authoritative date and 15-day cycle information.
   */
  public getDateCycleInfo(refDate?: Date): DateCycleInfo {
    const date = refDate || this.now();
    const todayStr = this.getTodayString(date);
    const [yearStr, monthStr, dayStr] = todayStr.split('-');

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-12
    const day = parseInt(dayStr, 10);     // 1-31

    const daysInMonth = this.getDaysInMonth(year, month);
    const weekdayIdx = date.getDay(); // 0-6
    const monthName = MONTH_NAMES_LONG[month - 1] || '';
    const monthShort = MONTH_NAMES_SHORT[month - 1] || '';
    const weekdayName = WEEKDAY_NAMES_LONG[weekdayIdx] || '';
    const weekdayShort = WEEKDAY_NAMES_SHORT[weekdayIdx] || '';

    // Semi-Monthly 15-day cycle:
    // Cycle 1: 1st to 15th
    // Cycle 2: 16th to end of month (28, 29, 30, or 31)
    const cycleIndex: 1 | 2 = day <= 15 ? 1 : 2;
    const cycleStartDay = cycleIndex === 1 ? 1 : 16;
    const cycleEndDay = cycleIndex === 1 ? 15 : daysInMonth;

    const cycleStartDate = `${year}-${String(month).padStart(2, '0')}-${String(cycleStartDay).padStart(2, '0')}`;
    const cycleEndDate = `${year}-${String(month).padStart(2, '0')}-${String(cycleEndDay).padStart(2, '0')}`;

    let nextUpdateDate: string;
    if (cycleIndex === 1) {
      nextUpdateDate = `${year}-${String(month).padStart(2, '0')}-16`;
    } else {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      nextUpdateDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
    }

    const totalDaysInCycle = cycleEndDay - cycleStartDay + 1;
    const elapsedDaysInCycle = day - cycleStartDay + 1;
    const daysRemainingInCycle = Math.max(0, totalDaysInCycle - elapsedDaysInCycle);
    const cycleProgressPct = Math.min(100, Math.round((elapsedDaysInCycle / totalDaysInCycle) * 100));

    const cycleId = `${year}-${String(month).padStart(2, '0')}-C${cycleIndex}`;
    const cycleLabel = `Cycle ${cycleIndex} (${cycleStartDay} ${monthShort} – ${cycleEndDay} ${monthShort} ${year})`;

    // Continuous Rolling 15-day cycle from anchor
    const currentMs = date.getTime();
    const diffMs = Math.max(0, currentMs - ROLLING_ANCHOR_EPOCH_MS);
    const rollingCycleIndex = Math.floor(diffMs / FIFTEEN_DAYS_MS);
    const rollingStartMs = ROLLING_ANCHOR_EPOCH_MS + (rollingCycleIndex * FIFTEEN_DAYS_MS);
    const rollingEndMs = rollingStartMs + FIFTEEN_DAYS_MS - 1;
    const nextRollingMs = rollingStartMs + FIFTEEN_DAYS_MS;

    const rollingCycleId = `ROLL-${rollingCycleIndex + 1}`;
    const rollingStartDate = new Date(rollingStartMs).toISOString().slice(0, 10);
    const rollingEndDate = new Date(rollingEndMs).toISOString().slice(0, 10);
    const nextRollingUpdateDate = new Date(nextRollingMs).toISOString().slice(0, 10);
    const daysRemainingInRollingCycle = Math.max(0, Math.ceil((nextRollingMs - currentMs) / (24 * 60 * 60 * 1000)));

    // Quarter calculation
    const quarterNumber = Math.ceil(month / 3);
    const reportingQuarter = `Q${quarterNumber} ${year}`;
    const reportingPeriod = `${monthName} ${year}`;
    const academicYear = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

    return {
      currentDate: todayStr,
      currentDay: day,
      currentMonth: month,
      currentMonthName: monthName,
      currentMonthShort: monthShort,
      currentYear: year,
      currentWeekday: weekdayName,
      currentWeekdayShort: weekdayShort,
      currentTimestamp: date.toISOString(),
      timezone: this.timezone,

      cycleIndex,
      cycleId,
      cycleLabel,
      cycleStartDate,
      cycleEndDate,
      nextUpdateDate,
      totalDaysInCycle,
      elapsedDaysInCycle,
      daysRemainingInCycle,
      cycleProgressPct,

      rollingCycleId,
      rollingStartDate,
      rollingEndDate,
      nextRollingUpdateDate,
      daysRemainingInRollingCycle,

      reportingPeriod,
      reportingQuarter,
      academicYear,
      isLeapYear: this.isLeapYear(year),
    };
  }

  /**
   * Formats a date string or Date object.
   */
  public formatDate(
    input: string | Date | null | undefined,
    format: 'short' | 'long' | 'input' | 'month-year' | 'relative' = 'short'
  ): string {
    if (!input) return '';
    const date = typeof input === 'string' ? new Date(input) : input;
    if (isNaN(date.getTime())) return String(input);

    if (format === 'relative') {
      return this.formatRelative(date);
    }

    if (format === 'input') {
      return this.getTodayString(date);
    }

    if (format === 'month-year') {
      return date.toLocaleDateString('en-IN', {
        timeZone: this.timezone,
        month: 'long',
        year: 'numeric'
      });
    }

    if (format === 'long') {
      return date.toLocaleDateString('en-IN', {
        timeZone: this.timezone,
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    // Default 'short': e.g. "18 Nov 2026"
    return date.toLocaleDateString('en-IN', {
      timeZone: this.timezone,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  public formatRelative(date: Date): string {
    const now = this.now();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

    if (Math.abs(diffSeconds) < 60) return 'Just now';
    if (diffSeconds > 0 && diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds > 0 && diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 1 && diffDays <= 15) return `${diffDays} days ago`;
    if (diffDays < -1 && diffDays >= -15) return `In ${Math.abs(diffDays)} days`;

    return this.formatDate(date, 'short');
  }

  /**
   * Generates dynamic upcoming batch schedules anchored to the current/next 15-day cycle.
   * Eliminates stale hardcoded dates so batches are ALWAYS upcoming and active.
   */
  public getUpcomingBatches(): UpcomingBatchSchedule[] {
    const cycle = this.getDateCycleInfo();
    const today = new Date();

    // Calculate dates within the current cycle and upcoming 15-day window
    const addDays = (base: Date, days: number): Date => {
      const res = new Date(base);
      res.setDate(res.getDate() + days);
      return res;
    };

    // Stagger dates realistically: next Monday, next Wed, next Saturday, etc.
    const batchTemplates = [
      {
        id: 'b1',
        course: 'AWS Cloud Solutions Architect',
        category: 'Cloud',
        instructor: 'Rajesh Kumar',
        dayOffset: 3,
        days: 'Mon / Wed / Fri',
        time: '7:00 AM – 9:00 AM',
        duration: '60 Hrs',
        mode: 'Online' as const,
        type: 'Weekday' as const,
        seatsTotal: 25,
        seatsLeft: 7,
        fee: '₹18,999',
        badge: 'Filling Fast'
      },
      {
        id: 'b2',
        course: 'Full Stack Development (MERN)',
        category: 'Full Stack',
        instructor: 'Priya Nair',
        dayOffset: 5,
        days: 'Sat / Sun',
        time: '10:00 AM – 1:00 PM',
        duration: '90 Hrs',
        mode: 'Both' as const,
        type: 'Weekend' as const,
        seatsTotal: 20,
        seatsLeft: 12,
        fee: '₹22,999',
        badge: 'New Batch'
      },
      {
        id: 'b3',
        course: 'Machine Learning & AI',
        category: 'AI / ML',
        instructor: 'Suresh Anand',
        dayOffset: 7,
        days: 'Tue / Thu',
        time: '7:00 PM – 9:00 PM',
        duration: '50 Hrs',
        mode: 'Online' as const,
        type: 'Weekday' as const,
        seatsTotal: 30,
        seatsLeft: 18,
        fee: '₹16,999'
      },
      {
        id: 'b4',
        course: 'Data Science & Analytics',
        category: 'Data Science',
        instructor: 'Anitha Reddy',
        dayOffset: 9,
        days: 'Mon – Fri',
        time: '10:00 AM – 4:00 PM',
        duration: '80 Hrs',
        mode: 'Classroom' as const,
        type: 'Fast-Track' as const,
        seatsTotal: 15,
        seatsLeft: 4,
        fee: '₹24,999',
        badge: 'Last 4 Seats'
      },
      {
        id: 'b5',
        course: 'Automation Testing (Selenium)',
        category: 'Software Testing',
        instructor: 'Kiran Babu',
        dayOffset: 11,
        days: 'Sat / Sun',
        time: '2:00 PM – 5:00 PM',
        duration: '40 Hrs',
        mode: 'Online' as const,
        type: 'Weekend' as const,
        seatsTotal: 25,
        seatsLeft: 10,
        fee: '₹14,999'
      },
      {
        id: 'b6',
        course: 'DevOps & Kubernetes',
        category: 'DevOps',
        instructor: 'Venkatesh Rao',
        dayOffset: 13,
        days: 'Mon / Wed / Fri',
        time: '8:00 PM – 10:00 PM',
        duration: '50 Hrs',
        mode: 'Online' as const,
        type: 'Weekday' as const,
        seatsTotal: 25,
        seatsLeft: 8,
        fee: '₹16,999',
        badge: 'Filling Fast'
      },
      {
        id: 'b7',
        course: 'Cyber Security & Ethical Hacking',
        category: 'Security',
        instructor: 'Arjun Singh',
        dayOffset: 15,
        days: 'Sat / Sun',
        time: '10:00 AM – 1:00 PM',
        duration: '45 Hrs',
        mode: 'Classroom' as const,
        type: 'Weekend' as const,
        seatsTotal: 20,
        seatsLeft: 5,
        fee: '₹15,999'
      },
      {
        id: 'b8',
        course: 'Python & Django Full Stack',
        category: 'Programming',
        instructor: 'Divya Krishnan',
        dayOffset: 17,
        days: 'Mon / Wed / Fri',
        time: '7:00 AM – 8:30 AM',
        duration: '45 Hrs',
        mode: 'Online' as const,
        type: 'Weekday' as const,
        seatsTotal: 30,
        seatsLeft: 16,
        fee: '₹9,999',
        badge: 'New Batch'
      },
    ];

    return batchTemplates.map(b => {
      const batchDate = addDays(today, b.dayOffset);
      const dateStr = this.getTodayString(batchDate);
      return {
        id: b.id,
        course: b.course,
        category: b.category,
        instructor: b.instructor,
        startDate: dateStr,
        formattedStartDate: this.formatDate(batchDate, 'short'),
        days: b.days,
        time: b.time,
        duration: b.duration,
        mode: b.mode,
        type: b.type,
        seatsTotal: b.seatsTotal,
        seatsLeft: b.seatsLeft,
        fee: b.fee,
        badge: b.badge,
      };
    });
  }

  /**
   * Generates dynamic upcoming demo class slots starting from tomorrow.
   */
  public getUpcomingDemoSlots(): UpcomingDemoSlot[] {
    const today = new Date();
    const slots = [
      { course: 'AWS / Cloud', trainer: 'Rajesh Kumar', offsetDays: 1, time: '10:00 AM IST', mode: 'Online (Zoom)', seats: 5 },
      { course: 'Full Stack Development', trainer: 'Priya Nair', offsetDays: 2, time: '11:00 AM IST', mode: 'Online (Zoom)', seats: 8 },
      { course: 'Data Science & AI', trainer: 'Anitha Reddy', offsetDays: 3, time: '7:00 PM IST', mode: 'Online (Zoom)', seats: 12 },
      { course: 'Machine Learning', trainer: 'Suresh Anand', offsetDays: 4, time: '9:00 AM IST', mode: 'Online (Zoom)', seats: 4 },
      { course: 'Cyber Security', trainer: 'Arjun Singh', offsetDays: 5, time: '6:00 PM IST', mode: 'Online (Zoom)', seats: 10 },
      { course: 'DevOps & Docker', trainer: 'Venkatesh Rao', offsetDays: 6, time: '8:00 PM IST', mode: 'Online (Zoom)', seats: 7 },
    ];

    return slots.map((s, idx) => {
      const slotDate = new Date(today);
      slotDate.setDate(slotDate.getDate() + s.offsetDays);
      const dateValue = this.getTodayString(slotDate);
      const formatted = this.formatDate(slotDate, 'short');
      const dayOfWeek = WEEKDAY_NAMES_LONG[slotDate.getDay()];

      return {
        id: `demo-${idx + 1}`,
        course: s.course,
        trainer: s.trainer,
        date: formatted,
        dateValue,
        dayOfWeek,
        time: s.time,
        mode: s.mode,
        seats: s.seats,
      };
    });
  }

  /**
   * Calculates the recurring 15-day application deadline (end of current or next cycle).
   */
  public getCycleDeadline(advanceCycles: number = 0): { deadlineDate: string; formattedDeadline: string } {
    const cycle = this.getDateCycleInfo();
    if (advanceCycles === 0) {
      return {
        deadlineDate: cycle.cycleEndDate,
        formattedDeadline: this.formatDate(cycle.cycleEndDate, 'short'),
      };
    }
    // Return next cycle end date
    const nextStart = new Date(cycle.nextUpdateDate);
    const nextCycle = this.getDateCycleInfo(nextStart);
    return {
      deadlineDate: nextCycle.cycleEndDate,
      formattedDeadline: this.formatDate(nextCycle.cycleEndDate, 'short'),
    };
  }

  /**
   * Returns formatted policy revision date (e.g., "November 2026").
   */
  public getPolicyLastUpdated(): string {
    const info = this.getDateCycleInfo();
    return `${info.currentMonthName} ${info.currentYear}`;
  }
}

export const dateService = new DateService();

/**
 * React Hook that subscribes to date system updates.
 * Rerenders components reactively when the day rolls over at midnight
 * without requiring a manual page refresh.
 */
export function useDateSystem(): {
  dateInfo: DateCycleInfo;
  todayString: string;
  currentYear: number;
  currentMonth: string;
  formatDate: (input: string | Date | null | undefined, format?: 'short' | 'long' | 'input' | 'month-year' | 'relative') => string;
} {
  const [dateInfo, setDateInfo] = useState<DateCycleInfo>(() => dateService.getDateCycleInfo());

  useEffect(() => {
    const unsubscribe = dateService.subscribe(() => {
      setDateInfo(dateService.getDateCycleInfo());
    });
    return unsubscribe;
  }, []);

  return {
    dateInfo,
    todayString: dateInfo.currentDate,
    currentYear: dateInfo.currentYear,
    currentMonth: dateInfo.currentMonthName,
    formatDate: dateService.formatDate.bind(dateService),
  };
}

