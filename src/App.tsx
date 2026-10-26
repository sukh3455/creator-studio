import React, { useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  Asset, 
  RenderJob, 
  ProviderSettings, 
  AspectRatio, 
  Scene 
} from './types/creatorStudio';
import { Sparkles, Plus } from 'lucide-react';
import { loadSettings, saveSettings } from './services/settings/settingsStore';
import { getDatabaseProvider, SAMPLE_DIWALI_PROJECT } from './services/db/databaseProvider';
import { getStorageProvider } from './services/storage/storageProvider';
import { planCreativeProject, regenerateSceneWithAI } from './services/ai/creativePlanner';

// UI Components
import { Header, TabType } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StoryboardApproval } from './components/StoryboardApproval';
import { PreviewPlayer } from './components/PreviewPlayer';
import { AssetLibrary } from './components/AssetLibrary';
import { RenderQueueModal } from './components/RenderQueueModal';
import { ProjectCreateModal } from './components/ProjectCreateModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // Provider Settings
  const [settings, setSettings] = useState<ProviderSettings>(() => loadSettings());

  // Database and Storage Providers
  const db = getDatabaseProvider(settings);
  const storage = getStorageProvider(settings);

  // Core State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createInitialPrompt, setCreateInitialPrompt] = useState<string>('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState<boolean>(false);

  // Initialize and load persisted data
  useEffect(() => {
    async function initData() {
      try {
        const loadedProjects = await db.getProjects();
        if (loadedProjects.length === 0) {
          setProjects([]);
          setCurrentProjectId(null);
        } else {
          setProjects(loadedProjects);
          setCurrentProjectId(loadedProjects[0].id);
        }

        const loadedAssets = await db.getAssets();
        setAssets(loadedAssets);

        const loadedJobs = await db.getRenderJobs();
        setRenderJobs(loadedJobs);
      } catch (err) {
        console.error('Failed to initialize database:', err);
      }
    }
    initData();
  }, []);

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0] || null;

  // Save Settings
  const handleSaveSettings = (newSettings: ProviderSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Mobile Hardware / Gesture Back Button Interceptor
  // Prevents mobile browser from navigating away and closing the site
  useEffect(() => {
    const handlePopState = () => {
      if (isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
        return;
      }
      if (isRenderModalOpen) {
        setIsRenderModalOpen(false);
        return;
      }
      if (isCreateModalOpen) {
        setIsCreateModalOpen(false);
        return;
      }
      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSettingsModalOpen, isRenderModalOpen, isCreateModalOpen, activeTab]);

  const handleOpenSettings = () => {
    window.history.pushState({ modal: 'settings' }, '');
    setIsSettingsModalOpen(true);
  };

  const handleOpenRender = () => {
    window.history.pushState({ modal: 'render' }, '');
    setIsRenderModalOpen(true);
  };

  const handleOpenCreate = (prompt = '') => {
    setCreateInitialPrompt(prompt);
    window.history.pushState({ modal: 'create' }, '');
    setIsCreateModalOpen(true);
  };

  const handleTabChange = (newTab: TabType) => {
    if (newTab !== activeTab) {
      window.history.pushState({ tab: newTab }, '');
      setActiveTab(newTab);
    }
  };

  // Create & Plan Project with AI / Offline Template
  const handleCreateProject = async (data: {
    prompt: string;
    duration: number;
    aspectRatio: AspectRatio;
    stylePreset: any;
    brandKit: any;
  }) => {
    const { project } = await planCreativeProject(
      data.prompt,
      {
        duration: data.duration,
        aspectRatio: data.aspectRatio,
        stylePreset: data.stylePreset,
        brandKit: data.brandKit
      },
      settings
    );

    const saved = await db.saveProject(project);
    setProjects(prev => [saved, ...prev]);
    setCurrentProjectId(saved.id);

    // Direct user to Storyboard Approval Screen immediately after planning
    handleTabChange('storyboard');
  };

  // Open creation modal with pre-filled prompt
  const handleUseTemplate = (prompt: string) => {
    handleOpenCreate(prompt);
  };

  // Update Project
  const handleUpdateProject = async (updated: Project) => {
    const saved = await db.saveProject(updated);
    setProjects(prev => prev.map(p => (p.id === saved.id ? saved : p)));
  };

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    await db.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      setCurrentProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Regenerate Scene with AI or Rule-Based Modifier
  const handleRegenerateScene = async (scene: Scene, instruction: string) => {
    if (!currentProject) return;
    const regenerated = await regenerateSceneWithAI(scene, instruction, currentProject, settings);
    const updatedScenes = currentProject.scenes.map(s => (s.id === scene.id ? regenerated : s));
    const updatedProj: Project = {
      ...currentProject,
      scenes: updatedScenes,
      status: 'planned' // Re-approval required
    };
    await handleUpdateProject(updatedProj);
  };

  // Change Aspect Ratio
  const handleAspectRatioChange = async (aspectRatio: AspectRatio) => {
    if (!currentProject) return;
    const updated: Project = { ...currentProject, aspectRatio };
    await handleUpdateProject(updated);
  };

  // Assets Management
  const handleSaveAsset = async (asset: Asset) => {
    const saved = await db.saveAsset(asset);
    setAssets(prev => [saved, ...prev.filter(a => a.id !== saved.id)]);
  };

  const handleDeleteAsset = async (id: string) => {
    await db.deleteAsset(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleAssignAssetToScene = (sceneId: string, role: 'background' | 'overlay', assetId: string) => {
    if (!currentProject) return;
    const updatedScenes = currentProject.scenes.map(s => {
      if (s.id === sceneId) {
        return {
          ...s,
          assignedAssetIds: {
            ...s.assignedAssetIds,
            [role]: assetId
          }
        };
      }
      return s;
    });
    handleUpdateProject({ ...currentProject, scenes: updatedScenes });
  };

  // Render Jobs Management
  const handleSaveRenderJob = async (job: RenderJob) => {
    const saved = await db.saveRenderJob(job);
    setRenderJobs(prev => [saved, ...prev.filter(j => j.id !== saved.id)]);
    return saved;
  };

  const handleUpdateRenderJob = async (id: string, updates: Partial<RenderJob>) => {
    const updated = await db.updateRenderJob(id, updates);
    setRenderJobs(prev => prev.map(j => (j.id === id ? updated : j)));
    return updated;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentProject={currentProject}
        onOpenSettings={handleOpenSettings}
        onOpenRenderModal={handleOpenRender}
        onAspectRatioChange={handleAspectRatioChange}
      />

      {/* Main Screen Views */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            projects={projects}
            currentProjectId={currentProjectId}
            settings={settings}
            onSelectProject={(id) => {
              setCurrentProjectId(id);
              handleTabChange('storyboard');
            }}
            onCreateNewProject={() => handleOpenCreate('')}
            onUseTemplate={handleUseTemplate}
            onDeleteProject={handleDeleteProject}
            onOpenSettings={handleOpenSettings}
          />
        )}

        {activeTab === 'storyboard' && (
          currentProject ? (
            <StoryboardApproval
              project={currentProject}
              onUpdateProject={handleUpdateProject}
              onRegenerateScene={handleRegenerateScene}
              onProceedToEditor={() => handleTabChange('editor')}
              onProceedToRender={handleOpenRender}
              onBackToDashboard={() => handleTabChange('dashboard')}
            />
          ) : (
            <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Storyboard Selected</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your creative concept prompt on the Dashboard or click below to generate your custom video scenes with AI.
              </p>
              <button
                onClick={() => handleOpenCreate('')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Video</span>
              </button>
            </div>
          )
        )}

        {activeTab === 'editor' && (
          currentProject ? (
            <PreviewPlayer
              project={currentProject}
              onOpenRenderModal={handleOpenRender}
            />
          ) : (
            <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Video to Preview</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create a new project from your prompt to preview the real-time 60 FPS motion graphics canvas.
              </p>
              <button
                onClick={() => handleOpenCreate('')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Video</span>
              </button>
            </div>
          )
        )}

        {activeTab === 'assets' && currentProject && (
          <AssetLibrary
            project={currentProject}
            assets={assets}
            settings={settings}
            storageProvider={storage}
            onSaveAsset={handleSaveAsset}
            onDeleteAsset={handleDeleteAsset}
            onAssignAssetToScene={handleAssignAssetToScene}
          />
        )}

        {activeTab === 'renders' && currentProject && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={handleOpenRender}
              className="mb-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              + Open Export & Render Center
            </button>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Completed Video Renders</h3>
              {renderJobs.length === 0 ? (
                <p className="text-xs text-slate-500">No renders yet. Click the button above to export a video.</p>
              ) : (
                <div className="space-y-2">
                  {renderJobs.map(job => (
                    <div key={job.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-amber-400 font-bold">{job.id}</span>
                        <span className="text-slate-400 ml-2">Target: {job.target} • {job.format.toUpperCase()}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        initialPrompt={createInitialPrompt}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {currentProject && (
        <RenderQueueModal
          isOpen={isRenderModalOpen}
          onClose={() => setIsRenderModalOpen(false)}
          project={currentProject}
          renderJobs={renderJobs}
          settings={settings}
          onSaveRenderJob={handleSaveRenderJob}
          onUpdateRenderJob={handleUpdateRenderJob}
          onGoToStoryboard={() => handleTabChange('storyboard')}
        />
      )}
    </div>
  );
};
