import type { DataDatabase } from './database.js';
import { getBackendDateCycleInfo } from './dateService.js';

const STATE_ID = 'website';
const RETRY_DELAY_MS = 60_000;

export interface DateCycleSchedule {
  lastCycleId: string | null;
  lastSuccessfulExecution: string | null;
  nextScheduledExecution: string;
}

function nextExecutionTimestamp(nextDate: string): string {
  return new Date(`${nextDate}T00:00:00+05:30`).toISOString();
}

export async function synchronizeDateCycle(
  database: DataDatabase,
  now: Date = new Date(),
): Promise<DateCycleSchedule> {
  const info = getBackendDateCycleInfo(now);
  const nowTimestamp = now.toISOString();

  await database.transaction(async () => {
    await database.execute(
      `INSERT INTO date_cycle_state (id, last_cycle_id, last_success_at, next_run_at, updated_at)
       VALUES (?, NULL, NULL, ?, ?)
       ON CONFLICT(id) DO NOTHING`,
      [STATE_ID, nextExecutionTimestamp(info.nextRollingUpdateDate), nowTimestamp],
    );
  });

  const current = await database.query<{
    last_cycle_id: string | null;
    last_success_at: string | null;
    next_run_at: string;
  }>(
    'SELECT last_cycle_id, last_success_at, next_run_at FROM date_cycle_state WHERE id = ?',
    [STATE_ID],
  );
  const row = current.rows[0];
  if (!row) throw new Error('Date cycle scheduler state could not be initialized.');

  if (Date.parse(row.next_run_at) <= now.getTime()) {
    const nextRunAt = nextExecutionTimestamp(info.nextRollingUpdateDate);
    await database.transaction(async () => {
      const updated = await database.execute(
        `UPDATE date_cycle_state
         SET last_cycle_id = ?, last_success_at = ?, next_run_at = ?, updated_at = ?
         WHERE id = ? AND next_run_at <= ?`,
        [info.rollingCycleId, nowTimestamp, nextRunAt, nowTimestamp, STATE_ID, nowTimestamp],
      );
      if (updated === 0) return;

      await database.execute(
        `INSERT INTO date_cycle_runs (cycle_id, executed_at, next_run_at)
         VALUES (?, ?, ?)
         ON CONFLICT(cycle_id) DO NOTHING`,
        [info.rollingCycleId, nowTimestamp, nextRunAt],
      );
    });
  }

  const result = await database.query<{
    last_cycle_id: string | null;
    last_success_at: string | null;
    next_run_at: string;
  }>(
    'SELECT last_cycle_id, last_success_at, next_run_at FROM date_cycle_state WHERE id = ?',
    [STATE_ID],
  );
  const schedule = result.rows[0];
  if (!schedule) throw new Error('Date cycle scheduler state could not be read.');
  return {
    lastCycleId: schedule.last_cycle_id,
    lastSuccessfulExecution: schedule.last_success_at,
    nextScheduledExecution: schedule.next_run_at,
  };
}

export async function getDateCycleSchedule(
  database: DataDatabase,
): Promise<DateCycleSchedule> {
  const result = await database.query<{
    last_cycle_id: string | null;
    last_success_at: string | null;
    next_run_at: string;
  }>(
    'SELECT last_cycle_id, last_success_at, next_run_at FROM date_cycle_state WHERE id = ?',
    [STATE_ID],
  );
  const row = result.rows[0];
  if (!row) throw new Error('Date cycle scheduler state has not been initialized.');
  return {
    lastCycleId: row.last_cycle_id,
    lastSuccessfulExecution: row.last_success_at,
    nextScheduledExecution: row.next_run_at,
  };
}

export function startDateCycleScheduler(database: DataDatabase): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  const scheduleNext = async (): Promise<void> => {
    if (stopped) return;
    try {
      const schedule = await synchronizeDateCycle(database);
      if (schedule.lastSuccessfulExecution) {
        console.info(
          `[date-cycle] ${schedule.lastCycleId} completed at ${schedule.lastSuccessfulExecution}; next run at ${schedule.nextScheduledExecution}`,
        );
      } else {
        console.info(`[date-cycle] First scheduled run at ${schedule.nextScheduledExecution}`);
      }
      const delay = Math.max(0, Date.parse(schedule.nextScheduledExecution) - Date.now());
      timer = setTimeout(() => { void scheduleNext(); }, delay);
      timer.unref();
    } catch (error) {
      console.error('[date-cycle] Scheduled update failed; retrying shortly:', error);
      timer = setTimeout(() => { void scheduleNext(); }, RETRY_DELAY_MS);
      timer.unref();
    }
  };

  void scheduleNext();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
