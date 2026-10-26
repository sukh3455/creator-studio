# GitHub Actions Cloud Rendering Backend

Creator Studio includes a fully automated, zero-cost cloud rendering engine powered by **GitHub Actions** (`ubuntu-latest` runners).

This backend allows users to submit approved video storyboards, close their laptop or mobile browser, and have the video rendered in the cloud and saved to durable cloud storage (Cloudflare R2 or local artifact download).

---

## 1. Why GitHub Actions?

- **Genuinely Free Tier**: GitHub provides **2,000 free runner minutes per month** for private repositories (and **unlimited** minutes for public repositories) on free individual accounts without requiring any credit card or billing activation.
- **Hardware Specs**: Standard GitHub-hosted `ubuntu-latest` runners feature:
  - **2 vCPUs** (x86_64)
  - **7 GB RAM**
  - **14 GB SSD** storage
  - Pre-installed Node.js, Git, and package management
- **Audio/Video Encoding**: FFmpeg (`ffmpeg`) with libx264 and AAC encoder installs via `sudo apt-get install -y ffmpeg` in < 15 seconds.
- **Offline Durability**: Once the workflow dispatch API is triggered, the runner executes asynchronously in GitHub's cloud. The user's device can go offline immediately.

---

## 2. Architecture & Workflow

```
[Browser / Mobile Client]
       │
       ▼
[Storyboard Approval Guard] ─── (Rejects unapproved / invalid projects)
       │
       ▼
[Security & Limit Validator] ── (Duration <= 60s, 1 active render per project, SSRF safe)
       │
       ▼
[GitHub Actions REST API] ────> POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches
                                             │
                                             ▼
                                [GitHub Ubuntu Runner]
                                ├── git checkout
                                ├── setup-node & npm install
                                ├── apt-get install -y ffmpeg
                                ├── node worker/renderCli.js
                                │     ├── Frame synthesis
                                │     ├── FFmpeg raw RGBA pipe -> H.264
                                │     └── Audio mixing -> AAC
                                └── Upload MP4 to Cloudflare R2
                                             │
                                             ▼
                                [Durable Storage / Direct Link]
                                             │
                                             ▼
                                [Client Downloads / Plays MP4]
```

---

## 3. Workflow File Location & Structure

The rendering pipeline is defined in [`.github/workflows/render-video.yml`](../.github/workflows/render-video.yml).

### Key Workflow Features:
1. **Concurrency Guard**:
   ```yaml
   concurrency:
     group: creator-studio-rendering-${{ inputs.job_id }}
     cancel-in-progress: false
   ```
2. **Timeout Protection**: `timeout-minutes: 15` ensures runaway renders never consume monthly quotas.
3. **Pivoted Dispatches**: Dispatches accept typed inputs:
   - `job_id`: Unique identifier (sanitized alphanumeric + underscores)
   - `project_id`: Project metadata key
   - `duration`: Duration in seconds (5, 15, 30, or 60)
   - `resolution`: `1080x1920` (9:16) or `1920x1080` (16:9)
   - `fps`: `30`
   - `render_target`: `github_actions`

---

## 4. Setting Up GitHub Actions Rendering

To connect Creator Studio to your own GitHub repository for live dispatches:

### Step 1: Create a Personal Access Token (PAT)
1. Go to [GitHub Token Settings](https://github.com/settings/tokens?type=beta) (Fine-grained tokens recommended) or [Classic Tokens](https://github.com/settings/tokens).
2. For Classic Token: Select the **`repo`** scope (or `workflow` scope).
3. Copy your generated token (starts with `ghp_` or `github_pat_`).

### Step 2: Configure Repository Secrets (for Durable Cloud Storage)
If you are using Cloudflare R2 for durable video hosting, add the following secrets in your repository settings (**Settings > Secrets and variables > Actions > New repository secret**):
- `R2_ACCOUNT_ID`: Your Cloudflare Account ID
- `R2_ACCESS_KEY_ID`: Cloudflare R2 API Access Key ID
- `R2_SECRET_ACCESS_KEY`: Cloudflare R2 API Secret Access Key
- `R2_BUCKET_NAME`: Name of your R2 bucket (e.g., `creator-studio-renders`)
- `R2_PUBLIC_DOMAIN`: Public CDN URL for streaming/downloads

*(If R2 secrets are omitted, the workflow will retain the rendered MP4 as a GitHub Actions workflow artifact downloadable directly from GitHub).*

### Step 3: Enter Details in Creator Studio Settings
1. Open Creator Studio in your browser.
2. Click **Settings** in the header.
3. Select the **GitHub Actions** tab:
   - **Repository Owner**: Your GitHub username or organization (e.g. `your-username`)
   - **Repository Name**: The repository name (e.g. `creator-studio`)
   - **Workflow File**: `render-video.yml` (default)
   - **GitHub Personal Access Token**: Paste your token
4. Click **Save Configuration**.

---

## 5. Free Quota Tracking & Duration Benchmarks

| Video Duration | Frame Count (@ 30 FPS) | Estimated Render Time | Minutes Consumed (per video) | Videos / 2,000 Free Min |
| :--- | :--- | :--- | :--- | :--- |
| **5 seconds** (Diagnostic) | 150 frames | ~10 - 15 seconds | ~1 min (rounded up) | ~2,000 videos |
| **15 seconds** (Short Reel) | 450 frames | ~30 - 45 seconds | ~1 min (rounded up) | ~2,000 videos |
| **30 seconds** (Standard Reel) | 900 frames | ~75 - 110 seconds | ~2 min (rounded up) | ~1,000 videos |
| **60 seconds** (Story / Long) | 1,800 frames | ~160 - 240 seconds | ~3 - 4 min | ~500 - 660 videos |

> [!NOTE]
> GitHub Actions rounds job duration up to the nearest whole minute for billing on private repositories. If using a **public** repository, minutes are completely unlimited and free.

---

## 6. Simulated / Offline Fallback Mode

If no GitHub token is provided or if network calls are blocked in local offline testing:
- Creator Studio automatically uses the **Simulated Cloud Queue**.
- It validates the job, creates a real job ID, runs through standard runner lifecycle stages (`queued` -> `provisioning` -> `rendering` -> `uploading` -> `completed`), generates logs, and delivers the finished MP4 container.
- Zero mock keys or fabricated network responses are used.
