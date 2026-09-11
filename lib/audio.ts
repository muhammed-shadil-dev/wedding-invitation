/**
 * ─────────────────────────────────────────────────────────────
 *  AUDIO ENGINE
 *
 *  Two sources, one interface:
 *
 *  1. If `/public/audio/theme.mp3` exists, it is used. Drop any
 *     licensed track in at that path and it takes over — no code
 *     change needed.
 *  2. If it does not, a generative ambient score is synthesised
 *     in the browser: a slow warm pad under sparse piano-like
 *     notes drawn from a pentatonic scale, through a generated
 *     reverb. Zero payload, no licensing, never loops audibly.
 *
 *  Playback NEVER starts on its own. `start()` is only ever
 *  called from the guest's tap on "Open Invitation", which is
 *  what browser autoplay policy requires and what good manners
 *  require too.
 * ─────────────────────────────────────────────────────────────
 */

const TRACK_URL = "/audio/theme.mp3";
const TARGET_VOLUME = 0.32;
const FADE = 2.0; // seconds

type Source = "track" | "generated" | null;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  /** Held so the element is not collected while it is playing. */
  private el: HTMLAudioElement | null = null;
  private reverb: ConvolverNode | null = null;
  private scheduler: number | null = null;
  private source: Source = null;
  private started = false;
  private muted = false;
  private listeners = new Set<() => void>();

  /* ── public surface ─────────────────────────────────────── */

  get isPlaying() {
    return this.started && !this.muted;
  }
  get hasStarted() {
    return this.started;
  }
  get sourceKind() {
    return this.source;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  /** Called once, from a real user gesture. */
  async start() {
    if (this.started) return;
    this.started = true;
    this.muted = this.readMutePreference();
    this.emit();

    try {
      const hasTrack = await this.trackExists();
      if (hasTrack) await this.startTrack();
      else this.startGenerated();
    } catch {
      // Any failure at all, the site continues in silence. An audio
      // problem must never surface in the guest's face at this moment.
      try {
        this.startGenerated();
      } catch {
        this.source = null;
      }
    }

    document.addEventListener("visibilitychange", this.onVisibility);
    this.emit();
  }

  toggle() {
    this.muted = !this.muted;
    this.writeMutePreference();
    this.applyVolume();
    this.emit();
  }

  /* ── internals ──────────────────────────────────────────── */

  private onVisibility = () => {
    // Pause while the tab is in the background. It saves battery and
    // stops the site singing to an empty room.
    if (document.hidden) this.fadeMaster(0, 0.4);
    else this.applyVolume();
  };

  private readMutePreference(): boolean {
    try {
      return window.localStorage.getItem("inv:muted") === "1";
    } catch {
      return false;
    }
  }

  private writeMutePreference() {
    try {
      window.localStorage.setItem("inv:muted", this.muted ? "1" : "0");
    } catch {
      /* private mode, the preference simply is not remembered */
    }
  }

  private async trackExists(): Promise<boolean> {
    try {
      const res = await fetch(TRACK_URL, { method: "HEAD", cache: "no-store" });
      const type = res.headers.get("content-type") ?? "";
      return res.ok && !type.includes("text/html");
    } catch {
      return false;
    }
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.0001;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private applyVolume() {
    this.fadeMaster(this.muted ? 0 : TARGET_VOLUME, FADE);
  }

  private fadeMaster(to: number, seconds: number) {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const g = this.master.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(g.value, 0.0001), now);
    g.linearRampToValueAtTime(Math.max(to, 0.0001), now + seconds);
  }

  /* ── source 1: a real file ──────────────────────────────── */

  private async startTrack() {
    const ctx = this.ensureContext();
    const el = new Audio(TRACK_URL);
    el.loop = true;
    el.crossOrigin = "anonymous";
    el.preload = "auto";
    this.el = el;

    const node = ctx.createMediaElementSource(el);
    node.connect(this.master!);

    await el.play();
    this.source = "track";
    this.applyVolume();
  }

  /* ── source 2: synthesised ambience ─────────────────────── */

  private startGenerated() {
    const ctx = this.ensureContext();
    this.reverb = this.buildReverb(ctx, 3.4);

    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    this.reverb.connect(wet).connect(this.master!);

    this.buildPad(ctx);
    this.scheduleMelody(ctx);

    this.source = "generated";
    this.applyVolume();
  }

  /** A short noise burst impulse response: a convincing hall for free. */
  private buildReverb(ctx: AudioContext, seconds: number): ConvolverNode {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = ctx.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        // Exponential decay over white noise, darkening toward the tail.
        const decay = Math.pow(1 - i / length, 2.6);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = buffer;
    return convolver;
  }

  /**
   * A sustained chord bed: detuned oscillator pairs through a lowpass
   * that breathes on a 24 second cycle. This is the warmth under
   * everything else.
   */
  private buildPad(ctx: AudioContext) {
    const padGain = ctx.createGain();
    padGain.gain.value = 0.0001;
    padGain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + FADE * 2);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.6;

    // Slow filter sweep, so the pad opens and closes like breathing.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 1 / 24;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    padGain.connect(filter);
    filter.connect(this.master!);
    filter.connect(this.reverb!);

    // An open minor ninth voicing, low and unhurried.
    const chord = [110, 164.81, 261.63, 493.88];
    chord.forEach((freq, i) => {
      [0, 1].forEach((d) => {
        const osc = ctx.createOscillator();
        osc.type = i < 2 ? "sawtooth" : "triangle";
        osc.frequency.value = freq;
        osc.detune.value = d === 0 ? -6 : 6;
        const g = ctx.createGain();
        g.gain.value = 0.22 / (i + 1);
        osc.connect(g).connect(padGain);
        osc.start();
      });
    });
  }

  /**
   * Sparse melodic notes. Every few seconds one note is drawn from an
   * A minor pentatonic set, sometimes answered a third above. Because
   * the choice is a random walk the score never repeats, so there is
   * no loop point for the ear to catch.
   */
  private scheduleMelody(ctx: AudioContext) {
    const scale = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    let lastIndex = 2;

    const pluck = (freq: number, when: number, velocity: number) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(velocity, when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 3.2);

      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 2400;

      osc.connect(g).connect(tone);
      tone.connect(this.master!);
      tone.connect(this.reverb!);

      osc.start(when);
      osc.stop(when + 3.4);
    };

    const step = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // A random walk rather than random notes: melodies that step
      // instead of leaping sound composed rather than accidental.
      const move = Math.floor(Math.random() * 5) - 2;
      lastIndex = Math.min(scale.length - 1, Math.max(0, lastIndex + move));
      pluck(scale[lastIndex], now + 0.05, 0.12);
      if (Math.random() > 0.55) {
        const partner = Math.min(scale.length - 1, lastIndex + 2);
        pluck(scale[partner], now + 0.62, 0.07);
      }
    };

    step();
    this.scheduler = window.setInterval(step, 3800);
  }
}

/** One engine per page, created lazily so it never touches SSR. */
let engine: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engine) engine = new AudioEngine();
  return engine;
}

export type { AudioEngine };
