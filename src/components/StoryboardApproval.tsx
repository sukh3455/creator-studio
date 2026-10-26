import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Clapperboard, 
  Film, 
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Video,
  Eye,
  Sliders
} from 'lucide-react';
import { Project, Scene, CompositionLayout, CameraMotion } from '../types/creatorStudio';

interface StoryboardApprovalProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onRegenerateScene: (scene: Scene, instruction: string) => Promise<void>;
  onProceedToEditor: () => void;
  onProceedToRender: () => void;
  onBackToDashboard?: () => void;
}

export const StoryboardApproval: React.FC<StoryboardApprovalProps> = ({
  project,
  onUpdateProject,
  onRegenerateScene,
  onProceedToEditor,
  onProceedToRender,
  onBackToDashboard
}) => {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
  const [regenInstruction, setRegenInstruction] = useState<string>('');

  const scenes = project.scenes || [];
  const allApproved = scenes.length > 0 && scenes.every(s => s.approved);
  const isProjectApproved = project.status === 'approved' || project.status === 'completed';

  // Quality Audit Metrics
  const distinctLayouts = new Set(scenes.map(s => s.compositionLayout || s.order)).size;
  const distinctBgs = new Set(scenes.map(s => s.backgroundColor)).size;
  const hasDistinctVisuals = distinctLayouts > 1 || scenes.length <= 1;
  const hasDistinctBgs = distinctBgs > 1 || scenes.length <= 1;
  const isTypographySafe = scenes.every(s => (s.captionText?.length || 0) < 140);
  const hasNarrativeArc = scenes.length >= 2;

  const qualityScore = Math.round(
    ((hasDistinctVisuals ? 30 : 10) +
     (hasDistinctBgs ? 25 : 10) +
     (isTypographySafe ? 25 : 10) +
     (hasNarrativeArc ? 20 : 10))
  );

  const handleToggleSceneApproval = (sceneId: string) => {
    const updatedScenes = scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, approved: !s.approved };
      }
      return s;
    });

    const nowAllApproved = updatedScenes.every(s => s.approved);
    onUpdateProject({
      ...project,
      scenes: updatedScenes,
      status: nowAllApproved ? 'approved' : 'planned',
      approvedAt: nowAllApproved ? new Date().toISOString() : undefined
    });
  };

  const handleApproveAll = () => {
    const updatedScenes = scenes.map(s => ({ ...s, approved: true }));
    onUpdateProject({
      ...project,
      scenes: updatedScenes,
      status: 'approved',
      approvedAt: new Date().toISOString()
    });
  };

  const handleSceneTextChange = (sceneId: string, field: 'narration' | 'captionText' | 'title', value: string) => {
    const updatedScenes = scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onUpdateProject({ ...project, scenes: updatedScenes });
  };

  const handleSceneLayoutChange = (sceneId: string, layout: CompositionLayout) => {
    const updatedScenes = scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, compositionLayout: layout };
      }
      return s;
    });
    onUpdateProject({ ...project, scenes: updatedScenes });
  };

  const handleSceneCameraChange = (sceneId: string, camera: CameraMotion) => {
    const updatedScenes = scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, cameraMotion: camera };
      }
      return s;
    });
    onUpdateProject({ ...project, scenes: updatedScenes });
  };

  const handleSceneDurationChange = (sceneId: string, duration: number) => {
    const updatedScenes = scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, duration: Math.max(1, duration) };
      }
      return s;
    });
    const newTotal = updatedScenes.reduce((sum, s) => sum + s.duration, 0);
    onUpdateProject({ ...project, scenes: updatedScenes, duration: newTotal });
  };

  const handleTriggerRegenerate = async (scene: Scene) => {
    if (!regenInstruction.trim()) return;
    setRegeneratingSceneId(scene.id);
    try {
      await onRegenerateScene(scene, regenInstruction);
      setRegenInstruction('');
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Mobile Back */}
      <div className="flex items-center justify-between">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        )}
      </div>

      {/* Mandatory Approval Notification Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isProjectApproved
          ? 'bg-emerald-950/30 border-emerald-500/40 shadow-xl shadow-emerald-950/10'
          : 'bg-amber-950/30 border-amber-500/40 shadow-xl shadow-amber-950/10'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            {isProjectApproved ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
            )}
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{isProjectApproved ? 'Storyboard Approved & Ready for Render' : 'Creative Director Storyboard Review'}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isProjectApproved
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {isProjectApproved ? 'Ready to Export' : 'Approval Required'}
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                {isProjectApproved
                  ? 'All scenes have been verified and approved. Final video export is unlocked.'
                  : 'Review the creative concept, visual archetype, narration, and motion behaviors for each scene below. Approving the storyboard unlocks the 60fps MP4 exporter.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isProjectApproved ? (
              <button
                onClick={handleApproveAll}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                <span>Approve All Scenes & Proceed</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onProceedToEditor}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
                >
                  <Clapperboard className="w-4 h-4" />
                  <span>Preview 60fps Player</span>
                </button>
                <button
                  onClick={onProceedToRender}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Film className="w-4 h-4 stroke-[2.5]" />
                  <span>Export MP4 Video</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Creative Director Quality Audit Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Creative Director Quality Audit</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {qualityScore}% Quality Score
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[11px] block">Visual Diversity</span>
            <div className="flex items-center space-x-1.5 font-bold text-white">
              <span className={distinctLayouts > 1 ? 'text-emerald-400' : 'text-amber-400'}>
                {distinctLayouts} Unique Layouts
              </span>
            </div>
            <p className="text-[10px] text-slate-500">No repetitive templates</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[11px] block">Atmospheric Variation</span>
            <div className="flex items-center space-x-1.5 font-bold text-white">
              <span className={distinctBgs > 1 ? 'text-emerald-400' : 'text-amber-400'}>
                {distinctBgs} Contrasting BGs
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Dynamic lighting & palettes</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[11px] block">Safe Margins</span>
            <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Auto-Wrapped</span>
            </div>
            <p className="text-[10px] text-slate-500">9:16 safe zone compliant</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[11px] block">Narrative Progression</span>
            <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3-Act Structure</span>
            </div>
            <p className="text-[10px] text-slate-500">Hook → Value → CTA</p>
          </div>
        </div>
      </div>

      {/* Project Meta Summary */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-4 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span>Project: <strong className="text-white">{project.title}</strong></span>
          <span>Duration: <strong className="text-white">{project.duration}s</strong></span>
          <span>Aspect Ratio: <strong className="text-white">{project.aspectRatio}</strong></span>
          <span>Brand: <strong className="text-amber-400">{project.brandKit?.name}</strong></span>
        </div>
        <div className="text-[11px] text-slate-500">
          {scenes.filter(s => s.approved).length} of {scenes.length} scenes approved
        </div>
      </div>

      {/* Scene-by-Scene Cards */}
      <div className="space-y-6">
        {scenes.map((scene, idx) => {
          const isRegenerating = regeneratingSceneId === scene.id;

          return (
            <div
              key={scene.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                scene.approved
                  ? 'bg-slate-900/80 border-emerald-500/30 shadow-md'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Scene Card Header */}
              <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-950/70 border-b border-slate-800/80 gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleSceneApproval(scene.id)}
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {scene.approved ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 uppercase tracking-wider">
                    {scene.label}
                  </span>
                  <h3 className="font-bold text-white text-sm">{scene.title}</h3>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={scene.duration}
                      onChange={(e) => handleSceneDurationChange(scene.id, parseInt(e.target.value) || 1)}
                      className="w-12 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-center text-xs text-white"
                    />
                    <span>sec</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      scene.approved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {scene.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Scene Content Body */}
              <div className="p-6 space-y-6">
                {/* Visual Architecture Bar */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-semibold flex items-center space-x-1">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>Layout:</span>
                      </span>
                      <select
                        value={scene.compositionLayout || 'split_editorial'}
                        onChange={(e) => handleSceneLayoutChange(scene.id, e.target.value as CompositionLayout)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-medium text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="split_editorial">Split Editorial (Hook)</option>
                        <option value="metric_grid">Metric Grid (3 Pillars)</option>
                        <option value="hero_badge">Glass Hero Card</option>
                        <option value="geometric_focus">Geometric Focus</option>
                        <option value="brand_outro">Grand Brand Outro</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-semibold flex items-center space-x-1">
                        <Video className="w-3.5 h-3.5 text-sky-400" />
                        <span>Camera:</span>
                      </span>
                      <select
                        value={scene.cameraMotion || 'zoom_in'}
                        onChange={(e) => handleSceneCameraChange(scene.id, e.target.value as CameraMotion)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-medium text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="zoom_in">Smooth Zoom In</option>
                        <option value="zoom_out">Smooth Zoom Out</option>
                        <option value="pan_drift_up">Pan Drift Up</option>
                        <option value="pan_drift_down">Pan Drift Down</option>
                        <option value="steady">Steady</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span>Focal Point:</span>
                    <span className="text-amber-300 font-mono">{scene.focalConcept || 'Vector Graphics & Kinetic Typography'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Script & Voiceover */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>Spoken Voiceover Script</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Narration audio text</span>
                      </label>
                      <textarea
                        rows={3}
                        value={scene.narration}
                        onChange={(e) => handleSceneTextChange(scene.id, 'narration', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>On-Screen Kinetic Captions</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Safe-wrapped lines</span>
                      </label>
                      <textarea
                        rows={2}
                        value={scene.captionText}
                        onChange={(e) => handleSceneTextChange(scene.id, 'captionText', e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-200 text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Motion Graphics Spec & Asset Requirements */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Active Motion Graphics Elements</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {scene.elements?.map((elem, eIdx) => (
                          <div
                            key={eIdx}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-1.5"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span className="font-semibold capitalize">{elem.type.replace('_', ' ')}</span>
                          </div>
                        ))}
                        <div className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                          Theme: {scene.theme}
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                          Transition: {scene.transition}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-2 block">
                        Asset Strategy & Audio FX
                      </label>
                      <div className="space-y-1.5">
                        {scene.assetRequirements?.map((req, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/50"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scene Regeneration Bar */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Prompt to regenerate this scene (e.g. 'Emphasize 3D logo design and add dynamic blue accents')..."
                      value={regeneratingSceneId === scene.id ? regenInstruction : ''}
                      onChange={(e) => {
                        setRegeneratingSceneId(scene.id);
                        setRegenInstruction(e.target.value);
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      disabled={isRegenerating || !regenInstruction.trim()}
                      onClick={() => handleTriggerRegenerate(scene)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40 transition-all shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Scene'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSceneApproval(scene.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      scene.approved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{scene.approved ? 'Approved ✓' : 'Approve Scene'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
