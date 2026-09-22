import React, { useState } from 'react';
import { User, TradingAccount, Trade } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Settings,
  Shield,
  Database,
  Lock,
  Download,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface SettingsViewProps {
  user: User;
  accounts: TradingAccount[];
  trades: Trade[];
  onReloadData: () => void;
  onNavigate: (view: any) => void;
}

export function SettingsView({
  user,
  accounts,
  trades,
  onReloadData,
  onNavigate,
}: SettingsViewProps) {
  const [resetting, setResetting] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleExportJson = () => {
    const exportObject = {
      user: { id: user.id, email: user.email, displayName: user.displayName },
      exportedAt: new Date().toISOString(),
      accounts,
      trades,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `trackerx_export_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await api.demoSession();
      setResetNotice('Demo portfolio restored with 28 verified historical trade executions.');
      onReloadData();
      setTimeout(() => setResetNotice(null), 4000);
    } catch (err: any) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>Settings & Security Architecture</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Multi-tenant data isolation, security posture, and local data export controls.
          </p>
        </div>
      </div>

      {resetNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{resetNotice}</span>
        </div>
      )}

      {/* User Profile & Tenant Sandbox */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <h2 className="text-xs font-bold uppercase text-neutral-300">
          User Identity & Tenant Sandbox
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
            <div className="text-[10px] text-neutral-500 uppercase">Trader Display Name</div>
            <div className="font-bold text-neutral-200">{user.displayName}</div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
            <div className="text-[10px] text-neutral-500 uppercase">Registered Email</div>
            <div className="font-bold text-neutral-200">{user.email}</div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
            <div className="text-[10px] text-neutral-500 uppercase">Tenant UUID</div>
            <div className="text-cyan-400 text-[11px] truncate">{user.id}</div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
            <div className="text-[10px] text-neutral-500 uppercase">Database Engine</div>
            <div className="text-emerald-400 font-bold">SQLite 3.45 (WAL Mode / ACID)</div>
          </div>
        </div>
      </div>

      {/* Security Guarantees */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase text-neutral-300">
            Cryptographic & Non-Execution Security Standards
          </h2>
        </div>

        <div className="space-y-3 text-xs text-neutral-400">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">Zero Execution Capability: </strong>
              The TRACKERX system architecture contains no broker order placement endpoints or execution triggers.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">Strict Tenant Scoping: </strong>
              All database queries execute with explicit indexed <code>user_id</code> foreign key filters preventing cross-tenant leakage.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">Non-Causal Explanation Standard: </strong>
              AI explanations are strictly grounded in deterministic calculations and never hallucinate causality.
            </div>
          </div>
        </div>
      </div>

      {/* Data Controls & Demo Seeding */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <h2 className="text-xs font-bold uppercase text-neutral-300">
          Data Portability & Test Environment
        </h2>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Normalized JSON ({trades.length} trades)</span>
          </button>

          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-cyan-500/50 text-neutral-300 hover:text-white text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{resetting ? 'Resetting...' : 'Re-Seed Demo Data (28 Verified Trades)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
