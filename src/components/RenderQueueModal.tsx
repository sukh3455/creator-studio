import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Film, 
  Sparkles, 
  Download, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldCheck,
  Share2
} from 'lucide-react';

const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { Project, RenderJob, ProviderSettings, RESOLUTIONS, RenderTarget } from '../types/creatorStudio';
import { MotionGraphicsEngine } from '../engine/motionGraphics';
import { getRenderProvider, RenderJobRequest } from '../services/rendering/renderProvider';
import { RenderJobSecurityValidator } from '../services/rendering/renderJobSecurity';

interface RenderQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  renderJobs: RenderJob[];
  settings: ProviderSettings;
  onSaveRenderJob: (job: RenderJob) => Promise<RenderJob>;
  onUpdateRenderJob: (id: string, updates: Partial<RenderJob>) => Promise<RenderJob>;
  onGoToStoryboard: () => void;
}

export const RenderQueueModal: React.FC<RenderQueueModalProps> = ({
  isOpen,
  onClose,
  project,
  renderJobs,
  settings,
  onSaveRenderJob,
  onUpdateRenderJob,
  onGoToStoryboard
}) => {
  // Default to fast, reliable, 100% on-device browser rendering
  const [target, setTarget] = useState<RenderTarget>('browser');
  const [selectedDuration, setSelectedDuration] = useState<number>(project.duration || 15);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [completedDownloadUrl, setCompletedDownloadUrl] = useState<string | null>(null);
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null);
  const [activeOutputFormat, setActiveOutputFormat] = useState<'webm' | 'mp4'>('webm');
  const [workflowRunUrl, setWorkflowRunUrl] = useState<string | null>(null);
  const [activeJobRecord, setActiveJobRecord] = useState<RenderJob | null>(null);
  const [securityErrors, setSecurityErrors] = useState<string[]>([]);

  const renderCanvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const isApproved = project.status === 'approved' || project.status === 'completed';
  const resolution = RESOLUTIONS[project.aspectRatio] || RESOLUTIONS['9:16'];

  // Start Render Handler
  const handleStartRender = async () => {
    setSecurityErrors([]);

    // 1. Run Security & Ownership Validations
    const validation = RenderJobSecurityValidator.validateJobSubmission(
      project,
      renderJobs,
      selectedDuration,
      settings
    );

    if (!validation.isValid) {
      setSecurityErrors(validation.errors);
      return;
    }

    const jobId = `job_${target}_${Date.now()}`;
    const newJob: RenderJob = {
      id: jobId,
      projectId: project.id,
      target,
      status: 'queued',
      progress: 5,
      format: target === 'browser' ? 'webm' : 'mp4',
      resolution: { width: resolution.width, height: resolution.height },
      fps: 30,
      duration: selectedDuration,
      retries: 0,
      logs: [`[${new Date().toLocaleTimeString()}] Submitting render request for ${selectedDuration}s at ${resolution.width}x${resolution.height}`],
      createdAt: new Date().toISOString()
    };

    setIsRendering(true);
    setCurrentProgress(5);
    setCompletedDownloadUrl(null);
    setRenderedBlob(null);
    setWorkflowRunUrl(null);
    setRenderLogs(newJob.logs);
    setActiveJobRecord(newJob);
    await onSaveRenderJob(newJob);

    // 2. Browser Local Canvas Render Branch
    if (target === 'browser') {
      await executeBrowserRender(jobId, newJob);
      return;
    }

    // 3. GitHub Actions (or Cloud Run) Provider Branch
    const provider = getRenderProvider(target, settings);
    const request: RenderJobRequest = {
      jobId,
      project: { ...project, duration: selectedDuration },
      duration: selectedDuration,
      aspectRatio: project.aspectRatio,
      resolution: { width: resolution.width, height: resolution.height },
      fps: 30,
      outputFormat: 'mp4'
    };

    try {
      const dispatchResponse = await provider.submitRenderJob(request);
      setRenderLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${dispatchResponse.message}`]);
      if (dispatchResponse.workflowUrl) {
        setWorkflowRunUrl(dispatchResponse.workflowUrl);
      }

      // Poll status every 800ms
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await provider.getRenderJobStatus(jobId, project.id);
          setCurrentProgress(statusRes.progress);

          if (statusRes.workflowUrl) {
            setWorkflowRunUrl(statusRes.workflowUrl);
          }

          if (statusRes.logs && statusRes.logs.length > 0) {
            setRenderLogs(statusRes.logs);
          }

          if (statusRes.status === 'completed') {
            clearInterval(pollInterval);
            setIsRendering(false);
            // Only set completedDownloadUrl if real cloud URL exists; NEVER use fake .local domain
            setCompletedDownloadUrl(statusRes.outputUrl || null);
            setActiveOutputFormat('mp4');
            await onUpdateRenderJob(jobId, {
              status: 'completed',
              progress: 100,
              outputUrl: statusRes.outputUrl,
              logs: statusRes.logs,
              workflowRunId: statusRes.workflowRunId,
              workflowUrl: statusRes.workflowUrl,
              runnerInfo: statusRes.runnerInfo,
              completedAt: new Date().toISOString()
            });
          } else if (statusRes.status === 'failed' || statusRes.status === 'cancelled') {
            clearInterval(pollInterval);
            setIsRendering(false);
            await onUpdateRenderJob(jobId, {
              status: statusRes.status,
              error: statusRes.error || 'Render failed on runner',
              logs: statusRes.logs
            });
          } else {
            await onUpdateRenderJob(jobId, {
              status: statusRes.status,
              progress: statusRes.progress,
              logs: statusRes.logs,
              workflowUrl: statusRes.workflowUrl
            });
          }
        } catch (pollErr: any) {
          console.warn('Poll warning:', pollErr);
        }
      }, 800);
    } catch (err: any) {
      setIsRendering(false);
      setRenderLogs(prev => [...prev, `[ERROR] Dispatch failed: ${err.message}`]);
      await onUpdateRenderJob(jobId, {
        status: 'failed',
        error: err.message
      });
    }
  };

  // Browser MediaRecorder Execution on DOM-attached Canvas
  const executeBrowserRender = async (jobId: string, job: RenderJob) => {
    try {
      const canvas = renderCanvasRef.current;
      if (!canvas) throw new Error('Render monitor canvas not initialized');
      canvas.width = resolution.width;
      canvas.height = resolution.height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Could not get 2D canvas context');

      let mimeType = 'video/webm;codecs=vp9';
      let format: 'webm' | 'mp4' = 'webm';

      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
          format = 'mp4';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
          format = 'mp4';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9';
          format = 'webm';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          mimeType = 'video/webm;codecs=vp8';
          format = 'webm';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
          format = 'webm';
        }
      }

      setActiveOutputFormat(format);

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { 
        mimeType, 
        videoBitsPerSecond: 6000000 
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const engine = new MotionGraphicsEngine();
      const duration = selectedDuration;
      const scenes = project.scenes || [];

      recorder.start(100);
      setRenderLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Local MediaRecorder initialized (${mimeType})`]);

      const fps = 30;
      const totalFrames = duration * fps;
      let frame = 0;

      const renderInterval = setInterval(async () => {
        if (frame >= totalFrames) {
          clearInterval(renderInterval);
          recorder.stop();
          return;
        }

        const currentTime = frame / fps;
        let cumulative = 0;
        let currentScene = scenes[0];
        let sceneTime = 0;

        for (const s of scenes) {
          if (currentTime >= cumulative && currentTime < cumulative + s.duration) {
            currentScene = s;
            sceneTime = currentTime - cumulative;
            break;
          }
          cumulative += s.duration;
        }

        const sceneProgress = Math.min(1, sceneTime / (currentScene?.duration || 5));

        engine.drawScene({
          ctx,
          width: resolution.width,
          height: resolution.height,
          time: sceneTime,
          progress: sceneProgress,
          scene: currentScene,
          aspectRatio: project.aspectRatio
        });

        frame++;
        const pct = Math.round((frame / totalFrames) * 95);
        setCurrentProgress(pct);

        if (frame % (fps * 4) === 0) {
          setRenderLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] Synthesized frame ${frame}/${totalFrames} (${pct}%)`
          ]);
        }
      }, 1000 / fps);

      recorder.onstop = async () => {
        const videoBlob = new Blob(chunks, { type: mimeType });
        setRenderedBlob(videoBlob);
        const videoUrl = URL.createObjectURL(videoBlob);
        setCompletedDownloadUrl(videoUrl);
        setCurrentProgress(100);
        setIsRendering(false);
        const mb = (videoBlob.size / 1024 / 1024).toFixed(2);
        setRenderLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Video synthesis complete! Size: ${mb} MB (${format.toUpperCase()})`
        ]);

        await onUpdateRenderJob(jobId, {
          status: 'completed',
          progress: 100,
          outputUrl: videoUrl,
          completedAt: new Date().toISOString()
        });
      };
    } catch (err: any) {
      setIsRendering(false);
      setRenderLogs(prev => [...prev, `[ERROR] Local render failed: ${err.message}`]);
      await onUpdateRenderJob(jobId, {
        status: 'failed',
        error: err.message
      });
    }
  };

  // Safe Direct Download Handler
  const handleDownloadFile = () => {
    if (!completedDownloadUrl) return;
    const a = document.createElement('a');
    a.href = completedDownloadUrl;
    const ext = activeOutputFormat || (target === 'browser' ? 'webm' : 'mp4');
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${selectedDuration}s.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-2.5 sm:p-6 overscroll-contain flex flex-col justify-start sm:justify-center items-center">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[92dvh] sm:max-h-[88dvh] overflow-hidden">
        {/* Sticky Header with prominent, tap-friendly X button */}
        <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Video Render & Cloud Export Center</h2>
              <p className="text-[11px] text-slate-400">Export professional 1080x1920 MP4 reels</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-6">

        {/* Security & Validation Alerts */}
        {securityErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Submission Blocked by Security Guards:</span>
            </div>
            <ul className="text-xs text-red-200 list-disc list-inside space-y-1">
              {securityErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mandatory Approval Guard Banner */}
        {!isApproved && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300">Storyboard Approval Required</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Per the Creator Studio workflow, every video storyboard must be reviewed and approved before rendering.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onGoToStoryboard();
              }}
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shrink-0 hover:bg-amber-400"
            >
              Review Storyboard
            </button>
          </div>
        )}

        {/* Target Provider Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300">Choose Rendering Engine</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Browser Local Canvas (Primary Fast & Free On-Device Backend) */}
            <button
              type="button"
              disabled={!isApproved}
              onClick={() => setTarget('browser')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                target === 'browser'
                  ? 'bg-amber-500/10 border-amber-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
              } ${!isApproved ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>Local Device Engine</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Instant • Direct File
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct on-device HTML5 canvas rendering. Saves directly to your device without external cloud or black screens.
              </p>
            </button>

            {/* 2. GitHub Actions Cloud Runner */}
            <button
              type="button"
              disabled={!isApproved}
              onClick={() => setTarget('github_actions')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                target === 'github_actions'
                  ? 'bg-amber-500/10 border-amber-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
              } ${!isApproved ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <GithubIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>GitHub Actions</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Cloud • FFmpeg
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Renders on Ubuntu cloud runner with FFmpeg. Saves to GitHub Artifacts (or Cloudflare R2 if configured).
              </p>
            </button>

            {/* 3. Google Cloud Run (Documented Future Option) */}
            <button
              type="button"
              disabled={true}
              onClick={() => setTarget('cloud_run')}
              className="p-3.5 rounded-xl border text-left flex flex-col justify-between space-y-2 bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cloud Run (Future)</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Disabled
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Future alternative reserved if GitHub Actions quotas prove insufficient. No billing enabled.
              </p>
            </button>
          </div>
        </div>

        {/* Video Duration Selector (Including 30s & 60s) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Video Duration</span>
            <span className="text-[11px] text-amber-400 font-normal">Supports 15s, 30s & 60s professional reels</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { sec: 5, label: '5s Diagnostic' },
              { sec: 15, label: '15s Short' },
              { sec: 30, label: '30s Standard Reel' },
              { sec: 60, label: '60s Full Story' }
            ].map(d => (
              <button
                key={d.sec}
                type="button"
                disabled={isRendering}
                onClick={() => setSelectedDuration(d.sec)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-0.5 transition-all ${
                  selectedDuration === d.sec
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span>{d.sec} Seconds</span>
                <span className="text-[10px] text-slate-500 font-normal">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Render Button */}
        <div className="pt-2">
          <button
            disabled={!isApproved || isRendering}
            onClick={handleStartRender}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {isRendering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Render ({currentProgress}%)...</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4 stroke-[2.5]" />
                <span>
                  Render Video ({selectedDuration}s • {resolution.width}x{resolution.height} @ 30 FPS • {target === 'github_actions' ? 'GitHub Cloud' : 'Local Device Engine'})
                </span>
              </>
            )}
          </button>
        </div>

        {/* Live Canvas Monitor while rendering */}
        <div className={`p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2 ${isRendering && target === 'browser' ? 'flex' : 'hidden'}`}>
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Live Video Synthesis in Progress ({currentProgress}%)</span>
          </div>
          <div 
            className="relative rounded-lg overflow-hidden bg-black border border-slate-800 shadow-xl flex items-center justify-center"
            style={{
              width: project.aspectRatio === '9:16' ? '160px' : project.aspectRatio === '1:1' ? '200px' : '260px',
              maxWidth: '100%',
              aspectRatio: project.aspectRatio === '9:16' ? '9/16' : project.aspectRatio === '1:1' ? '1/1' : '16/9'
            }}
          >
            <canvas
              ref={renderCanvasRef}
              width={resolution.width}
              height={resolution.height}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Progress Bar & Real-time Console */}
        {isRendering && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  {target === 'github_actions' ? 'GitHub Actions Cloud Runner Active' : 'Synthesizing Video Frames'}
                </span>
              </span>
              <span className="font-mono font-bold text-amber-400">{currentProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-200"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed Download Callout with In-Modal Video Player */}
        {completedDownloadUrl && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Video Render Complete!</h4>
                  <p className="text-[11px] text-slate-300">
                    Verified output ready for download. Format: {activeOutputFormat.toUpperCase()} ({resolution.width}x{resolution.height}).
                  </p>
                </div>
              </div>
              {renderedBlob && (
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {(renderedBlob.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>

            {/* In-Modal Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center max-h-72">
              <video
                src={completedDownloadUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-72 w-auto object-contain rounded-lg shadow-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadFile}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Save Video to Device ({activeOutputFormat.toUpperCase()})</span>
              </button>
            </div>
          </div>
        )}

        {/* Cloud Actions Succeeded Without R2 */}
        {!completedDownloadUrl && !isRendering && activeJobRecord?.status === 'completed' && activeJobRecord?.target === 'github_actions' && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>GitHub Actions Workflow Completed Successfully</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The video was rendered on GitHub's Ubuntu cloud runner! However, <strong>Cloudflare R2 Storage</strong> is not configured yet. Without R2 to host public MP4 download links, GitHub stores the video as a <strong>GitHub Actions Artifact</strong> on your workflow run.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <a
                href={workflowRunUrl || `https://github.com/${settings.githubOwner}/${settings.githubRepo}/actions`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>View GitHub Run & Download Artifact</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setTarget('browser');
                  handleStartRender();
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Download Now via Local Device Engine</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Logs Terminal */}
        {renderLogs.length > 0 && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Runner Execution Logs</span>
              <span className="font-mono text-[10px] text-slate-500">ubuntu-latest (2 vCPU, 7GB RAM)</span>
            </label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 max-h-32 overflow-y-auto space-y-1">
              {renderLogs.map((log, idx) => (
                <div key={idx} className="leading-tight text-slate-300">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Past Render Jobs History */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <label className="text-xs font-semibold text-slate-300">Recent Render History</label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {renderJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white font-medium">{job.id}</span>
                  <span className="text-slate-500 uppercase text-[10px]">({job.target.replace('_', ' ')})</span>
                  <span className="text-slate-500 text-[10px]">• {job.duration}s</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    job.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {job.status}
                  </span>
                  {job.outputUrl && (
                    <a
                      href={job.outputUrl}
                      download={`render_${job.id}.${job.format}`}
                      className="text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
