// ============================================================
// ELEMENTIA — Web Audio Synthesizer
// Procedural sound effects for all game interactions
// ============================================================

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.35;
    this.masterGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  // ── Utility ──
  _now() { return this.ctx.currentTime; }

  _osc(type, freq, dur, gainVal = 0.3) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, this._now());
    gain.gain.linearRampToValueAtTime(gainVal, this._now() + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this._now() + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this._now());
    osc.stop(this._now() + dur + 0.05);
    return { osc, gain };
  }

  // ── Freeze / Ice crystallization ──
  playFreeze() {
    this.init();
    const t = this._now();
    // Shimmering high-frequency sweep downward
    for (let i = 0; i < 5; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3000 + i * 400, t + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.8 + i * 0.06);
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 8;
      gain.gain.setValueAtTime(0, t + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.05 + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0 + i * 0.06);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.06);
      osc.stop(t + 1.2 + i * 0.06);
    }
    // Crystal chime
    [1200, 1600, 2400].forEach((f, i) => {
      this._osc('sine', f, 1.5, 0.08);
    });
  }

  // ── Heat / Melting ──
  playHeat() {
    this.init();
    const t = this._now();
    // Warm low-frequency rumble with rising filter
    const noise = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    noise.type = 'sawtooth';
    noise.frequency.value = 80;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 1.0);
    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.linearRampToValueAtTime(0.15, t + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
    noise.stop(t + 1.5);
    // Sizzle
    this._osc('sawtooth', 4000, 0.3, 0.04);
  }

  // ── Evaporation ──
  playEvaporation() {
    this.init();
    const t = this._now();
    for (let i = 0; i < 8; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, t + i * 0.1);
      osc.frequency.exponentialRampToValueAtTime(2000 + Math.random() * 1000, t + 0.8 + i * 0.1);
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.05 + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9 + i * 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.1);
      osc.stop(t + 1.2 + i * 0.1);
    }
  }

  // ── Rain / Precipitation ──
  playRain() {
    this.init();
    const t = this._now();
    // Gentle patter using noise-like oscillators
    for (let i = 0; i < 15; i++) {
      const delay = Math.random() * 1.2;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.value = 1000 + Math.random() * 3000;
      filter.type = 'bandpass';
      filter.frequency.value = 2000 + Math.random() * 2000;
      filter.Q.value = 12;
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.04, t + delay + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.15);
    }
  }

  // ── Atomic Bond Formation ──
  playBond() {
    this.init();
    const t = this._now();
    // Harmonic chord: major triad rising
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.05 + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5 + i * 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.08);
      osc.stop(t + 2.0);
    });
    // Shimmer overtone
    this._osc('sine', 2093, 2.0, 0.04);
  }

  // ── Success chime ──
  playSuccess() {
    this.init();
    const t = this._now();
    const notes = [523, 659, 784, 1047]; // C major ascending
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.03 + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 + i * 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.12);
      osc.stop(t + 0.8 + i * 0.12);
    });
  }

  // ── Level Up fanfare ──
  playLevelUp() {
    this.init();
    const t = this._now();
    // Pentatonic fanfare
    const notes = [440, 523, 659, 784, 880, 1047, 1319];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i < 4 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.04 + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7 + i * 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.1);
      osc.stop(t + 1.0 + i * 0.1);
    });
  }

  // ── Error / Fizzle ──
  playFizzle() {
    this.init();
    const t = this._now();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.4);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  // ── UI click ──
  playClick() {
    this.init();
    this._osc('sine', 800, 0.08, 0.1);
  }

  // ── Ambient hum (continuous, returns stop function) ──
  startAmbient() {
    this.init();
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc1.type = 'sine'; osc1.frequency.value = 55;
    osc2.type = 'sine'; osc2.frequency.value = 82.5;
    filter.type = 'lowpass'; filter.frequency.value = 200;
    gain.gain.value = 0.04;
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc1.start();
    osc2.start();
    return () => {
      gain.gain.exponentialRampToValueAtTime(0.001, this._now() + 0.5);
      setTimeout(() => { osc1.stop(); osc2.stop(); }, 600);
    };
  }

  // ── Stream / Water flow ──
  playStream() {
    this.init();
    const t = this._now();
    for (let i = 0; i < 12; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const delay = i * 0.15 + Math.random() * 0.05;
      osc.type = 'sine';
      osc.frequency.value = 300 + Math.random() * 400;
      filter.type = 'bandpass';
      filter.frequency.value = 500 + Math.random() * 500;
      filter.Q.value = 5;
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.04, t + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.3);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.5);
    }
  }

  // ── Magnetic separation ──
  playMagnet() {
    this.init();
    const t = this._now();
    // Low frequency sweep + metallic ping
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.linearRampToValueAtTime(200, t + 0.3);
    osc.frequency.linearRampToValueAtTime(60, t + 0.6);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.0);
    // Metallic ping
    setTimeout(() => this._osc('triangle', 3200, 0.4, 0.08), 200);
  }
}
