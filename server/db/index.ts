import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'trackerx.db');
export const db = new DatabaseSync(DB_PATH);

// Initialize database settings
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trading_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      account_number TEXT,
      broker TEXT NOT NULL,
      platform TEXT NOT NULL,
      account_type TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      initial_balance REAL NOT NULL DEFAULT 10000.0,
      current_balance REAL NOT NULL DEFAULT 10000.0,
      status TEXT NOT NULL DEFAULT 'active',
      connection_method TEXT NOT NULL,
      last_sync_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      trading_account_id TEXT NOT NULL,
      external_trade_id TEXT,
      external_order_id TEXT,
      broker TEXT NOT NULL,
      platform TEXT NOT NULL,
      symbol TEXT NOT NULL,
      asset_class TEXT NOT NULL DEFAULT 'forex',
      direction TEXT NOT NULL,
      quantity REAL NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL NOT NULL,
      stop_loss REAL,
      take_profit REAL,
      open_time INTEGER NOT NULL,
      close_time INTEGER NOT NULL,
      holding_duration INTEGER NOT NULL,
      gross_pnl REAL NOT NULL,
      commission REAL NOT NULL DEFAULT 0.0,
      swap REAL NOT NULL DEFAULT 0.0,
      fees REAL NOT NULL DEFAULT 0.0,
      net_pnl REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      risk_amount REAL,
      risk_percentage REAL,
      r_multiple REAL,
      setup TEXT,
      session TEXT,
      tags_json TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS import_batches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      trading_account_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      total_rows INTEGER NOT NULL,
      imported_count INTEGER NOT NULL,
      skipped_count INTEGER NOT NULL,
      duplicate_count INTEGER NOT NULL,
      error_count INTEGER NOT NULL,
      status TEXT NOT NULL,
      log_json TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS funded_account_rules (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      trading_account_id TEXT UNIQUE NOT NULL,
      starting_balance REAL NOT NULL,
      profit_target REAL NOT NULL,
      max_total_drawdown REAL NOT NULL,
      max_daily_drawdown REAL NOT NULL,
      max_risk_per_trade REAL,
      min_trading_days INTEGER DEFAULT 5,
      evaluation_status TEXT NOT NULL DEFAULT 'in_progress',
      rules_configured INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_trades_user_acc ON trades(user_id, trading_account_id, close_time);
    CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
    CREATE INDEX IF NOT EXISTS idx_trades_setup ON trades(setup);
    CREATE INDEX IF NOT EXISTS idx_trades_session ON trades(session);
  `);
}

// Password utility functions
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}
