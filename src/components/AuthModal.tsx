import React, { useState } from 'react';
import { api, setStoredToken } from '../services/api.js';
import { User } from '../types/index.js';
import { X, Lock, Mail, User as UserIcon, Sparkles, Shield, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await api.register({ email, password, displayName });
        setStoredToken(res.token);
        onSuccess(res.user);
      } else {
        const res = await api.login({ email, password });
        setStoredToken(res.token);
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      const res = await api.demoSession();
      setStoredToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to start demo session');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <span className="font-mono text-sm font-semibold text-neutral-200">
              {mode === 'login' ? 'Trader Login' : 'Create TRACKERX Account'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300">
              {error}
            </div>
          )}

          {/* Quick Demo Access Callout */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-neutral-900 border border-cyan-500/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero-friction Demo</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                Explore with 28 verified historical trades & funded guardrails.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDemoAccess}
              disabled={demoLoading}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
            >
              {demoLoading ? 'Starting...' : 'Explore Demo'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Trader Name / Handle</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Trader"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@domain.com"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-neutral-100 hover:bg-white text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}
            </button>
          </form>

          {/* Toggle login / signup */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="text-xs text-neutral-400 hover:text-cyan-400 transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already registered? Log in'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
            <Shield className="w-3.5 h-3.5 text-neutral-400" />
            <span>Strict tenant isolation. Zero trade execution rights.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
