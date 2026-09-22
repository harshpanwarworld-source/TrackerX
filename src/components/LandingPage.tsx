import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Database,
  Dna,
  FileSpreadsheet,
  HelpCircle,
  Layers,
  Lock,
  Microscope,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  TrendingDown,
  TrendingUp,
  Workflow,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onStartAnalyzing: () => void;
  onExploreDemo: () => void;
}

export function LandingPage({ onStartAnalyzing, onExploreDemo }: LandingPageProps) {
  const [activeHeroTab, setActiveHeroTab] = useState<'diagnostics' | 'curve' | 'dna'>('diagnostics');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does TRACKERX claim to know the exact cause of my trade outcomes?',
      a: 'Never. Markets are multivariant systems and historical trade logs cannot establish absolute singular causality. Instead, TRACKERX isolates measurable contributing factors (e.g. position size deviations, risk consistency, execution timing windows, and setup historical expectancy) compared against your baseline.',
    },
    {
      q: 'Can TRACKERX place or close trades on my broker account?',
      a: 'No. TRACKERX is exclusively an analytics and journaling platform. It possesses zero execution capabilities, cannot open or modify orders, and requires read-only permissions where APIs are connected.',
    },
    {
      q: 'Which platforms and brokers are supported?',
      a: 'TRACKERX features a universal CSV & Excel importer that works with any broker statement format, including MT4, MT5, cTrader, TradeLocker, NinjaTrader, and TradingView. Native API connectors, MT5 local bridge companions, and MT4 EAs are organized in an open connector abstraction.',
    },
    {
      q: 'How does TRACKERX handle funded and prop firm evaluation accounts?',
      a: 'You can configure starting balances, profit targets, maximum total drawdowns, and maximum daily drawdowns. TRACKERX dynamically computes your remaining distance to targets, daily headroom buffer, and flags potential violations.',
    },
    {
      q: 'How is my private trading data protected?',
      a: 'All trading records are encrypted and isolated per user with strict tenant boundaries. Password hashes use salted key derivation (scrypt). We never share, sell, or aggregate your private trading strategies.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>

        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>EVIDENCE-BASED QUANTITATIVE ANALYTICS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-100 leading-[1.12]">
            Turn Your Trading History Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Trading Intelligence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Connect your trading accounts, analyze every trade, understand measurable patterns, and discover what your trading data is actually telling you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartAnalyzing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>Start Analyzing Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Non-Causal Evidence
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Zero Execution Risk
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Account Normalized
            </span>
          </div>
        </div>

        {/* Realistic Interactive Dashboard Hero Preview */}
        <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/80">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></span>
              </div>
              <span className="text-xs font-mono text-neutral-400 ml-2">TRACKERX WORKSTATION PREVIEW</span>
            </div>

            {/* Preview View Switcher */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveHeroTab('diagnostics')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeHeroTab === 'diagnostics' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Trade Diagnostics
              </button>
              <button
                onClick={() => setActiveHeroTab('curve')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeHeroTab === 'curve' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Equity & Drawdown
              </button>
              <button
                onClick={() => setActiveHeroTab('dna')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeHeroTab === 'dna' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Trader DNA
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview */}
          <div className="p-6">
            {activeHeroTab === 'diagnostics' && (
              <div className="space-y-4">
                {/* Trade Diagnostic Card */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-850 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-neutral-100">EURUSD</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-rose-950 text-rose-400 border border-rose-800/60">
                        SELL • -1.0R (-$640.00)
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">1.0850 → 1.0890</span>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">Setup: Pullback • London Session</div>
                  </div>

                  {/* Principle Quote */}
                  <div className="text-xs text-cyan-400 font-medium">
                    TRACKERX identified these measurable contributing factors:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
                      <div className="text-[10px] uppercase font-mono text-neutral-400 mb-1">Position Size Deviation</div>
                      <div className="text-sm font-bold font-mono text-rose-400">+42% Above Median</div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Executed 3.50 lots vs trader baseline median of 2.00 lots.
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
                      <div className="text-[10px] uppercase font-mono text-neutral-400 mb-1">Timing & Momentum</div>
                      <div className="text-sm font-bold font-mono text-amber-400">12m Post-Loss Window</div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Entered 12 mins following a -$540 loss. Historical expectancy in this window is -0.42R.
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
                      <div className="text-[10px] uppercase font-mono text-neutral-400 mb-1">Setup Expectancy</div>
                      <div className="text-sm font-bold font-mono text-neutral-200">+0.22R Historical</div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Comparable "Pullback" setups have 48% win rate across 14 historical trades.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeHeroTab === 'curve' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Net Realized P&L</div>
                    <div className="text-lg font-bold text-emerald-400">+$8,420.00</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Win Rate</div>
                    <div className="text-lg font-bold text-neutral-100">64.3%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Profit Factor</div>
                    <div className="text-lg font-bold text-cyan-400">2.18</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase">Max Drawdown</div>
                    <div className="text-lg font-bold text-neutral-300">$1,650 (1.6%)</div>
                  </div>
                </div>

                <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2 border border-neutral-800 rounded-xl bg-neutral-950">
                  {[20, 28, 25, 40, 36, 52, 48, 62, 59, 75, 70, 85, 80, 92, 88, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        style={{ height: `${h}%` }}
                        className="w-full bg-gradient-to-t from-cyan-500/40 to-cyan-400 rounded-t-sm group-hover:bg-cyan-300 transition-all"
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeHeroTab === 'dna' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono uppercase text-cyan-400 font-semibold">Session Performance Matrix</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center py-1 border-b border-neutral-850">
                      <span className="text-neutral-400">London Session</span>
                      <span className="text-emerald-400 font-bold">+1.85R Expectancy (68% WR)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-neutral-850">
                      <span className="text-neutral-400">New York Overlap</span>
                      <span className="text-emerald-400 font-bold">+1.42R Expectancy (60% WR)</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-400">Asian Off-Hours</span>
                      <span className="text-rose-400 font-bold">-0.35R Expectancy (33% WR)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono uppercase text-cyan-400 font-semibold">Behavioral Flag: Post-Loss</div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Trades entered within 30 minutes following a realized loss show an empirical win rate drop of 24.5% compared to the trader baseline.
                  </p>
                  <div className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 p-2 rounded">
                    Statistical Significance: HIGH (p &lt; 0.05 across 6 observations)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 border-t border-neutral-800/80 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
              Systematic Data Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100">
              How TRACKERX Works
            </h2>
            <p className="text-sm text-neutral-400">
              From disparate broker export files to verified mathematical trading intelligence in four deterministic stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-neutral-100">Ingest Trade History</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Connect via read-only Broker APIs, MT5 bridge companion, MT4 EA webhooks, or drag-and-drop CSV statements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-neutral-100">Normalize Schema</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Raw ticket numbers, fills, swaps, and slippage map into a uniform canonical trade model independent of broker semantics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-neutral-100">Calculate Patterns</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Quantitative engine computes expectancy, max drawdown, risk deviation, holding durations, and session heatmaps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold">
                04
              </div>
              <h3 className="text-base font-bold text-neutral-100">Explain the Evidence</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Grounded explanation synthesis highlights verified statistical deviations from baseline without fabricating causality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section id="features" className="py-20 border-t border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
              Comprehensive Analytics Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100">
              Built for Serious Quantitative Traders
            </h2>
            <p className="text-sm text-neutral-400">
              Stop guessing why trades won or lost. Measure real statistical relationships across all your executions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <Microscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Trade Diagnostics ("Why I Won / Lost")</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every trade is benchmarked against your historical median for position sizing, timing, setup expectancy, and session alignment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <Dna className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Trader DNA & Behavioral Patterns</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Pinpoint your highest expectancy hours, optimal holding duration windows, and identify post-loss revenge trading tendencies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Funded Account Guardrails</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Configure proprietary evaluation thresholds. Monitor remaining daily loss buffer, max drawdown headroom, and profit targets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Universal CSV Importer</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Drag-and-drop statements from MT4, MT5, cTrader, TradingView, or NinjaTrader with automated column matching and duplicate elimination.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Risk Consistency Scoring</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Evaluate your variance in position sizing and risk exposure across different market regimes to maintain capital preservation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Multi-Account Portfolio Isolation</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Analyze your personal accounts, challenge evaluations, and live funded accounts in a single consolidated interface or isolated views.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BROKER CONNECTIVITY ARCHITECTURE */}
      <section id="connectors" className="py-20 border-t border-neutral-800/80 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
              Transparent Integration Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100">
              Broker Connectivity Architecture
            </h2>
            <p className="text-sm text-neutral-400">
              We never fabricate live broker connectivity. Here is our exact connector matrix and operational status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-100">CSV & Statement Importer</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Immediate file ingestion for any broker CSV, MT4/MT5 HTML/CSV reports, and cTrader deal logs.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-100">MetaTrader 5 (MT5) Bridge</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                  Development Connector
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Lightweight local companion service streaming deal updates directly from your MT5 terminal terminal history.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-100">MetaTrader 4 (MT4) EA</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                  Development Connector
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                MQL4 Expert Advisor publishing encrypted WebRequest trade receipts upon position closure.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-100">Broker API / OAuth</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Read-only OAuth and API integration for Interactive Brokers, Oanda, and digital asset venues.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-100">cTrader Open API</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Direct integration with Spotware cTrader Open API v2 with OAuth authorization grant.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-100">PDF Statement Parser</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Pipeline Stage
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Automated tabular extraction from standard monthly PDF broker statements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECURITY SECTION */}
      <section id="security" className="py-20 border-t border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
              Zero Execution Risk
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100">
              Security & Data Isolation
            </h2>
            <p className="text-sm text-neutral-400">
              Your trading history is sensitive financial intelligence. We guard it with rigorous architectural standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Strict Read-Only Access</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                TRACKERX never requests order execution or withdrawal privileges. There is zero risk of unauthorized trade placement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Multi-Tenant Isolation</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every trade record and metric is sandboxed behind relational row-level constraints with constant-time verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">No Broker Password Storage</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We never store master trading passwords. MT4/MT5 integrations utilize read-only investor keys or local push bridges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-20 border-t border-neutral-800/80 bg-neutral-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-neutral-100">Questions & Answers</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/80 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-neutral-200 hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-90 text-cyan-400' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-neutral-850 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-neutral-850 bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold tracking-wider text-sm font-mono text-neutral-200">
              TRACKER<span className="text-cyan-400">X</span>
            </span>
          </div>

          <div className="text-xs text-neutral-400 text-center md:text-right max-w-lg leading-relaxed">
            TRACKERX is an analytics and trading-journal web platform. It does not provide personalized investment advice, broker trade execution, or fund management.
          </div>
        </div>
      </footer>
    </div>
  );
}
