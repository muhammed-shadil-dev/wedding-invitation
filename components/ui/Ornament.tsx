"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { drawLine, dropLine, motionSafe, transition, viewport } from "@/lib/motion";

/** A gold hairline that draws itself outward from the centre. */
export function Rule({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={`hairline h-px w-full origin-center ${className}`}
      variants={motionSafe(drawLine, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    />
  );
}

/**
 * ─────────────────────────────────────────────────────────────
 *  SCENE BREAK
 *
 *  The connective tissue between scenes, and the reason the page
 *  reads as one document rather than nine stacked sections.
 *
 *  A thread drops from the scene above, passes through a small
 *  diamond, and continues into the scene below. It is the same
 *  mark every time, so the eye learns it as punctuation — the
 *  paragraph break of the invitation.
 * ─────────────────────────────────────────────────────────────
 */
export function SceneBreak({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      className={`pointer-events-none flex w-full flex-col items-center ${className}`}
      aria-hidden
    >
      <motion.span
        className="block h-14 w-px origin-top bg-linear-to-b from-transparent to-gold/45"
        variants={motionSafe(dropLine, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      />

      <motion.svg
        width="16"
        height="16"
        viewBox="0 0 22 22"
        fill="none"
        className="my-2 shrink-0 text-gold"
        initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.5 }}
        whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
        viewport={viewport}
        transition={{ ...transition.slow, delay: reduced ? 0 : 0.35 }}
      >
        <path
          d="M11 2.5 13.4 8.6 19.5 11 13.4 13.4 11 19.5 8.6 13.4 2.5 11 8.6 8.6Z"
          fill="currentColor"
          opacity="0.9"
        />
      </motion.svg>

      <motion.span
        className="block h-14 w-px origin-top bg-linear-to-b from-gold/45 to-transparent"
        variants={motionSafe(dropLine, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      />
    </div>
  );
}

/** A rule interrupted by a diamond. Used within a scene, not between. */
export function Divider({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={`flex w-full items-center justify-center gap-4 ${className}`}>
      <motion.div
        className="hairline h-px flex-1 origin-right"
        variants={motionSafe(drawLine, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      />
      <motion.svg
        width="18"
        height="18"
        viewBox="0 0 22 22"
        fill="none"
        className="shrink-0 text-gold"
        initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.6 }}
        whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
        viewport={viewport}
        transition={{ ...transition.slow, delay: reduced ? 0 : 0.15 }}
      >
        <path
          d="M11 2.5 13.4 8.6 19.5 11 13.4 13.4 11 19.5 8.6 13.4 2.5 11 8.6 8.6Z"
          fill="currentColor"
          opacity="0.85"
        />
      </motion.svg>
      <motion.div
        className="hairline h-px flex-1 origin-left"
        variants={motionSafe(drawLine, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      />
    </div>
  );
}

/** A small botanical flourish, mirrored. Decorative, and static. */
export function Flourish({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M2 20C22 20 30 8 46 8c10 0 14 6 14 12s-4 12-14 12c-16 0-24-12-44-12"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.55"
      />
      <path d="M60 20c14 0 22-9 36-9M60 20c14 0 22 9 36 9" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
      <circle cx="112" cy="20" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="99" cy="11" r="1.4" fill="currentColor" opacity="0.5" />
      <circle cx="99" cy="29" r="1.4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
