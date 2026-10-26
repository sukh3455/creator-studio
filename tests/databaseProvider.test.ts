import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabaseProvider, SAMPLE_DIWALI_PROJECT } from '../src/services/db/databaseProvider';
import { Asset, RenderJob } from '../src/types/creatorStudio';

// Mock localStorage for Node environment if not present
if (typeof localStorage === 'undefined') {
  const store = new Map<string, string>();
  (global as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear()
  };
}

describe('Database Persistence & Mock Provider', () => {
  let db: MockDatabaseProvider;

  beforeEach(() => {
    localStorage.clear();
    db = new MockDatabaseProvider();
  });

  it('initializes with the default Diwali Sukh Graphix project', async () => {
    const projects = await db.getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(1);
    expect(projects[0].title).toContain('Diwali Reel — Sukh Graphix');
  });

  it('saves and updates a project', async () => {
    const project = {
      ...SAMPLE_DIWALI_PROJECT,
      id: 'proj_test_custom_1',
      title: 'Custom Test Project'
    };

    const saved = await db.saveProject(project);
    expect(saved.title).toBe('Custom Test Project');

    const fetched = await db.getProject('proj_test_custom_1');
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Custom Test Project');

    // Update status to approved
    const updated = await db.saveProject({ ...project, status: 'approved' });
    expect(updated.status).toBe('approved');
  });

  it('persists and deletes assets with metadata', async () => {
    const asset: Asset = {
      id: 'asset_test_1',
      projectId: 'proj_test_custom_1',
      name: 'sukh_logo.png',
      type: 'logo',
      url: 'blob:https://example.com/mock-logo',
      mimeType: 'image/png',
      size: 45000,
      source: 'user_upload',
      license: { type: 'User Owned' },
      createdAt: new Date().toISOString()
    };

    await db.saveAsset(asset);
    const assets = await db.getAssets('proj_test_custom_1');
    expect(assets.length).toBe(1);
    expect(assets[0].name).toBe('sukh_logo.png');

    await db.deleteAsset('asset_test_1');
    const remaining = await db.getAssets('proj_test_custom_1');
    expect(remaining.length).toBe(0);
  });

  it('tracks render jobs from pending to completed', async () => {
    const job: RenderJob = {
      id: 'job_test_1',
      projectId: 'proj_test_custom_1',
      target: 'browser',
      status: 'pending',
      progress: 0,
      format: 'webm',
      resolution: { width: 720, height: 1280 },
      fps: 30,
      duration: 15,
      retries: 0,
      logs: ['Job created'],
      createdAt: new Date().toISOString()
    };

    await db.saveRenderJob(job);
    const initialJobs = await db.getRenderJobs('proj_test_custom_1');
    expect(initialJobs[0].status).toBe('pending');

    // Update progress
    await db.updateRenderJob('job_test_1', {
      status: 'rendering',
      progress: 50
    });

    const midJobs = await db.getRenderJobs('proj_test_custom_1');
    expect(midJobs[0].progress).toBe(50);
    expect(midJobs[0].status).toBe('rendering');

    // Finalize
    await db.updateRenderJob('job_test_1', {
      status: 'completed',
      progress: 100,
      outputUrl: 'blob:video-url'
    });

    const finalJobs = await db.getRenderJobs('proj_test_custom_1');
    expect(finalJobs[0].status).toBe('completed');
    expect(finalJobs[0].outputUrl).toBe('blob:video-url');
  });
});
