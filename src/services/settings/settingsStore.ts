import { ProviderSettings } from '../../types/creatorStudio';

const SETTINGS_KEY = 'creator_studio_provider_settings_v1';

export const DEFAULT_SETTINGS: ProviderSettings = {
  openRouterApiKey: '',
  openRouterModel: 'google/gemini-2.0-flash-exp:free',
  openRouterFreeOnly: true,
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseEnabled: false,
  r2AccountId: '',
  r2AccessKeyId: '',
  r2SecretAccessKey: '',
  r2BucketName: '',
  r2PublicDomain: '',
  githubOwner: '',
  githubRepo: '',
  githubToken: '',
  githubWorkflow: 'render-video.yml',
  defaultRenderProvider: 'github_actions',
  cloudRunWorkerUrl: '',
  cloudRunAuthToken: '',
  mockMode: false,
  maxUploadSizeMB: 50,
  maxRenderDurationSeconds: 60
};

export function loadSettings(): ProviderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      // Check for environment variables if injected by Vite
      return {
        ...DEFAULT_SETTINGS,
        openRouterApiKey: (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '',
        openRouterModel: (import.meta as any).env?.VITE_OPENROUTER_MODEL || DEFAULT_SETTINGS.openRouterModel,
        supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
        supabaseAnonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
        supabaseEnabled: Boolean((import.meta as any).env?.VITE_SUPABASE_URL),
        r2AccountId: (import.meta as any).env?.VITE_R2_ACCOUNT_ID || '',
        r2BucketName: (import.meta as any).env?.VITE_R2_BUCKET_NAME || '',
        githubOwner: (import.meta as any).env?.VITE_GITHUB_OWNER || '',
        githubRepo: (import.meta as any).env?.VITE_GITHUB_REPO || '',
        githubToken: (import.meta as any).env?.VITE_GITHUB_TOKEN || '',
        githubWorkflow: (import.meta as any).env?.VITE_GITHUB_WORKFLOW || 'render-video.yml',
        cloudRunWorkerUrl: (import.meta as any).env?.VITE_CLOUD_RUN_WORKER_URL || ''
      };
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: ProviderSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

export interface ValidationStatus {
  service: 'OpenRouter AI' | 'Supabase Database' | 'Cloudflare R2' | 'GitHub Actions Rendering' | 'Cloud Run Worker';
  status: 'connected' | 'mocked' | 'unconfigured' | 'error';
  message: string;
  isFree: boolean;
}

export function validateProviderStatuses(settings: ProviderSettings): ValidationStatus[] {
  const results: ValidationStatus[] = [];

  // OpenRouter
  if (settings.openRouterApiKey && settings.openRouterApiKey.trim().length > 0) {
    results.push({
      service: 'OpenRouter AI',
      status: 'connected',
      message: `Active model: ${settings.openRouterModel} (${settings.openRouterFreeOnly ? 'Free tier enforced' : 'Paid allowed'})`,
      isFree: settings.openRouterFreeOnly
    });
  } else {
    results.push({
      service: 'OpenRouter AI',
      status: 'mocked',
      message: 'Running in offline template mode. 100% free deterministic AI script & storyboard planner.',
      isFree: true
    });
  }

  // GitHub Actions Rendering
  if (settings.githubOwner && settings.githubRepo && settings.githubToken) {
    results.push({
      service: 'GitHub Actions Rendering',
      status: 'connected',
      message: `Connected to ${settings.githubOwner}/${settings.githubRepo} (${settings.githubWorkflow}). 2,000 free mins/month.`,
      isFree: true
    });
  } else {
    results.push({
      service: 'GitHub Actions Rendering',
      status: 'mocked',
      message: 'Local cloud queue active. Simulates background Ubuntu runner and verified durable MP4 output until GitHub PAT is set.',
      isFree: true
    });
  }

  // Supabase
  if (settings.supabaseEnabled && settings.supabaseUrl && settings.supabaseAnonKey) {
    results.push({
      service: 'Supabase Database',
      status: 'connected',
      message: `Connected to Supabase PostgreSQL at ${settings.supabaseUrl.slice(0, 24)}...`,
      isFree: true
    });
  } else {
    results.push({
      service: 'Supabase Database',
      status: 'mocked',
      message: 'Local offline database active (IndexedDB & LocalStorage). Full persistence without external account.',
      isFree: true
    });
  }

  // Cloudflare R2
  if (settings.r2AccountId && settings.r2AccessKeyId && settings.r2SecretAccessKey && settings.r2BucketName) {
    results.push({
      service: 'Cloudflare R2',
      status: 'connected',
      message: `R2 Bucket: ${settings.r2BucketName}`,
      isFree: true
    });
  } else {
    results.push({
      service: 'Cloudflare R2',
      status: 'mocked',
      message: 'Local browser media storage active. In-memory and IndexedDB blob persistence.',
      isFree: true
    });
  }

  // Cloud Run Worker
  if (settings.cloudRunWorkerUrl && settings.cloudRunWorkerUrl.trim().length > 0) {
    results.push({
      service: 'Cloud Run Worker',
      status: 'connected',
      message: `Cloud rendering worker configured: ${settings.cloudRunWorkerUrl.slice(0, 30)}...`,
      isFree: false
    });
  } else {
    results.push({
      service: 'Cloud Run Worker',
      status: 'mocked',
      message: 'Future alternative worker placeholder (disabled by default to prevent unexpected billing).',
      isFree: true
    });
  }

  return results;
}
