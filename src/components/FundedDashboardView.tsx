import React, { useState, useEffect } from 'react';
import { TradingAccount, FundedAccountRules, QuantitativeSummary } from '../types/index.js';
import { api } from '../services/api.js';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Target,
  TrendingDown,
  Calendar,
  Layers,
  Save,
  RotateCcw,
} from 'lucide-react';

interface FundedDashboardViewProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  summary: QuantitativeSummary | null;
}

export function FundedDashboardView({
  accounts,
  selectedAccountId,
  summary,
}: FundedDashboardViewProps) {
  const [selectedAcc, setSelectedAcc] = useState<TradingAccount | null>(null);
  const [rules, setRules] = useState<FundedAccountRules | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form states
  const [startingBalance, setStartingBalance] = useState(100000);
  const [profitTarget, setProfitTarget] = useState(10000);
  const [maxTotalDrawdown, setMaxTotalDrawdown] = useState(10000);
  const [maxDailyDrawdown, setMaxDailyDrawdown] = useState(5000);
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState(1500);
  const [minTradingDays, setMinTradingDays] = useState(5);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find active account
  useEffect(() => {
    const acc = accounts.find(a => a.id === selectedAccountId) || accounts[0] || null;
    setSelectedAcc(acc);

    if (acc) {
      setLoading(true);
      api.getAccount(acc.id)
        .then(res => {
          if (res.fundedRules) {
            setRules(res.fundedRules);
            setStartingBalance(res.fundedRules.startingBalance);
            setProfitTarget(res.fundedRules.profitTarget);
            setMaxTotalDrawdown(res.fundedRules.maxTotalDrawdown);
            setMaxDailyDrawdown(res.fundedRules.maxDailyDrawdown);
            setMaxRiskPerTrade(res.fundedRules.maxRiskPerTrade || 1500);
            setMinTradingDays(res.fundedRules.minTradingDays);
          } else {
            // Default placeholder rules
            const initBal = acc.initialBalance || 100000;
            setStartingBalance(initBal);
            setProfitTarget(initBal * 0.10);
            setMaxTotalDrawdown(initBal * 0.10);
            setMaxDailyDrawdown(initBal * 0.05);
            setMaxRiskPerTrade(initBal * 0.015);
            setMinTradingDays(5);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [selectedAccountId, accounts]);

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcc) return;

    try {
      const res = await api.updateFundedRules(selectedAcc.id, {
        startingBalance,
        profitTarget,
        maxTotalDrawdown,
        maxDailyDrawdown,
        maxRiskPerTrade,
        minTradingDays,
      });
      setRules(res.fundedRules);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update rules:', err);
    }
  };

  const currentBalance = selectedAcc?.currentBalance || (startingBalance + (summary?.netPnl || 0));
  const currentNetPnl = currentBalance - startingBalance;

  // Calculation of progress & buffers
  const targetPercent = Math.min(100, Math.max(0, (currentNetPnl / profitTarget) * 100));
  const remainingToTarget = Math.max(0, profitTarget - currentNetPnl);

  // Total Drawdown buffer remaining
  // Hard breach level = startingBalance - maxTotalDrawdown
  const hardBreachLevel = startingBalance - maxTotalDrawdown;
  const currentTotalBuffer = Math.max(0, currentBalance - hardBreachLevel);
  const totalBufferPercent = Math.min(100, (currentTotalBuffer / maxTotalDrawdown) * 100);

  // Daily Drawdown: today's worst drop
  const todayPnl = summary?.dailyPnl[summary.dailyPnl.length - 1]?.pnl || 0;
  const dailyBufferRemaining = Math.max(0, maxDailyDrawdown - Math.abs(Math.min(0, todayPnl)));
  const dailyBufferPercent = Math.min(100, (dailyBufferRemaining / maxDailyDrawdown) * 100);

  // Breach checks
  const isTargetAchieved = currentNetPnl >= profitTarget;
  const isTotalDrawdownBreached = currentBalance <= hardBreachLevel;
  const isDailyDrawdownBreached = todayPnl <= -maxDailyDrawdown;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-neutral-100 flex items-center gap-2">
            <span>Funded Account Guardrails</span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
                isTotalDrawdownBreached || isDailyDrawdownBreached
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : isTargetAchieved
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              }`}
            >
              {isTotalDrawdownBreached || isDailyDrawdownBreached
                ? 'BREACH WARNING'
                : isTargetAchieved
                ? 'TARGET ACHIEVED'
                : 'MONITORING ACTIVE'}
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time headroom monitoring based on your user-configured evaluation rules.
          </p>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span>{editing ? 'Cancel Config' : 'Configure Rules'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-300">
          Funded account rules updated and guardrail thresholds recalculated.
        </div>
      )}

      {/* Editing Drawer / Panel */}
      {editing && (
        <form onSubmit={handleSaveRules} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase text-neutral-200">
              User-Configurable Evaluation Parameters
            </h2>
            <span className="text-[11px] text-neutral-400 font-mono">
              Account: {selectedAcc?.name || 'Selected Account'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-neutral-400 mb-1">Starting Balance ($)</label>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Profit Target ($)</label>
              <input
                type="number"
                value={profitTarget}
                onChange={(e) => setProfitTarget(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Max Total Drawdown ($)</label>
              <input
                type="number"
                value={maxTotalDrawdown}
                onChange={(e) => setMaxTotalDrawdown(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Max Daily Drawdown ($)</label>
              <input
                type="number"
                value={maxDailyDrawdown}
                onChange={(e) => setMaxDailyDrawdown(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Max Risk per Trade ($)</label>
              <input
                type="number"
                value={maxRiskPerTrade}
                onChange={(e) => setMaxRiskPerTrade(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Min Trading Days</label>
              <input
                type="number"
                value={minTradingDays}
                onChange={(e) => setMinTradingDays(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-850">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold font-mono"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Rules</span>
            </button>
          </div>
        </form>
      )}

      {/* Primary Status Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Distance to Profit Target */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase text-neutral-200">Profit Target</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {targetPercent.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="text-2xl font-bold text-neutral-100">
              ${Math.max(0, currentNetPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-xs text-neutral-500 font-normal"> / ${profitTarget.toLocaleString()}</span>
            </div>
            <div className="text-xs text-neutral-400">
              Remaining: <span className="text-neutral-200">${remainingToTarget.toFixed(2)}</span>
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-neutral-950 overflow-hidden border border-neutral-850">
            <div
              style={{ width: `${targetPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            ></div>
          </div>
        </div>

        {/* 2. Total Drawdown Buffer */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase text-neutral-200">Total Loss Buffer</span>
            </div>
            <span className={`text-xs font-mono font-bold ${totalBufferPercent < 30 ? 'text-rose-400' : 'text-cyan-400'}`}>
              {totalBufferPercent.toFixed(1)}% Safe
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="text-2xl font-bold text-neutral-100">
              ${currentTotalBuffer.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-xs text-neutral-500 font-normal"> buffer</span>
            </div>
            <div className="text-xs text-neutral-400">
              Hard Breach Level: <span className="text-rose-400">${hardBreachLevel.toLocaleString()}</span>
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-neutral-950 overflow-hidden border border-neutral-850">
            <div
              style={{ width: `${totalBufferPercent}%` }}
              className={`h-full transition-all duration-500 ${
                totalBufferPercent < 30
                  ? 'bg-rose-500'
                  : totalBufferPercent < 60
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              }`}
            ></div>
          </div>
        </div>

        {/* 3. Daily Drawdown Buffer */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase text-neutral-200">Daily Loss Buffer</span>
            </div>
            <span className={`text-xs font-mono font-bold ${dailyBufferPercent < 30 ? 'text-rose-400' : 'text-amber-400'}`}>
              {dailyBufferPercent.toFixed(1)}% Remaining
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="text-2xl font-bold text-neutral-100">
              ${dailyBufferRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-xs text-neutral-500 font-normal"> / ${maxDailyDrawdown.toLocaleString()}</span>
            </div>
            <div className="text-xs text-neutral-400">
              Today's Net Realized: <span className={todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {todayPnl >= 0 ? '+' : ''}${todayPnl.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-neutral-950 overflow-hidden border border-neutral-850">
            <div
              style={{ width: `${dailyBufferPercent}%` }}
              className={`h-full transition-all duration-500 ${
                dailyBufferPercent < 30 ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Guardrail Checklist & Transparency Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <h2 className="text-sm font-bold font-mono text-neutral-200">
          Evaluation Guardrail Verification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Profit Target</span>
              {isTargetAchieved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px] font-mono text-neutral-500">In Progress</span>
              )}
            </div>
            <div className="text-sm font-bold font-mono text-neutral-200">
              +${profitTarget.toLocaleString()} (+{((profitTarget / startingBalance) * 100).toFixed(0)}%)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Max Drawdown Limit</span>
              {!isTotalDrawdownBreached ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-sm font-bold font-mono text-neutral-200">
              -${maxTotalDrawdown.toLocaleString()} (-{((maxTotalDrawdown / startingBalance) * 100).toFixed(0)}%)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Daily Max Loss</span>
              {!isDailyDrawdownBreached ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-sm font-bold font-mono text-neutral-200">
              -${maxDailyDrawdown.toLocaleString()} (-{((maxDailyDrawdown / startingBalance) * 100).toFixed(0)}%)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Min Trading Days</span>
              <span className="text-[10px] font-mono text-cyan-400">
                {summary?.dailyPnl.length || 0} / {minTradingDays} Days
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-neutral-200">
              {(summary?.dailyPnl.length || 0) >= minTradingDays ? 'Completed' : 'Accumulating'}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-400 font-mono">
          * Note: TRACKERX evaluation guardrails are based on your personal rule configurations and are intended for self-monitoring.
        </div>
      </div>
    </div>
  );
}
