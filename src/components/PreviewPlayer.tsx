import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Square,
  CheckCircle2,
  Film
} from 'lucide-react';
import { Project, Scene, RESOLUTIONS } from '../types/creatorStudio';
import { MotionGraphicsEngine, RenderContext } from '../engine/motionGraphics';
import { AudioMixer } from '../engine/audio/audioMixer';
import { SpeechVoiceoverService } from '../services/audio/speechVoiceover';

interface PreviewPlayerProps {
  project: Project;
  onOpenRenderModal: () => void;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  project,
  onOpenRenderModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MotionGraphicsEngine>(new MotionGraphicsEngine());
  const mixerRef = useRef<AudioMixer | null>(null);
  const voiceServiceRef = useRef<SpeechVoiceoverService>(new SpeechVoiceoverService());

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const scenes = project.scenes || [];
  const totalDuration = project.duration || 15;
  const resolution = RESOLUTIONS[project.aspectRatio] || RESOLUTIONS['9:16'];

  // Calculate cumulative scene time boundaries
  const sceneBounds = scenes.map((s, idx) => {
    const start = scenes.slice(0, idx).reduce((acc, cur) => acc + cur.duration, 0);
    return {
      index: idx,
      scene: s,
      start,
      end: start + s.duration
    };
  });

  // Get active scene based on currentTime
  const getActiveSceneInfo = useCallback((time: number) => {
    const bound = sceneBounds.find(b => time >= b.start && time < b.end) || sceneBounds[0];
    const sceneTime = bound ? time - bound.start : 0;
    const sceneProgress = bound ? Math.min(1, sceneTime / bound.scene.duration) : 0;
    return {
      bound,
      sceneTime,
      sceneProgress
    };
  }, [sceneBounds]);

  // Animation draw loop
  const renderFrameAtTime = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { bound, sceneTime, sceneProgress } = getActiveSceneInfo(time);
    if (!bound) return;

    setCurrentSceneIndex(bound.index);

    const rc: RenderContext = {
      ctx,
      width: resolution.width,
      height: resolution.height,
      time: sceneTime,
      progress: sceneProgress,
      scene: bound.scene,
      aspectRatio: project.aspectRatio
    };

    engineRef.current.drawScene(rc);
  }, [getActiveSceneInfo, resolution, project.aspectRatio]);

  // Main playback requestAnimationFrame loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp: number | null = null;

    const loop = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaSec = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      setCurrentTime((prev) => {
        const nextTime = prev + deltaSec;
        if (nextTime >= totalDuration) {
          setIsPlaying(false);
          return 0; // loop or pause at end
        }
        renderFrameAtTime(nextTime);
        return nextTime;
      });

      if (isPlaying) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(loop);
    } else {
      renderFrameAtTime(currentTime);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, totalDuration, renderFrameAtTime]);

  // Render static frame on time or aspect change
  useEffect(() => {
    renderFrameAtTime(currentTime);
  }, [currentTime, resolution, renderFrameAtTime]);

  const togglePlay = () => {
    if (!isPlaying) {
      // Trigger voiceover for active scene if enabled
      const { bound } = getActiveSceneInfo(currentTime);
      if (bound && bound.scene.narration) {
        voiceServiceRef.current.speak(bound.scene.narration, {
          enabled: !isMuted,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0
        });
      }
    } else {
      voiceServiceRef.current.stop();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    voiceServiceRef.current.stop();
    setCurrentTime(0);
    renderFrameAtTime(0);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    renderFrameAtTime(val);
  };

  const activeScene = scenes[currentSceneIndex] || scenes[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Player Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              60 FPS Real-time Engine
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 font-semibold">{project.title}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {activeScene ? `${activeScene.label}: ${activeScene.title}` : 'Video Preview'}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenRenderModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Film className="w-4 h-4 stroke-[2.5]" />
            <span>Export MP4 Video</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Player Container */}
      <div className="flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Aspect Frame Wrapper */}
        <div 
          className="relative rounded-xl overflow-hidden shadow-2xl bg-black border border-slate-800 flex items-center justify-center transition-all"
          style={{
            width: project.aspectRatio === '9:16' ? '360px' : project.aspectRatio === '1:1' ? '460px' : '640px',
            maxWidth: '100%',
            aspectRatio: project.aspectRatio === '9:16' ? '9/16' : project.aspectRatio === '1:1' ? '1/1' : '16/9'
          }}
        >
          <canvas
            ref={canvasRef}
            width={resolution.width}
            height={resolution.height}
            className="w-full h-full object-contain select-none"
          />

          {/* Overlay Aspect Tag */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/20 pointer-events-none">
            {project.aspectRatio}
          </div>
        </div>

        {/* Playback Controls & Scrubber */}
        <div className="w-full max-w-2xl mt-6 space-y-3">
          {/* Timeline Scrubber */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-400 w-12 text-right">
              {currentTime.toFixed(1)}s
            </span>
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.05}
              value={currentTime}
              onChange={handleScrubberChange}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-xs font-mono text-slate-400 w-12">
              {totalDuration.toFixed(1)}s
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                title="Restart"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Scene Indicators */}
            <div className="flex items-center space-x-1.5">
              {scenes.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    const start = scenes.slice(0, idx).reduce((acc, cur) => acc + cur.duration, 0);
                    setCurrentTime(start);
                    renderFrameAtTime(start);
                  }}
                  title={s.title}
                  className={`cursor-pointer px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    idx === currentSceneIndex
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  Scene {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
