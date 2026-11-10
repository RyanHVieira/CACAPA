// Sound & Music Engine (1:1 with prototype CAÇAPA and authentic Caçapa ASMR vibe)
// Includes procedural 8-bar Caçapa-style lo-fi jazz swing music loop using Web Audio API

export class SoundManager {
  private static instance: SoundManager | null = null;
  private static autoInitRegistered: boolean = false;

  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public soundVolume: number = 0.6;
  public musicVolume: number = 0.45;

  // Web Audio nodes for ASMR synthesis & reverb
  private noiseBuffer: AudioBuffer | null = null;
  private masterBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private lfoGain: GainNode | null = null;

  // Music loop state
  private musicIntervalId: ReturnType<typeof setInterval> | null = null;
  private mStep: number = 0;
  private mT0: number = 0;

  // 8-bar Caçapa Jazz Swing Progression (Rhodes Piano, Bass, Wobble Synth, Lo-fi Hat)
  private readonly BPM = 88;
  private readonly SW = 0.64; // Swing ratio
  private readonly BEAT = 60 / this.BPM;

  // Chords: [Root, [voicing], 5th]
  private readonly CHORDS: [number, number[], number][] = [
    [48, [51, 55, 58, 62], 7],  // Cmin7
    [53, [57, 60, 63, 67], 7],  // Fmin7
    [46, [62, 65, 69, 72], 7],  // Bb7
    [51, [55, 58, 62, 65], 7],  // Ebmaj7
    [57, [57, 60, 63, 67], 6],  // Abmaj7
    [50, [54, 57, 60, 63], 7],  // Dm7b5
    [55, [58, 62, 65, 69], 7],  // G7
    [55, [59, 62, 65, 68], 7],  // G7alt
  ];

  // Lead melody notes: [step, midi, lengthInBeats]
  private readonly MELODY: [number, number, number][] = [
    [0, 67, 3], [3, 70, 1], [4, 72, 2], [6, 70, 2],
    [8, 69, 3], [11, 67, 1], [12, 65, 4],
    [16, 74, 3], [19, 72, 1], [20, 70, 2], [22, 69, 2], [24, 67, 4],
    [28, 70, 2], [30, 67, 2],
    [32, 72, 3], [35, 70, 1], [36, 69, 2], [38, 67, 2],
    [40, 66, 3], [43, 69, 1], [44, 72, 4],
    [48, 74, 3], [51, 72, 1], [52, 70, 2], [54, 67, 2],
    [56, 68, 3], [59, 67, 1], [60, 71, 2], [62, 72, 2],
  ];

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  constructor() {
    if (SoundManager.instance) {
      return SoundManager.instance;
    }
    SoundManager.instance = this;

    // Start music on first user click anywhere in the window
    if (!SoundManager.autoInitRegistered) {
      SoundManager.autoInitRegistered = true;
      const autoInit = () => {
        this.initContext();
        if (this.musicEnabled) {
          this.startMusic();
        }
        window.removeEventListener('pointerdown', autoInit);
        window.removeEventListener('keydown', autoInit);
      };
      window.addEventListener('pointerdown', autoInit, { once: true });
      window.addEventListener('keydown', autoInit, { once: true });
    }
  }

  public initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      const n = this.ctx.sampleRate;

      // 1. Synthesize 2 seconds of pink/white tape noise buffer
      this.noiseBuffer = this.ctx.createBuffer(1, n * 2, n);
      const nd = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < nd.length; i++) {
        nd[i] = Math.random() * 2 - 1;
      }

      // 2. Master dynamics compressor to keep audio warm, fat, and unclipped
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 3;
      comp.connect(this.ctx.destination);

      // 3. Master SFX bus
      this.masterBus = this.ctx.createGain();
      this.masterBus.gain.value = this.soundEnabled ? this.soundVolume : 0;
      this.masterBus.connect(comp);

      // 4. Music bus with separate gain control
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicEnabled ? this.musicVolume : 0;
      this.musicBus.connect(comp);

      // 5. Convolution Hall Reverb for lush spatial room reflection
      const ir = this.ctx.createBuffer(2, Math.floor(n * 1.3), n);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c);
        let lp = 0;
        for (let i = 0; i < d.length; i++) {
          lp += (Math.random() * 2 - 1 - lp) * 0.3;
          d[i] = lp * Math.pow(1 - i / d.length, 3);
        }
      }
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = ir;
      const reverbGain = this.ctx.createGain();
      reverbGain.gain.value = 0.35;
      this.reverbNode.connect(reverbGain);
      reverbGain.connect(this.masterBus);

      // 6. LFO Vibrato for wobble synth lead
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.37;
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.value = 13;
      lfo.connect(this.lfoGain);
      lfo.start();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean): boolean {
    this.soundEnabled = enabled;
    if (this.masterBus && this.ctx) {
      try {
        this.masterBus.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterBus.gain.setValueAtTime(this.soundEnabled ? this.soundVolume : 0, this.ctx.currentTime);
      } catch {
        this.masterBus.gain.value = this.soundEnabled ? this.soundVolume : 0;
      }
    }
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    return this.setSoundEnabled(!this.soundEnabled);
  }

  public setMusicEnabled(enabled: boolean): boolean {
    this.musicEnabled = enabled;
    if (this.musicBus && this.ctx) {
      try {
        this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicBus.gain.setValueAtTime(this.musicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
      } catch {
        this.musicBus.gain.value = this.musicEnabled ? this.musicVolume : 0;
      }
    }
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  public toggleMusic(): boolean {
    return this.setMusicEnabled(!this.musicEnabled);
  }

  // --- PROCEDURAL CAÇAPA JAZZ ENGINE ---
  private midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private relTime(s: number): number {
    return (s >> 1) * this.BEAT + (s & 1) * this.BEAT * this.SW;
  }

  public startMusic(): void {
    if (!this.musicEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    if (this.musicIntervalId) return; // Already running, never duplicate!

    if (this.musicBus) {
      try {
        this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
        this.musicBus.gain.setValueAtTime(this.musicVolume, ctx.currentTime);
      } catch {
        this.musicBus.gain.value = this.musicVolume;
      }
    }

    this.mT0 = ctx.currentTime + 0.15;
    this.mStep = 0;

    const tick = () => {
      if (!this.musicEnabled) {
        this.stopMusic();
        return;
      }
      if (!this.ctx || this.ctx.state !== 'running') return;
      if (this.mT0 + this.relTime(this.mStep) < this.ctx.currentTime - 0.05) {
        this.mT0 = this.ctx.currentTime + 0.1 - this.relTime(this.mStep);
      }
      while (this.mT0 + this.relTime(this.mStep) < this.ctx.currentTime + 0.35) {
        this.scheduleMusicStep(this.mStep);
        this.mStep++;
      }
    };

    this.musicIntervalId = setInterval(tick, 40);
  }

  public stopMusic(): void {
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    if (this.musicBus && this.ctx) {
      try {
        this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicBus.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {
        this.musicBus.gain.value = 0;
      }
    }
  }

  private scheduleMusicStep(s: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;

    const p = s % 64;
    const bar = p >> 3;
    const q = p & 7;
    const dl = this.mT0 + this.relTime(s) - ctx.currentTime;
    if (dl < 0) return;

    const [root, chordNotes, fifth] = this.CHORDS[bar];
    const nextRoot = this.CHORDS[(bar + 1) % 8][0];

    // 1. Walking Bass (soft acoustic triangle wave)
    if (!(q & 1)) {
      const bassNote = q === 2 ? root + fifth : q === 6 ? (nextRoot > root ? nextRoot - 1 : nextRoot + 1) : root;
      this.playSynthTone(this.midiToFreq(bassNote), this.BEAT * 0.9, 0.08, {
        dl,
        type: 'triangle',
        attack: 0.01,
        bus: this.musicBus,
      });
    }

    // 2. Rhodes / Electric Piano Chords (calm warm swell)
    if (q === 0 || q === 3) {
      for (const n of chordNotes) {
        this.playSynthTone(this.midiToFreq(n), q ? this.BEAT * 0.8 : this.BEAT * 1.9, 0.014, {
          dl,
          type: 'triangle',
          attack: 0.008,
          reverb: 0.3,
          bus: this.musicBus,
        });
      }
    }

    // Sustained ambient chord pad
    if (q === 0) {
      for (const n of chordNotes) {
        this.playSynthTone(this.midiToFreq(n), this.BEAT * 7.5, 0.008, {
          dl,
          attack: 0.7,
          reverb: 0.5,
          bus: this.musicBus,
        });
      }
    }

    // 3. Kick & Snare brushes
    if (q === 0 || q === 5) {
      this.playSynthTone(125, 0.22, 0.09, { dl, bus: this.musicBus, attack: 0.002, glide: 0.36 });
    }
    if (q === 2 || q === 6) {
      this.playSynthNoise(0.14, 0.04, 1900, 0.8, { dl, bus: this.musicBus, attack: 0.002, reverb: 0.25 });
    }

    // 4. Soft lo-fi closed hi-hat
    this.playSynthNoise(0.03, q & 1 ? 0.016 : 0.009, 7500, 1.2, {
      dl,
      bus: this.musicBus,
      attack: 0.001,
      type: 'highpass',
    });

    // 5. Wobble Synth Lead
    if ((s >> 6) % 2 === 0 || bar >= 4) {
      for (const e of this.MELODY) {
        if (e[0] === p) {
          const d = e[2] * this.BEAT * 0.5 + 0.2;
          this.playSynthTone(this.midiToFreq(e[1]), d, 0.026, {
            dl,
            type: 'triangle',
            attack: 0.03,
            reverb: 0.45,
            bus: this.musicBus,
            lfo: true,
          });
          this.playSynthTone(this.midiToFreq(e[1]), d, 0.01, {
            dl,
            attack: 0.03,
            bus: this.musicBus,
          });
        }
      }
    }
  }

  // --- SOUND EFFECTS (ASMR BALLS, CLACKS, REVERB) ---
  private playSynthTone(
    freq: number,
    dur: number,
    vol: number,
    opts: {
      dl?: number;
      type?: OscillatorType;
      attack?: number;
      glide?: number;
      reverb?: number;
      bus?: GainNode;
      lfo?: boolean;
    } = {}
  ): void {
    if (
      !Number.isFinite(freq) ||
      !Number.isFinite(dur) ||
      !Number.isFinite(vol) ||
      freq <= 0 ||
      dur <= 0
    ) {
      return;
    }

    const ctx = this.initContext();
    if (!ctx) return;

    const delay = Number.isFinite(opts.dl) ? Math.max(0, opts.dl!) : 0;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = opts.type || 'sine';
    const safeFreq = Math.max(20, Math.min(22000, freq));
    osc.frequency.setValueAtTime(safeFreq, t);

    if (opts.glide && Number.isFinite(opts.glide) && opts.glide > 0) {
      const targetFreq = Math.max(20, Math.min(22000, safeFreq * opts.glide));
      osc.frequency.exponentialRampToValueAtTime(targetFreq, t + dur);
    }

    const safeVol = Math.max(0.0001, Math.min(1.0, vol));
    const attack = Number.isFinite(opts.attack) ? Math.max(0.001, opts.attack!) : 0.006;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(safeVol, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(env);
    if (opts.lfo && this.lfoGain) {
      this.lfoGain.connect(osc.detune);
    }

    env.connect(opts.bus || this.masterBus || ctx.destination);
    if (opts.reverb && this.reverbNode && Number.isFinite(opts.reverb)) {
      const rGain = ctx.createGain();
      rGain.gain.value = Math.max(0, Math.min(1.0, opts.reverb));
      env.connect(rGain);
      rGain.connect(this.reverbNode);
    }

    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private playSynthNoise(
    dur: number,
    vol: number,
    freq: number,
    q: number,
    opts: {
      dl?: number;
      type?: BiquadFilterType;
      attack?: number;
      glide?: number;
      reverb?: number;
      bus?: GainNode;
    } = {}
  ): void {
    if (
      !Number.isFinite(freq) ||
      !Number.isFinite(dur) ||
      !Number.isFinite(vol) ||
      freq <= 0 ||
      dur <= 0
    ) {
      return;
    }

    const ctx = this.initContext();
    if (!ctx || !this.noiseBuffer) return;

    const delay = Number.isFinite(opts.dl) ? Math.max(0, opts.dl!) : 0;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    src.buffer = this.noiseBuffer;
    filter.type = opts.type || 'bandpass';
    filter.Q.value = Number.isFinite(q) ? Math.max(0.1, q) : 1;
    const safeFreq = Math.max(20, Math.min(22000, freq));
    filter.frequency.setValueAtTime(safeFreq, t);

    if (opts.glide && Number.isFinite(opts.glide) && opts.glide > 0) {
      const targetFreq = Math.max(40, Math.min(22000, safeFreq * opts.glide));
      filter.frequency.exponentialRampToValueAtTime(targetFreq, t + dur);
    }

    const safeVol = Math.max(0.0001, Math.min(1.0, vol));
    const attack = Number.isFinite(opts.attack) ? Math.max(0.001, opts.attack!) : 0.004;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(safeVol, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(filter);
    filter.connect(env);
    env.connect(opts.bus || this.masterBus || ctx.destination);

    if (opts.reverb && this.reverbNode && Number.isFinite(opts.reverb)) {
      const rGain = ctx.createGain();
      rGain.gain.value = Math.max(0, Math.min(1.0, opts.reverb));
      env.connect(rGain);
      rGain.connect(this.reverbNode);
    }

    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  // --- GAMEPLAY SOUNDS ---
  playCueHit(power: number = 0.5): void {
    if (!this.soundEnabled) return;
    this.playSynthTone(900, 0.05, 0.09, { attack: 0.002, glide: 0.7 });
    this.playSynthNoise(0.04, 0.1 + 0.1 * power, 2200, 1.0, { attack: 0.001 });
    this.playSynthTone(165, 0.18, 0.12 + 0.16 * power, { attack: 0.004, glide: 0.65, reverb: 0.2 });
  }

  playBallHit(speed: number): void {
    if (!this.soundEnabled) return;
    const safeSpeed = Number.isFinite(speed) ? Math.max(0, speed) : 2.5;
    const v = Math.min(1.0, Math.max(0.1, safeSpeed / 5));
    const f = 1180 + (Math.random() - 0.5) * 140 + v * 260;

    this.playSynthTone(f, 0.1, 0.05 + 0.17 * v, { attack: 0.0025, glide: 0.82, reverb: 0.3 });
    this.playSynthTone(f * 2.3, 0.04, 0.03 * v, { attack: 0.0015 });
    this.playSynthTone(200 + v * 40, 0.14, 0.05 + 0.1 * v, { attack: 0.004, glide: 0.7 });
    this.playSynthNoise(0.025, 0.03 + 0.07 * v, 2800, 1.0, { attack: 0.0015 });
  }

  playCushionBounce(speed: number): void {
    if (!this.soundEnabled) return;
    const safeSpeed = Number.isFinite(speed) ? Math.max(0, speed) : 2.5;
    const v = Math.min(1.0, Math.max(0.1, safeSpeed / 5));
    this.playSynthNoise(0.14, 0.05 + 0.14 * v, 380, 0.7, { attack: 0.004, type: 'lowpass', glide: 0.55, reverb: 0.15 });
    this.playSynthTone(105, 0.18, 0.06 + 0.18 * v, { attack: 0.005, glide: 0.6 });
  }

  playPocket(comboCount: number = 1): void {
    if (!this.soundEnabled) return;
    // ASMR pocket drop
    this.playSynthNoise(0.3, 0.2, 480, 0.7, { attack: 0.012, type: 'lowpass', glide: 0.45, reverb: 0.25 });
    this.playSynthTone(170, 0.25, 0.22, { attack: 0.008, glide: 0.55, reverb: 0.2 });
    this.playSynthNoise(0.55, 0.09, 260, 0.6, { attack: 0.1, type: 'lowpass', glide: 0.5, dl: 0.05 });

    // Harmonic musical chime ascending with combo scale
    const rawCount = Number.isFinite(comboCount) ? comboCount : 1;
    const count = Math.max(1, Math.floor(rawCount));
    const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
    const semitone = scale[Math.min(count - 1, scale.length - 1)] ?? 0;
    const freq = 392 * Math.pow(2, semitone / 12);
    if (Number.isFinite(freq)) {
      this.playSynthTone(freq, 0.7, 0.08, { attack: 0.01, reverb: 0.55 });
      this.playSynthTone(freq * 2, 0.35, 0.025, { attack: 0.006, reverb: 0.4 });
    }
  }

  playFoul(): void {
    if (!this.soundEnabled) return;
    this.playSynthTone(150, 0.55, 0.18, { attack: 0.01, glide: 0.5, reverb: 0.3 });
    this.playSynthNoise(0.4, 0.1, 300, 0.7, { type: 'lowpass', attack: 0.02 });
  }

  playChipCount(): void {
    if (!this.soundEnabled) return;
    [0, 0.055, 0.1].forEach((dl, i) => {
      this.playSynthTone(2200 + i * 240, 0.14, 0.045, { attack: 0.001, dl, reverb: 0.35 });
      this.playSynthTone(3400 + i * 180, 0.07, 0.02, { attack: 0.001, dl });
      this.playSynthNoise(0.03, 0.035, 4200, 2.0, { attack: 0.001, dl });
    });
  }

  playScoreImpact(): void {
    if (!this.soundEnabled) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      this.playSynthTone(f, 0.8, 0.07, { attack: 0.012, dl: i * 0.07, reverb: 0.6 });
      this.playSynthTone(f * 2, 0.3, 0.02, { attack: 0.008, dl: i * 0.07, reverb: 0.5 });
    });
  }

  playWin(): void {
    if (!this.soundEnabled) return;
    [392, 494, 587, 784].forEach((f, i) => {
      this.playSynthTone(f, 0.9, 0.08, { attack: 0.015, dl: i * 0.1, reverb: 0.7 });
    });
  }

  playLose(): void {
    if (!this.soundEnabled) return;
    [392, 330, 262].forEach((f, i) => {
      this.playSynthTone(f, 0.7, 0.08, { attack: 0.02, dl: i * 0.2, reverb: 0.5 });
    });
  }

  playChalk(): void {
    if (!this.soundEnabled) return;
    this.playSynthNoise(0.1, 0.05, 2600, 0.7, { attack: 0.03, type: 'bandpass' });
  }

  playBuy(): void {
    if (!this.soundEnabled) return;
    this.playChipCount();
    this.playSynthTone(660, 0.5, 0.06, { attack: 0.01, reverb: 0.5 });
  }

  playTick(n: number): void {
    if (!this.soundEnabled) return;
    const k = Math.min(n, 16);
    this.playSynthTone(520 + k * 34, 0.18, 0.03, { attack: 0.003, reverb: 0.35 });
    this.playSynthTone(1040 + k * 68, 0.08, 0.012, { attack: 0.002 });
  }

  playMultCount(): void {
    if (!this.soundEnabled) return;
    this.playSynthTone(620, 0.12, 0.06, { attack: 0.002, glide: 0.8, reverb: 0.2 });
  }

  playCardTrigger(): void {
    if (!this.soundEnabled) return;
    this.playSynthTone(880, 0.2, 0.07, { attack: 0.005, reverb: 0.4 });
    this.playSynthTone(1320, 0.15, 0.04, { attack: 0.003, dl: 0.03 });
  }

  playCash(): void {
    if (!this.soundEnabled) return;
    this.playChipCount();
  }
}
