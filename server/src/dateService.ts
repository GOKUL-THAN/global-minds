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

  // Fixed rolling 15-day cycle
  cycleIndex: number;
  cycleId: string;
  cycleLabel: string;
  cycleStartDate: string;
  cycleEndDate: string;
  nextUpdateDate: string;
  totalDaysInCycle: number;
  elapsedDaysInCycle: number;
  daysRemainingInCycle: number;
  cycleProgressPct: number;

  // Continuous rolling 15-day cycle
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

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getTodayString(refDate?: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const d = refDate || new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getBackendDateCycleInfo(refDate?: Date, timeZone: string = DEFAULT_TIMEZONE): BackendDateCycleInfo {
  const date = refDate || new Date();
  const todayStr = getTodayString(date, timeZone);
  const [yearStr, monthStr, dayStr] = todayStr.split('-');

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

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
  const cycleLabel = `15-day cycle (${cycleStartDate} – ${cycleEndDate})`;
  const rollingCycleId = cycleId;
  const rollingStartDate = cycleStartDate;
  const rollingEndDate = cycleEndDate;
  const nextRollingUpdateDate = nextUpdateDate;
  const nextRollingUpdateEpoch = zonedMidnightEpoch(nextUpdateDate, timeZone);
  const daysRemainingInRollingCycle = Math.max(0, Math.ceil((nextRollingUpdateEpoch - date.getTime()) / DAY_MS));

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

