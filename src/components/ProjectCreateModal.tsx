import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Square, 
  Wand2, 
  Layers, 
  Palette, 
  Flame, 
  Clock,
  Check
} from 'lucide-react';
import { AspectRatio, StylePreset, BrandKit } from '../types/creatorStudio';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    prompt: string;
    duration: number;
    aspectRatio: AspectRatio;
    stylePreset: StylePreset;
    brandKit: BrandKit;
  }) => Promise<void>;
  initialPrompt?: string;
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialPrompt
}) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt || '');
  const [duration, setDuration] = useState<number>(15);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [stylePreset, setStylePreset] = useState<StylePreset>('auto');

  // Brand Kit (defaults to empty/generic, not hardcoded Diwali)
  const [brandName, setBrandName] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState<string>('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState<string>('#8B5CF6');
  const [tagline, setTagline] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showBrandKit, setShowBrandKit] = useState<boolean>(false);

  // Sync prompt whenever initialPrompt changes
  React.useEffect(() => {
    if (initialPrompt !== undefined) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        prompt,
        duration,
        aspectRatio,
        stylePreset,
        brandKit: {
          name: brandName,
          primaryColor,
          secondaryColor,
          accentColor: '#FEF08A',
          tagline,
          fontFamily: stylePreset === 'festive' ? 'serif' : 'sans'
        }
      });
      onClose();
    } catch (err) {
      console.error('Failed to plan project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-2.5 sm:p-6 overscroll-contain flex flex-col justify-start sm:justify-center items-center">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[92dvh] sm:max-h-[88dvh] overflow-hidden">
        {/* Sticky Header with prominent, tap-friendly X button */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Create New Video Project</h2>
              <p className="text-[11px] text-slate-400">Natural-language prompt-to-video creative director</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-6">
          {/* Prompt Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Creative Concept Prompt</span>
              <span className="text-[11px] text-amber-400">Natural language planning</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 15-second high-energy fitness motivation reel with bold kinetic typography, glowing orange accents, and explosive beat transitions..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-600 transition-all resize-none"
              required
            />
          </div>

          {/* Format & Duration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>9:16 Reel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>16:9 Wide</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-all ${
                    aspectRatio === '1:1'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Square className="w-4 h-4" />
                  <span>1:1 Square</span>
                </button>
              </div>
            </div>

            {/* Target Duration */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">Target Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-all ${
                      duration === d
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{d} Seconds</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Preset Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Motion Graphics Style</label>
              <span className="text-[11px] text-amber-400 font-medium">
                {stylePreset === 'auto' ? 'Auto-adapts color & vibe to your prompt' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'auto', label: '✦ Auto / AI Directed', icon: Sparkles },
                { id: 'vibrant_colors', label: 'Vibrant Colors (Holi)', icon: Palette },
                { id: 'festive', label: 'Festive Gold (Diwali)', icon: Flame },
                { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: Sparkles },
                { id: 'corporate', label: 'Corporate Clean', icon: Layers },
                { id: 'luxury_gold', label: 'Golden Sheen', icon: Palette }
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStylePreset(s.id as StylePreset)}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-medium transition-all ${
                      stylePreset === s.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Brand Kit */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-3">
            <button
              type="button"
              onClick={() => setShowBrandKit(!showBrandKit)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-300"
            >
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Brand Kit & Colors (Optional)</span>
              </div>
              <span className="text-amber-400 text-xs">{showBrandKit ? 'Collapse' : 'Customize'}</span>
            </button>

            {showBrandKit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-slate-400">Brand / Client Name</label>
                    <button
                      type="button"
                      onClick={() => {
                        setBrandName('Sukh Graphix');
                        setTagline('Illuminating Creative Excellence');
                        setPrimaryColor('#F59E0B');
                        setSecondaryColor('#B45309');
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                    >
                      Fill Sukh Graphix
                    </button>
                  </div>
                  <input
                    type="text"
                    value={brandName}
                    placeholder="e.g. Acme Studio (Leave empty for generic celebration)"
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600"
                  />
                  <p className="text-[10px] text-slate-500">
                    Leave blank to auto-derive festive titles (e.g. "Happy Holi").
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Tagline / Motto</label>
                  <input
                    type="text"
                    value={tagline}
                    placeholder="e.g. Elevate Your Creative Vision"
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-slate-300">{primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Secondary Accent</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-slate-300">{secondaryColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Planning Storyboard...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Generate Storyboard</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
