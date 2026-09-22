import React, { useState } from 'react';
import { TradingAccount, AccountPlatform, AccountType } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Wallet,
  Plus,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Activity,
  X,
} from 'lucide-react';

interface AccountsViewProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onRefreshAccounts: () => void;
  onOpenImport: () => void;
}

export function AccountsView({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onRefreshAccounts,
  onOpenImport,
}: AccountsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [broker, setBroker] = useState('');
  const [platform, setPlatform] = useState<AccountPlatform>('mt5');
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [currency, setCurrency] = useState('USD');
  const [initialBalance, setInitialBalance] = useState(10000);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createAccount({
        name,
        broker,
        platform,
        accountType,
        currency,
        initialBalance,
        connectionMethod: platform === 'csv' ? 'manual_import' : 'api',
      });
      setShowAddModal(false);
      setName('');
      setBroker('');
      onRefreshAccounts();
    } catch (err: any) {
      console.error('Failed to create account:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-neutral-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <span>Accounts & Connector Workstation</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage your broker connections, evaluation challenges, and personal trading accounts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Trading Account</span>
        </button>
      </div>

      {/* Connected Accounts Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase text-neutral-300">
          Connected Trading Accounts ({accounts.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => {
            const isSelected = selectedAccountId === acc.id || (selectedAccountId === 'all' && accounts[0]?.id === acc.id);
            const netGain = acc.currentBalance - acc.initialBalance;

            return (
              <div
                key={acc.id}
                className={`p-5 rounded-2xl bg-neutral-900 border transition-all ${
                  isSelected ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/5' : 'border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 border-b border-neutral-850 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-neutral-100 text-sm">{acc.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                        {acc.accountType}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                      {acc.broker} • Platform: <span className="uppercase">{acc.platform}</span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Active</span>
                  </span>
                </div>

                <div className="py-3 grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase">Current Balance</div>
                    <div className="text-base font-bold text-neutral-100">
                      ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase">Cumulative Return</div>
                    <div className={`text-base font-bold ${netGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netGain >= 0 ? '+' : ''}${netGain.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-850 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectAccount(acc.id)}
                    className="text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1"
                  >
                    <span>Inspect Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onOpenImport}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-[11px] transition-colors"
                  >
                    Import Trades
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broker Connector Architecture Matrix */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold font-mono text-neutral-200">
            Broker Connector Status Matrix
          </h2>
          <p className="text-xs text-neutral-400">
            Architecture overview for automated ingestion bridges and file imports.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-200">CSV & Statement Parser</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Production
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Zero setup required. Drag and drop any statement from any brokerage or terminal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-200">MT5 Local Companion</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                Dev Connector
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              IPC WebSocket bridge streaming trade receipts locally without credential transmission.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-200">MT4 Web Push EA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                Dev Connector
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              MQL4 Expert Advisor syncing historical orders securely on position settlement.
            </p>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <span className="text-sm font-bold font-mono text-neutral-200">Add Trading Account</span>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Account Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FTMO 100K Challenge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Broker / Firm</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FTMO, IC Markets, Oanda"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-neutral-100"
                  >
                    <option value="mt5">MetaTrader 5</option>
                    <option value="mt4">MetaTrader 4</option>
                    <option value="ctrader">cTrader</option>
                    <option value="broker_api">Broker API</option>
                    <option value="manual_csv">Manual / CSV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-neutral-100"
                  >
                    <option value="personal">Personal Live</option>
                    <option value="funded">Funded Prop</option>
                    <option value="evaluation">Prop Challenge</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Starting Balance ($)</label>
                  <input
                    type="number"
                    required
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-neutral-100"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
