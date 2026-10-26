/**
 * Shared database initialisation for Vercel serverless functions.
 *
 * Vercel functions are stateless but a single worker process may handle
 * multiple requests.  We keep the database connection alive across
 * invocations inside the same process using a lazy singleton, then re-use
 * it on warm calls.  Each cold-start runs migrations automatically.
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { runMigrations } from '../../server/src/migrations.js';

// ── env helpers ──────────────────────────────────────────────────────────────
export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// ── lazy postgres pool ────────────────────────────────────────────────────────
let pool: Pool | undefined;
let migrated = false;

function getPool(): Pool {
  if (!pool) {
    const connectionString = requiredEnv('DATABASE_URL');
    pool = new Pool({ connectionString, max: 3 });
  }
  return pool;
}

export type Row = Record<string, unknown>;

export interface DB {
  query<R = Row>(sql: string, values?: (string | number | null)[]): Promise<R[]>;
  execute(sql: string, values?: (string | number | null)[]): Promise<number>;
  transaction<T>(fn: (db: DB) => Promise<T>): Promise<T>;
}

function toPostgresSql(sql: string): string {
  let p = 0;
  return sql.replace(/\?/g, () => `$${++p}`);
}

function makeDb(client: { query: Pool['query'] }): DB {
  return {
    async query<R = Row>(sql: string, values: (string | number | null)[] = []): Promise<R[]> {
      const result = await client.query(toPostgresSql(sql), values);
      return result.rows as R[];
    },
    async execute(sql: string, values: (string | number | null)[] = []): Promise<number> {
      const result = await client.query(toPostgresSql(sql), values);
      return result.rowCount ?? 0;
    },
    async transaction<T>(fn: (db: DB) => Promise<T>): Promise<T> {
      // outer transaction — use pool directly (may already be in txn context)
      const c = await getPool().connect();
      try {
        await c.query('BEGIN');
        const result = await fn(makeDb(c));
        await c.query('COMMIT');
        return result;
      } catch (err) {
        await c.query('ROLLBACK');
        throw err;
      } finally {
        c.release();
      }
    },
  };
}

export async function getDb(): Promise<DB> {
  const p = getPool();
  const db = makeDb(p);
  if (!migrated) {
    // Run migrations once per cold-start process.  Concurrent cold-starts are
    // safe because migrations use advisory locks / CREATE TABLE IF NOT EXISTS.
    migrated = true;
    await runMigrations(db as never);
  }
  return db;
}
