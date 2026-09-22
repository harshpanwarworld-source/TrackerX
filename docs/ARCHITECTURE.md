# TRACKERX — Architecture Overview

## 1. System Architecture

TRACKERX adopts a full-stack, modular architecture with strict separation between data ingestion, normalization, quantitative analytics calculation, presentation, and explanation layers:

```
[Ingestion Layer]
  - Broker APIs (OAuth / REST)
  - MT5 Local Bridge (IPC / WebSocket / Socket)
  - MT4 Expert Advisor (HTTP Post / WebRequest)
  - cTrader Open API / Fix
  - File Import (CSV, XLSX, PDF parser)
        │
        ▼
[Normalization Engine]
  - Column Mapping & Schema Detection
  - Deduplication & Timestamp Alignment
  - Canonical Trade Entity Hydration
        │
        ▼
[Relational Database (ACID SQL)]
  - Users & Tenant Isolation
  - Trading Accounts & Broker Credentials (Encrypted)
  - Canonical Trades & Events
  - Import Batches & Audit Logs
  - Funded Account Configurations
        │
        ▼
[Quantitative Analytics Engine]
  - Summary Metrics (Net P&L, Win Rate, Profit Factor, Expectancy, Max Drawdown)
  - Behavioral Metrics (Session, Hour, Holding Duration, Win/Loss Reactions)
  - Baseline Comparator (Individual Trade vs Trader Historical Median)
        │
        ├───────────────────────────────┐
        ▼                               ▼
[Visual Presentation Layer]     [AI Evidence Explanation Layer]
  - Dark Financial UI             - Server-side Gemini API Integration
  - Equity & Drawdown Visualizers  - Structured Input: Verified Metrics Only
  - Trade Diagnostic Workstation  - Output: Natural Language Factor Summary
  - Responsive Mobile/Desktop     - Strict Constraint: No Invented Causality
```

## 2. Technology Stack Selection

### 2.1 Frontend
* **Framework**: React 19 with Vite 8.
* **Language**: TypeScript 5.8+ (Strict Type-Safety).
* **Styling**: Tailwind CSS v4 with dark-first color schemes, custom monospace tabular figures, and responsive breakpoints.
* **Component Icons**: Lucide React.
* **Animation**: Motion for subtle modal, tab, and card state transitions.
* **State Management**: React state with dedicated hooks for account selection, date ranges, and analytics filtering.

### 2.2 Backend
* **Runtime**: Node.js 22 LTS with Express 4.21.
* **TypeScript Execution**: `tsx` in development, optimized `esbuild` CommonJS bundling for production (`dist/server.cjs`).
* **Networking**: Port 3000 (binds to 0.0.0.0 for Cloud Run container hosting).
* **API Structure**: RESTful `/api/*` endpoints with session-based authentication and tenant data isolation.

### 2.3 Database
* **Engine**: Relational SQL database (`node:sqlite` in local container with full SQL syntax, tables, foreign keys, and indexes; schema-compatible with PostgreSQL/Cloud SQL).
* **Isolation**: All queries enforce `WHERE user_id = ?` and `WHERE trading_account_id IN (SELECT id FROM trading_accounts WHERE user_id = ?)`.

### 2.4 AI Explanation Layer
* **SDK**: `@google/genai` (Server-side only).
* **Model**: `gemini-3.8-flash` for rapid structured text synthesis.
* **Boundary**: The model never executes trades or generates raw metrics. It accepts purely deterministic mathematical evidence produced by the analytics engine and transforms it into clear, evidence-based commentary.
