import React, { useState, useEffect } from 'react';
import { TraderDNA } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Dna,
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Layers,
  Award,
  Shield,
  Activity,
} from 'lucide-react';

interface TraderDNAViewProps {
  selectedAccountId?: string;
}

export function TraderDNAView({ selectedAccountId }: TraderDNAViewProps) {
  const [dna, setDna] = useState<TraderDNA | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getTraderDNA(selectedAccountId === 'all' ? undefined : selectedAccountId)
      .then(res => setDna(res.dna))
      .catch(err => console.error('Failed to load Trader DNA:', err))
      .finally(() => setLoading(false));
  }, [selectedAccountId]);

  if (loading || !dna) {
    return (
      <div className="p-12 text-center text-neutral-400 font-mono">
        Calculating Trader DNA & behavioral attribution patterns...
      </div>
    );
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-neutral-100 flex items-center gap-2">
            <Dna className="w-5 h-5 text-cyan-400" />
            <span>Trader DNA & Behavioral Patterns</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Your empirical execution fingerprint across market sessions, holding durations, and emotional inflection points.
          </p>
        </div>
      </div>

      {/* Behavioral Patterns Alert Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase text-neutral-300">
          Detected Behavioral Patterns & Statistical Variance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dna.behavioralPatterns.map((pat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${pat.cautionLevel === 'ALERT' ? 'text-rose-400' : 'text-amber-400'}`} />
                  <span className="text-xs font-mono font-bold text-neutral-200">{pat.title}</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                    pat.cautionLevel === 'ALERT'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {pat.significance} Impact
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 text-xs font-mono">
                <span className="text-neutral-400">Observed: </span>
                <span className="text-neutral-200">{pat.observedValue} </span>
                <span className="text-neutral-500">(Baseline: {pat.baselineValue})</span>
              </div>

              <div className="text-xs text-neutral-400 leading-relaxed">
                {pat.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Session Performance */}
      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold font-mono text-neutral-200">Session Performance Matrix</h2>
            <p className="text-xs text-neutral-400">Comparing your win rate and net return across major global trading sessions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dna.sessionPerformance.map((sess) => {
            const isPos = sess.pnl >= 0;
            return (
              <div key={sess.session} className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-200">{sess.session}</span>
                  <span className="text-neutral-400">{sess.tradesCount} trades</span>
                </div>

                <div className={`text-xl font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '+' : ''}${sess.pnl.toFixed(2)}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-850 text-neutral-400">
                  <span>Win Rate</span>
                  <span className="text-neutral-200 font-semibold">{sess.winRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Execution Distribution (0 - 23 UTC) */}
      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold font-mono text-neutral-200">Hourly Distribution (00:00 - 23:00 UTC)</h2>
            <p className="text-xs text-neutral-400">P&L distribution by the hour your trades were initiated.</p>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-1 pt-4 border border-neutral-850 rounded-xl bg-neutral-950 px-2 select-none">
          {dna.hourlyPerformance.map((h) => {
            const maxTrades = Math.max(...dna.hourlyPerformance.map(i => i.tradesCount), 1);
            const heightPercent = Math.max(8, (h.tradesCount / maxTrades) * 88);
            const isPos = h.pnl >= 0;

            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="hidden group-hover:block absolute bottom-full mb-2 z-10 px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-[10px] font-mono text-neutral-200 whitespace-nowrap shadow-xl">
                  {h.hour}:00 UTC • {h.tradesCount} trades • {isPos ? '+' : ''}${h.pnl.toFixed(0)} ({h.winRate}% WR)
                </div>

                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all ${
                    h.tradesCount === 0
                      ? 'bg-neutral-850'
                      : isPos
                      ? 'bg-emerald-500/70 group-hover:bg-emerald-400'
                      : 'bg-rose-500/70 group-hover:bg-rose-400'
                  }`}
                ></div>
                <span className="text-[9px] font-mono text-neutral-400">{h.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setups Breakdown Table */}
      <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <h2 className="text-sm font-bold font-mono text-neutral-200">Setup & Playbook Expectancy</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                <th className="py-2 px-3">Setup / Strategy</th>
                <th className="py-2 px-3">Trade Sample</th>
                <th className="py-2 px-3">Win Rate</th>
                <th className="py-2 px-3">Net Realized P&L</th>
                <th className="py-2 px-3">Expectancy (R)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {dna.setupExpectancy.map(s => {
                const isPos = s.pnl >= 0;
                return (
                  <tr key={s.setup} className="hover:bg-neutral-850/50">
                    <td className="py-2.5 px-3 font-bold text-neutral-200">{s.setup}</td>
                    <td className="py-2.5 px-3 text-neutral-400">{s.count} trades</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-100">{s.winRate}%</td>
                    <td className={`py-2.5 px-3 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}${s.pnl.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300">
                      {s.expectancyR !== undefined ? `${s.expectancyR >= 0 ? '+' : ''}${s.expectancyR.toFixed(2)}R` : '-'}
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
