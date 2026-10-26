# Google Cloud Run Rendering Worker Deployment Guide

The rendering worker executes background video encoding, FFmpeg composition, and Playwright website captures inside a containerized Debian environment.

---

## 1. Prerequisites

- A Google Cloud Platform (GCP) project with billing enabled.
- [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed locally.
- Docker or Google Cloud Build.

---

## 2. Build & Push Worker Container Image

From the project root:

```bash
# 1. Set your GCP project ID
export GCP_PROJECT_ID="your-gcp-project-id"
export IMAGE_TAG="gcr.io/${GCP_PROJECT_ID}/creator-studio-renderer:latest"

# 2. Build and submit using Google Cloud Build (no local Docker daemon required):
gcloud builds submit worker/ --tag "${IMAGE_TAG}" --project "${GCP_PROJECT_ID}"
```

---

## 3. Deploy as a Google Cloud Run Service or Job

### Option A: Cloud Run Service (HTTP Dispatcher)
```bash
gcloud run deploy creator-studio-renderer \
  --image "${IMAGE_TAG}" \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --allow-unauthenticated \
  --project "${GCP_PROJECT_ID}"
```

### Option B: Cloud Run Job (Queue Batch Worker)
```bash
gcloud run jobs create creator-studio-job \
  --image "${IMAGE_TAG}" \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --max-retries 3 \
  --task-timeout 600s \
  --project "${GCP_PROJECT_ID}"
```

---

## 4. Connect to Frontend

Once deployed, copy the Cloud Run Service URL (e.g. `https://creator-studio-renderer-xyz.a.run.app`) into:
- Creator Studio **Settings Modal > Cloud Run Worker**, or
- `VITE_CLOUD_RUN_WORKER_URL` in `.env.local`.
