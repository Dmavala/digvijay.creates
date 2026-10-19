/**
 * Reel Audio Engine (Web Audio API)
 * High-end brutalist sound design for 3D film reel:
 * - Studio Algorithmic Convolution Reverb (spatial cinema chamber)
 * - Calibrated volume boost for visceral tactile impact
 * - 35mm film projector sprocket ticking / ratchet clicks on scroll
 * - Cinematic pneumatic sub-bass whoosh & optical lens latch on zoom in
 * - Analog air release flutter & detent release on zoom out
 */

class ReelAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxBus: GainNode | null = null;
  private dryOnlyBus: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private lastTickTime = 0;
  private lastWhooshTime = 0;

  private createReverbImpulse(ctx: AudioContext, duration = 1.6, decay = 2.6): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    // Discrete early reflection taps for architectural room acoustics
    const earlyTaps = [
      { time: 0.014, gainL: 0.38, gainR: 0.22 },
      { time: 0.027, gainL: 0.26, gainR: 0.35 },
      { time: 0.045, gainL: 0.22, gainR: 0.19 },
      { time: 0.068, gainL: 0.16, gainR: 0.15 },
    ];

    for (const tap of earlyTaps) {
      const idx = Math.floor(tap.time * sampleRate);
      if (idx < length) {
        left[idx] += tap.gainL;
        right[idx] += tap.gainR;
      }
    }

    // Late diffuse reverberant field with stereo decorrelation
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-decay * t);
      left[i] += (Math.random() * 2 - 1) * envelope * 0.45;
      right[i] += (Math.random() * 2 - 1) * envelope * 0.45;
    }

    // High-frequency absorption (air damping filter)
    let lastL = 0;
    let lastR = 0;
    const alpha = 0.20;
    for (let i = 0; i < length; i++) {
      lastL = lastL + alpha * (left[i] - lastL);
      lastR = lastR + alpha * (right[i] - lastR);
      left[i] = lastL;
      right[i] = lastR;
    }

    return impulse;
  }

  private init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();

      // SFX Bus (generators with spatial reverb plug in here: clicks, zoom latch/boom)
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // Dedicated Dry-Only Bus (100% DRY path: NO reverb convolver, zero wash/tail)
      this.dryOnlyBus = this.ctx.createGain();
      this.dryOnlyBus.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // Dry Path for Reverb Bus: Direct punchy transient sound
      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.setValueAtTime(1.25, this.ctx.currentTime);

      // Wet Path: Lush spatial convolution reverb
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createReverbImpulse(this.ctx, 1.6, 2.6);

      this.wetGain = this.ctx.createGain();
      this.wetGain.gain.setValueAtTime(0.46, this.ctx.currentTime); // Atmospheric reverb tail

      // Studio-grade Dynamics Compressor for warm analog glue and zero digital clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4.5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.08, this.ctx.currentTime);

      // Boosted Master Gain for powerful, present audio
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.45, this.ctx.currentTime);

      // Routing:
      // sfxBus (reverb) -> dryGain --------------> compressor -> masterGain -> destination
      // sfxBus (reverb) -> convolver -> wetGain -> compressor
      // dryOnlyBus (100% DRY, no reverb) --------> compressor
      this.sfxBus.connect(this.dryGain);
      this.dryGain.connect(this.compressor);

      this.sfxBus.connect(this.convolver);
      this.convolver.connect(this.wetGain);
      this.wetGain.connect(this.compressor);

      this.dryOnlyBus.connect(this.compressor);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Precompute 1 second of calibrated pink/white analog noise buffer
      const sampleRate = this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, sampleRate, sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < sampleRate; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.153852;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.18;
      }
      this.noiseBuffer = buffer;
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  public ensure() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Tactile 35mm Sprocket Click:
   * Boosted mechanical click echoing in the convolution reverb space.
   */
  public playSprocketClick(velocity = 1.0) {
    this.ensure();
    if (!this.ctx || !this.sfxBus) return;

    const now = this.ctx.currentTime;
    // Rate limit: max ~38 clicks/second to maintain crisp definition
    if (now - this.lastTickTime < 0.026) return;
    this.lastTickTime = now;

    const vel = Math.min(Math.max(velocity, 0.3), 2.2);
    // Boosted volume level for crisp tactile feedback
    const gainLevel = 0.155 * Math.min(1.4, 0.6 + vel * 0.45);

    try {
      // 1. Transient click (mechanical tooth engagement)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600 + (Math.random() - 0.5) * 450, now);
      filter.Q.setValueAtTime(6.0, now);

      const baseFreq = 540 + (Math.random() - 0.5) * 80;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * 2.8, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.015);

      oscGain.gain.setValueAtTime(gainLevel * 2.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.017);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.sfxBus);

      osc.start(now);
      osc.stop(now + 0.019);

      // 2. Micro noise friction (celluloid rubbing gate)
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(3400 + Math.random() * 500, now);
        noiseFilter.Q.setValueAtTime(3.5, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(gainLevel * 1.1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.013);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxBus);

        noise.start(now);
        noise.stop(now + 0.015);
      }
    } catch {}
  }

  /**
   * Cinematic Scroll Whoosh SFX:
   * Soft, silky aerodynamic air displacement as the 3D film ribbon glides through the air on scroll.
   * Completely DRY (no reverb tail) with warm, gentle low-pass filtering and subtle, non-intrusive volume.
   */
  public playScrollWhoosh(velocity = 1.0) {
    this.ensure();
    if (!this.ctx || !this.dryOnlyBus) return;

    const now = this.ctx.currentTime;
    // Throttle: minimum ~200ms between whooshes for clean, non-cluttered response
    if (now - this.lastWhooshTime < 0.20) return;
    this.lastWhooshTime = now;

    const vel = Math.min(Math.max(velocity, 0.25), 2.2);
    const duration = 0.22 + Math.min(0.10, vel * 0.05);

    try {
      // 1. Soft Air Rush (gentle low-pass noise, 100% dry, NO reverb)
      if (this.noiseBuffer) {
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(0.7, now); // Gentle slope without harsh resonance

        // Keep frequencies warm and soft: sweep gently from 160Hz up to ~550-720Hz max, then fade
        const startFreq = 160;
        const peakFreq = Math.min(720, 360 + vel * 160);
        filter.frequency.setValueAtTime(startFreq, now);
        filter.frequency.exponentialRampToValueAtTime(peakFreq, now + duration * 0.32);
        filter.frequency.exponentialRampToValueAtTime(140, now + duration);

        const gainNode = this.ctx.createGain();
        // Softer volume: subtle air whisper (~75% softer than before)
        const peakGain = Math.min(0.08, 0.028 + vel * 0.022);
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(peakGain, now + duration * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.dryOnlyBus); // Route purely through dry bus (NO reverb!)

        noiseSource.start(now);
        noiseSource.stop(now + duration + 0.02);
      }

      // 2. Subtle warm low-mid cushion (extremely gentle, non-boomy)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';

      const startPitch = 55 + Math.random() * 8;
      const peakPitch = Math.min(85, 62 + vel * 12);
      subOsc.frequency.setValueAtTime(startPitch, now);
      subOsc.frequency.exponentialRampToValueAtTime(peakPitch, now + duration * 0.28);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + duration);

      // Very soft, warm tonal foundation
      const subPeak = Math.min(0.03, 0.01 + vel * 0.008);
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(subPeak, now + duration * 0.26);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      subOsc.connect(subGain);
      subGain.connect(this.dryOnlyBus); // Route purely through dry bus (NO reverb!)

      subOsc.start(now);
      subOsc.stop(now + duration + 0.02);
    } catch {}
  }

  /**
   * Cinematic Zoom In SFX:
   * Heavy pneumatic sub-bass boom + air compression whoosh + camera shutter latch echoing in reverb.
   */
  public playZoomIn() {
    this.ensure();
    if (!this.ctx || !this.sfxBus) return;

    const now = this.ctx.currentTime;

    try {
      // A. Deep sub-bass cinematic boom (boosted volume)
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(120, now);
      sub.frequency.exponentialRampToValueAtTime(36, now + 0.35);

      subGain.gain.setValueAtTime(0.68, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      sub.connect(subGain);
      subGain.connect(this.sfxBus);
      sub.start(now);
      sub.stop(now + 0.4);

      // B. Dynamic air compression whoosh (boosted volume)
      if (this.noiseBuffer) {
        const whoosh = this.ctx.createBufferSource();
        whoosh.buffer = this.noiseBuffer;
        const whooshFilter = this.ctx.createBiquadFilter();
        whooshFilter.type = 'lowpass';
        whooshFilter.frequency.setValueAtTime(220, now);
        whooshFilter.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
        whooshFilter.frequency.exponentialRampToValueAtTime(320, now + 0.3);

        const whooshGain = this.ctx.createGain();
        whooshGain.gain.setValueAtTime(0.02, now);
        whooshGain.gain.linearRampToValueAtTime(0.50, now + 0.1);
        whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

        whoosh.connect(whooshFilter);
        whooshFilter.connect(whooshGain);
        whooshGain.connect(this.sfxBus);

        whoosh.start(now);
        whoosh.stop(now + 0.34);
      }

      // C. Heavy aperture / mechanical lens latch at ~95ms (boosted volume)
      const latchTime = now + 0.095;
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      const clickFilter = this.ctx.createBiquadFilter();

      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(1850, latchTime);
      clickFilter.Q.setValueAtTime(4.5, latchTime);

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(800, latchTime);
      clickOsc.frequency.exponentialRampToValueAtTime(170, latchTime + 0.04);

      clickGain.gain.setValueAtTime(0.72, latchTime);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, latchTime + 0.045);

      clickOsc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.sfxBus);

      clickOsc.start(latchTime);
      clickOsc.stop(latchTime + 0.048);
    } catch {}
  }

  /**
   * Cinematic Zoom Out SFX:
   * Smooth reverse optical pull-back + mechanical detent release with spatial reverb.
   */
  public playZoomOut() {
    this.ensure();
    if (!this.ctx || !this.sfxBus) return;

    const now = this.ctx.currentTime;

    try {
      // A. Soft optical pull-back tone (boosted volume)
      const pullOsc = this.ctx.createOscillator();
      const pullGain = this.ctx.createGain();
      pullOsc.type = 'sine';
      pullOsc.frequency.setValueAtTime(46, now);
      pullOsc.frequency.exponentialRampToValueAtTime(105, now + 0.16);
      pullOsc.frequency.exponentialRampToValueAtTime(48, now + 0.28);

      pullGain.gain.setValueAtTime(0.38, now);
      pullGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      pullOsc.connect(pullGain);
      pullGain.connect(this.sfxBus);
      pullOsc.start(now);
      pullOsc.stop(now + 0.32);

      // B. Delicate air release flutter (boosted volume)
      if (this.noiseBuffer) {
        const air = this.ctx.createBufferSource();
        air.buffer = this.noiseBuffer;
        const airFilter = this.ctx.createBiquadFilter();
        airFilter.type = 'bandpass';
        airFilter.frequency.setValueAtTime(900, now);
        airFilter.Q.setValueAtTime(2.0, now);

        const airGain = this.ctx.createGain();
        airGain.gain.setValueAtTime(0.32, now);
        airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        air.connect(airFilter);
        airFilter.connect(airGain);
        airGain.connect(this.sfxBus);

        air.start(now);
        air.stop(now + 0.24);
      }

      // C. Soft mechanical detent release click (boosted volume)
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(1420, now);
      clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.028);

      clickGain.gain.setValueAtTime(0.42, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      clickOsc.connect(clickGain);
      clickGain.connect(this.sfxBus);
      clickOsc.start(now);
      clickOsc.stop(now + 0.032);
    } catch {}
  }
}

export const reelAudio = new ReelAudioEngine();
