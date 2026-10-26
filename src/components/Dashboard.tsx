import React from 'react';
import { 
  Plus, 
  Sparkles, 
  Clock, 
  Smartphone, 
  Monitor, 
  Square, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Zap, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Project, ProviderSettings } from '../types/creatorStudio';
import { validateProviderStatuses } from '../services/settings/settingsStore';

interface DashboardProps {
  projects: Project[];
  currentProjectId: string | null;
  settings: ProviderSettings;
  onSelectProject: (id: string) => void;
  onCreateNewProject: () => void;
  onUseTemplate: (templatePrompt: string) => void;
  onDeleteProject: (id: string) => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  currentProjectId,
  settings,
  onSelectProject,
  onCreateNewProject,
  onUseTemplate,
  onDeleteProject,
  onOpenSettings
}) => {
  const providerStatuses = validateProviderStatuses(settings);

  const [heroPrompt, setHeroPrompt] = useState<string>('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroPrompt.trim()) return;
    onUseTemplate(heroPrompt.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner with Direct Prompt Creation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Motion Graphics & Video Generation</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Create Custom Reels from <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">Any Idea or Prompt</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Every reel is generated completely unique from your prompt. The AI plans your script, scenes, kinetic captions, and motion graphics without pre-made templates.
          </p>

          {/* Direct Prompt Input Box */}
          <form onSubmit={handleHeroSubmit} className="pt-2 space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder="Describe your video idea... (e.g., A high-energy 15s fitness motivation reel for IronPeak Gym with electric neon typography, intense beat-synced cuts, and workout particles)"
                className="w-full p-4 pr-12 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                ⚡ Powered by OpenRouter AI • 1080x1920 60 FPS
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={!heroPrompt.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Generate New Reel Storyboard</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Provider Connectivity & System Status Bar */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">System & Cloud Integrations</h2>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium underline"
          >
            Configure Providers & Keys
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {providerStatuses.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-200">{p.service}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    p.status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {p.status === 'connected' ? 'Connected' : 'Local Fallback'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Projects ({projects.length})</h2>
          <button
            onClick={onCreateNewProject}
            className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <Plus className="w-4 h-4" />
            <span>New Video</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No projects yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Enter your reel idea in the prompt box above to generate unique, custom scenes with AI.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const isSelected = proj.id === currentProjectId;
              const isApproved = proj.status === 'approved' || proj.status === 'completed';

              return (
                <div
                  key={proj.id}
                  className={`rounded-xl border transition-all duration-200 p-5 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                        {proj.aspectRatio === '9:16' && <Smartphone className="w-3.5 h-3.5 text-amber-400" />}
                        {proj.aspectRatio === '16:9' && <Monitor className="w-3.5 h-3.5 text-blue-400" />}
                        {proj.aspectRatio === '1:1' && <Square className="w-3.5 h-3.5 text-purple-400" />}
                        <span>{proj.aspectRatio}</span>
                        <span>•</span>
                        <span>{proj.duration}s</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isApproved ? 'Approved' : 'Needs Approval'}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base mb-1 line-clamp-1">{proj.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {proj.prompt}
                    </p>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      {proj.scenes?.length || 0} scenes
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        title="Delete project"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${proj.title}"?`)) onDeleteProject(proj.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectProject(proj.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        <span>{isSelected ? 'Active' : 'Open'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
