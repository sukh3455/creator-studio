# Final External Integration Checklist

This checklist contains every required account, API key, configuration parameter, and official portal link needed to transition Creator Studio from local offline mode to full external production.

---

## 1. Provider Accounts & Links

| Provider | Service Role | Official Portal Link | Free Tier Limits |
| :--- | :--- | :--- | :--- |
| **OpenRouter** | AI Planning Provider | [https://openrouter.ai/](https://openrouter.ai/) | Free models (`gemini-2.0-flash-exp:free`, `llama-3.3-70b-instruct:free`) cost $0.00. |
| **GitHub** | Cloud Video Rendering | [https://github.com/](https://github.com/) | 2,000 runner min/month for private repos, unlimited for public repos. No card required. |
| **Supabase** | PostgreSQL & Auth | [https://supabase.com/](https://supabase.com/) | 2 free projects, 500 MB database storage, 50,000 monthly active users. |
| **Cloudflare** | R2 Storage & Pages | [https://dash.cloudflare.com/](https://dash.cloudflare.com/) | Pages: Unlimited requests, free SSL. R2: 10 GB/month free storage, zero egress fees. |
| **Google Cloud** | Cloud Run (Future Alt) | [https://cloud.google.com/run](https://cloud.google.com/run) | Optional alternative; requires billing activation. |

---

## 2. Configuration Fields & Keys

### GitHub Actions (Cloud Rendering Engine)
- **Exact Settings**: `VITE_GITHUB_OWNER`, `VITE_GITHUB_REPO`, `VITE_GITHUB_TOKEN`, `VITE_GITHUB_WORKFLOW`
- **Location**: Creator Studio UI > **Settings Modal > GitHub Actions** (or `.env.local`)
- **Key Generation URL**: [https://github.com/settings/tokens](https://github.com/settings/tokens) (Scope: `repo` or `workflow`)
- **Workflow File**: [`.github/workflows/render-video.yml`](../.github/workflows/render-video.yml)
- **Zero Cost Guarantee**: Standard Ubuntu runners (2 vCPU, 7 GB RAM) are completely free within the monthly 2,000-minute allocation.

### OpenRouter AI
- **Exact Setting**: `VITE_OPENROUTER_API_KEY`
- **Location**: Creator Studio UI > **Settings Modal > OpenRouter AI** (or `.env.local`)
- **Key Generation URL**: [https://openrouter.ai/keys](https://openrouter.ai/keys)
- **Safe Free Default**: `google/gemini-2.0-flash-exp:free` with `Free-only mode` toggled ON.

### Supabase Database
- **Exact Settings**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Location**: Creator Studio UI > **Settings Modal > Supabase DB** (or `.env.local`)
- **Project URL & Key URL**: [https://supabase.com/dashboard/project/_/settings/api](https://supabase.com/dashboard/project/_/settings/api)
- **Migration SQL**: Apply [`supabase/migrations/20261026000000_creator_studio_schema.sql`](../supabase/migrations/20261026000000_creator_studio_schema.sql) in SQL Editor.

### Cloudflare R2
- **Exact Settings**: `VITE_R2_ACCOUNT_ID`, `VITE_R2_ACCESS_KEY_ID`, `VITE_R2_SECRET_ACCESS_KEY`, `VITE_R2_BUCKET_NAME`
- **Location**: Creator Studio UI > **Settings Modal > Cloudflare R2** (or `.env.local`)
- **Token Generation URL**: [https://dash.cloudflare.com/?to=/:account/r2/api-tokens](https://dash.cloudflare.com/?to=/:account/r2/api-tokens)

### Google Cloud Run (Future Alternative)
- **Exact Settings**: `VITE_CLOUD_RUN_WORKER_URL`, `VITE_CLOUD_RUN_AUTH_TOKEN`
- **Location**: Creator Studio UI > **Settings Modal > Cloud Run Worker** (or `.env.local`)
- **Deployment Spec**: [`worker/cloudrun-job.yaml`](../worker/cloudrun-job.yaml) and [`worker/Dockerfile`](../worker/Dockerfile)
- **Console URL**: [https://console.cloud.google.com/run](https://console.cloud.google.com/run)


---

## 3. Immediate Usability

**No keys are required to use the application right now.** You can immediately:
1. Launch the app (`npm run dev`).
2. Input any prompt or click **Diwali Festive Reel — Sukh Graphix**.
3. Edit the storyboard script and click **Approve Storyboard**.
4. Upload custom logos and images or pick from the curated stock library.
5. Watch the real-time 60fps canvas animation with animated Diwali diyas and particles.
6. Click **Export MP4 Video** to render and download directly in your browser.
