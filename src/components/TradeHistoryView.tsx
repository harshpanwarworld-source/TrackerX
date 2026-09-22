import React, { useState, useMemo } from 'react';
import { Trade } from '../types/index.js';
import { Search, Filter, Download, Microscope, ChevronDown, ArrowUpDown } from 'lucide-react';

interface TradeHistoryViewProps {
  trades: Trade[];
  onSelectTrade: (tradeId: string) => void;
}

export function TradeHistoryView({ trades, onSelectTrade }: TradeHistoryViewProps) {
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [setupFilter, setSetupFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'pnl' | 'rMultiple' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Extract unique setups
  const availableSetups = useMemo(() => {
    const s = new Set<string>();
    trades.forEach(t => {
      if (t.setup) s.add(t.setup);
    });
    return Array.from(s);
  }, [trades]);

  // Filtered & Sorted trades
  const filteredTrades = useMemo(() => {
    return trades
      .filter(t => {
        if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false;
        if (directionFilter !== 'ALL' && t.direction !== directionFilter) return false;
        if (outcomeFilter === 'WIN' && t.netPnl <= 0) return false;
        if (outcomeFilter === 'LOSS' && t.netPnl >= 0) return false;
        if (setupFilter !== 'ALL' && t.setup !== setupFilter) return false;
        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (sortBy === 'date') {
          valA = a.closeTime;
          valB = b.closeTime;
        } else if (sortBy === 'pnl') {
          valA = a.netPnl;
          valB = b.netPnl;
        } else if (sortBy === 'rMultiple') {
          valA = a.rMultiple || 0;
          valB = b.rMultiple || 0;
        } else if (sortBy === 'duration') {
          valA = a.holdingDuration;
          valB = b.holdingDuration;
        }
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [trades, search, directionFilter, outcomeFilter, setupFilter, sortBy, sortOrder]);

  const exportCsv = () => {
    const headers = ['ID', 'Date', 'Symbol', 'Direction', 'Lots', 'Entry', 'Exit', 'Net_PnL', 'R_Multiple', 'Duration_Sec', 'Setup', 'Account'];
    const rows = filteredTrades.map(t => [
      t.id,
      new Date(t.closeTime).toISOString(),
      t.symbol,
      t.direction,
      t.quantity,
      t.entryPrice,
      t.exitPrice,
      t.netPnl,
      t.rMultiple || '',
      Math.round(t.holdingDuration / 1000),
      t.setup || '',
      t.accountName || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trackerx_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-neutral-100 flex items-center gap-2">
            <span>Trade Ledger & History</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
              {filteredTrades.length} / {trades.length} Records
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Normalized trade executions with deterministic R-multiples and duration logs.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search symbol (e.g. EURUSD)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Direction Filter */}
        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value as any)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">Direction: All</option>
          <option value="BUY">BUY Only</option>
          <option value="SELL">SELL Only</option>
        </select>

        {/* Outcome Filter */}
        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value as any)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">Outcome: All</option>
          <option value="WIN">Winners Only</option>
          <option value="LOSS">Losses Only</option>
        </select>

        {/* Setup Filter */}
        <select
          value={setupFilter}
          onChange={(e) => setSetupFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">Setup: All Strategies</option>
          {availableSetups.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="date">Sort: Date</option>
            <option value="pnl">Sort: Net P&L</option>
            <option value="rMultiple">Sort: R-Multiple</option>
            <option value="duration">Sort: Duration</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Close Date</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Entry / Exit</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Net P&L</th>
                <th className="py-3 px-4">R-Multiple</th>
                <th className="py-3 px-4">Setup</th>
                <th className="py-3 px-4 text-right">Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-neutral-500">
                    No trades match the current filter selection.
                  </td>
                </tr>
              ) : (
                filteredTrades.map(t => {
                  const isWin = t.netPnl > 0.01;
                  const isLoss = t.netPnl < -0.01;
                  const durationMins = Math.round(t.holdingDuration / 60000);
                  const durationHours = (t.holdingDuration / 3600000).toFixed(1);

                  return (
                    <tr key={t.id} className="hover:bg-neutral-850/60 transition-colors">
                      <td className="py-3 px-4 text-neutral-300">
                        {new Date(t.closeTime).toLocaleDateString()}
                        <div className="text-[10px] text-neutral-400">
                          {new Date(t.closeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-400 truncate max-w-[130px]">
                        {t.accountName || 'Primary'}
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-100">{t.symbol}</td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 text-neutral-300">{t.quantity.toFixed(2)}</td>
                      <td className="py-3 px-4 text-neutral-400">
                        <div>{t.entryPrice.toFixed(t.entryPrice > 100 ? 2 : 4)}</div>
                        <div className="text-[10px] text-neutral-400">→ {t.exitPrice.toFixed(t.exitPrice > 100 ? 2 : 4)}</div>
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {durationMins < 60 ? `${durationMins}m` : `${durationHours}h`}
                      </td>
                      <td className={`py-3 px-4 font-bold ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-neutral-400'}`}>
                        {isWin ? '+' : ''}${t.netPnl.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {t.rMultiple !== undefined ? (
                          <span className={`font-semibold ${t.rMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.rMultiple >= 0 ? '+' : ''}{t.rMultiple}R
                          </span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-300">{t.setup || 'Standard'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectTrade(t.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[11px] font-semibold transition-colors"
                        >
                          <Microscope className="w-3 h-3" />
                          <span>Diagnostics</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
