import React, { useState, useEffect, useCallback } from 'react';
import { User, TradingAccount, Trade, QuantitativeSummary } from './types/index.js';
import { api, getStoredToken, setStoredToken } from './services/api.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar, AppView } from './components/Sidebar.js';
import { LandingPage } from './components/LandingPage.js';
import { AuthModal } from './components/AuthModal.js';
import { DashboardView } from './components/DashboardView.js';
import { TradeHistoryView } from './components/TradeHistoryView.js';
import { TradeAnalysisView } from './components/TradeAnalysisView.js';
import { FundedDashboardView } from './components/FundedDashboardView.js';
import { TraderDNAView } from './components/TraderDNAView.js';
import { ImportCenterView } from './components/ImportCenterView.js';
import { AccountsView } from './components/AccountsView.js';
import { SettingsView } from './components/SettingsView.js';
import { DocsView } from './components/DocsView.js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<QuantitativeSummary | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [appLoading, setAppLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setAppLoading(false);
      return;
    }

    api.getMe()
      .then(res => {
        setUser(res.user);
      })
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => {
        setAppLoading(false);
      });
  }, []);

  // Fetch accounts when user logs in
  const loadAccounts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getAccounts();
      setAccounts(res.accounts);
      if (res.accounts.length > 0 && selectedAccountId !== 'all' && !res.accounts.find(a => a.id === selectedAccountId)) {
        setSelectedAccountId('all');
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }, [user, selectedAccountId]);

  // Fetch trades and summary when user or selectedAccountId changes
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [tradesRes, summaryRes] = await Promise.all([
        api.getTrades({ accountId: selectedAccountId }),
        api.getSummary(selectedAccountId),
      ]);
      setTrades(tradesRes.trades);
      setSummary(summaryRes.summary);
    } catch (err) {
      console.error('Failed to load trades / summary:', err);
    }
  }, [user, selectedAccountId]);

  useEffect(() => {
    if (user) {
      loadAccounts();
      loadData();
    }
  }, [user, loadAccounts, loadData]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore
    }
    setStoredToken(null);
    setUser(null);
    setAccounts([]);
    setTrades([]);
    setSummary(null);
    setCurrentView('dashboard');
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentView('dashboard');
  };

  const handleSelectTradeForAnalysis = (tradeId: string) => {
    setSelectedTradeId(tradeId);
    setCurrentView('trade-analysis');
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-mono text-cyan-400 space-y-3">
        <div className="w-8 h-8 rounded-lg border-2 border-cyan-500 border-t-transparent animate-spin"></div>
        <div className="text-xs tracking-wider">TRACKERX ENGINE INITIALIZING...</div>
      </div>
    );
  }

  // Render Public Landing Page if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col font-sans selection:bg-cyan-500 selection:text-neutral-950">
        <Navbar
          user={null}
          accounts={[]}
          selectedAccountId="all"
          onSelectAccount={() => {}}
          onOpenAuth={handleOpenAuth}
          onOpenImport={() => handleOpenAuth('signup')}
          onOpenAddAccount={() => handleOpenAuth('signup')}
          onLogout={() => {}}
        />

        <main className="flex-1">
          <LandingPage
            onStartAnalyzing={() => handleOpenAuth('signup')}
            onExploreDemo={async () => {
              try {
                const res = await api.demoSession();
                setStoredToken(res.token);
                setUser(res.user);
                setCurrentView('dashboard');
              } catch (err: any) {
                console.error('Demo error:', err);
                handleOpenAuth('login');
              }
            }}
          />
        </main>

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // Render Authenticated Workstation
  const isDemo = user.email.includes('demo');

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col text-neutral-100 font-sans selection:bg-cyan-500 selection:text-neutral-950">
      {/* Top Navbar */}
      <Navbar
        user={user}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        onOpenAuth={() => {}}
        onOpenImport={() => setCurrentView('import')}
        onOpenAddAccount={() => setCurrentView('accounts')}
        onLogout={handleLogout}
        isDemoUser={isDemo}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          tradeCount={trades.length}
          isFundedAccount={accounts.some(a => a.accountType === 'funded' || a.accountType === 'evaluation')}
        />

        {/* Dynamic Content Pane */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              summary={summary}
              trades={trades}
              onSelectTrade={handleSelectTradeForAnalysis}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'trades' && (
            <TradeHistoryView
              trades={trades}
              onSelectTrade={handleSelectTradeForAnalysis}
            />
          )}

          {currentView === 'trade-analysis' && (
            <TradeAnalysisView
              tradeId={selectedTradeId}
              trades={trades}
              onSelectTrade={setSelectedTradeId}
              onBackToHistory={() => setCurrentView('trades')}
            />
          )}

          {currentView === 'funded' && (
            <FundedDashboardView
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              summary={summary}
            />
          )}

          {currentView === 'dna' && (
            <TraderDNAView
              selectedAccountId={selectedAccountId}
            />
          )}

          {currentView === 'import' && (
            <ImportCenterView
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onImportComplete={() => {
                loadAccounts();
                loadData();
              }}
            />
          )}

          {currentView === 'accounts' && (
            <AccountsView
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={(id) => {
                setSelectedAccountId(id);
                setCurrentView('dashboard');
              }}
              onRefreshAccounts={loadAccounts}
              onOpenImport={() => setCurrentView('import')}
            />
          )}

          {currentView === 'docs' && (
            <DocsView />
          )}

          {currentView === 'settings' && (
            <SettingsView
              user={user}
              accounts={accounts}
              trades={trades}
              onReloadData={() => {
                loadAccounts();
                loadData();
              }}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
