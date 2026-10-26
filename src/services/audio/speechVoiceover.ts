export interface VoiceOption {
  name: string;
  lang: string;
  default: boolean;
  voiceURI: string;
}

export interface VoiceoverConfig {
  enabled: boolean;
  voiceURI?: string;
  rate: number;
  pitch: number;
  volume: number;
}

export class SpeechVoiceoverService {
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.refreshVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => this.refreshVoices();
    }
  }

  private refreshVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  getAvailableVoices(): VoiceOption[] {
    this.refreshVoices();
    return this.voices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      voiceURI: v.voiceURI
    }));
  }

  speak(
    text: string,
    config: VoiceoverConfig,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!config.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.rate || 1.0;
    utterance.pitch = config.pitch || 1.0;
    utterance.volume = config.volume ?? 1.0;

    if (config.voiceURI) {
      const match = this.voices.find(v => v.voiceURI === config.voiceURI);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };
    utterance.onerror = (e) => {
      this.currentUtterance = null;
      onError?.(e);
      onEnd?.();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}

// Generate FFmpeg Audio Mixing & Video Encoding Command
export function generateFFmpegRenderCommand(options: {
  videoInput: string;
  audioInput?: string;
  voiceInput?: string;
  outputFile: string;
  resolution: { width: number; height: number };
  fps?: number;
}): string {
  const fps = options.fps || 60;
  const { width, height } = options.resolution;

  if (options.audioInput && options.voiceInput) {
    return `ffmpeg -y -i "${options.videoInput}" -i "${options.audioInput}" -i "${options.voiceInput}" \\
  -filter_complex "[1:a]volume=0.3[music];[2:a]volume=1.0[voice];[music][voice]amix=inputs=2:duration=first[aout]" \\
  -map 0:v -map "[aout]" \\
  -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r ${fps} -vf "scale=${width}:${height}" \\
  -c:a aac -b:a 192k "${options.outputFile}"`;
  }

  if (options.audioInput) {
    return `ffmpeg -y -i "${options.videoInput}" -i "${options.audioInput}" \\
  -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r ${fps} -vf "scale=${width}:${height}" \\
  -c:a aac -b:a 192k -shortest "${options.outputFile}"`;
  }

  return `ffmpeg -y -i "${options.videoInput}" \\
  -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r ${fps} -vf "scale=${width}:${height}" \\
  -c:a aac -b:a 192k "${options.outputFile}"`;
}
