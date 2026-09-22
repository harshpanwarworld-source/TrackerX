import React from 'react';
import { QuantitativeSummary, Trade } from '../types/index.js';
import { EquityCurveChart, DailyPnlChart, WinLossDonutChart } from './FinancialCharts.js';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Shield,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Microscope,
  Award,
  AlertTriangle,
} from 'lucide-react';

interface DashboardViewProps {
  summary: QuantitativeSummary | null;
  trades: Trade[];
  onSelectTrade: (tradeId: string) => void;
  onNavigate: (view: any) => void;
}

export function DashboardView({ summary, trades, onSelectTrade, onNavigate }: DashboardViewProps) {
  if (!summary) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Loading quantitative summary...
      </div>
    );
  }

  // Prepare equity points for EquityCurveChart
  let runningEquity = summary.equityCurve[0]?.equity || 100000;
  const equityPoints = summary.equityCurve.map((pt, idx) => ({
    time: pt.time,
    equity: pt.equity,
    tradeIndex: idx,
    pnl: pt.pnl,
  }));

  // Prepare daily P&L points for DailyPnlChart
  const dailyPnlPoints = summary.dailyPnl.map(d => ({
    date: d.date,
    pnl: d.pnl,
    tradesCount: d.tradesCount,
  }));

  const isNetProfit = summary.netPnl >= 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-neutral-100 flex items-center gap-2">
            <span>Portfolio Intelligence</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              ACID Normalized
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Consolidated metrics computed across {summary.totalTrades} closed trade executions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('trade-analysis')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
          >
            <Microscope className="w-3.5 h-3.5 text-cyan-400" />
            <span>Diagnostics Hub</span>
          </button>
          <button
            onClick={() => onNavigate('import')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors"
          >
            <span>Import Trades</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Net Realized P&L */}
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Net Realized P&L</span>
            {isNetProfit ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className={`text-xl font-bold font-mono ${isNetProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isNetProfit ? '+' : ''}${summary.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            Gross: ${summary.grossProfit.toFixed(0)} / ${summary.grossLoss.toFixed(0)}
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Win Rate</span>
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-100">
            {summary.winRate}%
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            {summary.winningTrades}W • {summary.losingTrades}L • {summary.breakevenTrades}BE
          </div>
        </div>

        {/* Profit Factor */}
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Profit Factor</span>
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {summary.profitFactor.toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            Recovery: {summary.recoveryFactor.toFixed(2)}
          </div>
        </div>

        {/* Expectancy */}
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Expectancy / Trade</span>
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className={`text-xl font-bold font-mono ${summary.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {summary.expectancy >= 0 ? '+' : ''}${summary.expectancy.toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            {summary.averageR !== undefined ? `${summary.averageR >= 0 ? '+' : ''}${summary.averageR.toFixed(2)}R avg` : 'R-neutral'}
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Max Drawdown</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-200">
            ${summary.maxDrawdownAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-amber-400/90 font-mono">
            {summary.maxDrawdownPercent}% from peak
          </div>
        </div>

        {/* Risk Consistency */}
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Risk Consistency</span>
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-neutral-100">
            {summary.riskConsistencyScore}/100
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            Status: {summary.riskConsistencyScore >= 70 ? 'Controlled' : 'High Variance'}
          </div>
        </div>
      </div>

      {/* 3. Equity Curve & Win/Loss Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
              Cumulative Equity & High-Water Mark
            </h2>
            <span className="text-[11px] font-mono text-neutral-400">Base: $100,000.00</span>
          </div>
          <EquityCurveChart data={equityPoints} />
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300 mb-4">
              Win / Loss Distribution
            </h2>
            <WinLossDonutChart
              winRate={summary.winRate}
              wins={summary.winningTrades}
              losses={summary.losingTrades}
              breakevens={summary.breakevenTrades}
            />
          </div>

          <div className="pt-4 border-t border-neutral-850 mt-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Avg Winning Trade</span>
              <span className="text-emerald-400 font-semibold">+${summary.averageWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Avg Losing Trade</span>
              <span className="text-rose-400 font-semibold">-${summary.averageLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Consecutive Streaks</span>
              <span className="text-neutral-200">
                {summary.consecutiveWinsMax}W / {summary.consecutiveLossesMax}L max
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Daily Realized Net P&L Chart */}
      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
        <DailyPnlChart data={dailyPnlPoints} />
      </div>

      {/* 5. Recent Trades Ledger with Quick Diagnostic Link */}
      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold font-mono text-neutral-200">Recent Closed Executions</h2>
            <p className="text-xs text-neutral-400">
              Select any trade to inspect quantified contributing factors and baseline deviations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('trades')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            View all ({trades.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">Entry → Exit</th>
                <th className="py-2.5 px-3">Net P&L</th>
                <th className="py-2.5 px-3">R-Multiple</th>
                <th className="py-2.5 px-3">Setup</th>
                <th className="py-2.5 px-3 text-right">Diagnostic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {trades.slice(0, 8).map((t) => {
                const isWin = t.netPnl > 0.01;
                const isLoss = t.netPnl < -0.01;

                return (
                  <tr key={t.id} className="hover:bg-neutral-850/60 transition-colors">
                    <td className="py-3 px-3 text-neutral-400">
                      {new Date(t.closeTime).toLocaleDateString()}{' '}
                      <span className="text-[10px] text-neutral-400">{new Date(t.closeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-neutral-100">{t.symbol}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.direction === 'BUY'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        }`}
                      >
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-300">{t.quantity.toFixed(2)}</td>
                    <td className="py-3 px-3 text-neutral-400">
                      {t.entryPrice.toFixed(t.entryPrice > 100 ? 2 : 4)} → {t.exitPrice.toFixed(t.exitPrice > 100 ? 2 : 4)}
                    </td>
                    <td className={`py-3 px-3 font-bold ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-neutral-400'}`}>
                      {isWin ? '+' : ''}${t.netPnl.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-neutral-300">
                      {t.rMultiple !== undefined ? `${t.rMultiple >= 0 ? '+' : ''}${t.rMultiple}R` : '—'}
                    </td>
                    <td className="py-3 px-3 text-neutral-400">{t.setup || 'Standard'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectTrade(t.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[11px] font-semibold transition-colors"
                      >
                        <Microscope className="w-3 h-3" />
                        <span>Why {isWin ? 'Won' : isLoss ? 'Lost' : 'BE'}?</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
