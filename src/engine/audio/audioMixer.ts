export interface AudioMixerOptions {
  musicVolume?: number;
  voiceVolume?: number;
  duckingAmount?: number; // volume multiplier when voiceover speaks (e.g. 0.25)
}

export class AudioMixer {
  private audioCtx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private voiceGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private musicElement: HTMLAudioElement | null = null;
  private musicSourceNode: MediaElementAudioSourceNode | null = null;

  private options: Required<AudioMixerOptions> = {
    musicVolume: 0.35,
    voiceVolume: 1.0,
    duckingAmount: 0.2
  };

  constructor(options: AudioMixerOptions = {}) {
    this.options = { ...this.options, ...options };
  }

  // Initialize AudioContext on user interaction
  ensureContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      this.masterGainNode = this.audioCtx.createGain();
      this.musicGainNode = this.audioCtx.createGain();
      this.voiceGainNode = this.audioCtx.createGain();
      this.destinationNode = this.audioCtx.createMediaStreamDestination();

      this.musicGainNode.gain.value = this.options.musicVolume;
      this.voiceGainNode.gain.value = this.options.voiceVolume;

      this.musicGainNode.connect(this.masterGainNode);
      this.voiceGainNode.connect(this.masterGainNode);

      this.masterGainNode.connect(this.audioCtx.destination);
      this.masterGainNode.connect(this.destinationNode);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  getDestinationStream(): MediaStream | null {
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  // Background Music Controls
  loadMusic(url: string): void {
    this.ensureContext();
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.src = '';
    }
    this.musicElement = new Audio();
    this.musicElement.crossOrigin = 'anonymous';
    this.musicElement.src = url;
    this.musicElement.loop = true;

    if (this.audioCtx && this.musicGainNode) {
      this.musicSourceNode = this.audioCtx.createMediaElementSource(this.musicElement);
      this.musicSourceNode.connect(this.musicGainNode);
    }
  }

  playMusic(): void {
    if (this.musicElement) {
      this.ensureContext();
      this.musicElement.play().catch(e => console.warn('Music play delayed until user interaction:', e));
    }
  }

  pauseMusic(): void {
    if (this.musicElement) {
      this.musicElement.pause();
    }
  }

  stopMusic(): void {
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.currentTime = 0;
    }
  }

  // Audio Ducking: smooth volume dip during voiceover speech
  applyDucking(isSpeaking: boolean): void {
    if (!this.audioCtx || !this.musicGainNode) return;
    const now = this.audioCtx.currentTime;
    const targetVol = isSpeaking
      ? this.options.musicVolume * this.options.duckingAmount
      : this.options.musicVolume;

    this.musicGainNode.gain.cancelScheduledValues(now);
    this.musicGainNode.gain.linearRampToValueAtTime(targetVol, now + 0.15);
  }

  setVolumes(musicVol: number, voiceVol: number): void {
    this.options.musicVolume = musicVol;
    this.options.voiceVolume = voiceVol;
    if (this.musicGainNode && this.audioCtx) {
      this.musicGainNode.gain.setValueAtTime(musicVol, this.audioCtx.currentTime);
    }
    if (this.voiceGainNode && this.audioCtx) {
      this.voiceGainNode.gain.setValueAtTime(voiceVol, this.audioCtx.currentTime);
    }
  }

  close(): void {
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
