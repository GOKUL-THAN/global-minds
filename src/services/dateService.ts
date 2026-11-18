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

  // Fixed rolling 15-day cycle
  cycleIndex: number;
  cycleId: string;               // e.g. "ROLL-22"
  cycleLabel: string;
  cycleStartDate: string;        // YYYY-MM-DD
  cycleEndDate: string;          // YYYY-MM-DD, inclusive
  nextUpdateDate: string;        // YYYY-MM-DD
  totalDaysInCycle: number;      // 15
  elapsedDaysInCycle: number;    // 3
  daysRemainingInCycle: number;  // 12
  cycleProgressPct: number;      // 20 (%)

  // Continuous rolling 15-day cycle
  rollingCycleId: string;        // e.g. "ROLL-22"
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

const ROLLING_ANCHOR_DATE = '2026-01-01';
const DAY_MS = 24 * 60 * 60 * 1000;
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function dateOnlyEpoch(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function dateOnlyString(epoch: number): string {
  return new Date(epoch).toISOString().slice(0, 10);
}

function zonedMidnightEpoch(date: string, timeZone: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const targetEpoch = Date.UTC(year, month - 1, day);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  let guess = targetEpoch;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(guess)).map(part => [part.type, Number(part.value)]),
    );
    const representedEpoch = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    guess += targetEpoch - representedEpoch;
  }
  return guess;
}

function weekdayIndex(date: string): number {
  return new Date(dateOnlyEpoch(date)).getUTCDay();
}

function parseDateInput(input: string | Date): Date {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(`${input}T12:00:00.000Z`);
  }
  return typeof input === 'string' ? new Date(input) : input;
}

export function addCalendarDays(date: string, days: number): string {
  return dateOnlyString(dateOnlyEpoch(date) + days * DAY_MS);
}

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
    new Intl.DateTimeFormat('en', { timeZone: tz });
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
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
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

    const calendarEpoch = dateOnlyEpoch(todayStr);
    const weekdayIdx = new Date(calendarEpoch).getUTCDay();
    const monthName = MONTH_NAMES_LONG[month - 1] || '';
    const monthShort = MONTH_NAMES_SHORT[month - 1] || '';
    const weekdayName = WEEKDAY_NAMES_LONG[weekdayIdx] || '';
    const weekdayShort = WEEKDAY_NAMES_SHORT[weekdayIdx] || '';

    const anchorEpoch = dateOnlyEpoch(ROLLING_ANCHOR_DATE);
    const cycleIndex = Math.floor((calendarEpoch - anchorEpoch) / FIFTEEN_DAYS_MS);
    const cycleStartEpoch = anchorEpoch + cycleIndex * FIFTEEN_DAYS_MS;
    const cycleEndEpoch = cycleStartEpoch + FIFTEEN_DAYS_MS - DAY_MS;
    const nextUpdateEpoch = cycleStartEpoch + FIFTEEN_DAYS_MS;
    const cycleStartDate = dateOnlyString(cycleStartEpoch);
    const cycleEndDate = dateOnlyString(cycleEndEpoch);
    const nextUpdateDate = dateOnlyString(nextUpdateEpoch);

    const totalDaysInCycle = 15;
    const elapsedDaysInCycle = Math.floor((calendarEpoch - cycleStartEpoch) / DAY_MS) + 1;
    const daysRemainingInCycle = Math.max(0, totalDaysInCycle - elapsedDaysInCycle);
    const cycleProgressPct = Math.min(100, Math.round((elapsedDaysInCycle / totalDaysInCycle) * 100));

    const cycleId = `ROLL-${cycleIndex + 1}`;
    const cycleLabel = `15-day cycle (${this.formatDate(cycleStartDate, 'short')} – ${this.formatDate(cycleEndDate, 'short')})`;
    const rollingCycleId = cycleId;
    const rollingStartDate = cycleStartDate;
    const rollingEndDate = cycleEndDate;
    const nextRollingUpdateDate = nextUpdateDate;
    const nextRollingUpdateEpoch = zonedMidnightEpoch(nextUpdateDate, this.timezone);
    const daysRemainingInRollingCycle = Math.max(0, Math.ceil((nextRollingUpdateEpoch - date.getTime()) / DAY_MS));

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
    const date = parseDateInput(input);
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

  public formatDateTime(input: string | Date | null | undefined): string {
    if (!input) return '';
    const date = parseDateInput(input);
    if (Number.isNaN(date.getTime())) return String(input);
    return date.toLocaleString('en-IN', {
      timeZone: this.timezone,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Generates upcoming batch dates from the current IST date and recurring class days.
   * Eliminates stale hardcoded dates so batches are ALWAYS upcoming and active.
   */
  public getUpcomingBatches(): UpcomingBatchSchedule[] {
    const today = this.getTodayString();

    const batchTemplates = [
      {
        id: 'b1',
        course: 'AWS Cloud Solutions Architect',
        category: 'Cloud',
        dayOffset: 3,
        startWeekdays: [1],
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
        dayOffset: 5,
        startWeekdays: [6],
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
        course: 'AIML',
        category: 'AI / ML',
        dayOffset: 7,
        startWeekdays: [2],
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
        dayOffset: 9,
        startWeekdays: [1],
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
        dayOffset: 11,
        startWeekdays: [6],
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
        dayOffset: 13,
        startWeekdays: [1],
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
        dayOffset: 15,
        startWeekdays: [6],
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
        dayOffset: 17,
        startWeekdays: [1],
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

    let lastScheduledDate = today;
    return batchTemplates.map(b => {
      let dateStr = addCalendarDays(today, b.dayOffset);
      while (!b.startWeekdays.includes(weekdayIndex(dateStr)) || dateStr <= lastScheduledDate) {
        dateStr = addCalendarDays(dateStr, 1);
      }
      lastScheduledDate = dateStr;
      return {
        id: b.id,
        course: b.course,
        category: b.category,
        startDate: dateStr,
        formattedStartDate: this.formatDate(dateStr, 'short'),
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
    const today = this.getTodayString();
    const slots = [
      { course: 'AWS / Cloud', offsetDays: 1, time: '10:00 AM IST', mode: 'Online (Zoom)', seats: 5 },
      { course: 'Full Stack Development', offsetDays: 2, time: '11:00 AM IST', mode: 'Online (Zoom)', seats: 8 },
      { course: 'Data Science & AI', offsetDays: 3, time: '7:00 PM IST', mode: 'Online (Zoom)', seats: 12 },
      { course: 'AIML', offsetDays: 4, time: '9:00 AM IST', mode: 'Online (Zoom)', seats: 4 },
      { course: 'Cyber Security', offsetDays: 5, time: '6:00 PM IST', mode: 'Online (Zoom)', seats: 10 },
      { course: 'DevOps & Docker', offsetDays: 6, time: '8:00 PM IST', mode: 'Online (Zoom)', seats: 7 },
    ];

    return slots.map((s, idx) => {
      const dateValue = addCalendarDays(today, s.offsetDays);
      const formatted = this.formatDate(dateValue, 'short');
      const [year, month, day] = dateValue.split('-').map(Number);
      const dayOfWeek = WEEKDAY_NAMES_LONG[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];

      return {
        id: `demo-${idx + 1}`,
        course: s.course,
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

