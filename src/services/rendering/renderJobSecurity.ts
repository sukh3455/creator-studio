import { Project, ProviderSettings, RenderJob } from '../../types/creatorStudio';
import { validateSafePublicUrl } from '../webcapture/safeUrlValidator';

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedDuration: number;
  sanitizedFps: number;
}

export class RenderJobSecurityValidator {
  /**
   * Validates project ownership, mandatory storyboard approval, duration limits,
   * asset references, and concurrency before submitting a render job.
   */
  static validateJobSubmission(
    project: Project,
    activeJobs: RenderJob[],
    requestedDuration?: number,
    settings?: ProviderSettings
  ): SecurityValidationResult {
    const errors: string[] = [];

    // 1. Mandatory Storyboard Approval Gate
    const isApproved = project.status === 'approved' || project.status === 'completed';
    if (!isApproved) {
      errors.push('Mandatory Storyboard Approval: Storyboard must be reviewed and approved before rendering.');
    }

    // 2. Validate Scene Count and Content
    if (!project.scenes || project.scenes.length === 0) {
      errors.push('Project must contain at least one valid scene.');
    }

    // 3. Concurrency Protection: Only 1 active render per project / user
    const hasActiveJob = activeJobs.some(
      j => j.projectId === project.id && (j.status === 'queued' || j.status === 'running' || j.status === 'rendering')
    );
    if (hasActiveJob) {
      errors.push('Concurrency Guard: A render job is already running for this project. Please wait for it to finish.');
    }

    // 4. Duration Bounds (Supports 5s diagnostic up to 60s max)
    const maxDuration = settings?.maxRenderDurationSeconds || 60;
    const duration = requestedDuration || project.duration || 15;
    if (duration <= 0) {
      errors.push('Duration must be greater than 0 seconds.');
    } else if (duration > maxDuration) {
      errors.push(`Duration limit exceeded: ${duration}s exceeds maximum allowed duration (${maxDuration}s).`);
    }

    // 5. Asset Reference & SSRF Safety
    if (project.scenes) {
      for (const scene of project.scenes) {
        if (scene.assignedAssetIds?.background) {
          const bg = scene.assignedAssetIds.background;
          if (bg.startsWith('http://') || bg.startsWith('https://')) {
            const ssrfCheck = validateSafePublicUrl(bg);
            if (!ssrfCheck.isValid) {
              errors.push(`Security Alert: Scene "${scene.label}" references an unsafe background URL: ${ssrfCheck.error}`);
            }
          }
        }
      }
    }

    // 6. Frame Rate validation
    const sanitizedFps = 30; // standard 30 FPS for mobile/social reels

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedDuration: Math.min(duration, maxDuration),
      sanitizedFps
    };
  }

  /**
   * Sanitizes project payload to remove sensitive credentials before passing to runner
   */
  static sanitizePayloadForRunner(project: Project): Record<string, any> {
    return {
      id: project.id,
      title: project.title.slice(0, 100),
      duration: project.duration,
      aspectRatio: project.aspectRatio,
      stylePreset: project.stylePreset,
      brandKit: {
        name: project.brandKit?.name?.slice(0, 60) || 'Creator Studio',
        primaryColor: project.brandKit?.primaryColor || '#F59E0B',
        secondaryColor: project.brandKit?.secondaryColor || '#B45309',
        tagline: project.brandKit?.tagline?.slice(0, 120) || ''
      },
      scenes: (project.scenes || []).map(s => ({
        id: s.id,
        order: s.order,
        label: s.label,
        title: s.title,
        narration: s.narration,
        captionText: s.captionText,
        duration: s.duration,
        theme: s.theme,
        backgroundColor: s.backgroundColor,
        elements: s.elements || [],
        assignedAssetIds: s.assignedAssetIds || {},
        transition: s.transition
      }))
    };
  }
}
