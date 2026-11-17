// Web Audio API Audio Synthesizer for TickTick Clone
// Native audio generation without external sound assets!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isAmbientPlaying: boolean = false;
  private currentAmbientType: string = 'none';

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play crisp completion chime (ding!)
  playCompleteChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // High pitch double note (E6 -> B6)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.51, now); // E6
      osc1.frequency.exponentialRampToValueAtTime(1975.53, now + 0.08); // B6

      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  // Play Pomodoro Timer Finish bell
  playTimerFinishBell() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.8);
      });
    } catch {
      // Audio fallback
    }
  }

  // Play or Stop Ambient Background Noise
  playAmbientSound(type: 'none' | 'rain' | 'forest' | 'waves' | 'cafe' | 'whitenoise') {
    this.stopAmbientSound();
    if (type === 'none') return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      this.currentAmbientType = type;
      this.isAmbientPlaying = true;
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink noise / brown noise algorithm for natural rain & ocean sound
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain' || type === 'waves') {
          // Brown noise spectrum
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else {
          // White noise
          output[i] = white * 0.1;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for ambient acoustics
      const filter = this.ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
      } else if (type === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 1.0;
      } else if (type === 'forest') {
        filter.type = 'highpass';
        filter.frequency.value = 1200;
      } else if (type === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.value = 800;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 3000;
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      this.noiseNode = whiteNoise;
      this.ambientGain = gain;
    } catch {
      // Audio fallback
    }
  }

  stopAmbientSound() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {
        // ignore
      }
      this.ambientOsc = null;
    }
    this.isAmbientPlaying = false;
    this.currentAmbientType = 'none';
  }
}

export const soundEngine = new SoundEngine();
