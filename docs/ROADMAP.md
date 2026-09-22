# TRACKERX — Development & Implementation Roadmap

## Build Phases

### Phase 1: Foundation & Architecture (Current)
* [x] Requirement analysis and full documentation suite (`/docs/*`).
* [x] Normalized canonical data model definition.
* [x] Full-stack Express + Vite + TypeScript runtime configuration.
* [x] Dark-first responsive design system and typography setup.

### Phase 2: Authentication & Multi-Tenant Database
* [x] Native SQL database setup with tables for users, sessions, accounts, trades, import batches, and funded rules.
* [x] PBKDF2/scrypt password hashing and constant-time token verification.
* [x] Isolated demo session generation for zero-friction evaluation.

### Phase 3: Comprehensive Public SaaS Landing Page
* [x] High-conversion dark financial terminal visual aesthetic.
* [x] Hero section with realistic interactive dashboard preview.
* [x] 4-step ingestion & normalization breakdown.
* [x] Feature highlights (Trader DNA, Quantitative Risk, Trade Reasoning).
* [x] Broker connectivity transparency section (API, MT5 bridge, MT4 EA, cTrader, CSV).
* [x] Security & data isolation overview.
* [x] Interactive FAQ and pricing architecture.

### Phase 4: Core Authenticated Dashboard & Analytics Engine
* [x] Top KPI metric cards: Net P&L, Win Rate, Profit Factor, Expectancy, Max Drawdown, Total Trades, Avg R, Risk Consistency.
* [x] Responsive financial visual charts: Equity curve, Daily P&L bars, Drawdown curve, Win/Loss distribution.
* [x] High-performance trade filters (Symbol, Setup, Session, Direction, Outcome).
* [x] Multi-account selector (All Accounts, Personal, Funded, Demo).

### Phase 5: Individual Trade Diagnostics ("Why I Won" / "Why I Lost")
* [x] Trade overview card with exact execution prices, holding duration, commissions, swaps.
* [x] Deterministic contributing factors calculation (Position deviation, Risk delta, Setup historical expectancy, Session timing).
* [x] Grounded Gemini AI natural language explanation service.
* [x] Strict non-causality principles enforced.

### Phase 6: Universal CSV Importer
* [x] Drag-and-drop CSV upload with validation.
* [x] Automated header detection and manual column mapping.
* [x] Row preview and duplicate prevention.
* [x] Batch execution summary.

### Phase 7: Funded Account Risk Center & Guardrails
* [x] User-configurable rules (Starting balance, Profit Target, Max Daily DD, Max Total DD).
* [x] Dynamic headroom and distance-to-breach gauges.
* [x] Rule violation alerts.

### Phase 8: Trader DNA & Behavioral Analytics
* [x] Hourly and session performance heatmaps.
* [x] Holding time distributions (winning vs losing trades).
* [x] Post-win and post-loss behavioral impact.
* [x] Statistical confidence ratings.
