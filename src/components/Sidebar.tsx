import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ListFilter,
  Microscope,
  ShieldAlert,
  Dna,
  FileSpreadsheet,
  Settings,
  BookOpen,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export type AppView =
  | 'dashboard'
  | 'accounts'
  | 'trades'
  | 'trade-analysis'
  | 'funded'
  | 'dna'
  | 'import'
  | 'docs'
  | 'settings';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  tradeCount?: number;
  isFundedAccount?: boolean;
}

export function Sidebar({ currentView, onNavigate, tradeCount = 0, isFundedAccount = true }: SidebarProps) {
  const navItems: Array<{ id: AppView; label: string; icon: any; badge?: string | number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts & Connectors', icon: Wallet },
    { id: 'trades', label: 'Trade History', icon: ListFilter, badge: tradeCount > 0 ? tradeCount : undefined },
    { id: 'trade-analysis', label: 'Trade Diagnostics', icon: Microscope },
    { id: 'funded', label: 'Funded Guardrails', icon: ShieldAlert, badge: isFundedAccount ? 'Active' : undefined },
    { id: 'dna', label: 'Trader DNA', icon: Dna },
    { id: 'import', label: 'CSV Import Center', icon: FileSpreadsheet },
    { id: 'docs', label: 'Architecture & Specs', icon: BookOpen },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-neutral-800/80 bg-neutral-950/70 flex flex-col justify-between py-4 px-3 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Primary Navigation List */}
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-3 mb-2 font-mono">
            Platform Workstation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Diagnostic Principle Card */}
        <div className="px-3 py-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-[11px] space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-300">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Non-Causal Principle</span>
          </div>
          <p className="text-neutral-400 leading-relaxed">
            TRACKERX calculates measurable contributing factors and statistical variance. It never claims singular causality for trade outcomes.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-neutral-850 px-2 text-[10px] text-neutral-400 font-mono flex items-center justify-between">
        <span>TRACKERX ANALYTICS</span>
        <span className="text-cyan-500/80">SQL ENGINE: ACID</span>
      </div>
    </aside>
  );
}
