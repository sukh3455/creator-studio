import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Eye, 
  EyeOff, 
  Server, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertTriangle,
  Flame
} from 'lucide-react';

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { ProviderSettings } from '../types/creatorStudio';
import { FREE_MODELS, PAID_RECOMMENDED_MODELS } from '../services/ai/openrouterClient';
import { validateProviderStatuses } from '../services/settings/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProviderSettings;
  onSaveSettings: (settings: ProviderSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [form, setForm] = useState<ProviderSettings>({ ...settings });
  const [showOpenRouterKey, setShowOpenRouterKey] = useState<boolean>(false);
  const [showR2Secret, setShowR2Secret] = useState<boolean>(false);
  const [showSupabaseKey, setShowSupabaseKey] = useState<boolean>(false);
  const [showGithubToken, setShowGithubToken] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'github' | 'supabase' | 'r2' | 'worker' | 'safety'>('github');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const statuses = validateProviderStatuses(form);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Provider & Account Settings</h2>
              <p className="text-xs text-slate-400">Configure external cloud keys, AI models, and cost guards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {statuses.map((s, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
              <div className="text-slate-400 truncate">{s.service}</div>
              <div className="font-bold mt-0.5 capitalize text-amber-400">
                {s.status === 'connected' ? 'Connected ✓' : 'Local Fallback'}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-slate-800 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2 rounded-t-lg transition-colors ${
              activeTab === 'ai' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            OpenRouter AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`px-3 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'github' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Actions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-2 rounded-t-lg transition-colors ${
              activeTab === 'supabase' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Supabase DB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('r2')}
            className={`px-3 py-2 rounded-t-lg transition-colors ${
              activeTab === 'r2' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cloudflare R2
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('worker')}
            className={`px-3 py-2 rounded-t-lg transition-colors ${
              activeTab === 'worker' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cloud Run Worker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-2 rounded-t-lg transition-colors ${
              activeTab === 'safety' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cost & Safety
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">OpenRouter API Key</label>
                <div className="relative">
                  <input
                    type={showOpenRouterKey ? 'text' : 'password'}
                    placeholder="sk-or-v1-..."
                    value={form.openRouterApiKey}
                    onChange={(e) => setForm({ ...form, openRouterApiKey: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono pr-10 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Leave blank to use the built-in offline creative planner (100% free, zero tokens).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">AI Model Selection</label>
                <select
                  value={form.openRouterModel}
                  onChange={(e) => setForm({ ...form, openRouterModel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <optgroup label="Free Tier Models (Zero Cost)">
                    {FREE_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.description}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Paid Tier Models (Requires Paid OpenRouter Credits)">
                    {PAID_RECOMMENDED_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.description}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Free-only mode guard */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Enforce Free-Only Mode</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Automatically blocks requests to paid models to prevent unintended credit usage.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.openRouterFreeOnly}
                  onChange={(e) => setForm({ ...form, openRouterFreeOnly: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>
            </div>
          )}

          {/* GitHub Actions Cloud Rendering Settings */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Github className="w-4 h-4 text-amber-400" />
                    <span>Free Cloud Rendering Backend</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Uses ephemeral standard Ubuntu runners (2 vCPU, 7GB RAM). Free accounts receive <strong>2,000 runner minutes/month</strong> without requiring credit cards or paid upgrades.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  Zero Billing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">GitHub Owner / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. sukhgraphix or octocat"
                    value={form.githubOwner}
                    onChange={(e) => setForm({ ...form, githubOwner: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Repository Name</label>
                  <input
                    type="text"
                    placeholder="e.g. creator-studio"
                    value={form.githubRepo}
                    onChange={(e) => setForm({ ...form, githubRepo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Personal Access Token (PAT) with <code className="text-amber-400">repo</code> or <code className="text-amber-400">workflow</code> scope
                </label>
                <div className="relative">
                  <input
                    type={showGithubToken ? 'text' : 'password'}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={form.githubToken}
                    onChange={(e) => setForm({ ...form, githubToken: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono pr-10 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGithubToken(!showGithubToken)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Leave blank to use the simulated background runner queue (runs without any external token).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Workflow Filename</label>
                <input
                  type="text"
                  placeholder="render-video.yml"
                  value={form.githubWorkflow}
                  onChange={(e) => setForm({ ...form, githubWorkflow: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Supabase Settings */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Enable Remote Supabase Database</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    When disabled, the app uses offline IndexedDB & LocalStorage persistence.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.supabaseEnabled}
                  onChange={(e) => setForm({ ...form, supabaseEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={form.supabaseUrl}
                  onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Supabase Anon Key</label>
                <div className="relative">
                  <input
                    type={showSupabaseKey ? 'text' : 'password'}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={form.supabaseAnonKey}
                    onChange={(e) => setForm({ ...form, supabaseAnonKey: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono pr-10 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showSupabaseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cloudflare R2 Settings */}
          {activeTab === 'r2' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">R2 Account ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 78a9c8f..."
                    value={form.r2AccountId}
                    onChange={(e) => setForm({ ...form, r2AccountId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">R2 Bucket Name</label>
                  <input
                    type="text"
                    placeholder="creator-studio-media"
                    value={form.r2BucketName}
                    onChange={(e) => setForm({ ...form, r2BucketName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Access Key ID</label>
                <input
                  type="text"
                  placeholder="e.g. 5d89f..."
                  value={form.r2AccessKeyId}
                  onChange={(e) => setForm({ ...form, r2AccessKeyId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Secret Access Key</label>
                <div className="relative">
                  <input
                    type={showR2Secret ? 'text' : 'password'}
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={form.r2SecretAccessKey}
                    onChange={(e) => setForm({ ...form, r2SecretAccessKey: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowR2Secret(!showR2Secret)}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                  >
                    {showR2Secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cloud Run Worker Settings */}
          {activeTab === 'worker' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Cloud Run Rendering Worker URL</label>
                <input
                  type="text"
                  placeholder="https://creator-studio-renderer-xyz.a.run.app"
                  value={form.cloudRunWorkerUrl}
                  onChange={(e) => setForm({ ...form, cloudRunWorkerUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500">
                  Leave blank to use the browser-native canvas exporter (runs on phone & laptop with zero cloud setup).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Worker Bearer Auth Token (Optional)</label>
                <input
                  type="password"
                  placeholder="Optional token for secured Cloud Run workers"
                  value={form.cloudRunAuthToken}
                  onChange={(e) => setForm({ ...form, cloudRunAuthToken: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Cost & Safety Controls */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Max Upload Size (MB)</label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={form.maxUploadSizeMB}
                    onChange={(e) => setForm({ ...form, maxUploadSizeMB: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Max Video Duration (Seconds)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={form.maxRenderDurationSeconds}
                    onChange={(e) => setForm({ ...form, maxRenderDurationSeconds: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Autonomous Cost & Security Protections</span>
                </h4>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li>Mandatory storyboard approval blocks accidental or duplicate render runs.</li>
                  <li>SSRF validator blocks private network probing during website captures.</li>
                  <li>Secrets and keys are never sent in client URLs or logged to browser console.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              {savedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
