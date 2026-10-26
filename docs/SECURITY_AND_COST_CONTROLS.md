# Security and Cost Control Architecture

Creator Studio implements rigorous controls to prevent unauthorized access, data leaks, and runaway cloud billing.

---

## 1. Security Architecture

### 1.1 SSRF (Server-Side Request Forgery) Prevention
The website capture module strictly screens every URL using [`safeUrlValidator.ts`](../src/services/webcapture/safeUrlValidator.ts):
- Rejects loopback addresses (`127.0.0.1`, `localhost`, `::1`).
- Rejects private RFC 1918 IPv4 spaces (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- Rejects cloud instance metadata endpoints (`169.254.169.254`, `metadata.google.internal`).
- Rejects internal DNS suffixes (`.internal`, `.local`, `.lan`).
- Restricts protocols to `http:` and `https:` only (rejects `file:`, `ftp:`, `gopher:`, `data:`, `javascript:`).

### 1.2 Secret Hygiene
- API keys and tokens are stored in the client's `localStorage` or injected as environment variables.
- Secrets are **never** logged to the browser console.
- S3 / R2 secret access keys are not included in client-side download links.
- `.env` and `.env.*` are added to `.gitignore`. `.env.example` contains only blank values.

### 1.3 Row-Level Security (RLS)
The Supabase PostgreSQL migration enforces tenant isolation:
- Users can only read, insert, update, and delete their own projects, assets, and render records.

---

## 2. Cost Control Safeguards

### 2.1 Free-Only AI Model Mode
- The AI client validates model IDs before dispatching requests.
- When `openRouterFreeOnly: true` is enabled, any request attempting to use a paid model (e.g. Claude 3.5 Sonnet, GPT-4o) is blocked client-side before any token is consumed.
- Free models: `google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`, `deepseek/deepseek-r1:free`.

### 2.2 Mandatory Storyboard Approval Gate
- Rendering is strictly blocked until the user explicitly reviews and clicks **Approve Storyboard**.
- Prevents accidental, unintended, or duplicate renders.

### 2.3 Local-First Execution
- Video rendering runs on the client device via Canvas + MediaRecorder at zero server cost.
- Cloud Run workers are only dispatched when explicitly requested.

### 2.4 Bounded Worker Retries & Timeouts
- Cloud rendering worker jobs enforce a hard 5-minute timeout.
- Retries are strictly capped at 3 attempts with exponential backoff before failing safely.
