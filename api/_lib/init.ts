/**
 * Serverless cold-start initialiser.
 *
 * Vercel spawns a Node process per function and may reuse it across many
 * requests.  We initialise the database exactly once per process — the first
 * call awaits the real work, subsequent calls return the same promise instantly.
 *
 * All api/ handlers import `ensureDb` from this file and call it at the top
 * of every request.
 */

// Make dotenv load server/.env when running locally (no-op on Vercel where
// env vars are injected by the platform).
import 'dotenv/config';

import { initializeDatabase } from '../../server/src/db.js';
import { getDataDatabase } from '../../server/src/database.js';
import type { DataDatabase } from '../../server/src/database.js';

let initPromise: Promise<void> | undefined;

export function ensureDb(): Promise<void> {
  if (!initPromise) {
    initPromise = initializeDatabase().catch((err) => {
      // Reset so the next request retries (e.g. transient network error).
      initPromise = undefined;
      throw err;
    });
  }
  return initPromise;
}

export function db(): DataDatabase {
  return getDataDatabase();
}

export { getDataDatabase } from '../../server/src/database.js';
