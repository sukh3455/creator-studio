# Cloudflare Pages Static Frontend Deployment Guide

Cloudflare Pages is the preferred host for Creator Studio's frontend application. It provides fast global CDN distribution, automatic HTTPS, and free unlimited bandwidth.

---

## 1. Option A: Git Integration (Continuous Deployment)

1. Push this repository to GitHub or GitLab.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), select **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Set Build Configurations:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Environment Variables:
   Add any optional variables from `.env.example` (e.g. `VITE_OPENROUTER_API_KEY`, `VITE_SUPABASE_URL`).
6. Click **Save and Deploy**.

---

## 2. Option B: Direct Upload via Wrangler CLI

You can deploy the built application in seconds without connecting Git:

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy directly with Wrangler
npx wrangler pages deploy dist --project-name creator-studio
```

---

## 3. SPA Routing & Headers Configuration

The repository includes:
- `dist/index.html`: Self-contained bundle or SPA entry.
- `_headers`: Configured for clean caching and Cross-Origin Isolation headers for WebCodecs and canvas workers.
