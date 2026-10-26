# Google Cloud Run — Future Rendering Alternative

Creator Studio uses a **provider-neutral rendering interface** (`RenderProvider`), making it possible to adopt Google Cloud Run Jobs in the future without changing the frontend, database schema, or storyboard editor.

---

## 1. When Should Cloud Run Be Considered?

While **GitHub Actions is completely free** (2,000 monthly runner minutes on private repos, unlimited on public repos), Google Cloud Run Jobs may be advantageous under specific scaling requirements:

1. **Ultra-High Concurrency**:
   - Free GitHub accounts can run up to 20 concurrent jobs.
   - Cloud Run Jobs can scale to 100+ concurrent worker tasks simultaneously.
2. **Sub-Minute Cold Starts**:
   - GitHub Actions runners take ~15-25 seconds to spin up an Ubuntu VM, checkout code, and install FFmpeg.
   - Cloud Run uses pre-built Docker containers (`worker/Dockerfile`), starting container tasks in ~2-4 seconds.
3. **Dedicated GPU Acceleration**:
   - If AI diffusion video or hardware-accelerated NVENC is needed in the future, Cloud Run supports Nvidia L4 / T4 GPUs (requires paid billing).

---

## 2. Why GitHub Actions Is Recommended Right Now

| Criterion | GitHub Actions (Current Engine) | Google Cloud Run (Alternative) |
| :--- | :--- | :--- |
| **Credit Card Required?** | **NO** (Genuinely free on sign up) | **YES** (GCP billing setup requires credit card) |
| **Surprise Billing Risk** | **ZERO** (Hard caps on free minutes; private repos stop when 2,000 min reached) | **RISK** (Auto-scales past free limits if misconfigured) |
| **Infrastructure Setup** | **1 File** (`.github/workflows/render-video.yml`) | Artifact Registry + Cloud Run Job + IAM Roles + Service Accounts |
| **Maintenance Burden** | Managed by GitHub | Managed GCP project, container image updates |

---

## 3. Switching Architecture

Because `src/services/rendering/renderProvider.ts` implements the unified `RenderProvider` interface:

```typescript
export interface RenderProvider {
  submitRenderJob(job: RenderJob, settings: ProviderSettings): Promise<RenderJob>;
  getRenderJobStatus(jobId: string, token?: string): Promise<RenderJobStatus>;
  cancelRenderJob(jobId: string): Promise<boolean>;
  getRenderResult(jobId: string): Promise<string | null>;
}
```

Both `GitHubActionsRenderProvider` and `CloudRunRenderProvider` implement this contract. To switch to Cloud Run:
1. Build and push `worker/Dockerfile` to Google Artifact Registry:
   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/creator-studio-renderer:latest worker/
   ```
2. Deploy as a Cloud Run Job:
   ```bash
   gcloud run jobs create creator-studio-renderer \
     --image gcr.io/[PROJECT_ID]/creator-studio-renderer:latest \
     --tasks 1 --cpu 2 --memory 4Gi
   ```
3. In Creator Studio UI:
   - Navigate to **Settings > Rendering Engine**.
   - Change Default Engine to **Google Cloud Run Worker**.
   - Enter your Cloud Run Worker URL and Auth Token.
4. The user interface, storyboard validation, project persistence, and download UX remain **100% identical**.
