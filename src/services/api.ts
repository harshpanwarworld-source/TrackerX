import { User, TradingAccount, Trade, TradeAnalysisResult, QuantitativeSummary, TraderDNA, FundedAccountRules } from '../types/index.js';

const TOKEN_KEY = 'trackerx_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; displayName?: string }) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  demoSession: () =>
    request<{ user: User; token: string; isDemo: boolean }>('/api/auth/demo-session', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  // Accounts
  getAccounts: () => request<{ accounts: TradingAccount[] }>('/api/accounts'),

  createAccount: (payload: Partial<TradingAccount>) =>
    request<{ account: TradingAccount }>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAccount: (id: string) =>
    request<{ account: TradingAccount; fundedRules: FundedAccountRules | null }>(`/api/accounts/${id}`),

  updateFundedRules: (accountId: string, rules: Partial<FundedAccountRules>) =>
    request<{ fundedRules: FundedAccountRules }>(`/api/accounts/${accountId}/funded-rules`, {
      method: 'PUT',
      body: JSON.stringify(rules),
    }),

  // Trades
  getTrades: (params: { accountId?: string; symbol?: string; direction?: string; setup?: string; outcome?: string }) => {
    const q = new URLSearchParams();
    if (params.accountId) q.set('accountId', params.accountId);
    if (params.symbol) q.set('symbol', params.symbol);
    if (params.direction) q.set('direction', params.direction);
    if (params.setup) q.set('setup', params.setup);
    if (params.outcome) q.set('outcome', params.outcome);
    return request<{ trades: Trade[]; totalCount: number }>(`/api/trades?${q.toString()}`);
  },

  getTradeById: (id: string) =>
    request<{ trade: Trade; analysis: TradeAnalysisResult }>(`/api/trades/${id}`),

  // Analytics
  getSummary: (accountId?: string) => {
    const q = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
    return request<{ summary: QuantitativeSummary }>(`/api/analytics/summary${q}`);
  },

  getTraderDNA: (accountId?: string) => {
    const q = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
    return request<{ dna: TraderDNA }>(`/api/analytics/dna${q}`);
  },

  // AI Explanation
  explainTrade: (tradeId: string) =>
    request<{ explanation: TradeAnalysisResult['aiExplanation'] }>(`/api/ai/explain-trade/${tradeId}`, {
      method: 'POST',
    }),

  // Import
  previewCsv: (csvContent: string) =>
    request<{
      detectedHeaders: string[];
      autoMapping: Record<string, string>;
      sampleRows: Record<string, string>[];
      totalRows: number;
    }>('/api/import/csv/preview', {
      method: 'POST',
      body: JSON.stringify({ csvContent }),
    }),

  commitCsv: (payload: { accountId: string; csvContent: string; columnMapping: Record<string, string> }) =>
    request<{
      totalRows: number;
      importedCount: number;
      skippedCount: number;
      duplicateCount: number;
      errorCount: number;
      errors: string[];
    }>('/api/import/csv/commit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
