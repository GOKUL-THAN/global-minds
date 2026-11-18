import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getBackendDateCycleInfo, getTodayString, isLeapYear } from '../dist/dateService.js';

test('computes calendar date and weekday in the configured timezone', () => {
  const beforeIstMidnight = new Date('2026-11-18T18:29:00.000Z');
  const afterIstMidnight = new Date('2026-11-18T18:30:00.000Z');

  assert.equal(getTodayString(beforeIstMidnight), '2026-11-18');
  assert.equal(getTodayString(afterIstMidnight), '2026-11-19');
  assert.equal(getBackendDateCycleInfo(afterIstMidnight).currentWeekday, 'Thursday');
  assert.equal(getTodayString(afterIstMidnight, 'America/Los_Angeles'), '2026-11-18');
  const laBeforeMidnight = getBackendDateCycleInfo(
    new Date('2026-11-18T07:59:00.000Z'),
    'America/Los_Angeles',
  );
  assert.equal(laBeforeMidnight.currentDate, '2026-11-17');
  assert.equal(laBeforeMidnight.currentWeekday, 'Tuesday');
});

test('uses fixed 15-day calendar cycles across month ends and leap years', () => {
  const date = new Date('2026-02-20T06:30:00.000Z');
  const info = getBackendDateCycleInfo(date);

  assert.equal(info.cycleStartDate, '2026-02-15');
  assert.equal(info.cycleEndDate, '2026-03-01');
  assert.equal(info.nextUpdateDate, '2026-03-02');
  assert.equal(info.totalDaysInCycle, 15);
  assert.equal(isLeapYear(2028), true);
  assert.equal(getBackendDateCycleInfo(new Date('2028-02-29T06:30:00.000Z')).currentDate, '2028-02-29');
});
