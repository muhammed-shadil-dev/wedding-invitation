import type { Transition, Variants } from "framer-motion";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE ANIMATION SYSTEM
 *
 *  Every movement on this site is declared here. Components read
 *  tokens; they never write durations, easings or delays of their
 *  own. If a timing needs changing, it changes once, here.
 *
 *  The rules this system enforces:
 *
 *  1. Only `transform` and `opacity` animate. Never layout.
 *  2. Nothing travels further than 28px. Luxury is restraint.
 *  3. No overshoot easing on text or images. Springs are reserved
 *     for objects with implied mass: the flap, the seal, a button
 *     under a thumb.
 *  4. Entrances are slow, exits are quick. Things arrive with
 *     ceremony and leave without fuss.
 *  5. Every animation answers a question the guest is asking.
 *     Decoration that moves for its own sake is deleted.
 * ─────────────────────────────────────────────────────────────
 */

/* ── Easing ──────────────────────────────────────────────────
   Named for how they feel, not for their numbers.
──────────────────────────────────────────────────────────── */
export const ease = {
  /** The house curve. Fast start, long glide to rest. Entrances. */
  silk: [0.16, 1, 0.3, 1],
  /** Gentler, more symmetrical. Colour, opacity, atmosphere. */
  ink: [0.22, 0.61, 0.36, 1],
  /** Slow in and slow out. Curtains, veils, full-screen moves. */
  veil: [0.65, 0, 0.35, 1],
  /** Flat and unfussy. Exits and dismissals. */
  exit: [0.4, 0, 1, 1],
} as const;

/** GSAP speaks its own dialect. Same intent, its vocabulary. */
export const gsapEase = {
  silk: "power3.out",
  lift: "power2.inOut",
  fall: "power2.in",
  settle: "power1.out",
  out: "power2.out",
} as const;

/* ── Duration ────────────────────────────────────────────────
   Seconds. Referenced by name, never typed inline.
──────────────────────────────────────────────────────────── */
export const dur = {
  /** Interface feedback. Barely perceptible. */
  quick: 0.45,
  /** The default entrance. */
  base: 0.9,
  /** Headlines, images, anything with presence. */
  slow: 1.4,
  /** Full-screen moves and the opening. */
  cinema: 2.2,
} as const;

/** Delays. A "beat" is one unit of waiting. */
export const beat = {
  xs: 0.06,
  sm: 0.12,
  md: 0.22,
  lg: 0.35,
  xl: 0.55,
  xxl: 0.8,
} as const;

/** Gaps between children in a run. Faster reads as a glitch. */
export const stagger = {
  tight: 0.04,
  base: 0.06,
  loose: 0.09,
} as const;

/* ── Transitions ─────────────────────────────────────────────
   The complete set. A component that needs something not in
   this list is asking the wrong question.
──────────────────────────────────────────────────────────── */
export const transition = {
  /** Small elements arriving. */
  entrance: { duration: dur.base, ease: ease.silk },
  /** Headlines, portraits, cards. */
  slow: { duration: dur.slow, ease: ease.silk },
  /** The opening, and anything that fills the screen. */
  cinema: { duration: dur.cinema, ease: ease.veil },
  /** Pure opacity. Atmosphere, colour, crossfades. */
  fade: { duration: dur.base, ease: ease.ink },
  /** Leaving. */
  exit: { duration: dur.quick, ease: ease.exit },
  /** A curtain drawing across. */
  veil: { duration: dur.slow, ease: ease.veil },
  /** The handover from the gate to the invitation. */
  bloom: { duration: 1.1, ease: ease.veil },
  /** A single numeral rolling over in the countdown. */
  tick: { duration: 0.7, ease: ease.silk },
  /**
   * The one transition used when motion is reduced. Short, linear,
   * opacity only — and declared once so no component has to remember
   * what "reduced" is supposed to look like.
   */
  reduced: { duration: 0.2, ease: "linear" },
} satisfies Record<string, Transition>;

/** Springs. Only for things that should feel physical. */
export const spring = {
  /** Heavy paper. The flap, the invitation card. */
  paper: { type: "spring", stiffness: 120, damping: 20, mass: 0.9 },
  /** A small object breaking free. The wax seal. */
  seal: { type: "spring", stiffness: 180, damping: 14, mass: 0.6 },
  /** A control under a thumb. Almost subliminal. */
  tactile: { type: "spring", stiffness: 400, damping: 32, mass: 0.5 },
} satisfies Record<string, Transition>;

/** Scroll-linked values pass through these to kill iOS jitter. */
export const scrollSpring = {
  /** Parallax and drift. */
  drift: { stiffness: 90, damping: 26, restDelta: 0.001 },
  /** Colour and long, slow journeys. */
  atmosphere: { stiffness: 60, damping: 30, restDelta: 0.0005 },
  /** Progress threads. */
  thread: { stiffness: 80, damping: 28, restDelta: 0.001 },
} as const;

/* ── The reveal grammar ──────────────────────────────────────
   One vocabulary of entrances, used by every section. A section
   that invents its own entrance breaks the spell.
──────────────────────────────────────────────────────────── */

/** Text and small elements: rise and resolve. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: transition.entrance },
};

/** Pure resolve, no travel. For anything already in place. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transition.fade },
};

/** Photographs: settle out of a slight push-in. Never past 1. */
export const settleIn: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  show: { opacity: 1, scale: 1, transition: transition.slow },
};

/** A hairline drawing itself. Ornaments and rules. */
export const drawLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: transition.veil },
};

/** A vertical thread dropping between scenes. */
export const dropLine: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: { scaleY: 1, opacity: 1, transition: transition.veil },
};

/** Per-word or per-line text. Pairs with <SplitText/>. */
export const lineReveal: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: transition.slow },
};

/**
 * The gate handover. The invitation is already composed behind the
 * bloom, so it resolves without moving — movement here would betray
 * that a second screen had taken over.
 */
export const echoIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.slow, ease: ease.ink } },
};

/** Parent orchestrator. Children inherit `hidden`/`show`. */
export const orchestrate = (
  children: number = stagger.base,
  delay: number = 0
): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: children, delayChildren: delay } },
});

/* ── Looping motion ──────────────────────────────────────────
   Three loops exist on this site and no more. Each one is a
   signal, not decoration: something is live, something is
   waiting for you, something is playing.
──────────────────────────────────────────────────────────── */
export const loop = {
  /** The scroll cue. A thread of light falling, repeatedly. */
  cue: { duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 },
  /** The ring around "Open Invitation". A hand held out. */
  invite: { duration: 3, repeat: Infinity, ease: "easeOut", repeatDelay: 1.2 },
  /** The audio bars. Only ever runs while sound is actually playing. */
  audio: (index: number): Transition => ({
    duration: 1.6 + index * 0.22,
    repeat: Infinity,
    ease: "easeInOut",
    delay: index * 0.12,
  }),
  /** A reply in flight. Stops the moment it lands. */
  sending: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
} as const;

/* ─────────────────────────────────────────────────────────────
   THE MOTE FIELD

   Slow specks of light drifting upward behind everything. Their
   positions are fixed rather than random so the server and the
   client render the same thing, and there are nine of them because
   ten begins to look like weather.
   ───────────────────────────────────────────────────────────── */
export const motes = [
  { left: 8, size: 3, delay: 0, duration: 26, drift: 30, opacity: 0.35 },
  { left: 19, size: 2, delay: 7, duration: 34, drift: -20, opacity: 0.28 },
  { left: 31, size: 4, delay: 3, duration: 29, drift: 42, opacity: 0.4 },
  { left: 44, size: 2, delay: 12, duration: 38, drift: -34, opacity: 0.22 },
  { left: 56, size: 3, delay: 5, duration: 31, drift: 24, opacity: 0.34 },
  { left: 68, size: 5, delay: 15, duration: 42, drift: -28, opacity: 0.3 },
  { left: 77, size: 2, delay: 9, duration: 27, drift: 36, opacity: 0.26 },
  { left: 88, size: 3, delay: 18, duration: 35, drift: -18, opacity: 0.32 },
  { left: 95, size: 2, delay: 22, duration: 30, drift: 26, opacity: 0.24 },
] as const;

/* ── Viewport ────────────────────────────────────────────────
   Trigger once, a quarter of the way up. Re-triggering on
   scroll-back is a novelty that becomes an irritation.
──────────────────────────────────────────────────────────── */
export const viewport = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -12% 0px",
} as const;

/** For tall elements that would otherwise never reach 25%. */
export const viewportEarly = { once: true, amount: 0.15 } as const;

/* ── Reduced motion ──────────────────────────────────────────
   One rule. Everything collapses to a short opacity fade:
   nothing moves, nothing scales, nothing is removed. The
   content is identical — only the movement stops.
──────────────────────────────────────────────────────────── */
export const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: "linear" } },
};

export function motionSafe(variants: Variants, reduced: boolean): Variants {
  return reduced ? reducedVariants : variants;
}

/** Collapses a delay to nothing when motion is reduced. */
export function safeDelay(seconds: number, reduced: boolean): number {
  return reduced ? 0 : seconds;
}

/* ─────────────────────────────────────────────────────────────
   THE OVERTURE

   Roughly six seconds before the guest is asked to do anything.
   Nothing is tappable until the envelope has arrived: rushing a
   guest past the opening is the fastest way to make a luxury
   object feel like a web page.
   ───────────────────────────────────────────────────────────── */
export const overture = {
  /** A pool of warm light gathers. */
  light: { at: beat.lg, duration: 3.2 },
  /** A hairline of gold draws itself across the dark. */
  rule: { at: 0.6, duration: 1.6 },
  /** "Together with our families" */
  eyebrow: { at: 1.2, duration: dur.slow },
  /** The names, in foil. */
  names: { at: 1.8, duration: 1.8 },
  /** The envelope arrives out of the dark. */
  envelope: { at: 2.8, duration: 2.0 },
  /** And begins to breathe, once it has settled. */
  breathe: { at: 5, duration: 6 },
  /** The invitation to open. */
  invite: { at: 4.2, duration: dur.slow },
} as const;

/**
 * The hero's entrance, once the gate has handed over.
 *
 * The echo elements — rule, eyebrow, names — do not move, because
 * the gate has just shown them in this exact place. They resolve
 * under the bloom so that when it clears they are simply there.
 * Only the elements the gate never showed are allowed to travel.
 */
export const arrival = {
  echo: { at: 0 },
  request: { at: beat.xl },
  monogram: { at: beat.xxl },
  date: { at: 1.05 },
  cue: { at: 1.6 },
} as const;

/* ─────────────────────────────────────────────────────────────
   THE ENVELOPE TIMELINE

   Six beats that must land on precise frames relative to one
   another — which is the entire reason GSAP is in this project.
   The rhythm lives here so it can be tuned without opening the
   component.

   `at` values are GSAP position parameters: a negative offset
   overlaps the previous beat, "<" starts with it.
   ───────────────────────────────────────────────────────────── */
export const envelopeTimeline = {
  /** 1. The seal takes the strain, then gives. */
  sealTension: { duration: 0.28, ease: gsapEase.out },
  /** It breaks free and falls out of frame, tumbling. */
  sealFall: { duration: 1.05, ease: gsapEase.fall },
  /** The candle glow behind it goes out with it. */
  glowOut: { duration: 0.5, at: "<" },

  /** 2. The flap lifts, a little past vertical. */
  flapLift: { duration: 1.15, ease: gsapEase.lift, at: "-=0.65" },
  /** Then settles flat. The overshoot is the weight of the paper. */
  flapSettle: { duration: 0.45, ease: gsapEase.settle },

  /** 3. The envelope tips back, as if angled by a hand. */
  tilt: { duration: 1.1, ease: gsapEase.out, at: "-=1.1" },

  /** 4. The card is drawn out. The slowest beat on the site. */
  draw: { duration: 1.6, ease: gsapEase.out, at: "-=0.35" },

  /** 5. It turns to face the guest and lifts clear of the paper. */
  turn: { duration: 1.2, ease: gsapEase.lift, at: "-=0.9" },
  paperOut: { duration: 0.9, at: "<" },

  /** 6. The camera pushes in until the card is the screen. */
  dolly: { duration: 1.5, ease: gsapEase.lift, at: "-=0.55" },
  /** And the card opens into light, which is the handover. */
  bloom: { duration: 0.7, ease: gsapEase.lift, at: "-=0.7" },

  /** Reduced motion: no flight, no rotation. Just the handover. */
  reduced: { duration: 0.3 },
} as const;

/**
 * How far the seal falls, as a multiple of its own height, so the
 * distance scales with the envelope instead of being a pixel value
 * that clears the frame on one phone and not another.
 */
export const sealFallDistance = "400%";

/* ─────────────────────────────────────────────────────────────
   SCROLL FEEL

   The weight of the scroll itself. A long, heavy glide is the
   single biggest contributor to the site feeling expensive rather
   than merely fast, so it belongs in the animation system rather
   than buried in a provider.

   Touch is deliberately left native: overriding momentum on mobile
   fights the operating system's own curve and always loses.
   ───────────────────────────────────────────────────────────── */
export const lenis = {
  duration: 1.25,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical" as const,
  smoothWheel: true,
  syncTouch: false,
  touchMultiplier: 1.6,
  wheelMultiplier: 0.9,
};
