# TRACKERX — Broker Connector Architecture

## 1. Connector Abstraction Model

TRACKERX provides a uniform interface `IBrokerConnector` that isolates trade data acquisition from normalization and analytics:

```typescript
export interface IBrokerConnector {
  readonly id: string;
  readonly name: string;
  readonly type: 'api_oauth' | 'mt5_bridge' | 'mt4_ea' | 'ctrader' | 'file_import';
  readonly status: 'production' | 'development' | 'coming_soon';

  testConnection(credentials: Record<string, any>): Promise<{ ok: boolean; message: string }>;
  fetchTrades(accountId: string, since?: Date): Promise<RawBrokerTrade[]>;
  normalizeTrade(raw: RawBrokerTrade): NormalizedTrade;
}
```

## 2. Ingestion Methods

### Method 1: Broker API / OAuth (Interactive Brokers, Oanda, Binance, Bybit)
* Direct read-only REST / WebSocket credentials.
* Scope restricted strictly to `read:history` or `read:orders`. No trading or withdrawal permissions accepted.
* Credential encryption at rest using AES-256-GCM.

### Method 2: MetaTrader 5 (MT5) Local Bridge
* Standalone desktop companion service using MT5 Python API / Win32 IPC or lightweight local WebSocket agent.
* Queries local terminal history via `mt5.history_deals_get()` and streams JSON payloads to TRACKERX.
* Status in prototype: Architectural interface provided; labeled "Development Connector".

### Method 3: MetaTrader 4 (MT4) Expert Advisor
* MQL4 Expert Advisor (`TrackerX_Sync_EA.mq4`) executing periodic `WebRequest()` POST requests on candle close or trade closure.
* Sends encrypted payload containing ticket number, symbol, open/close prices, lot size, commission, swap, and magic numbers.
* Status in prototype: Architectural interface provided; labeled "Development Connector".

### Method 4: cTrader Integration
* Integrates via Spotware cTrader Open API v2.
* OAuth authorization code grant retrieves account tokens and subscribes to `ProtoOAGetAccountListReq` and `ProtoOADealListReq`.
* Status in prototype: Interface provided; labeled "Coming Soon".

### Method 5: Universal CSV & Excel Importer
* Full production-ready importer supporting generic broker CSV exports (MT4/MT5 statement export, TradingView, TradeLocker, NinjaTrader, cTrader CSV).
* Interactive drag-and-drop, automated header mapping detection with manual override, row validation, duplicate check, and error telemetry.

### Method 6: PDF Statement Parsing
* Extracts tabular trade rows from monthly broker PDF statements using coordinate text bounding boxes.
* Status: Pipeline placeholder documented.
