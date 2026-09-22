# TRACKERX — REST API Specification

All endpoints are hosted under `/api` and enforce session authentication headers or cookies (`Authorization: Bearer <session_token>`).

## 1. Authentication Endpoints
* `POST /api/auth/register`
  * Body: `{ email, password, displayName }`
  * Response: `{ user: { id, email, displayName }, token }`
* `POST /api/auth/login`
  * Body: `{ email, password }`
  * Response: `{ user: { id, email, displayName }, token }`
* `POST /api/auth/logout`
  * Response: `{ success: true }`
* `GET /api/auth/me`
  * Response: `{ user: { id, email, displayName, createdAt } }`
* `POST /api/auth/demo-session`
  * Generates a fully isolated demo session with pre-populated, verified test fixture data for immediate platform exploration.

## 2. Trading Accounts Endpoints
* `GET /api/accounts`
  * Response: `{ accounts: TradingAccount[] }`
* `POST /api/accounts`
  * Body: `{ name, broker, platform, accountType, currency, initialBalance, connectionMethod }`
  * Response: `{ account: TradingAccount }`
* `GET /api/accounts/:id`
  * Response: `{ account: TradingAccount, fundedRules?: FundedAccountRules }`
* `PUT /api/accounts/:id/funded-rules`
  * Body: `{ startingBalance, profitTarget, maxTotalDrawdown, maxDailyDrawdown, maxRiskPerTrade, minTradingDays }`
  * Response: `{ fundedRules: FundedAccountRules }`
* `DELETE /api/accounts/:id`
  * Deletes account and associated trades (cascade).

## 3. Normalized Trades Endpoints
* `GET /api/trades`
  * Query parameters: `accountId`, `symbol`, `direction`, `setup`, `outcome` (win/loss), `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder`.
  * Response: `{ trades: Trade[], totalCount, page, totalPages }`
* `GET /api/trades/:id`
  * Response: `{ trade: Trade, diagnosticFactors: DiagnosticFactor[] }`
* `POST /api/trades`
  * Body: `Partial<Trade>`
  * Response: `{ trade: Trade }`
* `DELETE /api/trades/:id`
  * Response: `{ success: true }`

## 4. Analytics & Diagnostics Endpoints
* `GET /api/analytics/summary`
  * Query parameters: `accountId`, `startDate`, `endDate`
  * Computes deterministic quantitative statistics: Net P&L, Win Rate, Profit Factor, Expectancy, Max Drawdown, Average R, Risk Consistency score, Equity Series, Daily P&L Series, Drawdown Curve, Setup Breakdown, Session Breakdown.
* `GET /api/analytics/dna`
  * Evaluates behavioral patterns: Hour-by-hour win rate & expectancy, Session expectancy, performance after wins vs after losses, average win duration vs average loss duration, and consecutive trade sequencing.
* `GET /api/analytics/trade-factors/:id`
  * Calculates statistical deviations for an individual trade against the user's historical baseline:
    - Position size vs median
    - Risk % vs average
    - Historical setup expectancy across comparable historical trades
    - Holding duration vs average win/loss duration
    - Previous trade context (e.g. entered within N minutes of a loss)

## 5. CSV Import & Validation Endpoints
* `POST /api/import/csv/preview`
  * Body: `{ csvContent: string, delimiter?: string }`
  * Returns: `{ detectedHeaders: string[], autoMapping: Record<string, string>, sampleRows: any[], rowCount: number }`
* `POST /api/import/csv/commit`
  * Body: `{ accountId: string, csvContent: string, columnMapping: Record<string, string> }`
  * Returns: `{ batchId, totalRows, importedCount, skippedCount, duplicateCount, errorCount, errors: string[] }`

## 6. AI Explanation Endpoint
* `POST /api/ai/explain-trade/:id`
  * Body: `{ tradeId: string }`
  * Internal Workflow:
    1. Loads the exact trade and calculated quantitative baseline factors from the analytics engine.
    2. Sends the verified metrics to `@google/genai` with strict grounding prompts.
    3. Returns natural language summary, measurable contributing factors, difference from baseline, and confidence level.
    4. If evidence is insufficient, returns explicit message: "Insufficient evidence to determine meaningful contributing factors."
