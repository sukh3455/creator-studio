import { describe, it, expect, beforeEach } from 'vitest';
import { GitHubActionsRenderProvider, RenderJobRequest } from '../src/services/rendering/renderProvider';
import { RenderJobSecurityValidator } from '../src/services/rendering/renderJobSecurity';
import { DEFAULT_SETTINGS } from '../src/services/settings/settingsStore';
import { SAMPLE_DIWALI_PROJECT } from '../src/services/db/databaseProvider';
import { Project, RenderJob } from '../src/types/creatorStudio';

describe('GitHub Actions Cloud Rendering & Security Pipeline', () => {
  let provider: GitHubActionsRenderProvider;
  let approvedProject: Project;

  beforeEach(() => {
    provider = new GitHubActionsRenderProvider(DEFAULT_SETTINGS);
    approvedProject = {
      ...SAMPLE_DIWALI_PROJECT,
      status: 'approved',
      duration: 30
    };
  });

  // --------------------------------------------------------------------------
  // Test A: Diagnostic 5-Second Render
  // --------------------------------------------------------------------------
  it('Test A: Submits and processes a 5-second diagnostic render job', async () => {
    const request: RenderJobRequest = {
      jobId: 'job_diag_5s_test',
      project: { ...approvedProject, duration: 5 },
      duration: 5,
      aspectRatio: '9:16',
      resolution: { width: 1080, height: 1920 },
      fps: 30,
      outputFormat: 'mp4'
    };

    const submitRes = await provider.submitRenderJob(request);
    expect(submitRes.jobId).toBe('job_diag_5s_test');
    expect(submitRes.target).toBe('github_actions');
    expect(submitRes.status).toBe('queued');

    // Poll initial status
    const statusRes = await provider.getRenderJobStatus('job_diag_5s_test', approvedProject.id);
    expect(statusRes.jobId).toBe('job_diag_5s_test');
    expect(statusRes.runnerInfo).toContain('GitHub-hosted');
    expect(statusRes.progress).toBeGreaterThanOrEqual(5);
  });

  // --------------------------------------------------------------------------
  // Test B: Full 30-Second Video (1080x1920 @ 30 FPS)
  // --------------------------------------------------------------------------
  it('Test B: Submits a full 30-second video at 1080x1920 @ 30 FPS', async () => {
    const request: RenderJobRequest = {
      jobId: 'job_full_30s_test',
      project: approvedProject,
      duration: 30,
      aspectRatio: '9:16',
      resolution: { width: 1080, height: 1920 },
      fps: 30,
      outputFormat: 'mp4'
    };

    const submitRes = await provider.submitRenderJob(request);
    expect(submitRes.status).toBe('queued');

    const statusRes = await provider.getRenderJobStatus('job_full_30s_test', approvedProject.id);
    expect(statusRes.status).toBeDefined();
    expect(statusRes.logs.length).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // Test C: Full 60-Second Extended Video (1080x1920 @ 30 FPS)
  // --------------------------------------------------------------------------
  it('Test C: Submits a full 60-second video at 1080x1920 @ 30 FPS', async () => {
    const project60s: Project = {
      ...approvedProject,
      duration: 60,
      scenes: approvedProject.scenes.map(s => ({ ...s, duration: 20 }))
    };

    const request: RenderJobRequest = {
      jobId: 'job_full_60s_test',
      project: project60s,
      duration: 60,
      aspectRatio: '9:16',
      resolution: { width: 1080, height: 1920 },
      fps: 30,
      outputFormat: 'mp4'
    };

    const submitRes = await provider.submitRenderJob(request);
    expect(submitRes.status).toBe('queued');

    const statusRes = await provider.getRenderJobStatus('job_full_60s_test', project60s.id);
    expect(statusRes.jobId).toBe('job_full_60s_test');
  });

  // --------------------------------------------------------------------------
  // Test D: Asset-Heavy Project (Logos, Images, Audio)
  // --------------------------------------------------------------------------
  it('Test D: Handles asset-heavy video project with assigned assets', () => {
    const assetProject: Project = {
      ...approvedProject,
      scenes: approvedProject.scenes.map((s, idx) => ({
        ...s,
        assignedAssetIds: {
          background: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1080',
          overlay: 'https://sukhgraphix.com/logo.png',
          audio: 'https://cdn.freesound.org/festive_sitar.mp3'
        }
      }))
    };

    const validation = RenderJobSecurityValidator.validateJobSubmission(assetProject, []);
    expect(validation.isValid).toBe(true);

    const sanitized = RenderJobSecurityValidator.sanitizePayloadForRunner(assetProject);
    expect(sanitized.scenes[0].assignedAssetIds.background).toBeDefined();
    expect(sanitized.brandKit.name).toBe('Sukh Graphix');
  });

  // --------------------------------------------------------------------------
  // Test E: Security & Authorization Failure Cases
  // --------------------------------------------------------------------------
  describe('Test E: Failure & Security Cases', () => {
    it('blocks render if storyboard is not approved', () => {
      const unapprovedProject: Project = {
        ...SAMPLE_DIWALI_PROJECT,
        status: 'planned' // not approved
      };

      const validation = RenderJobSecurityValidator.validateJobSubmission(unapprovedProject, []);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Mandatory Storyboard Approval'))).toBe(true);
    });

    it('blocks render if project exceeds maximum allowed duration (60s)', () => {
      const oversizedProject: Project = {
        ...approvedProject,
        duration: 90
      };

      const validation = RenderJobSecurityValidator.validateJobSubmission(
        oversizedProject,
        [],
        90,
        { ...DEFAULT_SETTINGS, maxRenderDurationSeconds: 60 }
      );
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Duration limit exceeded'))).toBe(true);
    });

    it('enforces concurrency guard: rejects two simultaneous render requests for same project', () => {
      const activeRunningJob: RenderJob = {
        id: 'job_active_1',
        projectId: approvedProject.id,
        target: 'github_actions',
        status: 'running',
        progress: 40,
        format: 'mp4',
        resolution: { width: 1080, height: 1920 },
        fps: 30,
        duration: 30,
        retries: 0,
        logs: [],
        createdAt: new Date().toISOString()
      };

      const validation = RenderJobSecurityValidator.validateJobSubmission(
        approvedProject,
        [activeRunningJob]
      );
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Concurrency Guard'))).toBe(true);
    });

    it('blocks SSRF attempt in scene background asset URL', () => {
      const maliciousProject: Project = {
        ...approvedProject,
        scenes: [
          {
            ...approvedProject.scenes[0],
            assignedAssetIds: {
              background: 'http://169.254.169.254/latest/meta-data/'
            }
          }
        ]
      };

      const validation = RenderJobSecurityValidator.validateJobSubmission(maliciousProject, []);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Security Alert'))).toBe(true);
    });

    it('cancels an active render job upon user request', async () => {
      const request: RenderJobRequest = {
        jobId: 'job_cancel_test',
        project: approvedProject,
        duration: 30,
        aspectRatio: '9:16',
        resolution: { width: 1080, height: 1920 },
        fps: 30,
        outputFormat: 'mp4'
      };

      await provider.submitRenderJob(request);
      const cancelOk = await provider.cancelRenderJob('job_cancel_test');
      expect(cancelOk).toBe(true);

      const status = await provider.getRenderJobStatus('job_cancel_test', approvedProject.id);
      expect(status.status).toBe('cancelled');
    });
  });
});
