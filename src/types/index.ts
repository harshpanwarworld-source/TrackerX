/**
 * TRACKERX Canonical Data Types
 * Independent of broker-specific formats.
 */

export type AssetClass = 'forex' | 'crypto' | 'indices' | 'commodities' | 'equities';
export type TradeDirection = 'BUY' | 'SELL';
export type AccountType = 'personal' | 'funded' | 'evaluation' | 'challenge';
export type AccountPlatform = 'broker_api' | 'mt4' | 'mt5' | 'ctrader' | 'csv' | 'excel' | 'pdf';
export type ConnectionMethod = 'api' | 'bridge' | 'ea' | 'manual_import';

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
}

export interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  accountNumber?: string;
  broker: string;
  platform: AccountPlatform;
  accountType: AccountType;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  status: 'active' | 'disconnected' | 'sync_error';
  connectionMethod: ConnectionMethod;
  lastSyncAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Trade {
  id: string;
  userId: string;
  tradingAccountId: string;
  accountName?: string;
  externalTradeId?: string;
  externalOrderId?: string;
  broker: string;
  platform: string;
  symbol: string;
  assetClass: AssetClass;
  direction: TradeDirection;
  quantity: number; // In lots, contracts, or units
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: number; // Unix timestamp in ms
  closeTime: number; // Unix timestamp in ms
  holdingDuration: number; // in milliseconds
  grossPnl: number;
  commission: number;
  swap: number;
  fees: number;
  netPnl: number;
  currency: string;
  riskAmount?: number; // Estimated dollar risk
  riskPercentage?: number; // Risk as % of balance at entry
  rMultiple?: number; // Realized R (Net PnL / Risk)
  setup?: string; // E.g. 'Pullback', 'Breakout', 'Order Block'
  session?: 'London' | 'New York' | 'Asian' | 'Overlap';
  tags?: string[];
  isDemo: boolean;
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface DiagnosticFactor {
  factor: string;
  category: 'position_sizing' | 'risk_consistency' | 'timing' | 'setup_performance' | 'session' | 'behavior';
  measuredValue: string;
  traderBaseline: string;
  difference: string;
  differencePercent?: number;
  evidence: string;
  isPositiveForOutcome: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TradeAnalysisResult {
  tradeId: string;
  outcome: 'WIN' | 'LOSS' | 'BREAKEVEN';
  netPnl: number;
  rMultiple?: number;
  contributingFactors: DiagnosticFactor[];
  historicalComparison: {
    comparableTradesCount: number;
    setupWinRate: number;
    setupExpectancy: number;
    historicalAverageLoss: number;
    historicalAverageWin: number;
  };
  missingInformation?: string[];
  aiExplanation?: {
    summary: string;
    factorHighlights: string[];
    differedFromNormal: string;
    confidence: string;
    insufficientEvidence?: boolean;
  };
}

export interface QuantitativeSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // 0 - 100
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  expectancy: number;
  averageR: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
  recoveryFactor: number;
  consecutiveWinsMax: number;
  consecutiveLossesMax: number;
  riskConsistencyScore: number; // 0 - 100
  averageHoldingDurationMs: number;
  bestSymbol: { symbol: string; pnl: number };
  worstSymbol: { symbol: string; pnl: number };
  bestSession: { session: string; pnl: number };
  worstSession: { session: string; pnl: number };
  bestSetup: { setup: string; expectancyR: number };
  worstSetup: { setup: string; expectancyR: number };
  equityCurve: Array<{ time: number; equity: number; tradeIndex: number; pnl: number }>;
  dailyPnl: Array<{ date: string; pnl: number; tradesCount: number }>;
  drawdownCurve: Array<{ time: number; drawdown: number; drawdownPercent: number }>;
}

export interface TraderDNA {
  hourlyPerformance: Array<{ hour: number; tradesCount: number; winRate: number; pnl: number }>;
  sessionPerformance: Array<{ session: string; tradesCount: number; winRate: number; pnl: number; expectancyR: number }>;
  weekdayPerformance: Array<{ day: string; dayIndex: number; tradesCount: number; pnl: number }>;
  setupExpectancy: Array<{ setup: string; count: number; winRate: number; pnl: number; expectancyR: number }>;
  symbolExpectancy: Array<{ symbol: string; count: number; winRate: number; pnl: number }>;
  behavioralPatterns: Array<{
    title: string;
    description: string;
    observedValue: string;
    baselineValue: string;
    sampleSize: number;
    significance: 'HIGH' | 'MODERATE' | 'LOW';
    cautionLevel: 'INFO' | 'WARNING' | 'ALERT';
  }>;
}

export interface FundedAccountRules {
  id: string;
  userId: string;
  tradingAccountId: string;
  startingBalance: number;
  profitTarget: number;
  maxTotalDrawdown: number;
  maxDailyDrawdown: number;
  maxRiskPerTrade?: number;
  minTradingDays: number;
  evaluationStatus: 'in_progress' | 'passed' | 'breached';
  rulesConfigured: boolean;
  // Computed metrics
  currentBalance?: number;
  currentEquity?: number;
  distanceToTarget?: number;
  distanceToMaxDrawdown?: number;
  dailyLossSoFar?: number;
  remainingDailyBuffer?: number;
  violations?: string[];
}

export interface ImportBatch {
  id: string;
  userId: string;
  tradingAccountId: string;
  filename: string;
  fileType: 'csv' | 'xlsx' | 'pdf';
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  errorCount: number;
  status: 'pending' | 'completed' | 'failed';
  errors?: string[];
  createdAt: number;
}
