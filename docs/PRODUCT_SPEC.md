# TRACKERX — Product Specification

## 1. Product Overview
TRACKERX is a high-precision trading analytics and trade-journaling platform tailored for retail traders, prop/evaluation firm participants, funded account managers, and multi-broker portfolio operators.

Unlike order execution systems, TRACKERX acts as a **pure analytics and diagnostic engine**. It imports historical and ongoing trade executions across diverse trading channels (Broker APIs, MT4, MT5, cTrader, CSV, Excel, and PDF records), maps disparate broker schemas into a canonical normalized trade model, calculates robust quantitative statistics, isolates statistically significant contributing factors behind winning and losing trades, and renders these findings in a dark-first financial workstation interface.

## 2. Core Functional Requirements

### 2.1 Multi-Broker Data Ingestion & Normalization
* **Connector Abstraction Layer**: Support for Broker APIs, MetaTrader 5 Bridge, MetaTrader 4 Expert Advisor, cTrader Open API / Fix, CSV/XLSX file ingestion, and statement parsing.
* **Canonical Trade Normalization**: Every trade is transformed into a standardized trade entity storing pricing, slippage, commission, swap, exact execution timestamps, duration, net P&L, risk in currency and basis points, setup classification, session window, and market context.
* **Batch Import & Audit Trail**: Ingested data is versioned under `ImportBatch` records with duplicate detection, row validation, and rejection logs.

### 2.2 Quantitative Analytics Engine
* **Performance Metrics**: Net P&L, Gross Profit, Gross Loss, Win Rate, Profit Factor, Expected Value (Expectancy in $ and R-multiple), Maximum Drawdown ($ and %), Recovery Factor, Consecutive Streaks.
* **Behavioral Analysis**: Holding time distributions, session and hour performance heatmaps, trading frequency, weekday variations, and post-outcome reactions (performance after a win vs after a loss).
* **Risk Consistency**: Risk per trade, deviation from baseline sizing, oversized trade detection, and drawdown contribution.

### 2.3 Evidence-Based Trade Diagnostics ("Why I Won" / "Why I Lost")
* **Strict Principle of Non-Fabricated Causality**: The platform never states that a single factor caused a trade outcome. Markets are multivariant. Instead, TRACKERX extracts **measurable contributing factors** benchmarked against the trader's historical baseline.
* **Quantified Factor Cards**:
  1. Position size deviation (e.g. "+34% above median position size").
  2. Execution window deviation (e.g. "Entry executed outside active session").
  3. Setup historical expectancy (e.g. "Setup historical expectancy: -0.32R over 18 comparable samples").
  4. Consecutive loss pressure (e.g. "Trade entered within 14 minutes of a stop-out").

### 2.4 Funded Account Rules & Guardrails
* User-configured evaluation parameters (Starting balance, Current balance, Profit Target, Maximum Daily Drawdown limit, Maximum Total Drawdown limit, Max Risk per trade).
* Live distance indicators: Real-time calculation of remaining buffer before breach, daily loss headroom, and profit target trajectory.
* Transparent labeling: All rules are designated as user-configured benchmarks to prevent false assumptions regarding individual prop firm policies.

### 2.5 Trader DNA
* Deep behavioral fingerprint: Best vs worst hours, sessions (London, NY, Asian, Overlap), instruments, setups, holding duration impact, and statistical confidence levels.

### 2.6 Public & Authenticated Application Shells
* **Public SaaS Web Experience**: High-converting, information-dense landing page, product architectural overview, broker compatibility breakdown, funded-account guardrail explainer, security commitment, and pricing tier architecture.
* **Authenticated Workspace**: Fluid desktop sidebar with collapsible mobile drawers, global account switcher, date filter, real-time sync status badge, and comprehensive trade analysis views.
