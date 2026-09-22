import React, { useState } from 'react';
import { BookOpen, Terminal, Shield, Layers, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export function DocsView() {
  const [activeDoc, setActiveDoc] = useState<'architecture' | 'analytics' | 'connectors' | 'security'>('analytics');

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>TRACKERX Architecture & Analytical Specifications</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Internal specifications for the quantitative analytics engine, security model, and connector abstraction.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {[
          { id: 'analytics', label: '1. Analytical Principles' },
          { id: 'architecture', label: '2. System Architecture' },
          { id: 'connectors', label: '3. Broker Ingestion' },
          { id: 'security', label: '4. Security Model' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveDoc(t.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeDoc === t.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Doc Content */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5 leading-relaxed text-neutral-300">
        {activeDoc === 'analytics' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase">
              Section 1: The Non-Causality Principle & Attribution Standard
            </h2>
            <p>
              In financial market analysis, trade outcomes cannot be determined by a single isolated variable. Factors such as liquidity conditions, news events, market spread, and volatility interact simultaneously.
            </p>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="font-bold text-neutral-100">Canonical Rules for AI and Analytics Language:</div>
              <ul className="space-y-1.5 text-neutral-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Never use definitive causal verbs like "You lost because..." or "This trade won due to..."</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Always frame as measurable contributing factors: "TRACKERX identified these measurable contributing factors: ..."</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Compare against historical baseline medians: "Executed lot size was +42% above your median 2.00 lot baseline."</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeDoc === 'architecture' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase">
              Section 2: High-Performance Normalized Database Architecture
            </h2>
            <p>
              TRACKERX operates on a local relational SQLite database running in WAL (Write-Ahead Logging) mode, providing ACID compliance, sub-millisecond query execution, and strict tenant isolation.
            </p>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-cyan-300 space-y-1">
              <div>// Primary Tables:</div>
              <div>• users (id, email, password_hash, salt, created_at)</div>
              <div>• sessions (token, user_id, expires_at)</div>
              <div>• trading_accounts (id, user_id, name, broker, platform, balance)</div>
              <div>• trades (id, user_id, trading_account_id, symbol, direction, pnl, r_multiple)</div>
              <div>• funded_account_rules (trading_account_id, profit_target, max_drawdown)</div>
            </div>
          </div>
        )}

        {activeDoc === 'connectors' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase">
              Section 3: Ingestion Framework
            </h2>
            <p>
              Broker historical statements vary drastically across formats (MT4 ticket logs, MT5 position deals, cTrader JSON exports). TRACKERX runs a multi-tier transformation pipeline that standardizes all input into canonical Trade entities with verified R-multiples.
            </p>
          </div>
        )}

        {activeDoc === 'security' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase">
              Section 4: Security Posture
            </h2>
            <p>
              TRACKERX is deliberately designed as a non-execution financial analytics platform. It possesses zero broker trade placement APIs, eliminating unauthorized execution risks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
