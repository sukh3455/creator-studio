# Creator Studio (v2.0) — Autonomous AI Motion Graphics & Video Generation

Creator Studio is a mobile-first, professional AI motion-graphics and video generation studio that runs seamlessly in phones and desktop web browsers.

A user enters any creative idea — such as:
> *"Create a premium 15-second Diwali Reel for Sukh Graphix with elegant typography, custom animated diyas, glowing particles, festive music and a polished brand reveal."*

Creator Studio writes the script, plans an editable scene-by-scene storyboard, enforces mandatory storyboard approval, synthesizes code-generated 60 FPS motion graphics, mixes multi-track audio, and exports MP4 video files locally on device or via containerized cloud workers.

---

## 🌟 Key Capabilities

1. **Natural-Language Prompt-to-Video Planning**:
   - OpenAI-compatible OpenRouter API integration targeting free-tier models (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`).
   - Rich deterministic offline creative template fallback (Diwali, SaaS, Compounding Avalanche, Brand Showcase) requiring zero external API keys.
2. **Mandatory Storyboard Approval**:
   - Enforces human-in-the-loop review before any rendering occurs.
   - Scene-by-scene script editing, kinetic captions, duration adjustments, and instant scene regeneration.
3. **Modular 60 FPS Motion Graphics Engine**:
   - License-free HTML5 Canvas2D / WebGL / SVG compositor (clean alternative to proprietary tools).
   - Animated Diwali Diya with terracotta clay lamp body, oil shimmer, and multi-layered dynamic flickering flame.
   - Glowing particle embers, golden twinkle stars, and confetti bursts.
   - Kinetic typography with gold luxury and neon tech gradients.
   - Polished brand reveal with radial lens sweeps and metallic reflection sheens.
   - Responsive multi-aspect ratio rendering: **9:16 Vertical**, **16:9 Landscape**, and **1:1 Square**.
4. **Multi-Track Audio Mixing & Voiceover**:
   - Web Audio API mixer with automatic music ducking during voiceover narration.
   - Client-side Web Speech API voice synthesis (multilingual: English, Hindi, Punjabi, French, Spanish).
   - FFmpeg command generator for production MP4 muxing and encoding.
5. **Website Capture Automation (Playwright & Chromium)**:
   - Mobile (393 × 852) and Desktop (1280 × 720) viewport captures.
   - Strict SSRF network filter blocking private IPs, localhost, and cloud metadata endpoints (`169.254.169.254`).
   - Client-side high-fidelity mock capture generator for instant previews.
6. **Multi-Source Asset Management**:
   - User uploads (PNG, JPG, SVG, MP4, WebM, MP3, WAV).
   - Curated commercial stock media library with license tracking (Free Commercial, CC0).
   - Scene assignment and visual asset framing.
7. **Triple-Target Video Rendering**:
   - **GitHub Actions Cloud Runner (Default Zero-Cost Cloud)**: Asynchronous 1080x1920 / 30 FPS rendering on GitHub-hosted `ubuntu-latest` runners (2,000 free minutes/mo, no credit card required) that continues after closing your browser or device.
   - **Local Browser Export**: Instant video generation via HTML5 Canvas `.captureStream()` + `MediaRecorder` directly in browser on phone or laptop.
   - **Containerized Cloud Worker**: Google Cloud Run Job alternative for high-concurrency enterprise workloads.
8. **Pluggable Persistence & RLS Security**:
   - LocalStorage and IndexedDB offline persistence out of the box.
   - Production Supabase PostgreSQL adapter with Row-Level Security (RLS) migrations.
   - Cloudflare R2 object storage provider.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```
All 26 automated tests verify GitHub Actions rendering, SSRF security, creative planning, database persistence, and cost safeguards.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates a self-contained production bundle in `dist/index.html`.

---

## 🛠️ Architecture & Tech Stack

```
Creator Studio
├── Frontend (React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons)
│   ├── src/components/
│   │   ├── Header.tsx              (Responsive navigation & aspect ratio toggle)
│   │   ├── Dashboard.tsx           (Projects gallery, health status, templates)
│   │   ├── StoryboardApproval.tsx  (Mandatory approval gate & scene regenerator)
│   │   ├── PreviewPlayer.tsx       (60 FPS canvas player with audio sync & scrubber)
│   │   ├── AssetLibrary.tsx        (Uploads, stock media, Playwright web capture)
│   │   ├── RenderQueueModal.tsx    (Browser MediaRecorder & Cloud Run dispatch)
│   │   ├── ProjectCreateModal.tsx  (Prompt-to-video input, aspect & brand kit)
│   │   └── SettingsModal.tsx       (API keys, model picker, free-only safeguards)
│   ├── src/engine/
│   │   ├── motionGraphics.ts       (Diya lamp, particles, typography, brand reveal)
│   │   └── audio/audioMixer.ts     (Web Audio API multi-channel mixer with ducking)
│   ├── src/services/
│   │   ├── ai/                     (OpenRouter client, offline creative templates)
│   │   ├── db/                     (Supabase client & IndexedDB/LocalStorage mock)
│   │   ├── storage/                (Cloudflare R2 client & local blob store)
│   │   └── webcapture/             (SSRF safe URL validator & web capture service)
│   └── src/types/creatorStudio.ts  (Core TypeScript domain models)
│
├── Cloud Rendering Worker (worker/)
│   ├── Dockerfile                  (Node.js 20, FFmpeg, system fonts, non-root user)
│   ├── index.js                    (Express server, idempotency, 5min timeout, retries)
│   └── cloudrun-job.yaml           (Google Cloud Run Job spec)
│
├── Database Migrations (supabase/migrations/)
│   └── 20261026000000_creator_studio_schema.sql (PostgreSQL schema + RLS policies)
│
└── Documentation Suite (docs/)
    ├── API_AND_PROVIDER_CONFIGURATION.md
    ├── OPENROUTER_SETUP.md
    ├── SUPABASE_SETUP.md
    ├── CLOUDFLARE_R2_SETUP.md
    ├── CLOUD_RUN_DEPLOYMENT.md
    ├── CLOUDFLARE_PAGES_DEPLOYMENT.md
    ├── SECURITY_AND_COST_CONTROLS.md
    ├── AUTOMATED_TESTING.md
    └── EXTERNAL_INTEGRATION_CHECKLIST.md
```

---

## 🔒 Security & Cost Controls

- **SSRF Blocked**: Private networks (`10.x`, `172.16-31.x`, `192.168.x`), loopback (`127.0.0.1`, `localhost`), and cloud instance metadata (`169.254.169.254`) are strictly blocked.
- **Cost Safeguard**: `Enforce Free-Only Mode` prevents unexpected token deductions by rejecting paid AI models client-side.
- **Mandatory Approval**: Rendering cannot be triggered until the user explicitly reviews and clicks **Approve Storyboard**.
- **Secret Protection**: Keys are never transmitted in URLs, never committed to git, and `.env.example` contains only blank values.

---

## 📖 Detailed Guides

- [GitHub Actions Cloud Rendering Guide](docs/GITHUB_ACTIONS_RENDERING.md) *(Default Zero-Cost Engine)*
- [Google Cloud Run — Future Rendering Alternative](docs/CLOUD_RUN_FUTURE_ALTERNATIVE.md)
- [API and Provider Configuration Guide](docs/API_AND_PROVIDER_CONFIGURATION.md)
- [OpenRouter AI Setup Guide](docs/OPENROUTER_SETUP.md)
- [Supabase Setup Guide](docs/SUPABASE_SETUP.md)
- [Cloudflare R2 Storage Guide](docs/CLOUDFLARE_R2_SETUP.md)
- [Google Cloud Run Deployment Guide](docs/CLOUD_RUN_DEPLOYMENT.md)
- [Cloudflare Pages Deployment Guide](docs/CLOUDFLARE_PAGES_DEPLOYMENT.md)
- [Security and Cost Controls](docs/SECURITY_AND_COST_CONTROLS.md)
- [Automated Testing Guide](docs/AUTOMATED_TESTING.md)
- [External Integration Checklist](docs/EXTERNAL_INTEGRATION_CHECKLIST.md)

---

## 📄 License

MIT License. Free for personal and commercial use.
