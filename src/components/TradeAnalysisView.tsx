import React, { useState, useEffect } from 'react';
import { Trade, TradeAnalysisResult } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Microscope,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Scale,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface TradeAnalysisViewProps {
  tradeId: string | null;
  trades: Trade[];
  onSelectTrade: (id: string) => void;
  onBackToHistory: () => void;
}

export function TradeAnalysisView({
  tradeId,
  trades,
  onSelectTrade,
  onBackToHistory,
}: TradeAnalysisViewProps) {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [analysis, setAnalysis] = useState<TradeAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<TradeAnalysisResult['aiExplanation'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default to first trade if none selected
  const activeTradeId = tradeId || trades[0]?.id;

  useEffect(() => {
    if (!activeTradeId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setAiExplanation(null);

    api.getTradeById(activeTradeId)
      .then(res => {
        if (!isMounted) return;
        setTrade(res.trade);
        setAnalysis(res.analysis);
        if (res.analysis.aiExplanation) {
          setAiExplanation(res.analysis.aiExplanation);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message || 'Failed to fetch trade analysis');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTradeId]);

  const requestAiExplanation = async () => {
    if (!activeTradeId) return;
    setAiLoading(true);
    try {
      const res = await api.explainTrade(activeTradeId);
      setAiExplanation(res.explanation);
    } catch (err: any) {
      console.error('AI explanation error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (!activeTradeId || trades.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-400">
        No trades available to analyze. Please import trades or seed demo data.
      </div>
    );
  }

  const isWin = trade ? trade.netPnl > 0.01 : false;
  const isLoss = trade ? trade.netPnl < -0.01 : false;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHistory}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Return to Trade Ledger"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-mono text-neutral-100 flex items-center gap-2">
              <span>Trade Diagnostic Engine</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Non-Causal Evidence
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Evaluating measurable contributing factors and deviation from your historical median baseline.
            </p>
          </div>
        </div>

        {/* Quick Trade Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono">Select Trade:</span>
          <select
            value={activeTradeId}
            onChange={(e) => onSelectTrade(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {trades.map(t => (
              <option key={t.id} value={t.id}>
                {t.symbol} ({t.direction}) {t.netPnl >= 0 ? '+' : ''}${t.netPnl.toFixed(0)} • {new Date(t.closeTime).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Critical Non-Causality Banner */}
      <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-semibold text-neutral-200 font-mono">Statistical Attribution Standard:</span>
          <p className="text-neutral-400 leading-relaxed">
            TRACKERX does not claim definitive causality. The market is an open complex system. This analysis isolates statistically measurable variances between this individual execution and your typical baseline behavior.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-neutral-400 font-mono">
          Computing trade factor variances against database baseline...
        </div>
      ) : trade && analysis ? (
        <>
          {/* 3. Trade Detail Overview Card */}
          <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold font-mono text-neutral-100">{trade.symbol}</span>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                    trade.direction === 'BUY'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                  }`}
                >
                  {trade.direction} {trade.quantity.toFixed(2)} Lots
                </span>
                <span
                  className={`px-3 py-1 rounded-md text-sm font-bold font-mono ${
                    isWin ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80' : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                  }`}
                >
                  {isWin ? '+' : ''}${trade.netPnl.toFixed(2)}
                  {trade.rMultiple !== undefined && ` (${trade.rMultiple >= 0 ? '+' : ''}${trade.rMultiple}R)`}
                </span>
              </div>

              <div className="text-xs font-mono text-neutral-400">
                Ticket: <span className="text-neutral-300">{trade.externalTradeId || trade.id.slice(0, 12)}</span> • Broker: <span className="text-neutral-300">{trade.broker}</span>
              </div>
            </div>

            {/* Execution stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <div className="text-[10px] text-neutral-400 uppercase">Entry Price</div>
                <div className="font-bold text-neutral-200">{trade.entryPrice.toFixed(trade.entryPrice > 100 ? 2 : 4)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <div className="text-[10px] text-neutral-400 uppercase">Exit Price</div>
                <div className="font-bold text-neutral-200">{trade.exitPrice.toFixed(trade.exitPrice > 100 ? 2 : 4)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <div className="text-[10px] text-neutral-400 uppercase">Stop Loss / TP</div>
                <div className="font-bold text-neutral-300">
                  {trade.stopLoss ? trade.stopLoss.toFixed(trade.stopLoss > 100 ? 2 : 4) : 'None'} /{' '}
                  {trade.takeProfit ? trade.takeProfit.toFixed(trade.takeProfit > 100 ? 2 : 4) : 'None'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <div className="text-[10px] text-neutral-400 uppercase">Holding Time</div>
                <div className="font-bold text-neutral-200">{Math.round(trade.holdingDuration / 60000)} minutes</div>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <div className="text-[10px] text-neutral-400 uppercase">Strategy Setup</div>
                <div className="font-bold text-cyan-400">{trade.setup || 'Discretionary'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                <div className="text-[10px] text-neutral-400 uppercase">Market Session</div>
                <div className="font-bold text-neutral-200">{trade.session || 'London'}</div>
              </div>
            </div>
          </div>

          {/* 4. Contributing Factors Matrix ("Why I Won / Why I Lost") */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-mono text-neutral-100 flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-cyan-400" />
                  <span>Attribution Evidence: Why this trade {isWin ? 'won' : 'lost'}</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  TRACKERX identified these measurable contributing factors:
                </p>
              </div>

              <div className="text-xs font-mono text-neutral-400">
                Compared against {analysis.historicalComparison.comparableTradesCount} trade baseline
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.contributingFactors.map((factor) => {
                const isHighConfidence = factor.confidence === 'HIGH';

                return (
                  <div
                    key={factor.factor}
                    className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2.5 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold font-mono text-neutral-200 uppercase tracking-wide">
                          {factor.factor}
                        </span>
                        <div className="text-[11px] font-mono text-cyan-400">
                          Measured: <strong>{factor.measuredValue}</strong> (Baseline: {factor.traderBaseline})
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                          factor.confidence === 'HIGH'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                            : factor.confidence === 'MEDIUM'
                            ? 'bg-neutral-800 text-neutral-300'
                            : 'bg-neutral-900 text-neutral-500'
                        }`}
                      >
                        Confidence: {factor.confidence}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-neutral-950 border border-neutral-850 text-xs font-mono text-neutral-300">
                      Variance: <span className="font-semibold text-neutral-100">{factor.difference}</span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {factor.evidence}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. AI Evidence Synthesis Layer */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-neutral-200">
                    Natural Language Evidence Synthesis
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    Grounded in deterministic metrics • Zero speculative hallucination
                  </span>
                </div>
              </div>

              {!aiExplanation && (
                <button
                  onClick={requestAiExplanation}
                  disabled={aiLoading}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Evidence Synthesis</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {aiExplanation ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-neutral-950 border border-cyan-500/20 text-xs text-neutral-300 leading-relaxed font-sans">
                  {aiExplanation.summary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <span className="text-xs font-mono font-semibold text-cyan-400 uppercase">
                      Measurable Factors Cited
                    </span>
                    <ul className="space-y-1.5 text-xs text-neutral-400">
                      {aiExplanation.factorHighlights.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <span className="text-xs font-mono font-semibold text-emerald-400 uppercase">
                      Variance From Baseline
                    </span>
                    <p className="text-xs text-neutral-400">
                      {aiExplanation.differedFromNormal}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 font-mono italic">
                  Attribution Standard: Evidence confidence rated at {aiExplanation.confidence}. TRACKERX does not assert definitive causation.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-850 text-xs text-neutral-400 flex items-center justify-between">
                <span>
                  Click "Generate Evidence Synthesis" to generate a grounded explanation synthesizing this trade's mathematical deviations.
                </span>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
