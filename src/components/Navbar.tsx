import React from 'react';
import { User, TradingAccount } from '../types/index.js';
import { Activity, ShieldCheck, Database, LogOut, ChevronDown, Plus, Sparkles, Terminal } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  accounts: TradingAccount[];
  selectedAccountId: string;
  onSelectAccount: (accId: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenImport: () => void;
  onOpenAddAccount: () => void;
  onLogout: () => void;
  isDemoUser?: boolean;
}

export function Navbar({
  user,
  accounts,
  selectedAccountId,
  onSelectAccount,
  onOpenAuth,
  onOpenImport,
  onOpenAddAccount,
  onLogout,
  isDemoUser,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Platform Name */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-wider text-base text-neutral-100 font-mono">TRACKER<span className="text-cyan-400">X</span></span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-semibold font-mono">
                  v2.4
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 hidden sm:inline -mt-0.5">Quantitative Trading Analytics</span>
            </div>
          </a>

          {/* Public Landing Links */}
          {!user && (
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400 font-medium">
              <a href="#how-it-works" className="hover:text-neutral-100 transition-colors">How It Works</a>
              <a href="#features" className="hover:text-neutral-100 transition-colors">Features</a>
              <a href="#connectors" className="hover:text-neutral-100 transition-colors">Connectors</a>
              <a href="#funded-guardrails" className="hover:text-neutral-100 transition-colors">Funded Rules</a>
              <a href="#security" className="hover:text-neutral-100 transition-colors">Security</a>
              <a href="#faq" className="hover:text-neutral-100 transition-colors">FAQ</a>
            </nav>
          )}
        </div>

        {/* Right Action / Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Account Selector */}
              <div className="relative flex items-center">
                <select
                  value={selectedAccountId}
                  onChange={(e) => onSelectAccount(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-cyan-500 font-medium cursor-pointer shadow-sm hover:bg-neutral-850"
                >
                  <option value="all">All Accounts (Consolidated)</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.broker} - {acc.currency})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 pointer-events-none" />
              </div>

              {/* Add Account Button */}
              <button
                onClick={onOpenAddAccount}
                className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Connect another broker or account"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>

              {/* Import CSV CTA */}
              <button
                onClick={onOpenImport}
                className="flex items-center gap-1.5 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import</span> Trades
              </button>

              {/* Status Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isDemoUser ? 'Test Fixture' : 'Isolated Data'}</span>
              </div>

              {/* User Profile & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-300">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* One-click explore demo */}
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs text-neutral-400 hover:text-neutral-200 font-medium px-3 py-2 transition-colors"
              >
                Log In
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="text-xs bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Start Free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
