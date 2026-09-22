# TRACKERX — Security & Data Isolation Architecture

## 1. Multi-Tenant Data Isolation
Financial trade journals contain confidential investment strategies and account balances. TRACKERX enforces non-bypassable tenant isolation:
* **Relational Row-Level Constraints**: All trade queries require authenticated user context.
* **No IDOR (Insecure Direct Object Reference)**: Every `GET /api/trades/:id` validates `WHERE id = ? AND user_id = ?`. Requesting an arbitrary ID returns `404 Not Found`.

## 2. Authentication & Credential Security
* **Password Hashing**: Passwords are never stored in plaintext. Uses salted key derivation (`scrypt` / PBKDF2 with 64-byte salts and minimum 32,768 cost parameters).
* **Constant-Time Verification**: Verification uses `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
* **Session Management**: Session tokens are cryptographically secure 256-bit random hex strings stored with expiration timestamps.
* **Input Validation & Sanitization**: Strict parsing of JSON and CSV files with bounded limits (maximum 10MB per upload, row limit 20,000 per batch).

## 3. Read-Only Broker Integration Principles
* **Zero Order Execution Privileges**: No API credentials with `trade:execute`, `order:place`, or `transfer:withdraw` are accepted or requested.
* **Broker Credential Encryption**: Sensitive API keys and tokens are encrypted at rest using AES-256-GCM.
* **No Stored Broker Account Passwords**: For MT4/MT5, read-only investor passwords or local push bridge connectors are used exclusively.

## 4. Google AI Studio Container & Port Constraints
* Cloud Run ingress allows traffic strictly on port 3000. Express is configured with host `0.0.0.0` and port `3000`.
* All Gemini AI API calls are routed strictly via server-side `/api/ai/*` endpoints. Client code never receives or stores API keys.
