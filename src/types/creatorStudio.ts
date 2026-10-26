export type AspectRatio = '9:16' | '16:9' | '1:1';

export interface ResolutionConfig {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  label: string;
}

export const RESOLUTIONS: Record<AspectRatio, ResolutionConfig> = {
  '9:16': {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    label: '9:16 Vertical (1080 × 1920 Full HD Reel)'
  },
  '16:9': {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    label: '16:9 Landscape (1920 × 1080 Full HD)'
  },
  '1:1': {
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    label: '1:1 Square (1080 × 1080)'
  }
};

export type StylePreset = 
  | 'festive' 
  | 'corporate' 
  | 'cyberpunk' 
  | 'minimal' 
  | 'luxury_gold' 
  | 'neon_glow';

export interface BrandKit {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tagline?: string;
  fontFamily: string;
}

export type VisualElementType = 
  | 'typography' 
  | 'diya' 
  | 'particles' 
  | 'device_mockup' 
  | 'brand_reveal' 
  | 'geometric' 
  | 'custom_code' 
  | 'asset_overlay';

export interface VisualElement {
  id: string;
  type: VisualElementType;
  props: Record<string, any>;
  animation?: {
    enter?: string;
    exit?: string;
    duration?: number;
    delay?: number;
  };
}

export type SceneTransition = 
  | 'fade' 
  | 'slide_left' 
  | 'slide_right' 
  | 'zoom_in' 
  | 'particle_dissolve' 
  | 'wipe';

export interface Scene {
  id: string;
  order: number;
  title: string;
  label: string;
  narration: string;
  captionText: string;
  duration: number; // in seconds
  visualType: 'motion_graphic' | 'asset' | 'web_capture' | 'hybrid';
  theme: string;
  backgroundColor: string;
  visualCode?: string; // High-performance 60fps canvas code
  elements: VisualElement[];
  assetRequirements: string[];
  assignedAssetIds: {
    background?: string;
    overlay?: string;
    audio?: string;
  };
  transition: SceneTransition;
  approved: boolean;
}

export type AssetType = 'image' | 'video' | 'audio' | 'logo' | 'screenshot' | 'recording';
export type AssetSource = 'user_upload' | 'web_capture' | 'stock' | 'generated';

export interface AssetLicense {
  type: 'Free Commercial' | 'CC0 / Public Domain' | 'User Owned' | 'Licensed';
  attribution?: string;
  sourceUrl?: string;
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: AssetType;
  url: string;
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number; // for audio/video in seconds
  trim?: { start: number; end: number };
  crop?: { x: number; y: number; width: number; height: number; fit: 'cover' | 'contain' };
  source: AssetSource;
  license: AssetLicense;
  createdAt: string;
}

export type ProjectStatus = 
  | 'draft' 
  | 'planning' 
  | 'planned' 
  | 'approved' 
  | 'rendering' 
  | 'completed' 
  | 'failed';

export interface Project {
  id: string;
  title: string;
  prompt: string;
  description: string;
  duration: number; // target duration in seconds
  aspectRatio: AspectRatio;
  stylePreset: StylePreset;
  brandKit: BrandKit;
  scenes: Scene[];
  status: ProjectStatus;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type RenderTarget = 'github_actions' | 'browser' | 'cloud_run';

export interface RenderJob {
  id: string;
  projectId: string;
  target: RenderTarget;
  status: 'pending' | 'queued' | 'running' | 'rendering' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0 to 100
  outputUrl?: string;
  format: 'mp4' | 'webm';
  resolution: { width: number; height: number };
  fps: number;
  duration: number;
  retries: number;
  logs: string[];
  error?: string;
  workflowRunId?: number;
  workflowUrl?: string;
  runnerInfo?: string;
  renderDurationMs?: number;
  fileSizeBytes?: number;
  createdAt: string;
  completedAt?: string;
}

export interface WebCaptureConfig {
  url: string;
  viewport: 'mobile' | 'desktop';
  fullPage?: boolean;
  delayMs?: number;
}

export interface ProviderSettings {
  openRouterApiKey: string;
  openRouterModel: string;
  openRouterFreeOnly: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseEnabled: boolean;
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicDomain: string;
  githubOwner: string;
  githubRepo: string;
  githubToken: string;
  githubWorkflow: string;
  defaultRenderProvider: RenderTarget;
  cloudRunWorkerUrl: string;
  cloudRunAuthToken: string;
  mockMode: boolean;
  maxUploadSizeMB: number;
  maxRenderDurationSeconds: number;
}
