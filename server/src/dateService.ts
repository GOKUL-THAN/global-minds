/**
 * Centralized Date & Time Service for Global Minds Academy Backend API
 * Provides authoritative date, day, month, year, timezone, and 15-day cycle calculations.
 */

export interface BackendDateCycleInfo {
  currentDate: string;           // YYYY-MM-DD
  currentDay: number;            // 1-31
  currentMonth: number;          // 1-12
  currentMonthName: string;      // 'November'
  currentMonthShort: string;     // 'Nov'
  currentYear: number;           // 2026
  currentWeekday: string;        // 'Wednesday'
  currentWeekdayShort: string;   // 'Wed'
  currentTimestamp: string;      // ISO 8601 UTC
  timezone: string;              // 'Asia/Kolkata'

  // Semi-Monthly 15-Day Cycle (1st-15th, 16th-End)
  cycleIndex: 1 | 2;
  cycleId: string;
  cycleLabel: string;
  cycleStartDate: string;
  cycleEndDate: string;
  nextUpdateDate: string;
  totalDaysInCycle: number;
  elapsedDaysInCycle: number;
  daysRemainingInCycle: number;
  cycleProgressPct: number;

  // Continuous Rolling 15-Day Cycle
  rollingCycleId: string;
  rollingStartDate: string;
  rollingEndDate: string;
  nextRollingUpdateDate: string;
  daysRemainingInRollingCycle: number;

  reportingPeriod: string;
  reportingQuarter: string;
  academicYear: string;
  isLeapYear: boolean;
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

const DEFAULT_TIMEZONE = 'Asia/Kolkata';
const ROLLING_ANCHOR_EPOCH_MS = Date.UTC(2026, 0, 1);
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getTodayString(refDate?: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const d = refDate || new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function getBackendDateCycleInfo(refDate?: Date, timeZone: string = DEFAULT_TIMEZONE): BackendDateCycleInfo {
  const date = refDate || new Date();
  const todayStr = getTodayString(date, timeZone);
  const [yearStr, monthStr, dayStr] = todayStr.split('-');

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const daysInMonth = getDaysInMonth(year, month);
  const weekdayIdx = date.getDay();
  const monthName = MONTH_NAMES_LONG[month - 1] || '';
  const monthShort = MONTH_NAMES_SHORT[month - 1] || '';
  const weekdayName = WEEKDAY_NAMES_LONG[weekdayIdx] || '';
  const weekdayShort = WEEKDAY_NAMES_SHORT[weekdayIdx] || '';

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
    timezone: timeZone,

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
    isLeapYear: isLeapYear(year),
  };
}

