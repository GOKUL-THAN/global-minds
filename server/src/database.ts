import { AsyncLocalStorage } from 'node:async_hooks';
import { access, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import { Pool, type PoolClient } from 'pg';
import { config } from './config.js';

export type DatabaseRow = Record<string, unknown>;
export interface QueryResult<Row = DatabaseRow> {
  rows: Row[];
  rowCount: number;
}

export interface DataDatabase {
  query<Row = DatabaseRow>(
    sql: string,
    values?: readonly (string | number | null)[],
  ): Promise<QueryResult<Row>>;
  execute(sql: string, values?: readonly (string | number | null)[]): Promise<number>;
  transaction<T>(operation: () => Promise<T>): Promise<T>;
  hasColumn(table: string, column: string): Promise<boolean>;
  close(): Promise<void>;
}

let activeDatabase: DataDatabase | undefined;

function currentDatabase(): DataDatabase {
  if (!activeDatabase) throw new Error('Database has not been initialized.');
  return activeDatabase;
}

class SqlJsDataDatabase implements DataDatabase {
  private saveQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly database: SqlJsDatabase,
    private readonly databasePath: string,
  ) {}

  async query<Row = DatabaseRow>(
    sql: string,
    values: readonly (string | number | null)[] = [],
  ): Promise<QueryResult<Row>> {
    const statement = this.database.prepare(sql);
    try {
      statement.bind([...values]);
      const rows: Row[] = [];
      while (statement.step()) rows.push(statement.getAsObject() as unknown as Row);
      return { rows, rowCount: rows.length };
    } finally {
      statement.free();
    }
  }

  async execute(sql: string, values: readonly (string | number | null)[] = []): Promise<number> {
    this.database.run(sql, [...values]);
    return this.database.getRowsModified();
  }

  transaction<T>(operation: () => Promise<T>): Promise<T> {
    const pending = this.saveQueue.then(async () => {
      this.database.run('BEGIN IMMEDIATE');
      let committed = false;
      try {
        const result = await operation();
        this.database.run('COMMIT');
        committed = true;
        await this.persist();
        return result;
      } catch (error) {
        if (!committed) this.database.run('ROLLBACK');
        throw error;
      }
    });
    this.saveQueue = pending.then(() => undefined, () => undefined);
    return pending;
  }

  async hasColumn(table: string, column: string): Promise<boolean> {
    if (!/^[a-z_]+$/.test(table) || !/^[a-z_]+$/.test(column)) {
      throw new Error('Invalid database identifier.');
    }
    const result = await this.query<{ name: string }>(`PRAGMA table_info(${table})`);
    return result.rows.some(row => row.name === column);
  }

  async close(): Promise<void> {}

  private async persist(): Promise<void> {
    const temporaryPath = `${this.databasePath}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporaryPath, Buffer.from(this.database.export()));
      await rename(temporaryPath, this.databasePath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
  }
}

const transactionClient = new AsyncLocalStorage<PoolClient>();

class PostgresDataDatabase implements DataDatabase {
  private readonly pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async query<Row = DatabaseRow>(
    sql: string,
    values: readonly (string | number | null)[] = [],
  ): Promise<QueryResult<Row>> {
    const client = transactionClient.getStore();
    const result = await (client ?? this.pool).query<DatabaseRow>(toPostgresSql(sql), [...values]);
    return { rows: result.rows as Row[], rowCount: result.rowCount ?? result.rows.length };
  }

  async execute(sql: string, values: readonly (string | number | null)[] = []): Promise<number> {
    const client = transactionClient.getStore();
    const result = await (client ?? this.pool).query(toPostgresSql(sql), [...values]);
    return result.rowCount ?? 0;
  }

  async transaction<T>(operation: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await transactionClient.run(client, operation);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async hasColumn(table: string, column: string): Promise<boolean> {
    const result = await this.query<{ present: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?
       ) AS present`,
      [table, column],
    );
    return result.rows[0]?.present === true;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

function toPostgresSql(sql: string): string {
  let parameter = 0;
  return sql.replace(/\?/g, () => `$${++parameter}`);
}

export async function initializeDataDatabase(): Promise<void> {
  if (activeDatabase) throw new Error('Database has already been initialized.');

  if (config.databaseDriver === 'postgres') {
    activeDatabase = new PostgresDataDatabase(config.databaseUrl!);
    return;
  }

  await mkdir(dirname(config.databasePath), { recursive: true });
  let existingDatabase: Uint8Array | undefined;
  try {
    await access(config.databasePath);
    existingDatabase = await readFile(config.databasePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  const wasmPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../node_modules/sql.js/dist/sql-wasm.wasm',
  );
  const SQL = await initSqlJs({ locateFile: () => wasmPath });
  activeDatabase = new SqlJsDataDatabase(
    existingDatabase ? new SQL.Database(existingDatabase) : new SQL.Database(),
    config.databasePath,
  );
  await activeDatabase.execute('PRAGMA foreign_keys = ON');
}

export function getDataDatabase(): DataDatabase {
  return currentDatabase();
}

export async function closeDataDatabase(): Promise<void> {
  if (activeDatabase) await activeDatabase.close();
  activeDatabase = undefined;
}
