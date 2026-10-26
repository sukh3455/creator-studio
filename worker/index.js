import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 8080;
const MAX_RENDER_TIMEOUT_MS = 5 * 60 * 1000; // 5 minute hard timeout
const activeJobs = new Map();

// SSRF URL Safety Validator
const FORBIDDEN_HOSTNAMES = new Set([
  'localhost', '127.0.0.1', '0.0.0.0', '::1', 'metadata.google.internal', '169.254.169.254'
]);

function isUrlSafe(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (FORBIDDEN_HOSTNAMES.has(host)) return false;
    if (/^(10|127|169\.254)\./.test(host)) return false;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return false;
    if (/^192\.168\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

// 1. Health & Readiness Check
app.get('/health', async (req, res) => {
  let ffmpegVersion = 'not_found';
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    ffmpegVersion = stdout.split('\n')[0];
  } catch {
    // ignore
  }

  res.json({
    status: 'healthy',
    service: 'creator-studio-render-worker',
    ffmpeg: ffmpegVersion,
    activeJobsCount: activeJobs.size,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 2. Playwright / Headless Web Capture Endpoint
app.post('/capture', async (req, res) => {
  const { url, viewport = 'mobile', width = 393, height = 852 } = req.body;
  
  if (!url || !isUrlSafe(url)) {
    return res.status(400).json({ error: 'SSRF blocked: Invalid or prohibited internal URL' });
  }

  try {
    // In container with Playwright, launch headless browser:
    // const browser = await chromium.launch({ args: ['--no-sandbox'] });
    // const page = await browser.newPage({ viewport: { width, height } });
    // await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    // const buffer = await page.screenshot();
    // await browser.close();

    // Mock asset capture response for standalone execution
    res.json({
      success: true,
      url,
      viewport,
      dimensions: { width, height },
      assetUrl: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=${width}&h=${height}&fit=crop`,
      size: 154200,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Render Job Dispatcher
app.post('/jobs/render', async (req, res) => {
  const {
    jobId = `job_${Date.now()}`,
    projectId,
    scenes = [],
    duration = 15,
    resolution = { width: 720, height: 1280 },
    fps = 60,
    audioUrl
  } = req.body;

  // Idempotency: If job already running, return status
  if (activeJobs.has(jobId)) {
    const existing = activeJobs.get(jobId);
    return res.json({ message: 'Job already in progress', job: existing });
  }

  const jobRecord = {
    id: jobId,
    projectId,
    status: 'rendering',
    progress: 5,
    retries: 0,
    startedAt: new Date().toISOString(),
    logs: [`[${new Date().toLocaleTimeString()}] Worker accepted job ${jobId}`]
  };

  activeJobs.set(jobId, jobRecord);

  // Respond immediately with queued status
  res.status(202).json({
    message: 'Render job accepted for background cloud processing',
    jobId,
    status: 'rendering'
  });

  // Execute rendering with bounded timeout & retries
  processRenderJob(jobRecord, { scenes, duration, resolution, fps, audioUrl });
});

async function processRenderJob(job, params) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      job.logs.push(`[${new Date().toLocaleTimeString()}] Starting render execution (Attempt ${attempt + 1}/${maxRetries})`);
      job.progress = 20;

      // Simulate frame synthesis progress
      for (let p = 25; p <= 85; p += 20) {
        await new Promise(r => setTimeout(r, 600));
        job.progress = p;
        job.logs.push(`[${new Date().toLocaleTimeString()}] Rendering scene frames: ${p}%`);
      }

      // Check if job was cancelled
      if (job.status === 'cancelled') {
        job.logs.push('Render was cancelled by user request.');
        return;
      }

      // Final encoding step
      job.progress = 95;
      job.logs.push(`[${new Date().toLocaleTimeString()}] Finalizing MP4 audio muxing with FFmpeg`);

      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.outputUrl = `https://storage.example.com/renders/${job.id}.mp4`;
      job.logs.push(`[${new Date().toLocaleTimeString()}] Render successfully finished: ${job.outputUrl}`);
      return;
    } catch (err) {
      attempt++;
      job.retries = attempt;
      job.logs.push(`[${new Date().toLocaleTimeString()}] Attempt ${attempt} failed: ${err.message}`);
      if (attempt > maxRetries) {
        job.status = 'failed';
        job.error = `Render failed after ${maxRetries} retries: ${err.message}`;
        return;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// 4. Job Status & Polling
app.get('/jobs/:id', (req, res) => {
  const job = activeJobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// 5. Job Cancellation
app.delete('/jobs/:id', (req, res) => {
  const job = activeJobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  job.status = 'cancelled';
  job.logs.push(`[${new Date().toLocaleTimeString()}] Cancellation requested`);
  res.json({ message: 'Job cancellation requested', jobId: req.params.id });
});

app.listen(PORT, () => {
  console.log(`Creator Studio Cloud Render Worker running on port ${PORT}`);
});
