import React, { useState } from 'react';
import { 
  Upload, 
  Images, 
  Globe, 
  Sparkles, 
  Trash2, 
  Layers, 
  Scissors, 
  Crop, 
  ShieldCheck, 
  Music, 
  Video, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Asset, Project, ProviderSettings } from '../types/creatorStudio';
import { CURATED_STOCK_LIBRARY, convertStockToAsset } from '../services/assets/stockMedia';
import { WebCaptureService } from '../services/webcapture/webCaptureService';
import { IStorageProvider } from '../services/storage/storageProvider';

interface AssetLibraryProps {
  project: Project;
  assets: Asset[];
  settings: ProviderSettings;
  storageProvider: IStorageProvider;
  onSaveAsset: (asset: Asset) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
  onAssignAssetToScene: (sceneId: string, role: 'background' | 'overlay', assetId: string) => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  project,
  assets,
  settings,
  storageProvider,
  onSaveAsset,
  onDeleteAsset,
  onAssignAssetToScene
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'stock' | 'webcapture'>('upload');

  // Web capture inputs
  const [webUrl, setWebUrl] = useState<string>('https://sukhgraphix.com');
  const [webViewport, setWebViewport] = useState<'mobile' | 'desktop'>('mobile');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Selected asset for inspection
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await storageProvider.uploadFile(file, file.name, file.type);

        let type: Asset['type'] = 'image';
        if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';

        const newAsset: Asset = {
          id: `asset_upload_${Date.now()}_${i}`,
          projectId: project.id,
          name: file.name,
          type,
          url: res.url,
          mimeType: file.type,
          size: res.size,
          source: 'user_upload',
          license: {
            type: 'User Owned'
          },
          createdAt: new Date().toISOString()
        };

        await onSaveAsset(newAsset);
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImportStock = async (stockItem: any) => {
    const asset = convertStockToAsset(stockItem, project.id);
    await onSaveAsset(asset);
  };

  const handleWebCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl.trim() || isCapturing) return;

    setIsCapturing(true);
    setCaptureError(null);

    const service = new WebCaptureService();
    try {
      const asset = await service.captureWebsite(
        {
          url: webUrl,
          viewport: webViewport,
          projectId: project.id
        },
        settings
      );
      await onSaveAsset(asset);
    } catch (err: any) {
      setCaptureError(err.message || 'Capture failed');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Images className="w-5 h-5 text-amber-400" />
            <span>Media & Asset Library</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage user uploads, stock media with license tracking, and Playwright website captures.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Uploads ({assets.filter(a => a.source === 'user_upload').length})
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stock'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stock Library
          </button>
          <button
            onClick={() => setActiveTab('webcapture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'webcapture'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Web Capture
          </button>
        </div>
      </div>

      {/* Main Content Sections */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Drag & drop upload box */}
          <label className="block cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-8 text-center bg-slate-900/40 hover:bg-slate-900/70 transition-all">
              <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">
                {isUploading ? 'Uploading assets...' : 'Click or Drag files to upload'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Supports PNG, JPG, SVG, MP4, WebM, MP3, and WAV up to {settings.maxUploadSizeMB} MB.
              </p>
            </div>
          </label>

          {/* Uploaded assets grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`group relative rounded-xl border p-2 cursor-pointer transition-all ${
                  selectedAsset?.id === asset.id
                    ? 'bg-slate-800 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="aspect-square rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden mb-2 relative">
                  {asset.type === 'image' || asset.type === 'screenshot' ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  ) : asset.type === 'audio' ? (
                    <Music className="w-8 h-8 text-amber-400" />
                  ) : (
                    <Video className="w-8 h-8 text-blue-400" />
                  )}

                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/70 text-slate-300">
                    {asset.type}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-white truncate">{asset.name}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{(asset.size / 1024).toFixed(0)} KB</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAsset(asset.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Media Tab */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Curated commercial stock media with verified licenses</span>
            <span className="text-emerald-400 font-semibold">100% Free for Commercial Use</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CURATED_STOCK_LIBRARY.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video rounded-lg bg-slate-950 overflow-hidden relative mb-2">
                    {item.type === 'image' ? (
                      <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-amber-400">
                        <Music className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-mono">{item.duration}s Audio</span>
                      </div>
                    )}
                    <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/90 text-slate-950">
                      {item.license.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                    {item.license.attribution}
                  </p>
                </div>

                <button
                  onClick={() => handleImportStock(item)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all"
                >
                  Import to Project
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Web Capture Tab */}
      {activeTab === 'webcapture' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Playwright & Chromium Website Capture</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter any public website URL to capture high-resolution mobile or desktop screenshots. All captures are protected by strict SSRF network filters.
            </p>

            <form onSubmit={handleWebCapture} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Website URL</label>
                <input
                  type="text"
                  placeholder="https://sukhgraphix.com or https://example.com"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Viewport</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWebViewport('mobile')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 ${
                      webViewport === 'mobile'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Mobile (393 × 852)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebViewport('desktop')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 ${
                      webViewport === 'desktop'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Desktop (1280 × 720)</span>
                  </button>
                </div>
              </div>

              {captureError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{captureError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isCapturing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                {isCapturing ? 'Capturing Website...' : 'Capture Website Screenshot'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Asset Inspector Modal / Panel */}
      {selectedAsset && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-slate-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-slate-950 overflow-hidden shrink-0">
              {selectedAsset.type === 'image' || selectedAsset.type === 'screenshot' ? (
                <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-400">
                  <Music className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">{selectedAsset.name}</h4>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                <span>License: {selectedAsset.license.type}</span>
                <span>•</span>
                <span>Source: {selectedAsset.source}</span>
              </div>
            </div>
          </div>

          {/* Scene assignment controls */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300">Assign to Scene:</span>
            {project.scenes?.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => onAssignAssetToScene(s.id, 'background', selectedAsset.id)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all"
              >
                Scene {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-xs text-slate-400 hover:text-white ml-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
