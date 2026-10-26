import { SceneItem, CharacterAction, CharacterExpression, CharacterPose } from '../types/timeline';
import { PhysicsEngine } from './physicsEngine';
import { CharacterRenderer } from './characterRenderer';
import { CodeRenderer } from './codeRenderer';

export interface RenderLoopCallbacks {
  onLog: (message: string) => void;
  onSceneChange: (sceneIndex: number, total: number) => void;
  onFinished: (downloadUrl?: string) => void;
}

export class AnimationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private physics: PhysicsEngine;
  private character: CharacterRenderer;
  private codeRenderer: CodeRenderer;

  private timeline: SceneItem[] = [];
  private currentSceneIndex = 0;
  private sceneStartTime = 0;
  private animFrameId: number | null = null;
  private isRunning = false;
  private isRecording = false;

  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  private isSpeaking = false;
  private callbacks: RenderLoopCallbacks;
  
  // Voice Settings
  private isVoiceoverEnabled = true;
  private selectedVoiceIndex: number | null = null;
  private voiceRate = 1.0;
  private voicePitch = 1.0;

  constructor(canvas: HTMLCanvasElement, callbacks: RenderLoopCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not retrieve 2D canvas context');
    this.ctx = context;
    this.physics = new PhysicsEngine();
    this.character = new CharacterRenderer();
    this.codeRenderer = new CodeRenderer();
    this.callbacks = callbacks;
  }

  public setVoiceSettings(enabled: boolean, voiceIndex: number | null, rate = 1.0, pitch = 1.0) {
    this.isVoiceoverEnabled = enabled;
    this.selectedVoiceIndex = voiceIndex;
    this.voiceRate = rate;
    this.voicePitch = pitch;
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
    this.callbacks.onLog('Playback terminated.');
  }

  public start(timeline: SceneItem[], shouldRecord = false) {
    if (!timeline || timeline.length === 0) {
      this.callbacks.onLog('Warning: Timeline sequence is empty.');
      return;
    }

    this.stop();
    this.timeline = timeline;
    this.currentSceneIndex = 0;
    this.isRunning = true;
    this.isRecording = shouldRecord;
    this.physics.reset();
    this.recordedChunks = [];

    const isVertical = this.canvas.height > this.canvas.width;
    const formatLabel = isVertical ? '9:16 Vertical (Shorts/Reels)' : '16:9 Landscape (HD)';

    this.callbacks.onLog(
      shouldRecord
        ? `🎬 RENDER STARTED: Synthesizing MP4 [${this.canvas.width}x${this.canvas.height} ${formatLabel} 30 FPS]...`
        : `▶ PREVIEW STARTED: [${formatLabel} | Voiceover: ${this.isVoiceoverEnabled ? 'ON' : 'OFF'}]...`
    );

    if (shouldRecord) {
      try {
        const stream = this.canvas.captureStream(30);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }
        }

        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 6500000 // 6.5 Mbps HD
        });

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          // Assembling file without black screen flicker
          const blob = new Blob(this.recordedChunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const formatTag = isVertical ? 'reel-9x16' : 'video-16x9';
          a.download = `auto-anim-${formatTag}-${Date.now()}.mp4`;
          a.click();
          this.callbacks.onLog(`✓ Video successfully rendered: ${a.download}`);
          this.callbacks.onFinished(url);

          // Clean stop after download is triggered
          this.isRunning = false;
          if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
        };

        this.mediaRecorder.start();
      } catch (err: any) {
        this.callbacks.onLog(`MediaRecorder setup error: ${err?.message || err}. Falling back to preview.`);
        this.isRecording = false;
      }
    }

    this.sceneStartTime = performance.now();
    this.playScene(0);
    this.renderLoop();
  }

  private playScene(index: number) {
    if (!this.isRunning) return;
    if (index >= this.timeline.length) {
      this.onSequenceCompleted();
      return;
    }

    this.currentSceneIndex = index;
    this.sceneStartTime = performance.now();
    const scene = this.timeline[index];
    this.callbacks.onSceneChange(index + 1, this.timeline.length);
    this.callbacks.onLog(`Scene [${index + 1}/${this.timeline.length}]: "${scene.label || 'SCENE'}" (Theme: ${scene.visualTheme || 'generative'})`);

    // Voice Synthesis Trigger (Optional)
    if (this.isVoiceoverEnabled && 'speechSynthesis' in window && scene.text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scene.text);
      utterance.rate = this.voiceRate;
      utterance.pitch = this.voicePitch;

      const voices = window.speechSynthesis.getVoices();
      if (this.selectedVoiceIndex !== null && voices[this.selectedVoiceIndex]) {
        utterance.voice = voices[this.selectedVoiceIndex];
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        setTimeout(() => {
          if (this.isRunning) {
            this.playScene(index + 1);
          }
        }, 300);
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        setTimeout(() => {
          if (this.isRunning) {
            this.playScene(index + 1);
          }
        }, Math.max(2600, (scene.text.split(' ').length / 2.2) * 1000));
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Voiceover disabled -> Timer-driven pacing for music-ready video
      this.isSpeaking = true;
      const wordCount = scene.text ? scene.text.split(' ').length : 6;
      const duration = (scene.duration || Math.max(3.2, (wordCount / 2.0))) * 1000;

      setTimeout(() => {
        this.isSpeaking = false;
        if (this.isRunning) {
          this.playScene(index + 1);
        }
      }, duration);
    }
  }

  private onSequenceCompleted() {
    this.isSpeaking = false;

    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Keep canvas rendering final frame to prevent black screen while mediaRecorder flushes
      this.callbacks.onLog('Flushing video stream buffer to MP4 file...');
      this.mediaRecorder.stop();
    } else {
      this.isRunning = false;
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      this.callbacks.onLog('Preview completed.');
      this.callbacks.onFinished();
    }
  }

  private renderLoop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsed = (now - this.sceneStartTime) / 1000;
    const dt = 1 / 60;

    const scene = this.timeline[this.currentSceneIndex] || {
      text: '',
      label: 'READY',
      color: '#38bdf8'
    };

    const isVertical = this.canvas.height > this.canvas.width;
    const action = scene.action || 'idle';
    const expression = scene.expression || 'happy';
    const pose = scene.pose || 'explaining';
    const position = scene.position || (isVertical ? 'center' : 'left');

    // 1. EXECUTE CLAUDE-STYLE AI CODE GENERATED VISUALS (Background + Topic Constructs)
    const executed = this.codeRenderer.render(
      this.ctx,
      scene.visualCode,
      this.canvas.width,
      this.canvas.height,
      elapsed,
      isVertical,
      scene.color || '#38bdf8'
    );

    if (!executed) {
      // Clean fallback background if no code was attached
      this.drawFallbackBackground(scene, elapsed);
    }

    // 2. UPDATE PHYSICS & COMPUTE CHARACTER TRANSFORMS
    this.physics.update(dt);
    const transform = this.physics.computeTransform(
      this.canvas.width,
      this.canvas.height,
      position,
      action,
      elapsed
    );

    // 3. DRAW 2D CARTOON CHARACTER (Teal shirt, thick dark outlines)
    this.character.draw(this.ctx, {
      transform,
      expression,
      pose,
      elapsed,
      isSpeaking: this.isSpeaking,
      accentColor: scene.color || '#38bdf8'
    });

    // 4. DRAW PARTICLES (Impact dust, sparkles)
    this.physics.drawParticles(this.ctx);

    // 5. DRAW KINETIC TYPOGRAPHY & SUBTITLES
    this.drawKineticTypography(scene, elapsed);
    this.drawSubtitleCard(scene);

    // 6. SUBTLE CINEMATIC CORNER ACCENTS
    this.drawFrameOverlay(scene);

    this.animFrameId = requestAnimationFrame(this.renderLoop);
  };

  private drawFallbackBackground(scene: SceneItem, elapsed: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const grad = this.ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#020617');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Subtle ambient grid
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    const spacing = 45;
    const offset = (elapsed * 8) % spacing;
    for (let x = offset; x < w; x += spacing) {
      for (let y = offset; y < h; y += spacing) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    this.ctx.restore();
  }

  private drawKineticTypography(scene: SceneItem, elapsed: number) {
    const text = scene.label || 'KINETIC';
    const accentColor = scene.color || '#38bdf8';
    const isVertical = this.canvas.height > this.canvas.width;
    const centerX = this.canvas.width / 2;
    const topY = isVertical ? 190 : 110;

    this.ctx.save();
    const pop = Math.min(1, elapsed * 3);
    const bounce = 1 + 0.15 * Math.sin(elapsed * 6) * Math.max(0, 1 - elapsed);
    this.ctx.translate(centerX, topY);
    this.ctx.scale(pop * bounce, pop * bounce);

    const fontSize = isVertical ? 48 : 62;
    this.ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const metrics = this.ctx.measureText(text);
    const textW = Math.min(this.canvas.width - 60, metrics.width + 60);
    const textH = isVertical ? 72 : 78;

    // Glowing Pill Background
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    this.ctx.shadowColor = accentColor;
    this.ctx.shadowBlur = 24;
    this.ctx.beginPath();
    this.ctx.roundRect(-textW / 2, -textH / 2, textW, textH, 18);
    this.ctx.fill();

    // Vibrant Accent Outline
    this.ctx.strokeStyle = accentColor;
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    // Kinetic Text
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, 0, 3, textW - 20);

    this.ctx.restore();
  }

  private drawSubtitleCard(scene: SceneItem) {
    if (!scene.text) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const isVertical = h > w;

    const cardW = isVertical ? Math.min(w - 40, 660) : Math.min(w - 120, 1050);
    const cardH = isVertical ? 115 : 80;
    const cardX = (w - cardW) / 2;
    const cardY = isVertical ? h - 165 : h - 110;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(cardX, cardY, cardW, cardH, 18);
    this.ctx.fill();
    this.ctx.stroke();

    // Speaking Indicator Dot
    const dotX = cardX + 28;
    const dotY = cardY + (isVertical ? 32 : cardH / 2);
    if (this.isSpeaking) {
      this.ctx.fillStyle = '#22c55e';
      this.ctx.beginPath();
      this.ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = '600 23px Inter, system-ui, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    const textX = cardX + (this.isSpeaking ? 44 : 26);
    const maxTextW = cardW - 60;

    if (isVertical) {
      const words = scene.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const test = currentLine ? `${currentLine} ${word}` : word;
        if (this.ctx.measureText(test).width > maxTextW) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = test;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = 30;
      const totalH = lines.length * lineHeight;
      const startY = cardY + (cardH - totalH) / 2 + lineHeight / 2;

      for (let i = 0; i < Math.min(lines.length, 3); i++) {
        this.ctx.fillText(lines[i], textX, startY + i * lineHeight);
      }
    } else {
      let displayText = scene.text;
      if (this.ctx.measureText(displayText).width > maxTextW) {
        while (displayText.length > 10 && this.ctx.measureText(displayText + '...').width > maxTextW) {
          displayText = displayText.slice(0, -3);
        }
        displayText += '...';
      }
      this.ctx.fillText(displayText, textX, cardY + cardH / 2);
    }

    this.ctx.restore();
  }

  private drawFrameOverlay(scene: SceneItem) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 12;
    this.ctx.strokeRect(8, 8, w - 16, h - 16);

    const color = scene.color || '#38bdf8';
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    const corner = 30;
    ctxDrawBracket(this.ctx, 22, 22, corner, 1, 1);
    ctxDrawBracket(this.ctx, w - 22, 22, corner, -1, 1);
    ctxDrawBracket(this.ctx, 22, h - 22, corner, 1, -1);
    ctxDrawBracket(this.ctx, w - 22, h - 22, corner, -1, -1);
    this.ctx.restore();
  }
}

function ctxDrawBracket(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, dx: number, dy: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * dy);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size * dx, y);
  ctx.stroke();
}
