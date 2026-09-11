"use client";

import { gsap } from "gsap";
import { useEffect, useRef, type RefObject } from "react";
import { site } from "@/site.config";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { envelopeTimeline as T, sealFallDistance } from "@/lib/motion";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE ENVELOPE
 *
 *  The one place GSAP is used, and the reason it is here: six beats
 *  that must land on precise frames relative to one another. The
 *  rhythm itself lives in lib/motion.ts as `envelopeTimeline`; this
 *  file only knows what moves, not when.
 *
 *  The paper is built from clip-path triangles inside a single
 *  preserve-3d space, so the flap genuinely passes behind the pocket
 *  rather than faking it with z-index, the folds stay crisp at any
 *  size, and the whole object costs nothing to download.
 *
 *  Everything inside is sized from one custom property, `--env`, so
 *  the object scales as a unit. Nothing in here is a pixel value
 *  that would be right on one phone and wrong on another.
 * ─────────────────────────────────────────────────────────────
 */

type Props = {
  /** Flip to true to play the opening. One way only. */
  open: boolean;
  /** The warm light the card opens into. Owned by the gate. */
  bloom: RefObject<HTMLDivElement | null>;
  /** Fired once the bloom has filled the screen. */
  onComplete: () => void;
};

export function Envelope3D({ open, bloom, onComplete }: Props) {
  const reduced = usePrefersReducedMotion();

  const stage = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const flapShadow = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (!open || played.current) return;
    played.current = true;

    // Reduced motion: no flight, no rotation. The card resolves, the
    // light comes up, the gate hands over. Same information, none of
    // the vestibular cost.
    if (reduced) {
      gsap.to([envelope.current, shadow.current], { opacity: 0, duration: T.reduced.duration });
      gsap.to(bloom.current, { opacity: 1, duration: T.reduced.duration, onComplete });
      return;
    }

    const moving = [envelope.current, flap.current, card.current, seal.current];

    const ctx = gsap.context(() => {
      // Promote only what actually moves, and only while it is moving.
      gsap.set(moving, { willChange: "transform" });

      const tl = gsap.timeline({
        defaults: { force3D: true },
        onComplete: () => {
          gsap.set(moving, { willChange: "auto" });
          onComplete();
        },
      });

      tl
        // 1 ── The seal takes the strain, then gives, and falls out of
        //      frame tumbling. The distance is a multiple of its own
        //      size, so it clears the bottom on every screen.
        .to(seal.current, { scale: 1.14, ...T.sealTension })
        .to(seal.current, {
          y: sealFallDistance,
          x: "-38%",
          rotateZ: -58,
          scale: 0.82,
          opacity: 0,
          ...T.sealFall,
        })
        .to(glow.current, { opacity: 0, duration: T.glowOut.duration }, T.glowOut.at)

        // 2 ── The flap lifts a little past vertical, then settles.
        //      The overshoot is the weight of the paper.
        .to(flap.current, { rotateX: -172, ...withoutAt(T.flapLift) }, T.flapLift.at)
        .to(flapShadow.current, { opacity: 0, duration: T.flapLift.duration }, "<")
        .to(flap.current, { rotateX: -180, ...withoutAt(T.flapSettle) })

        // 3 ── The envelope tips back, as if angled by a hand.
        .to(envelope.current, { rotateX: 16, y: "5%", ...withoutAt(T.tilt) }, T.tilt.at)

        // 4 ── The card is drawn out. The slowest beat on the site,
        //      and the one to protect if anything ever needs trimming.
        .to(card.current, { y: "-58%", ...withoutAt(T.draw) }, T.draw.at)

        // 5 ── It turns to face the guest and lifts clear of the paper.
        .to(envelope.current, { rotateX: 0, y: "0%", ...withoutAt(T.turn) }, T.turn.at)
        .to(card.current, { y: "-64%", scale: 1.06, ...withoutAt(T.turn) }, "<")
        .to([flap.current, shadow.current], { opacity: 0, duration: T.paperOut.duration }, "<")

        // 6 ── The camera pushes in until the card is the screen, and
        //      the card opens into light. The bloom is the handover:
        //      it hides the seam between the gate and the invitation,
        //      which is worth far more than matching them pixel for
        //      pixel at five different viewport sizes.
        .to(stage.current, { scale: 1.9, y: "24%", ...withoutAt(T.dolly) }, T.dolly.at)
        .to(bloom.current, { opacity: 1, ...withoutAt(T.bloom) }, T.bloom.at);
    }, stage);

    return () => ctx.revert();
  }, [open, reduced, onComplete, bloom]);

  return (
    <div className="stage relative flex items-center justify-center" ref={stage}>
      {/* The envelope's shadow on the ground plane */}
      <div
        ref={shadow}
        aria-hidden
        className="absolute top-[62%] h-[14%] w-[70%] rounded-[50%] blur-2xl"
        style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.75), transparent 70%)" }}
      />

      {/* Candle glow behind the seal */}
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute h-[52%] w-[52%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,168,106,0.32), transparent 68%)",
          animation: "flicker 4.5s ease-in-out infinite",
          filter: "blur(18px)",
        }}
      />

      {/* ── The envelope body ─────────────────────────────────
          One preserve-3d space. `--env` is bounded by width and by
          height, so the object never pushes the "Open" button off
          a short screen, and everything printed on it is a fraction
          of that single value.
      ──────────────────────────────────────────────────────── */}
      <div
        ref={envelope}
        className="preserve-3d relative aspect-[1/1.3]"
        style={{
          ["--env" as string]: "min(76vw, 320px, 34vh)",
          width: "var(--env)",
          transform: "rotateX(0deg)",
        }}
      >
        {/* The lined interior. Once the card rises, the wedges either
            side of the bottom fold are exposed — so they are made the
            point rather than left looking like a hole. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[3px]"
          style={{
            transform: "translateZ(0px)",
            background: "linear-gradient(165deg, #3b2230 0%, #2a1826 55%, #1d1019 100%)",
            boxShadow: "inset 0 2px 14px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #c9a86a 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, #c9a86a 0 1px, transparent 1px 9px)",
            }}
          />
        </div>

        {/* The card, waiting inside */}
        <div
          ref={card}
          className="paper absolute bottom-[3%] left-[7%] h-[94%] w-[86%] rounded-[2px]"
          style={{ transform: "translateZ(1px)" }}
        >
          <CardFace />
        </div>

        {/* Side flaps — these give the front its fold lines */}
        <div
          className="absolute inset-y-0 left-0 w-[52%]"
          style={{
            transform: "translateZ(2px)",
            clipPath: "polygon(0 0, 100% 50%, 0 100%)",
            background: "linear-gradient(100deg, #f2e9da 0%, #e4d8c1 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[52%]"
          style={{
            transform: "translateZ(2px)",
            clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
            background: "linear-gradient(260deg, #f2e9da 0%, #e2d5bd 100%)",
          }}
        />

        {/* Bottom flap */}
        <div
          className="absolute inset-x-0 bottom-0 h-[58%]"
          style={{
            transform: "translateZ(3px)",
            clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
            background: "linear-gradient(180deg, #f6efe3 0%, #eadfc9 70%, #ddd0b5 100%)",
          }}
        />

        {/* The addressee, written by hand on the front */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[11%] flex flex-col items-center gap-1"
          style={{ transform: "translateZ(3.5px)" }}
        >
          <span
            className="t-script text-[#6b5a3e]"
            style={{ fontSize: "calc(var(--env) * 0.115)" }}
          >
            To our dearest
          </span>
          <span
            className="font-display uppercase tracking-[0.4em] text-[#8a7757]"
            style={{ fontSize: "calc(var(--env) * 0.04)" }}
          >
            Family &amp; Friends
          </span>
        </div>

        {/* The flap's cast shadow, as a separate static layer.
            A drop-shadow filter on the flap itself would be re-rasterised
            on every frame of the rotation, which is exactly the kind of
            cost that turns a 60fps opening into a 40fps one. */}
        <div
          ref={flapShadow}
          aria-hidden
          className="absolute inset-x-0 top-[54%] h-[10%]"
          style={{
            transform: "translateZ(3.4px)",
            background: "linear-gradient(180deg, rgba(0,0,0,0.22), transparent)",
          }}
        />

        {/* Top flap — origin at the fold, so it hinges correctly.
            Both faces render: hiding the backface made it vanish the
            instant it passed vertical, mid-way through the slowest
            moment of the sequence. */}
        <div
          ref={flap}
          className="absolute inset-x-0 top-0 h-[56%]"
          style={{
            transform: "translateZ(4px) rotateX(0deg)",
            transformOrigin: "50% 0%",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: "linear-gradient(180deg, #faf4ea 0%, #f0e6d3 55%, #e0d3b8 100%)",
          }}
        />

        {/* The wax seal, sitting over the fold */}
        <div
          ref={seal}
          className="absolute left-1/2 top-[47%] aspect-square"
          style={{
            width: "calc(var(--env) * 0.23)",
            transform: "translateZ(6px) translateX(-50%)",
          }}
        >
          <WaxSeal initials={site.couple.monogram} />
        </div>
      </div>
    </div>
  );
}

/**
 * Timeline tokens carry their GSAP position parameter alongside their
 * tween values. This splits the two, so `at` can be passed as the
 * position argument and never leaks into the tween itself.
 */
type TimelineBeat = { duration: number; ease?: string; at?: string };

function withoutAt({ at: _at, ...tween }: TimelineBeat): Omit<TimelineBeat, "at"> {
  return tween;
}

/**
 * Wax seal, from layered gradients rather than an image: a domed
 * highlight, a pressed rim, and an uneven edge from a clip-path with
 * irregular vertices — real wax is never a perfect circle, and the eye
 * knows it even when it cannot say why.
 */
function WaxSeal({ initials }: { initials: readonly string[] }) {
  return (
    <div className="relative h-full w-full" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          clipPath:
            "polygon(50% 0%, 68% 4%, 84% 14%, 95% 30%, 100% 50%, 95% 70%, 83% 86%, 66% 96%, 50% 100%, 33% 96%, 16% 85%, 5% 69%, 0% 50%, 6% 29%, 17% 14%, 33% 4%)",
          background:
            "radial-gradient(circle at 34% 28%, #b8434f 0%, #8c2f39 42%, #6b2029 78%, #521a20 100%)",
          boxShadow:
            "inset 0 -3px 8px rgba(0,0,0,0.45), inset 0 3px 6px rgba(255,255,255,0.18), 0 6px 14px rgba(0,0,0,0.4)",
        }}
      />
      <div
        className="absolute inset-[13%] rounded-full"
        style={{
          boxShadow:
            "inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(255,255,255,0.12)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display leading-none tracking-[0.02em]"
          style={{
            fontSize: "calc(var(--env) * 0.072)",
            color: "#e8c9a0",
            textShadow: "0 1px 0 rgba(0,0,0,0.55), 0 -1px 0 rgba(255,255,255,0.12)",
          }}
        >
          {initials[0]}
          <span className="amp" style={{ color: "inherit" }}>
            &amp;
          </span>
          {initials[1]}
        </span>
      </div>
    </div>
  );
}

/**
 * What is printed on the card that comes out. It is on screen for
 * about two seconds before the camera pushes through it, so it says
 * one thing, set large.
 */
function CardFace() {
  const { couple } = site;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[3%] px-[8%] pt-[14%] text-center">
      <span
        className="t-arabic text-[#8a6b33]"
        dir="rtl"
        lang="ar"
        style={{ fontSize: "calc(var(--env) * 0.062)", lineHeight: 1.9 }}
      >
        {site.bismillah.arabic}
      </span>

      <div className="hairline h-px w-12 opacity-60" />

      <p
        className="font-display leading-[1.15] text-[#23392c]"
        style={{ fontSize: "calc(var(--env) * 0.105)" }}
      >
        {couple.brideFull}
        <span className="amp block text-[0.62em] text-[#8a6b33]">&amp;</span>
        {couple.groomFull}
      </p>

      <span
        className="uppercase tracking-[0.32em] text-[#9a8560]"
        style={{ fontSize: "calc(var(--env) * 0.036)" }}
      >
        {site.invitation.dateStamp}
      </span>
    </div>
  );
}
