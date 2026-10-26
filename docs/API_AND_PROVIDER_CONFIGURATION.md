# Creator Studio — API and Provider Configuration Guide

Creator Studio is architected with a **Provider Abstraction Model**. The application operates with zero external keys in offline local fallback mode, or seamlessly connects to cloud services once credentials are provided.

---

## Provider Overview Matrix

| Service | Environment Variable | Runtime Setting Location | Local Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **AI Planning** | `VITE_OPENROUTER_API_KEY` | Settings Modal > OpenRouter AI | Deterministic offline creative planning templates (Diwali, SaaS, Compounding, Brand) |
| **Database** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Settings Modal > Supabase DB | IndexedDB & LocalStorage full persistence with zero external setup |
| **Media Storage** | `VITE_R2_ACCOUNT_ID`, `VITE_R2_ACCESS_KEY_ID`, `VITE_R2_SECRET_ACCESS_KEY`, `VITE_R2_BUCKET_NAME` | Settings Modal > Cloudflare R2 | In-memory Object URLs & IndexedDB binary blob persistence |
| **Cloud Worker** | `VITE_CLOUD_RUN_WORKER_URL`, `VITE_CLOUD_RUN_AUTH_TOKEN` | Settings Modal > Cloud Run Worker | Browser-native HTML5 Canvas + WebCodecs / MediaRecorder export (zero servers required) |

---

## 1. Setting Values via Environment Variables (`.env.local`)

For automated deployment or persistent developer defaults, create a `.env.local` file in the project root:

```env
# AI Planning (OpenRouter)
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
VITE_OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free

# Supabase PostgreSQL
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare R2
VITE_R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_R2_BUCKET_NAME=creator-studio-media
VITE_R2_PUBLIC_DOMAIN=https://media.yourdomain.com

# Google Cloud Run Worker
VITE_CLOUD_RUN_WORKER_URL=https://creator-studio-worker-xyz.a.run.app
VITE_CLOUD_RUN_AUTH_TOKEN=your-custom-worker-secret
```

---

## 2. In-App Runtime Configuration (No Rebuild Required)

Users can configure or update API keys at runtime without re-deploying or restarting:
1. Click the **Gear icon (Settings)** in the top navigation bar.
2. Enter the keys in the corresponding provider tab.
3. Click **Save Settings**.
4. The provider status badges will immediately update from **Local Fallback** to **Connected ✓**.
