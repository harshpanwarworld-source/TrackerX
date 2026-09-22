import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, initDatabase, hashPassword, verifyPassword } from './server/db/index.js';
import { seedDemoData } from './server/db/seedDemo.js';
import { calculateSummary, calculateTradeFactors, calculateTraderDNA } from './server/analytics/engine.js';
import { generateTradeExplanation } from './server/ai/explanation.js';
import { Trade, TradingAccount, User } from './src/types/index.js';

dotenv.config();

// Initialize Database
initDatabase();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// ----------------------------------------------------
// Authentication Middleware
// ----------------------------------------------------
interface AuthRequest extends express.Request {
  user?: User;
}

function authMiddleware(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Bearer token missing.' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.prepare(`
    SELECT s.user_id, s.expires_at, u.id, u.email, u.display_name, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token) as any;

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  req.user = {
    id: session.id,
    email: session.email,
    displayName: session.display_name,
    createdAt: session.created_at,
  };

  next();
}

// ----------------------------------------------------
// API Routes: Health
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TRACKERX Trading Intelligence Server', timestamp: Date.now() });
});

// ----------------------------------------------------
// API Routes: Authentication
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Email and password (min 6 chars) are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const userId = 'usr_' + crypto.randomUUID();
  const { hash, salt } = hashPassword(password);
  const now = Date.now();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, display_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, email.toLowerCase(), hash, salt, displayName || email.split('@')[0], now, now);

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = now + 30 * 86400000; // 30 days
  db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(token, userId, expiresAt, now);

  // Automatically create a default personal trading account
  const defaultAccId = 'acc_' + crypto.randomUUID();
  db.prepare(`
    INSERT INTO trading_accounts (
      id, user_id, name, account_number, broker, platform, account_type, currency,
      initial_balance, current_balance, status, connection_method, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(defaultAccId, userId, 'Primary Trading Account', 'ACC-101', 'Direct Broker API', 'broker_api', 'personal', 'USD', 10000, 10000, 'active', 'manual_import', now, now);

  res.json({
    user: { id: userId, email: email.toLowerCase(), displayName: displayName || email.split('@')[0], createdAt: now },
    token,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
  if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + 30 * 86400000;
  db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(token, user.id, expiresAt, now);

  res.json({
    user: { id: user.id, email: user.email, displayName: user.display_name, createdAt: user.created_at },
    token,
  });
});

app.post('/api/auth/demo-session', (req, res) => {
  const demoEmail = 'demo.trader@trackerx.internal';
  let demoUser = db.prepare('SELECT * FROM users WHERE email = ?').get(demoEmail) as any;
  const now = Date.now();

  if (!demoUser) {
    const userId = 'usr_demo_' + crypto.randomUUID();
    const { hash, salt } = hashPassword('demo123456');
    db.prepare(`
      INSERT INTO users (id, email, password_hash, salt, display_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, demoEmail, hash, salt, 'Demo Portfolio Trader', now, now);

    demoUser = { id: userId, email: demoEmail, display_name: 'Demo Portfolio Trader', created_at: now };
  }

  // Ensure demo account and test trades exist
  seedDemoData(demoUser.id);

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = now + 14 * 86400000;
  db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(token, demoUser.id, expiresAt, now);

  res.json({
    user: { id: demoUser.id, email: demoUser.email, displayName: demoUser.display_name, createdAt: demoUser.created_at },
    token,
    isDemo: true,
  });
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authMiddleware, (req: AuthRequest, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// API Routes: Accounts
// ----------------------------------------------------
app.get('/api/accounts', authMiddleware, (req: AuthRequest, res) => {
  const rows = db.prepare(`
    SELECT a.*, r.starting_balance, r.profit_target, r.max_total_drawdown, r.max_daily_drawdown, r.max_risk_per_trade, r.min_trading_days, r.evaluation_status, r.rules_configured
    FROM trading_accounts a
    LEFT JOIN funded_account_rules r ON a.id = r.trading_account_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(req.user!.id) as any[];

  const accounts: TradingAccount[] = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    accountNumber: r.account_number,
    broker: r.broker,
    platform: r.platform,
    accountType: r.account_type,
    currency: r.currency,
    initialBalance: r.initial_balance,
    currentBalance: r.current_balance,
    status: r.status,
    connectionMethod: r.connection_method,
    lastSyncAt: r.last_sync_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  res.json({ accounts });
});

app.post('/api/accounts', authMiddleware, (req: AuthRequest, res) => {
  const { name, broker, platform, accountType, currency, initialBalance, connectionMethod, accountNumber } = req.body;
  if (!name || !broker || !platform || !accountType) {
    return res.status(400).json({ error: 'Name, broker, platform, and accountType are required.' });
  }

  const id = 'acc_' + crypto.randomUUID();
  const now = Date.now();
  const initBal = Number(initialBalance) || 10000;

  db.prepare(`
    INSERT INTO trading_accounts (
      id, user_id, name, account_number, broker, platform, account_type, currency,
      initial_balance, current_balance, status, connection_method, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.user!.id,
    name,
    accountNumber || 'ACC-' + Math.floor(1000 + Math.random() * 9000),
    broker,
    platform,
    accountType,
    currency || 'USD',
    initBal,
    initBal,
    'active',
    connectionMethod || 'manual_import',
    now,
    now
  );

  // If funded account, create default user-configurable rules
  if (accountType === 'funded' || accountType === 'evaluation' || accountType === 'challenge') {
    db.prepare(`
      INSERT INTO funded_account_rules (
        id, user_id, trading_account_id, starting_balance, profit_target, max_total_drawdown,
        max_daily_drawdown, max_risk_per_trade, min_trading_days, evaluation_status, rules_configured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'funded_' + crypto.randomUUID(),
      req.user!.id,
      id,
      initBal,
      initBal * 0.10, // 10% target default
      initBal * 0.10, // 10% max DD default
      initBal * 0.05, // 5% daily DD default
      initBal * 0.015,
      5,
      'in_progress',
      1,
      now,
      now
    );
  }

  const created = db.prepare('SELECT * FROM trading_accounts WHERE id = ?').get(id) as any;
  res.json({ account: created });
});

app.get('/api/accounts/:id', authMiddleware, (req: AuthRequest, res) => {
  const account = db.prepare('SELECT * FROM trading_accounts WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;
  if (!account) {
    return res.status(404).json({ error: 'Trading account not found.' });
  }

  const rules = db.prepare('SELECT * FROM funded_account_rules WHERE trading_account_id = ? AND user_id = ?').get(account.id, req.user!.id) as any;

  res.json({ account, fundedRules: rules || null });
});

app.put('/api/accounts/:id/funded-rules', authMiddleware, (req: AuthRequest, res) => {
  const { startingBalance, profitTarget, maxTotalDrawdown, maxDailyDrawdown, maxRiskPerTrade, minTradingDays } = req.body;
  const account = db.prepare('SELECT id FROM trading_accounts WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;
  if (!account) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const existingRule = db.prepare('SELECT id FROM funded_account_rules WHERE trading_account_id = ?').get(account.id) as any;
  const now = Date.now();

  if (existingRule) {
    db.prepare(`
      UPDATE funded_account_rules
      SET starting_balance = ?, profit_target = ?, max_total_drawdown = ?, max_daily_drawdown = ?,
          max_risk_per_trade = ?, min_trading_days = ?, updated_at = ?
      WHERE id = ?
    `).run(
      Number(startingBalance),
      Number(profitTarget),
      Number(maxTotalDrawdown),
      Number(maxDailyDrawdown),
      maxRiskPerTrade ? Number(maxRiskPerTrade) : null,
      Number(minTradingDays) || 5,
      now,
      existingRule.id
    );
  } else {
    db.prepare(`
      INSERT INTO funded_account_rules (
        id, user_id, trading_account_id, starting_balance, profit_target, max_total_drawdown,
        max_daily_drawdown, max_risk_per_trade, min_trading_days, evaluation_status, rules_configured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'funded_' + crypto.randomUUID(),
      req.user!.id,
      account.id,
      Number(startingBalance),
      Number(profitTarget),
      Number(maxTotalDrawdown),
      Number(maxDailyDrawdown),
      maxRiskPerTrade ? Number(maxRiskPerTrade) : null,
      Number(minTradingDays) || 5,
      'in_progress',
      1,
      now,
      now
    );
  }

  const updated = db.prepare('SELECT * FROM funded_account_rules WHERE trading_account_id = ?').get(account.id);
  res.json({ fundedRules: updated });
});

// ----------------------------------------------------
// API Routes: Trades & Analysis
// ----------------------------------------------------
app.get('/api/trades', authMiddleware, (req: AuthRequest, res) => {
  const { accountId, symbol, direction, setup, outcome, limit, page } = req.query;

  let query = `
    SELECT t.*, a.name as account_name
    FROM trades t
    JOIN trading_accounts a ON t.trading_account_id = a.id
    WHERE t.user_id = ?
  `;
  const params: any[] = [req.user!.id];

  if (accountId && accountId !== 'all') {
    query += ' AND t.trading_account_id = ?';
    params.push(accountId);
  }
  if (symbol) {
    query += ' AND t.symbol = ?';
    params.push(symbol);
  }
  if (direction) {
    query += ' AND t.direction = ?';
    params.push(direction);
  }
  if (setup) {
    query += ' AND t.setup = ?';
    params.push(setup);
  }
  if (outcome === 'win') {
    query += ' AND t.net_pnl > 0.01';
  } else if (outcome === 'loss') {
    query += ' AND t.net_pnl < -0.01';
  }

  query += ' ORDER BY t.close_time DESC';

  const rows = db.prepare(query).all(...params) as any[];

  const trades: Trade[] = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    tradingAccountId: r.trading_account_id,
    accountName: r.account_name,
    externalTradeId: r.external_trade_id,
    externalOrderId: r.external_order_id,
    broker: r.broker,
    platform: r.platform,
    symbol: r.symbol,
    assetClass: r.asset_class,
    direction: r.direction,
    quantity: r.quantity,
    entryPrice: r.entry_price,
    exitPrice: r.exit_price,
    stopLoss: r.stop_loss,
    takeProfit: r.take_profit,
    openTime: r.open_time,
    closeTime: r.close_time,
    holdingDuration: r.holding_duration,
    grossPnl: r.gross_pnl,
    commission: r.commission,
    swap: r.swap,
    fees: r.fees,
    netPnl: r.net_pnl,
    currency: r.currency,
    riskAmount: r.risk_amount,
    riskPercentage: r.risk_percentage,
    rMultiple: r.r_multiple,
    setup: r.setup,
    session: r.session,
    tags: r.tags_json ? JSON.parse(r.tags_json) : [],
    isDemo: Boolean(r.is_demo),
    createdAt: r.created_at,
  }));

  res.json({ trades, totalCount: trades.length });
});

app.get('/api/trades/:id', authMiddleware, (req: AuthRequest, res) => {
  const row = db.prepare(`
    SELECT t.*, a.name as account_name
    FROM trades t
    JOIN trading_accounts a ON t.trading_account_id = a.id
    WHERE t.id = ? AND t.user_id = ?
  `).get(req.params.id, req.user!.id) as any;

  if (!row) {
    return res.status(404).json({ error: 'Trade not found.' });
  }

  const trade: Trade = {
    id: row.id,
    userId: row.user_id,
    tradingAccountId: row.trading_account_id,
    accountName: row.account_name,
    externalTradeId: row.external_trade_id,
    externalOrderId: row.external_order_id,
    broker: row.broker,
    platform: row.platform,
    symbol: row.symbol,
    assetClass: row.asset_class,
    direction: row.direction,
    quantity: row.quantity,
    entryPrice: row.entry_price,
    exitPrice: row.exit_price,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    openTime: row.open_time,
    closeTime: row.close_time,
    holdingDuration: row.holding_duration,
    grossPnl: row.gross_pnl,
    commission: row.commission,
    swap: row.swap,
    fees: row.fees,
    netPnl: row.net_pnl,
    currency: row.currency,
    riskAmount: row.risk_amount,
    riskPercentage: row.risk_percentage,
    rMultiple: row.r_multiple,
    setup: row.setup,
    session: row.session,
    tags: row.tags_json ? JSON.parse(row.tags_json) : [],
    isDemo: Boolean(row.is_demo),
    createdAt: row.created_at,
  };

  // Fetch all user trades for contextual baseline comparison
  const allUserTradeRows = db.prepare('SELECT * FROM trades WHERE user_id = ?').all(req.user!.id) as any[];
  const allTrades: Trade[] = allUserTradeRows.map(r => ({
    ...r,
    userId: r.user_id,
    tradingAccountId: r.trading_account_id,
    isDemo: Boolean(r.is_demo),
  }));

  const analysis = calculateTradeFactors(trade, allTrades);

  res.json({ trade, analysis });
});

// ----------------------------------------------------
// API Routes: Quantitative Analytics & DNA
// ----------------------------------------------------
app.get('/api/analytics/summary', authMiddleware, (req: AuthRequest, res) => {
  const { accountId } = req.query;

  let query = 'SELECT * FROM trades WHERE user_id = ?';
  const params: any[] = [req.user!.id];

  if (accountId && accountId !== 'all') {
    query += ' AND trading_account_id = ?';
    params.push(accountId);
  }

  const rows = db.prepare(query).all(...params) as any[];
  const trades: Trade[] = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    tradingAccountId: r.trading_account_id,
    broker: r.broker,
    platform: r.platform,
    symbol: r.symbol,
    assetClass: r.asset_class,
    direction: r.direction,
    quantity: r.quantity,
    entryPrice: r.entry_price,
    exitPrice: r.exit_price,
    stopLoss: r.stop_loss,
    takeProfit: r.take_profit,
    openTime: r.open_time,
    closeTime: r.close_time,
    holdingDuration: r.holding_duration,
    grossPnl: r.gross_pnl,
    commission: r.commission,
    swap: r.swap,
    fees: r.fees,
    netPnl: r.net_pnl,
    currency: r.currency,
    riskAmount: r.risk_amount,
    riskPercentage: r.risk_percentage,
    rMultiple: r.r_multiple,
    setup: r.setup,
    session: r.session,
    isDemo: Boolean(r.is_demo),
    createdAt: r.created_at,
  }));

  const summary = calculateSummary(trades, 100000);
  res.json({ summary });
});

app.get('/api/analytics/dna', authMiddleware, (req: AuthRequest, res) => {
  const { accountId } = req.query;
  let query = 'SELECT * FROM trades WHERE user_id = ?';
  const params: any[] = [req.user!.id];

  if (accountId && accountId !== 'all') {
    query += ' AND trading_account_id = ?';
    params.push(accountId);
  }

  const rows = db.prepare(query).all(...params) as any[];
  const trades: Trade[] = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    tradingAccountId: r.trading_account_id,
    broker: r.broker,
    platform: r.platform,
    symbol: r.symbol,
    assetClass: r.asset_class,
    direction: r.direction,
    quantity: r.quantity,
    entryPrice: r.entry_price,
    exitPrice: r.exit_price,
    openTime: r.open_time,
    closeTime: r.close_time,
    holdingDuration: r.holding_duration,
    grossPnl: r.gross_pnl,
    commission: r.commission,
    swap: r.swap,
    fees: r.fees,
    netPnl: r.net_pnl,
    currency: r.currency,
    riskAmount: r.risk_amount,
    riskPercentage: r.risk_percentage,
    rMultiple: r.r_multiple,
    setup: r.setup,
    session: r.session,
    isDemo: Boolean(r.is_demo),
    createdAt: r.created_at,
  }));

  const dna = calculateTraderDNA(trades);
  res.json({ dna });
});

// ----------------------------------------------------
// API Routes: AI Natural Language Evidence Synthesis
// ----------------------------------------------------
app.post('/api/ai/explain-trade/:id', authMiddleware, async (req: AuthRequest, res) => {
  const tradeRow = db.prepare('SELECT * FROM trades WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;
  if (!tradeRow) {
    return res.status(404).json({ error: 'Trade not found.' });
  }

  const trade: Trade = {
    ...tradeRow,
    userId: tradeRow.user_id,
    tradingAccountId: tradeRow.trading_account_id,
    isDemo: Boolean(tradeRow.is_demo),
  };

  const allRows = db.prepare('SELECT * FROM trades WHERE user_id = ?').all(req.user!.id) as any[];
  const allTrades: Trade[] = allRows.map(r => ({
    ...r,
    userId: r.user_id,
    tradingAccountId: r.trading_account_id,
    isDemo: Boolean(r.is_demo),
  }));

  const analysis = calculateTradeFactors(trade, allTrades);
  const explanation = await generateTradeExplanation(trade, analysis);

  res.json({ explanation });
});

// ----------------------------------------------------
// API Routes: CSV Importer
// ----------------------------------------------------
app.post('/api/import/csv/preview', authMiddleware, (req: AuthRequest, res) => {
  const { csvContent } = req.body;
  if (!csvContent || typeof csvContent !== 'string') {
    return res.status(400).json({ error: 'CSV text content is required.' });
  }

  const lines = csvContent.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return res.status(400).json({ error: 'CSV file contains no data rows.' });
  }

  const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));

  // Detect column mapping automatically
  const autoMapping: Record<string, string> = {};
  headers.forEach(h => {
    const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lower.includes('symbol') || lower.includes('pair') || lower.includes('ticker') || lower.includes('item')) autoMapping['symbol'] = h;
    else if (lower.includes('direction') || lower.includes('type') || lower.includes('action') || lower.includes('side')) autoMapping['direction'] = h;
    else if (lower.includes('lots') || lower.includes('size') || lower.includes('volume') || lower.includes('quantity')) autoMapping['quantity'] = h;
    else if (lower.includes('openprice') || lower.includes('entryprice') || lower.includes('pricein') || lower === 'price' || lower === 'entry') autoMapping['entryPrice'] = h;
    else if (lower.includes('closeprice') || lower.includes('exitprice') || lower.includes('priceout') || lower === 'exit') autoMapping['exitPrice'] = h;
    else if (lower.includes('netpnl') || lower.includes('profit') || lower.includes('pnl') || lower.includes('netprofit')) autoMapping['netPnl'] = h;
    else if (lower.includes('opentime') || lower.includes('datein') || lower.includes('timein') || lower === 'time' || lower === 'date') autoMapping['openTime'] = h;
    else if (lower.includes('closetime') || lower.includes('dateout') || lower.includes('timeout')) autoMapping['closeTime'] = h;
    else if (lower.includes('stoploss') || lower === 'sl') autoMapping['stopLoss'] = h;
    else if (lower.includes('takeprofit') || lower === 'tp') autoMapping['takeProfit'] = h;
    else if (lower.includes('setup') || lower.includes('strategy')) autoMapping['setup'] = h;
  });

  const sampleRows = lines.slice(1, Math.min(lines.length, 11)).map((line: string) => {
    const cols = line.split(delimiter).map((c: string) => c.trim().replace(/^["']|["']$/g, ''));
    const rowObj: Record<string, string> = {};
    headers.forEach((h: string, idx: number) => {
      rowObj[h] = cols[idx] || '';
    });
    return rowObj;
  });

  res.json({
    detectedHeaders: headers,
    autoMapping,
    sampleRows,
    totalRows: lines.length - 1,
  });
});

app.post('/api/import/csv/commit', authMiddleware, (req: AuthRequest, res) => {
  const { accountId, csvContent, columnMapping } = req.body;
  if (!accountId || !csvContent || !columnMapping) {
    return res.status(400).json({ error: 'accountId, csvContent, and columnMapping are required.' });
  }

  const account = db.prepare('SELECT * FROM trading_accounts WHERE id = ? AND user_id = ?').get(accountId, req.user!.id) as any;
  if (!account) {
    return res.status(404).json({ error: 'Target trading account not found.' });
  }

  const lines = csvContent.trim().split(/\r?\n/).filter((line: string) => line.trim().length > 0);
  if (lines.length < 2) {
    return res.status(400).json({ error: 'CSV file contains no data rows.' });
  }

  const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((h: string) => h.trim().replace(/^["']|["']$/g, ''));

  const headerIndices: Record<string, number> = {};
  headers.forEach((h: string, idx: number) => {
    headerIndices[h] = idx;
  });

  const getCol = (cols: string[], field: string): string => {
    const mappedHeader = columnMapping[field];
    if (!mappedHeader || headerIndices[mappedHeader] === undefined) return '';
    return cols[headerIndices[mappedHeader]] || '';
  };

  let importedCount = 0;
  let skippedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  const insertStmt = db.prepare(`
    INSERT INTO trades (
      id, user_id, trading_account_id, external_trade_id, external_order_id, broker, platform,
      symbol, asset_class, direction, quantity, entry_price, exit_price, stop_loss, take_profit,
      open_time, close_time, holding_duration, gross_pnl, commission, swap, fees, net_pnl,
      currency, risk_amount, risk_percentage, r_multiple, setup, session, tags_json, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `);

  const now = Date.now();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine.split(delimiter).map((c: string) => c.trim().replace(/^["']|["']$/g, ''));

    const rawSymbol = getCol(cols, 'symbol').toUpperCase() || 'UNKNOWN';
    const rawDir = getCol(cols, 'direction').toUpperCase().includes('SELL') ? 'SELL' : 'BUY';
    const rawQty = parseFloat(getCol(cols, 'quantity')) || 1.0;
    const rawEntry = parseFloat(getCol(cols, 'entryPrice')) || 1.0;
    const rawExit = parseFloat(getCol(cols, 'exitPrice')) || rawEntry;
    const rawPnl = parseFloat(getCol(cols, 'netPnl')) || 0.0;
    const rawSl = parseFloat(getCol(cols, 'stopLoss')) || null;
    const rawTp = parseFloat(getCol(cols, 'takeProfit')) || null;
    const rawSetup = getCol(cols, 'setup') || 'Discretionary';

    // Parse dates or fallback
    let openTime = Date.parse(getCol(cols, 'openTime'));
    if (isNaN(openTime)) openTime = now - ((lines.length - i) * 86400000);

    let closeTime = Date.parse(getCol(cols, 'closeTime'));
    if (isNaN(closeTime) || closeTime <= openTime) closeTime = openTime + 3600000;

    const duration = closeTime - openTime;
    const tradeId = 'trd_' + crypto.randomUUID();

    // Check duplicate by external ID or symbol + openTime
    const dupCheck = db.prepare(`
      SELECT id FROM trades
      WHERE trading_account_id = ? AND symbol = ? AND open_time = ? AND entry_price = ?
    `).get(account.id, rawSymbol, openTime, rawEntry);

    if (dupCheck) {
      duplicateCount++;
      continue;
    }

    try {
      insertStmt.run(
        tradeId,
        req.user!.id,
        account.id,
        'IMP-' + (10000 + i),
        'ORD-' + (10000 + i),
        account.broker,
        account.platform,
        rawSymbol,
        rawSymbol.includes('USD') ? 'forex' : 'equities',
        rawDir,
        rawQty,
        rawEntry,
        rawExit,
        rawSl,
        rawTp,
        openTime,
        closeTime,
        duration,
        rawPnl,
        0.0,
        0.0,
        0.0,
        rawPnl,
        account.currency,
        rawSl ? Math.abs(rawEntry - rawSl) * rawQty * 100 : null,
        rawSl ? 1.0 : null,
        rawSl && Math.abs(rawEntry - rawSl) > 0 ? Number(((rawPnl / (Math.abs(rawEntry - rawSl) * rawQty * 100))).toFixed(2)) : null,
        rawSetup,
        'London',
        JSON.stringify(['csv_import']),
        now
      );
      importedCount++;
    } catch (err: any) {
      errorCount++;
      if (errors.length < 5) errors.push(`Row ${i}: ${err.message}`);
    }
  }

  // Update account balance
  const pnlSumRow = db.prepare('SELECT SUM(net_pnl) as total_pnl FROM trades WHERE trading_account_id = ?').get(account.id) as any;
  const newBalance = account.initial_balance + (pnlSumRow.total_pnl || 0);
  db.prepare('UPDATE trading_accounts SET current_balance = ?, updated_at = ? WHERE id = ?').run(newBalance, now, account.id);

  res.json({
    totalRows: lines.length - 1,
    importedCount,
    skippedCount,
    duplicateCount,
    errorCount,
    errors,
  });
});

// ----------------------------------------------------
// Vite Middleware / Static Serving
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRACKERX server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
