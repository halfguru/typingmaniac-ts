const SETTINGS_KEY = 'typingmaniac_audiosettings';

interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
}

interface SoundConfig {
  rate?: number;
  volume?: number;
}

class AudioServiceImpl {
  private settings: AudioSettings = {
    masterVolume: 1,
    sfxVolume: 0.7,
    musicVolume: 0.5,
    muted: false,
  };

  private audioContext: AudioContext | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch {
      // Use defaults
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore storage errors
    }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  setMasterVolume(volume: number) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setSfxVolume(volume: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setMusicVolume(volume: number) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  toggleMute(): boolean {
    this.settings.muted = !this.settings.muted;
    this.saveSettings();
    return this.settings.muted;
  }

  setMuted(muted: boolean) {
    this.settings.muted = muted;
    this.saveSettings();
  }

  private getEffectiveVolume(type: 'sfx' | 'music'): number {
    if (this.settings.muted) return 0;
    const typeVolume = type === 'sfx' ? this.settings.sfxVolume : this.settings.musicVolume;
    return this.settings.masterVolume * typeVolume;
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', config: SoundConfig = {}) {
    if (this.settings.muted) return;

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      const volume = (config.volume ?? 1) * this.getEffectiveVolume('sfx');
      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }

  private playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine') {
    if (this.settings.muted) return;

    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, duration, type), i * 30);
    });
  }

  playKeypress() {
    this.playTone(800 + Math.random() * 200, 0.05, 'sine', { volume: 0.3 });
  }

  playTypingError() {
    this.playTone(200, 0.15, 'sawtooth', { volume: 0.35 });
    setTimeout(() => this.playTone(160, 0.1, 'sawtooth', { volume: 0.25 }), 40);
  }

  playWordComplete() {
    this.playChord([523, 659, 784], 0.15, 'sine');
  }

  playWordMissed() {
    this.playTone(200, 0.2, 'sawtooth', { volume: 0.4 });
    setTimeout(() => this.playTone(150, 0.15, 'sawtooth', { volume: 0.3 }), 50);
  }

  playPowerActivate(power: 'fire' | 'ice' | 'wind' | 'slow') {
    const sounds: Record<string, () => void> = {
      fire: () => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => this.playTone(300 + i * 100, 0.1, 'sawtooth', { volume: 0.4 }), i * 30);
        }
      },
      ice: () => {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => this.playTone(1200 - i * 150, 0.2, 'sine', { volume: 0.3 }), i * 40);
        }
      },
      wind: () => {
        for (let i = 0; i < 6; i++) {
          setTimeout(() => this.playTone(400 + Math.sin(i) * 200, 0.15, 'triangle', { volume: 0.25 }), i * 25);
        }
      },
      slow: () => {
        this.playTone(600, 0.3, 'sine', { volume: 0.3 });
        setTimeout(() => this.playTone(400, 0.4, 'sine', { volume: 0.25 }), 100);
      },
    };
    sounds[power]?.();
  }

  playLevelComplete() {
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine', { volume: 0.4 });
        this.playTone(freq * 1.5, 0.25, 'triangle', { volume: 0.2 });
      }, i * 150);
    });
  }

  playGameOver() {
    const notes = [392, 349, 330, 262];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.4, 'sawtooth', { volume: 0.35 }), i * 200);
    });
  }

  playCombo(comboLevel: number) {
    const frequencies = [440, 494, 523, 587];
    const freq = frequencies[Math.min(comboLevel, frequencies.length - 1)];
    this.playTone(freq, 0.12, 'sine', { volume: 0.35 });
    this.playTone(freq * 1.5, 0.1, 'triangle', { volume: 0.2 });
  }

  playButtonClick() {
    this.playTone(600, 0.08, 'sine', { volume: 0.4 });
  }

  playCountdown() {
    this.playTone(440, 0.15, 'sine', { volume: 0.4 });
  }

  playGo() {
    this.playChord([523, 659, 784], 0.3, 'sine');
  }

  startMusic() {
    // Background music disabled
  }

  stopMusic() {
    // Background music disabled
  }
}

export const audioService = new AudioServiceImpl();
