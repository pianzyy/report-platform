import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { env } from './env';
import { logger } from '../utils/logger';

let db: SqlJsDatabase | null = null;

const DB_FILE = path.resolve(env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'reports.db'));

export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();

  const dbDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    logger.info('Database loaded from file');
  } else {
    db = new SQL.Database();
    logger.info('New database created');
  }

  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');

  runMigrations(db);
  logger.info('Database migrations completed');
}

function runMigrations(database: SqlJsDatabase): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      config TEXT NOT NULL,
      content TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      generated_at TEXT,
      error_message TEXT
    )
  `);
  database.run('CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)');
  database.run('CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at)');

  database.run(`
    CREATE TABLE IF NOT EXISTS data_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      data_type TEXT NOT NULL,
      query_params TEXT NOT NULL,
      data TEXT NOT NULL,
      fetched_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      is_valid INTEGER NOT NULL DEFAULT 1
    )
  `);
  database.run('CREATE INDEX IF NOT EXISTS idx_data_cache_lookup ON data_cache(source, data_type, expires_at)');
  database.run('CREATE INDEX IF NOT EXISTS idx_data_cache_valid ON data_cache(is_valid, expires_at)');

  database.run(`
    CREATE TABLE IF NOT EXISTS refresh_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      records_updated INTEGER NOT NULL DEFAULT 0,
      error_message TEXT
    )
  `);
  database.run('CREATE INDEX IF NOT EXISTS idx_refresh_history_source ON refresh_history(source, started_at)');

  database.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  const cols = database.exec('PRAGMA table_info(reports)');
  if (cols.length > 0) {
    const hasUserId = cols[0].values.some(row => row[1] === 'user_id');
    if (!hasUserId) {
      database.run('ALTER TABLE reports ADD COLUMN user_id TEXT REFERENCES users(id)');
    }
  }

  saveToFile();
}

export function saveToFile(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dbDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, buffer);
  }
}

export function closeDatabase(): void {
  if (db) {
    saveToFile();
    db.close();
    db = null;
  }
}

export function queryAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const database = getDb();
  try {
    const stmt = database.prepare(sql);
    stmt.bind(params as SqlJsDatabase.Params);
    const results: T[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row as unknown as T);
    }
    stmt.free();
    return results;
  } catch (err) {
    logger.error({ err, sql, params }, 'Query failed');
    throw err;
  }
}

export function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | null {
  const results = queryAll<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export function execute(sql: string, params: unknown[] = []): { changes: number; lastInsertId: number } {
  const database = getDb();
  try {
    database.run(sql, params as SqlJsDatabase.Params);
    const changes = database.getRowsModified();
    // Get last insert rowid
    const lastId = queryOne<{ id: number }>('SELECT last_insert_rowid() as id');
    saveToFile();
    return { changes, lastInsertId: lastId?.id ?? 0 };
  } catch (err) {
    logger.error({ err, sql, params }, 'Execute failed');
    throw err;
  }
}

export function executeMany(sql: string, paramsList: unknown[][]): void {
  const database = getDb();
  try {
    const stmt = database.prepare(sql);
    for (const params of paramsList) {
      stmt.bind(params as SqlJsDatabase.Params);
      stmt.step();
      stmt.reset();
    }
    stmt.free();
    saveToFile();
  } catch (err) {
    logger.error({ err, sql }, 'ExecuteMany failed');
    throw err;
  }
}
