# TRACKERX — Database Schema & Data Models

## 1. Entity-Relationship Design

The TRACKERX schema is designed for relational consistency, high-throughput aggregation, and multi-tenant isolation.

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Trading Accounts Table
CREATE TABLE IF NOT EXISTS trading_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_number TEXT,
  broker TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'broker_api', 'mt4', 'mt5', 'ctrader', 'csv', 'excel', 'pdf'
  account_type TEXT NOT NULL, -- 'personal', 'funded', 'evaluation', 'challenge'
  currency TEXT NOT NULL DEFAULT 'USD',
  initial_balance REAL NOT NULL DEFAULT 10000.0,
  current_balance REAL NOT NULL DEFAULT 10000.0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'disconnected', 'sync_error'
  connection_method TEXT NOT NULL, -- 'api', 'bridge', 'ea', 'manual_import'
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Canonical Trades Table (Independent of Broker Specifics)
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  trading_account_id TEXT NOT NULL,
  external_trade_id TEXT,
  external_order_id TEXT,
  broker TEXT NOT NULL,
  platform TEXT NOT NULL,
  symbol TEXT NOT NULL,
  asset_class TEXT NOT NULL DEFAULT 'forex', -- 'forex', 'crypto', 'indices', 'commodities', 'equities'
  direction TEXT NOT NULL, -- 'BUY' or 'SELL'
  quantity REAL NOT NULL,
  entry_price REAL NOT NULL,
  exit_price REAL NOT NULL,
  stop_loss REAL,
  take_profit REAL,
  open_time INTEGER NOT NULL, -- Milliseconds unix timestamp
  close_time INTEGER NOT NULL, -- Milliseconds unix timestamp
  holding_duration INTEGER NOT NULL, -- Milliseconds
  gross_pnl REAL NOT NULL,
  commission REAL NOT NULL DEFAULT 0.0,
  swap REAL NOT NULL DEFAULT 0.0,
  fees REAL NOT NULL DEFAULT 0.0,
  net_pnl REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  risk_amount REAL, -- Dollar risk if SL set
  risk_percentage REAL, -- Risk as % of account balance
  r_multiple REAL, -- Realized R: Net PnL / Risk Amount
  setup TEXT, -- E.g. 'Pullback', 'Breakout', 'Order Block', 'Liquidity Sweep'
  session TEXT, -- 'London', 'New York', 'Asian', 'Overlap'
  tags_json TEXT, -- JSON string array of tags
  is_demo INTEGER NOT NULL DEFAULT 0, -- 1 for demo test records, 0 for real data
  metadata_json TEXT, -- Freeform broker-specific extras
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
);

-- 5. Import Batches Table
CREATE TABLE IF NOT EXISTS import_batches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  trading_account_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'csv', 'xlsx', 'pdf'
  total_rows INTEGER NOT NULL,
  imported_count INTEGER NOT NULL,
  skipped_count INTEGER NOT NULL,
  duplicate_count INTEGER NOT NULL,
  error_count INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
  log_json TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
);

-- 6. Funded Account Rules & Guardrails
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
  evaluation_status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'passed', 'breached'
  rules_configured INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
);

-- 7. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  details_json TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 2. Indices for Aggregation Performance
* `CREATE INDEX idx_trades_user_account ON trades(user_id, trading_account_id, close_time);`
* `CREATE INDEX idx_trades_symbol ON trades(symbol);`
* `CREATE INDEX idx_trades_setup ON trades(setup);`
* `CREATE INDEX idx_trades_session ON trades(session);`
