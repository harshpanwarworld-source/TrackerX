import React, { useState } from 'react';
import { TradingAccount } from '../types/index.js';
import { api } from '../services/api.js';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ImportCenterViewProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  onImportComplete: () => void;
}

const SAMPLE_CSV = `Date,Symbol,Type,Lots,OpenPrice,ClosePrice,NetProfit,StopLoss,TakeProfit,Setup
2026-03-10 08:30:00,EURUSD,BUY,2.00,1.08500,1.08950,900.00,1.08200,1.09200,Order Block
2026-03-10 14:15:00,GBPUSD,SELL,1.50,1.26500,1.26000,750.00,1.26850,1.25800,Break & Retest
2026-03-11 09:00:00,USDCAD,BUY,2.50,1.35200,1.34800,-1000.00,1.34800,1.35900,Liquidity Sweep
2026-03-11 15:30:00,NAS100,BUY,1.00,18250.0,18410.0,1600.00,18200.0,18500.0,Opening Range Breakout
2026-03-12 10:20:00,XAUUSD,SELL,2.00,2180.50,2190.50,-2000.00,2190.50,2160.00,FVG Fill
2026-03-12 16:00:00,EURUSD,BUY,3.00,1.08700,1.09100,1200.00,1.08450,1.09400,Order Block`;

export function ImportCenterView({
  accounts,
  selectedAccountId,
  onImportComplete,
}: ImportCenterViewProps) {
  const [csvContent, setCsvContent] = useState('');
  const [targetAccountId, setTargetAccountId] = useState(
    selectedAccountId !== 'all' ? selectedAccountId : accounts[0]?.id || ''
  );
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [autoMapping, setAutoMapping] = useState<Record<string, string>>({});
  const [sampleRows, setSampleRows] = useState<Record<string, string>[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'complete'>('upload');
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    duplicateCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      processPreview(text);
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    setCsvContent(SAMPLE_CSV);
    processPreview(SAMPLE_CSV);
  };

  const processPreview = async (text: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.previewCsv(text);
      setDetectedHeaders(res.detectedHeaders);
      setAutoMapping(res.autoMapping);
      setSampleRows(res.sampleRows);
      setStep('mapping');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse CSV preview');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!targetAccountId) {
      setErrorMessage('Please select a target trading account.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.commitCsv({
        accountId: targetAccountId,
        csvContent,
        columnMapping: autoMapping,
      });
      setImportResult(res);
      setStep('complete');
      onImportComplete();
    } catch (err: any) {
      setErrorMessage(err.message || 'Import execution failed');
    } finally {
      setLoading(false);
    }
  };

  const requiredFields = [
    { key: 'symbol', label: 'Symbol (Ticker / Pair)', required: true },
    { key: 'direction', label: 'Direction (BUY / SELL / Action)', required: true },
    { key: 'quantity', label: 'Quantity (Lots / Volume)', required: true },
    { key: 'entryPrice', label: 'Entry Price', required: true },
    { key: 'exitPrice', label: 'Exit Price', required: false },
    { key: 'netPnl', label: 'Net Profit / P&L', required: true },
    { key: 'openTime', label: 'Open Date / Time', required: false },
    { key: 'closeTime', label: 'Close Date / Time', required: false },
    { key: 'stopLoss', label: 'Stop Loss (SL)', required: false },
    { key: 'takeProfit', label: 'Take Profit (TP)', required: false },
    { key: 'setup', label: 'Setup / Strategy Tag', required: false },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-neutral-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <span>Universal CSV & Statement Importer</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Ingest trading statements from MT4, MT5, cTrader, TradingView, or proprietary CSV templates.
          </p>
        </div>

        {step !== 'upload' && (
          <button
            onClick={() => {
              setStep('upload');
              setCsvContent('');
              setImportResult(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Import</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-xs font-mono text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Upload / Paste */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Target Account selector */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-200">Target Trading Account</span>
              <p className="text-[11px] text-neutral-400">Select which portfolio or broker account to map these trades into.</p>
            </div>
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.broker})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-neutral-800 hover:border-cyan-500/50 rounded-2xl p-8 text-center transition-colors bg-neutral-900/40 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold font-mono text-neutral-200">
                Drag & Drop Broker Statement CSV or Click to Browse
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Supports standard export files from MetaTrader 4, MetaTrader 5, cTrader, NinjaTrader, and broker account portals.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <label className="cursor-pointer px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold font-mono transition-colors">
                <span>Select CSV File</span>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={loadSample}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Load Sample Template</span>
              </button>
            </div>
          </div>

          {/* Direct CSV Paste area */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <span className="text-xs font-mono font-bold text-neutral-300">Or Paste Raw CSV Data Directly</span>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste raw CSV lines here (with headers)..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => processPreview(csvContent)}
              disabled={!csvContent.trim() || loading}
              className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold font-mono disabled:opacity-50 transition-colors"
            >
              {loading ? 'Analyzing Structure...' : 'Preview Columns →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping & Sample Verification */}
      {step === 'mapping' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-neutral-200">Step 2: Verify Column Mapping</h3>
                <p className="text-xs text-neutral-400">Auto-detected field alignments. Confirm or manually adjust dropdowns.</p>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {detectedHeaders.length} Columns Detected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requiredFields.map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-xs font-mono text-neutral-400">
                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                  </label>
                  <select
                    value={autoMapping[field.key] || ''}
                    onChange={(e) => setAutoMapping({ ...autoMapping, [field.key]: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Ignore / Not in CSV --</option>
                    {detectedHeaders.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Rows Preview Table */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-neutral-300">
              Sample Data Extraction (First {sampleRows.length} Rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                    {detectedHeaders.map(h => (
                      <th key={h} className="py-2 px-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {sampleRows.map((r, i) => (
                    <tr key={i} className="hover:bg-neutral-850/50">
                      {detectedHeaders.map(h => (
                        <td key={h} className="py-2 px-3 text-neutral-300 whitespace-nowrap">{r[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setStep('upload')}
              className="text-xs font-mono text-neutral-400 hover:text-neutral-200"
            >
              ← Back to File Selection
            </button>
            <button
              onClick={handleCommitImport}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
            >
              <span>{loading ? 'Importing...' : 'Commit & Normalize Trades'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Complete / Summary */}
      {step === 'complete' && importResult && (
        <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold font-mono text-neutral-100">
              Import Completed Successfully
            </h2>
            <p className="text-xs text-neutral-400">
              Trades have been normalized into your canonical ledger and metrics recalculated.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto font-mono text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <div className="text-neutral-400 text-[10px] uppercase">Imported</div>
              <div className="text-lg font-bold text-emerald-400">{importResult.importedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <div className="text-neutral-400 text-[10px] uppercase">Duplicates Skipped</div>
              <div className="text-lg font-bold text-neutral-300">{importResult.duplicateCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <div className="text-neutral-400 text-[10px] uppercase">Errors</div>
              <div className="text-lg font-bold text-neutral-400">{importResult.errorCount}</div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="max-w-md mx-auto p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs font-mono text-left text-rose-300 space-y-1">
              <div className="font-bold">Errors encountered:</div>
              {importResult.errors.map((e, idx) => (
                <div key={idx}>• {e}</div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setStep('upload');
                setCsvContent('');
              }}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono transition-colors"
            >
              Import More Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
