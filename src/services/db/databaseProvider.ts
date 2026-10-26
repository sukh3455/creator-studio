import { Project, Asset, RenderJob, ProviderSettings } from '../../types/creatorStudio';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface IDatabaseProvider {
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  getAssets(projectId?: string): Promise<Asset[]>;
  saveAsset(asset: Asset): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;
  
  getRenderJobs(projectId?: string): Promise<RenderJob[]>;
  saveRenderJob(job: RenderJob): Promise<RenderJob>;
  updateRenderJob(id: string, updates: Partial<RenderJob>): Promise<RenderJob>;
}

const LOCAL_STORAGE_PROJECTS_KEY = 'creator_studio_projects_v1';
const LOCAL_STORAGE_ASSETS_KEY = 'creator_studio_assets_v1';
const LOCAL_STORAGE_JOBS_KEY = 'creator_studio_jobs_v1';

// Initial sample project showcasing Diwali Reel for Sukh Graphix
export const SAMPLE_DIWALI_PROJECT: Project = {
  id: 'proj_diwali_sukh_graphix',
  title: 'Diwali Reel — Sukh Graphix',
  prompt: 'Create a premium 15-second Diwali Reel for Sukh Graphix with elegant typography, custom animated diyas, glowing particles, festive music and a polished brand reveal.',
  description: '15-second celebratory motion-graphics reel with glowing diyas, particle embers, festive Sanskrit typography, and luxury gold brand reveal.',
  duration: 15,
  aspectRatio: '9:16',
  stylePreset: 'festive',
  brandKit: {
    name: 'Sukh Graphix',
    primaryColor: '#F59E0B',
    secondaryColor: '#B45309',
    accentColor: '#FEF08A',
    tagline: 'Illuminating Creative Excellence',
    fontFamily: 'serif'
  },
  status: 'planned',
  scenes: [
    {
      id: 'sc_1',
      order: 1,
      title: 'Festive Greeting & Shubh Deepavali',
      label: 'SCENE 1: FESTIVE DAWN',
      narration: 'This Diwali, let light triumph over darkness and every creation shine with boundless radiance.',
      captionText: '✨ Shubh Deepavali ✨\nCelebrate The Festival of Lights',
      duration: 5,
      visualType: 'motion_graphic',
      theme: 'diwali_festive',
      backgroundColor: '#1E1100',
      elements: [
        {
          id: 'elem_diya_1',
          type: 'diya',
          props: { size: 140, glowIntensity: 1.2, flameColor: '#FF7700', oilGlow: '#FFD700' }
        },
        {
          id: 'elem_particles_1',
          type: 'particles',
          props: { count: 65, color: '#FBBF24', speed: 1.2, style: 'ember_sparks' }
        },
        {
          id: 'elem_typo_1',
          type: 'typography',
          props: { text: 'शुभ दीपावली', subtitle: 'Festival of Lights', style: 'festive_gold' }
        }
      ],
      assetRequirements: ['Festive Sanskrit audio intro', 'Ambient sparkle sound'],
      assignedAssetIds: {},
      transition: 'fade',
      approved: false
    },
    {
      id: 'sc_2',
      order: 2,
      title: 'Creative Mastery & Design Spark',
      label: 'SCENE 2: CREATIVE ESSENCE',
      narration: 'From imaginative vision to breathtaking visuals, we craft designs that illuminate your brand story.',
      captionText: 'Crafting Visual Magic\nThat Elevates Your Brand',
      duration: 5,
      visualType: 'motion_graphic',
      theme: 'luxury_gold',
      backgroundColor: '#170E05',
      elements: [
        {
          id: 'elem_diya_duo',
          type: 'diya',
          props: { size: 100, glowIntensity: 1.0, dual: true }
        },
        {
          id: 'elem_geometric_gold',
          type: 'geometric',
          props: { shape: 'mandala', rotationSpeed: 0.008, color: '#F59E0B' }
        },
        {
          id: 'elem_typo_2',
          type: 'typography',
          props: { text: 'CREATIVE MASTERY', subtitle: 'Where Design Meets Passion', style: 'kinetic_pop' }
        }
      ],
      assetRequirements: ['Sukh Graphix Portfolio Preview', 'Mandala vector'],
      assignedAssetIds: {},
      transition: 'particle_dissolve',
      approved: false
    },
    {
      id: 'sc_3',
      order: 3,
      title: 'Grand Brand Reveal — Sukh Graphix',
      label: 'SCENE 3: BRAND REVEAL',
      narration: 'Sukh Graphix wishes you prosperity, success, and endless joy this Diwali.',
      captionText: 'SUKH GRAPHIX\nIlluminating Creative Excellence',
      duration: 5,
      visualType: 'motion_graphic',
      theme: 'luxury_gold',
      backgroundColor: '#0D0800',
      elements: [
        {
          id: 'elem_brand_reveal',
          type: 'brand_reveal',
          props: {
            brandName: 'SUKH GRAPHIX',
            tagline: 'Illuminating Creative Excellence',
            glowColor: '#F59E0B',
            lensSweep: true,
            particleExplosion: true
          }
        },
        {
          id: 'elem_diya_center',
          type: 'diya',
          props: { size: 120, glowIntensity: 1.5, flameColor: '#FF9900' }
        }
      ],
      assetRequirements: ['Sukh Graphix Official Logo', 'Festive Music Outro'],
      assignedAssetIds: {},
      transition: 'zoom_in',
      approved: false
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export class MockDatabaseProvider implements IDatabaseProvider {
  private projects: Map<string, Project> = new Map();
  private assets: Map<string, Asset> = new Map();
  private renderJobs: Map<string, RenderJob> = new Map();

  constructor() {
    this.initFromLocalStorage();
  }

  private initFromLocalStorage(): void {
    try {
      const rawProjects = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (rawProjects) {
        const arr: Project[] = JSON.parse(rawProjects);
        arr.forEach(p => this.projects.set(p.id, p));
      } else {
        // Seed default sample
        this.projects.set(SAMPLE_DIWALI_PROJECT.id, SAMPLE_DIWALI_PROJECT);
        this.syncProjectsToStorage();
      }

      const rawAssets = localStorage.getItem(LOCAL_STORAGE_ASSETS_KEY);
      if (rawAssets) {
        const arr: Asset[] = JSON.parse(rawAssets);
        arr.forEach(a => this.assets.set(a.id, a));
      }

      const rawJobs = localStorage.getItem(LOCAL_STORAGE_JOBS_KEY);
      if (rawJobs) {
        const arr: RenderJob[] = JSON.parse(rawJobs);
        arr.forEach(j => this.renderJobs.set(j.id, j));
      }
    } catch (err) {
      console.warn('MockDatabaseProvider: LocalStorage initialization fallback', err);
    }
  }

  private syncProjectsToStorage(): void {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_PROJECTS_KEY,
        JSON.stringify(Array.from(this.projects.values()))
      );
    } catch (err) {
      console.error('Failed to sync projects to localStorage', err);
    }
  }

  private syncAssetsToStorage(): void {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_ASSETS_KEY,
        JSON.stringify(Array.from(this.assets.values()))
      );
    } catch (err) {
      console.error('Failed to sync assets to localStorage', err);
    }
  }

  private syncJobsToStorage(): void {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_JOBS_KEY,
        JSON.stringify(Array.from(this.renderJobs.values()))
      );
    } catch (err) {
      console.error('Failed to sync render jobs to localStorage', err);
    }
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getProject(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async saveProject(project: Project): Promise<Project> {
    const updated: Project = {
      ...project,
      updatedAt: new Date().toISOString()
    };
    this.projects.set(updated.id, updated);
    this.syncProjectsToStorage();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
    this.syncProjectsToStorage();
  }

  async getAssets(projectId?: string): Promise<Asset[]> {
    const all = Array.from(this.assets.values());
    if (projectId) {
      return all.filter(a => a.projectId === projectId || a.projectId === 'global');
    }
    return all;
  }

  async saveAsset(asset: Asset): Promise<Asset> {
    this.assets.set(asset.id, asset);
    this.syncAssetsToStorage();
    return asset;
  }

  async deleteAsset(id: string): Promise<void> {
    this.assets.delete(id);
    this.syncAssetsToStorage();
  }

  async getRenderJobs(projectId?: string): Promise<RenderJob[]> {
    const all = Array.from(this.renderJobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (projectId) {
      return all.filter(j => j.projectId === projectId);
    }
    return all;
  }

  async saveRenderJob(job: RenderJob): Promise<RenderJob> {
    this.renderJobs.set(job.id, job);
    this.syncJobsToStorage();
    return job;
  }

  async updateRenderJob(id: string, updates: Partial<RenderJob>): Promise<RenderJob> {
    const current = this.renderJobs.get(id);
    if (!current) {
      throw new Error(`Render job ${id} not found`);
    }
    const updated: RenderJob = { ...current, ...updates };
    this.renderJobs.set(id, updated);
    this.syncJobsToStorage();
    return updated;
  }
}

export class SupabaseDatabaseProvider implements IDatabaseProvider {
  private client: SupabaseClient;
  private mockFallback: MockDatabaseProvider;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.client = createClient(supabaseUrl, supabaseAnonKey);
    this.mockFallback = new MockDatabaseProvider();
  }

  async getProjects(): Promise<Project[]> {
    try {
      const { data, error } = await this.client
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error || !data) {
        console.warn('Supabase getProjects error, falling back to mock:', error);
        return this.mockFallback.getProjects();
      }

      return data.map(row => ({
        id: row.id,
        title: row.title,
        prompt: row.prompt,
        description: row.description,
        duration: row.duration,
        aspectRatio: row.aspect_ratio,
        stylePreset: row.style_preset,
        brandKit: row.brand_kit,
        scenes: row.scenes,
        status: row.status,
        approvedAt: row.approved_at,
        approvedBy: row.approved_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch {
      return this.mockFallback.getProjects();
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const { data, error } = await this.client
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return this.mockFallback.getProject(id);
      }

      return {
        id: data.id,
        title: data.title,
        prompt: data.prompt,
        description: data.description,
        duration: data.duration,
        aspectRatio: data.aspect_ratio,
        stylePreset: data.style_preset,
        brandKit: data.brand_kit,
        scenes: data.scenes,
        status: data.status,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch {
      return this.mockFallback.getProject(id);
    }
  }

  async saveProject(project: Project): Promise<Project> {
    try {
      const row = {
        id: project.id,
        title: project.title,
        prompt: project.prompt,
        description: project.description,
        duration: project.duration,
        aspect_ratio: project.aspectRatio,
        style_preset: project.stylePreset,
        brand_kit: project.brandKit,
        scenes: project.scenes,
        status: project.status,
        approved_at: project.approvedAt,
        approved_by: project.approvedBy,
        updated_at: new Date().toISOString()
      };

      const { error } = await this.client.from('projects').upsert(row);
      if (error) {
        console.warn('Supabase saveProject error, using mock fallback:', error);
        return this.mockFallback.saveProject(project);
      }
      return project;
    } catch {
      return this.mockFallback.saveProject(project);
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.client.from('projects').delete().eq('id', id);
    } catch {
      await this.mockFallback.deleteProject(id);
    }
  }

  async getAssets(projectId?: string): Promise<Asset[]> {
    try {
      let query = this.client.from('assets').select('*');
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query;
      if (error || !data) {
        return this.mockFallback.getAssets(projectId);
      }
      return data.map(row => ({
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        type: row.type,
        url: row.url,
        mimeType: row.mime_type,
        size: row.size,
        dimensions: row.dimensions,
        duration: row.duration,
        trim: row.trim,
        crop: row.crop,
        source: row.source,
        license: row.license,
        createdAt: row.created_at
      }));
    } catch {
      return this.mockFallback.getAssets(projectId);
    }
  }

  async saveAsset(asset: Asset): Promise<Asset> {
    try {
      const row = {
        id: asset.id,
        project_id: asset.projectId,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        mime_type: asset.mimeType,
        size: asset.size,
        dimensions: asset.dimensions,
        duration: asset.duration,
        trim: asset.trim,
        crop: asset.crop,
        source: asset.source,
        license: asset.license
      };
      const { error } = await this.client.from('assets').upsert(row);
      if (error) {
        return this.mockFallback.saveAsset(asset);
      }
      return asset;
    } catch {
      return this.mockFallback.saveAsset(asset);
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      await this.client.from('assets').delete().eq('id', id);
    } catch {
      await this.mockFallback.deleteAsset(id);
    }
  }

  async getRenderJobs(projectId?: string): Promise<RenderJob[]> {
    try {
      let query = this.client.from('render_jobs').select('*').order('created_at', { ascending: false });
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query;
      if (error || !data) {
        return this.mockFallback.getRenderJobs(projectId);
      }
      return data.map(row => ({
        id: row.id,
        projectId: row.project_id,
        target: row.target,
        status: row.status,
        progress: row.progress,
        outputUrl: row.output_url,
        format: row.format,
        resolution: row.resolution,
        fps: row.fps,
        duration: row.duration,
        retries: row.retries,
        logs: row.logs || [],
        error: row.error,
        createdAt: row.created_at,
        completedAt: row.completed_at
      }));
    } catch {
      return this.mockFallback.getRenderJobs(projectId);
    }
  }

  async saveRenderJob(job: RenderJob): Promise<RenderJob> {
    try {
      const row = {
        id: job.id,
        project_id: job.projectId,
        target: job.target,
        status: job.status,
        progress: job.progress,
        output_url: job.outputUrl,
        format: job.format,
        resolution: job.resolution,
        fps: job.fps,
        duration: job.duration,
        retries: job.retries,
        logs: job.logs,
        error: job.error,
        created_at: job.createdAt,
        completed_at: job.completedAt
      };
      const { error } = await this.client.from('render_jobs').upsert(row);
      if (error) {
        return this.mockFallback.saveRenderJob(job);
      }
      return job;
    } catch {
      return this.mockFallback.saveRenderJob(job);
    }
  }

  async updateRenderJob(id: string, updates: Partial<RenderJob>): Promise<RenderJob> {
    try {
      const rowUpdates: Record<string, any> = {};
      if (updates.status !== undefined) rowUpdates.status = updates.status;
      if (updates.progress !== undefined) rowUpdates.progress = updates.progress;
      if (updates.outputUrl !== undefined) rowUpdates.output_url = updates.outputUrl;
      if (updates.logs !== undefined) rowUpdates.logs = updates.logs;
      if (updates.error !== undefined) rowUpdates.error = updates.error;
      if (updates.completedAt !== undefined) rowUpdates.completed_at = updates.completedAt;

      const { error } = await this.client.from('render_jobs').update(rowUpdates).eq('id', id);
      if (error) {
        return this.mockFallback.updateRenderJob(id, updates);
      }
      const refreshed = await this.getRenderJobs();
      const match = refreshed.find(j => j.id === id);
      if (!match) throw new Error('Render job not found');
      return match;
    } catch {
      return this.mockFallback.updateRenderJob(id, updates);
    }
  }
}

// Database Provider Factory
let activeProviderInstance: IDatabaseProvider | null = null;

export function getDatabaseProvider(settings: ProviderSettings): IDatabaseProvider {
  if (settings.supabaseEnabled && settings.supabaseUrl && settings.supabaseAnonKey) {
    if (!(activeProviderInstance instanceof SupabaseDatabaseProvider)) {
      activeProviderInstance = new SupabaseDatabaseProvider(
        settings.supabaseUrl,
        settings.supabaseAnonKey
      );
    }
    return activeProviderInstance;
  }

  if (!(activeProviderInstance instanceof MockDatabaseProvider)) {
    activeProviderInstance = new MockDatabaseProvider();
  }
  return activeProviderInstance;
}
