import { db } from './index.js';
import crypto from 'crypto';

export function seedDemoData(userId: string): { accountId: string; tradeCount: number } {
  // Check if demo account already exists for this user
  const existingAcc = db.prepare('SELECT id FROM trading_accounts WHERE user_id = ? AND name LIKE ?').get(userId, '%Demo%') as { id: string } | undefined;

  let accountId: string;

  if (existingAcc) {
    accountId = existingAcc.id;
    // Check if trades exist
    const countRow = db.prepare('SELECT COUNT(*) as count FROM trades WHERE trading_account_id = ?').get(accountId) as { count: number };
    if (countRow.count > 0) {
      return { accountId, tradeCount: countRow.count };
    }
  } else {
    accountId = 'demo-acc-' + crypto.randomUUID();
    const now = Date.now();
    db.prepare(`
      INSERT INTO trading_accounts (
        id, user_id, name, account_number, broker, platform, account_type, currency,
        initial_balance, current_balance, status, connection_method, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      accountId,
      userId,
      'TRACKERX Demo Account (Test Fixture)',
      'DEMO-892410',
      'MetaQuotes Demo',
      'mt5',
      'funded',
      'USD',
      100000.0,
      108420.0,
      'active',
      'bridge',
      now,
      now
    );

    // Create funded rules for this account
    db.prepare(`
      INSERT INTO funded_account_rules (
        id, user_id, trading_account_id, starting_balance, profit_target, max_total_drawdown,
        max_daily_drawdown, max_risk_per_trade, min_trading_days, evaluation_status, rules_configured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'funded-rules-' + crypto.randomUUID(),
      userId,
      accountId,
      100000.0,
      10000.0, // $10,000 profit target (10%)
      10000.0, // $10,000 max total drawdown (10%)
      5000.0,  // $5,000 max daily drawdown (5%)
      1500.0,  // $1,500 max risk per trade (1.5%)
      5,
      'in_progress',
      1,
      now,
      now
    );
  }

  // Realistic sample historical trades for trading diagnostics & Trader DNA
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'NAS100', 'US30'];
  const setups = ['Liquidity Sweep', 'Pullback', 'Breakout', 'Order Block', 'Trend Continuation'];
  const sessions: Array<'London' | 'New York' | 'Asian' | 'Overlap'> = ['London', 'New York', 'Asian', 'Overlap'];

  // 28 realistic trades spread over the last 30 days
  const now = Date.now();
  const dayMs = 86400000;

  const rawTradesData = [
    { dayAgo: 28, symbol: 'EURUSD', dir: 'BUY', qty: 2.0, openP: 1.0820, closeP: 1.0865, netPnl: 900, sl: 1.0800, r: 2.25, setup: 'Liquidity Sweep', session: 'London', riskPct: 0.8 },
    { dayAgo: 27, symbol: 'GBPUSD', dir: 'SELL', qty: 2.0, openP: 1.2680, closeP: 1.2640, netPnl: 800, sl: 1.2700, r: 2.0, setup: 'Order Block', session: 'London', riskPct: 0.8 },
    { dayAgo: 25, symbol: 'NAS100', dir: 'BUY', qty: 1.0, openP: 18100, closeP: 18240, netPnl: 1400, sl: 18050, r: 2.8, setup: 'Breakout', session: 'New York', riskPct: 1.0 },
    { dayAgo: 24, symbol: 'EURUSD', dir: 'BUY', qty: 3.5, openP: 1.0850, closeP: 1.0820, netPnl: -1050, sl: 1.0820, r: -1.0, setup: 'Pullback', session: 'New York', riskPct: 1.8 }, // Oversized trade
    { dayAgo: 24, symbol: 'EURUSD', dir: 'BUY', qty: 3.0, openP: 1.0818, closeP: 1.0800, netPnl: -540, sl: 1.0800, r: -1.0, setup: 'Pullback', session: 'New York', riskPct: 1.5 }, // Rapid re-entry after loss
    { dayAgo: 22, symbol: 'XAUUSD', dir: 'BUY', qty: 1.5, openP: 2310.5, closeP: 2328.0, netPnl: 2625, sl: 2302.0, r: 2.05, setup: 'Liquidity Sweep', session: 'London', riskPct: 1.2 },
    { dayAgo: 20, symbol: 'USDJPY', dir: 'SELL', qty: 2.0, openP: 156.40, closeP: 156.90, netPnl: -640, sl: 156.90, r: -1.0, setup: 'Trend Continuation', session: 'Asian', riskPct: 0.7 },
    { dayAgo: 19, symbol: 'GBPUSD', dir: 'BUY', qty: 2.0, openP: 1.2610, closeP: 1.2675, netPnl: 1300, sl: 1.2580, r: 2.16, setup: 'Order Block', session: 'London', riskPct: 0.8 },
    { dayAgo: 17, symbol: 'EURUSD', dir: 'SELL', qty: 2.0, openP: 1.0890, closeP: 1.0850, netPnl: 800, sl: 1.0910, r: 2.0, setup: 'Pullback', session: 'London', riskPct: 0.8 },
    { dayAgo: 16, symbol: 'NAS100', dir: 'SELL', qty: 1.0, openP: 18450, closeP: 18520, netPnl: -700, sl: 18520, r: -1.0, setup: 'Breakout', session: 'New York', riskPct: 0.9 },
    { dayAgo: 15, symbol: 'US30', dir: 'BUY', qty: 1.0, openP: 39100, closeP: 39350, netPnl: 1250, sl: 39000, r: 2.5, setup: 'Liquidity Sweep', session: 'New York', riskPct: 1.0 },
    { dayAgo: 14, symbol: 'EURUSD', dir: 'BUY', qty: 2.0, openP: 1.0830, closeP: 1.0872, netPnl: 840, sl: 1.0810, r: 2.1, setup: 'Liquidity Sweep', session: 'London', riskPct: 0.8 },
    { dayAgo: 12, symbol: 'GBPUSD', dir: 'SELL', qty: 2.0, openP: 1.2720, closeP: 1.2755, netPnl: -700, sl: 1.2755, r: -1.0, setup: 'Order Block', session: 'London', riskPct: 0.8 },
    { dayAgo: 11, symbol: 'XAUUSD', dir: 'BUY', qty: 1.0, openP: 2340.0, closeP: 2362.5, netPnl: 2250, sl: 2332.0, r: 2.81, setup: 'Trend Continuation', session: 'Overlap', riskPct: 1.0 },
    { dayAgo: 10, symbol: 'USDJPY', dir: 'BUY', qty: 2.0, openP: 157.10, closeP: 156.80, netPnl: -380, sl: 156.80, r: -1.0, setup: 'Trend Continuation', session: 'Asian', riskPct: 0.6 },
    { dayAgo: 9, symbol: 'NAS100', dir: 'BUY', qty: 1.0, openP: 18600, closeP: 18780, netPnl: 1800, sl: 18530, r: 2.57, setup: 'Breakout', session: 'New York', riskPct: 0.9 },
    { dayAgo: 8, symbol: 'EURUSD', dir: 'SELL', qty: 2.0, openP: 1.0860, closeP: 1.0890, netPnl: -600, sl: 1.0890, r: -1.0, setup: 'Pullback', session: 'London', riskPct: 0.8 },
    { dayAgo: 7, symbol: 'GBPUSD', dir: 'BUY', qty: 2.0, openP: 1.2650, closeP: 1.2710, netPnl: 1200, sl: 1.2620, r: 2.0, setup: 'Order Block', session: 'London', riskPct: 0.8 },
    { dayAgo: 6, symbol: 'EURUSD', dir: 'BUY', qty: 2.0, openP: 1.0840, closeP: 1.0885, netPnl: 900, sl: 1.0820, r: 2.25, setup: 'Liquidity Sweep', session: 'London', riskPct: 0.8 },
    { dayAgo: 5, symbol: 'XAUUSD', dir: 'SELL', qty: 1.2, openP: 2365.0, closeP: 2378.0, netPnl: -1560, sl: 2378.0, r: -1.0, setup: 'Pullback', session: 'New York', riskPct: 1.4 },
    { dayAgo: 5, symbol: 'XAUUSD', dir: 'SELL', qty: 1.5, openP: 2377.0, closeP: 2388.0, netPnl: -1650, sl: 2388.0, r: -1.0, setup: 'Pullback', session: 'New York', riskPct: 1.5 }, // Rapid re-entry after loss
    { dayAgo: 4, symbol: 'US30', dir: 'BUY', qty: 1.0, openP: 39500, closeP: 39820, netPnl: 1600, sl: 39380, r: 2.66, setup: 'Breakout', session: 'New York', riskPct: 1.0 },
    { dayAgo: 3, symbol: 'EURUSD', dir: 'BUY', qty: 2.0, openP: 1.0855, closeP: 1.0895, netPnl: 800, sl: 1.0835, r: 2.0, setup: 'Liquidity Sweep', session: 'London', riskPct: 0.8 },
    { dayAgo: 2, symbol: 'GBPUSD', dir: 'SELL', qty: 2.0, openP: 1.2740, closeP: 1.2690, netPnl: 1000, sl: 1.2765, r: 2.0, setup: 'Order Block', session: 'London', riskPct: 0.8 },
    { dayAgo: 1, symbol: 'NAS100', dir: 'BUY', qty: 1.0, openP: 18900, closeP: 19080, netPnl: 1800, sl: 18830, r: 2.57, setup: 'Breakout', session: 'New York', riskPct: 0.9 },
    { dayAgo: 1, symbol: 'EURUSD', dir: 'BUY', qty: 2.0, openP: 1.0880, closeP: 1.0860, netPnl: -400, sl: 1.0860, r: -1.0, setup: 'Pullback', session: 'London', riskPct: 0.7 },
  ];

  const insertTradeStmt = db.prepare(`
    INSERT INTO trades (
      id, user_id, trading_account_id, external_trade_id, external_order_id, broker, platform,
      symbol, asset_class, direction, quantity, entry_price, exit_price, stop_loss, take_profit,
      open_time, close_time, holding_duration, gross_pnl, commission, swap, fees, net_pnl,
      currency, risk_amount, risk_percentage, r_multiple, setup, session, tags_json, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  rawTradesData.forEach((t, idx) => {
    const tradeId = 'demo-trade-' + (idx + 1).toString().padStart(4, '0');
    const openTime = now - (t.dayAgo * dayMs) + (Math.floor(Math.random() * 10) * 3600000);
    const duration = (Math.floor(Math.random() * 180) + 25) * 60000; // 25 to 205 mins
    const closeTime = openTime + duration;
    const commission = 6.0;
    const swap = 0.0;
    const grossPnl = t.netPnl + commission;
    const assetClass = t.symbol.includes('USD') && !t.symbol.includes('XAU') ? 'forex' : t.symbol.includes('XAU') ? 'commodities' : 'indices';
    const riskAmount = (t.riskPct / 100) * 100000;

    insertTradeStmt.run(
      tradeId,
      userId,
      accountId,
      'MT5-' + (980000 + idx),
      'ORD-' + (740000 + idx),
      'MetaQuotes Demo',
      'mt5',
      t.symbol,
      assetClass,
      t.dir,
      t.qty,
      t.openP,
      t.closeP,
      t.sl,
      t.dir === 'BUY' ? t.openP + (t.openP - t.sl) * 2 : t.openP - (t.sl - t.openP) * 2,
      openTime,
      closeTime,
      duration,
      grossPnl,
      commission,
      swap,
      0.0,
      t.netPnl,
      'USD',
      riskAmount,
      t.riskPct,
      t.r,
      t.setup,
      t.session,
      JSON.stringify(['demo', t.setup.toLowerCase()]),
      now
    );
  });

  return { accountId, tradeCount: rawTradesData.length };
}
