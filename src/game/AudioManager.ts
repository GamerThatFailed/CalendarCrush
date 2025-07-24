export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};
  private masterVolume = 0.3;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.createSounds();
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  private async createSounds(): Promise<void> {
    if (!this.audioContext) return;

    // Create synthesized sounds for each game event
    this.sounds['paddle-bounce'] = this.createTone(220, 0.1, 'sine');
    this.sounds['wall-bounce'] = this.createTone(440, 0.1, 'square');
    this.sounds['meeting-hit'] = this.createTone(330, 0.15, 'triangle');
    this.sounds['meeting-cancelled'] = this.createChord([440, 550, 660], 0.3);
    this.sounds['power-up'] = this.createChord([523, 659, 784], 0.4);
    this.sounds['life-lost'] = this.createTone(110, 0.8, 'sawtooth');
    this.sounds['level-complete'] = this.createMelody([523, 659, 784, 1047], 0.2);
    this.sounds['game-over'] = this.createTone(138, 1.0, 'triangle');
  }

  private createTone(frequency: number, duration: number, type: OscillatorType): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(0.5 + t * frequency));
          break;
      }

      // Apply envelope
      const envelope = Math.exp(-t * 3);
      data[i] = sample * envelope * 0.3;
    }

    return buffer;
  }

  private createChord(frequencies: number[], duration: number): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      frequencies.forEach(freq => {
        sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
      });

      const envelope = Math.exp(-t * 2);
      data[i] = sample * envelope * 0.3;
    }

    return buffer;
  }

  private createMelody(frequencies: number[], noteDuration: number): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const totalDuration = frequencies.length * noteDuration;
    const length = sampleRate * totalDuration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    frequencies.forEach((freq, noteIndex) => {
      const noteStart = noteIndex * noteDuration;
      const noteLength = noteDuration * sampleRate;

      for (let i = 0; i < noteLength; i++) {
        const t = i / sampleRate;
        const globalIndex = noteIndex * noteLength + i;
        
        if (globalIndex < length) {
          const sample = Math.sin(2 * Math.PI * freq * t);
          const envelope = Math.exp(-t * 4);
          data[globalIndex] = sample * envelope * 0.2;
        }
      }
    });

    return buffer;
  }

  public async playSound(soundName: string): Promise<void> {
    if (!this.audioContext || !this.sounds[soundName]) return;

    try {
      // Resume context if suspended (required for some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds[soundName];
      gainNode.gain.value = this.masterVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}