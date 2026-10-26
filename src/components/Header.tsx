import React from 'react';
import { 
  Sparkles, 
  FolderKanban, 
  Clapperboard, 
  CheckSquare, 
  Images, 
  Film, 
  Settings, 
  Smartphone, 
  Monitor, 
  Square,
  AlertCircle
} from 'lucide-react';
import { AspectRatio, Project } from '../types/creatorStudio';

export type TabType = 'dashboard' | 'editor' | 'storyboard' | 'assets' | 'renders';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentProject: Project | null;
  onOpenSettings: () => void;
  onOpenRenderModal: () => void;
  onAspectRatioChange: (aspectRatio: AspectRatio) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentProject,
  onOpenSettings,
  onOpenRenderModal,
  onAspectRatioChange
}) => {
  const isApproved = currentProject?.status === 'approved' || currentProject?.status === 'completed';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-white bg-clip-text text-transparent">
                  Creator Studio
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous AI Motion Graphics & Video Studio
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => setActiveTab('storyboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === 'storyboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Storyboard</span>
              {currentProject && !isApproved && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span>Editor & Player</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'assets'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Images className="w-3.5 h-3.5" />
              <span>Assets</span>
            </button>

            <button
              onClick={() => setActiveTab('renders')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'renders'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Render Queue</span>
            </button>
          </nav>

          {/* Right Controls: Aspect Ratio + Render Trigger + Settings */}
          <div className="flex items-center space-x-2">
            {/* Aspect Ratio Switcher (Tablet/Desktop) */}
            {currentProject && (
              <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                <button
                  title="9:16 Vertical Reel"
                  onClick={() => onAspectRatioChange('9:16')}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    currentProject.aspectRatio === '9:16'
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  title="16:9 Landscape Video"
                  onClick={() => onAspectRatioChange('16:9')}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    currentProject.aspectRatio === '16:9'
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  title="1:1 Square"
                  onClick={() => onAspectRatioChange('1:1')}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    currentProject.aspectRatio === '1:1'
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Render Button */}
            {currentProject && (
              <button
                onClick={onOpenRenderModal}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shrink-0 ${
                  isApproved
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-95'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <Film className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Export Video</span>
                <span className="sm:hidden">Export</span>
                {!isApproved && (
                  <span title="Storyboard approval required before final export">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </span>
                )}
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Provider Settings & API Keys"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-2 border-t border-slate-800/80 bg-slate-950/90 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'dashboard' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <FolderKanban className="w-4 h-4 mb-0.5" />
          <span>Projects</span>
        </button>
        <button
          onClick={() => setActiveTab('storyboard')}
          className={`flex flex-col items-center py-1 px-2 rounded relative ${
            activeTab === 'storyboard' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5" />
          <span>Storyboard</span>
          {currentProject && !isApproved && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-2" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'editor' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Clapperboard className="w-4 h-4 mb-0.5" />
          <span>Player</span>
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'assets' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Images className="w-4 h-4 mb-0.5" />
          <span>Assets</span>
        </button>
        <button
          onClick={() => setActiveTab('renders')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            activeTab === 'renders' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Film className="w-4 h-4 mb-0.5" />
          <span>Renders</span>
        </button>
      </div>
    </header>
  );
};
