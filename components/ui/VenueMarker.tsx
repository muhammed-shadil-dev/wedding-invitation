"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { beat, dur, ease, safeDelay, spring, transition, viewport } from "@/lib/motion";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE VENUE MARKER
 *
 *  An engraved medallion with the place marked on it, drawn as SVG.
 *
 *  It replaces an embedded Google map, which brought its own popup,
 *  its own branding, its own controls and its own keyboard-shortcut
 *  hints onto a wedding invitation. None of that could be styled
 *  away, and all of it announced "website" at the one moment the
 *  page should be announcing "invitation".
 *
 *  This is deliberately a symbol rather than a chart. It does not
 *  trace real streets, because a decorative map that pretends to be
 *  accurate is worse than one that plainly does not: the guest who
 *  needs the actual route taps the button underneath, which opens
 *  the real thing.
 * ─────────────────────────────────────────────────────────────
 */
export function VenueMarker({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const draws = !reduced;
  const engrave = { duration: dur.cinema, ease: ease.veil };

  return (
    <div className={`relative ${className}`} aria-hidden>
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {/* The engraved rings */}
        <motion.circle
          cx="100" cy="100" r="94"
          fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"
          initial={draws ? { pathLength: 0 } : false}
          whileInView={draws ? { pathLength: 1 } : undefined}
          viewport={viewport}
          transition={engrave}
          style={{ rotate: -90, transformOrigin: "50% 50%" }}
        />
        <motion.circle
          cx="100" cy="100" r="86"
          fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.24"
          initial={draws ? { pathLength: 0 } : false}
          whileInView={draws ? { pathLength: 1 } : undefined}
          viewport={viewport}
          transition={{ ...engrave, delay: safeDelay(0.2, reduced) }}
          style={{ rotate: 90, transformOrigin: "50% 50%" }}
        />

        {/* Compass ticks. Four long at the cardinals, twelve short between. */}
        <g opacity="0.5">
          {Array.from({ length: 16 }).map((_, i) => {
            const cardinal = i % 4 === 0;
            const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
            const r1 = cardinal ? 72 : 78;
            const r2 = 82;
            return (
              <motion.line
                key={i}
                x1={100 + Math.cos(angle) * r1}
                y1={100 + Math.sin(angle) * r1}
                x2={100 + Math.cos(angle) * r2}
                y2={100 + Math.sin(angle) * r2}
                stroke="currentColor"
                strokeWidth={cardinal ? 1 : 0.5}
                initial={draws ? { opacity: 0 } : false}
                whileInView={draws ? { opacity: 1 } : undefined}
                viewport={viewport}
                transition={{ duration: dur.base, ease: ease.silk, delay: safeDelay(0.5 + i * 0.02, reduced) }}
              />
            );
          })}
        </g>

        {/* Two waterways, because Alappuzha is a town of them. Ornament,
            not cartography — kept abstract enough to read as engraving. */}
        <motion.path
          d="M22 128c26-10 40 6 62-2s34-22 60-16"
          fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.22"
          initial={draws ? { pathLength: 0 } : false}
          whileInView={draws ? { pathLength: 1 } : undefined}
          viewport={viewport}
          transition={{ ...engrave, delay: safeDelay(0.35, reduced) }}
        />
        <motion.path
          d="M28 146c30-6 44 10 66 4s30-14 54-10"
          fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.14"
          initial={draws ? { pathLength: 0 } : false}
          whileInView={draws ? { pathLength: 1 } : undefined}
          viewport={viewport}
          transition={{ ...engrave, delay: safeDelay(0.5, reduced) }}
        />
      </svg>

      {/* The place itself. It settles rather than draws, so the eye is
          taken to it last and it reads as something set down. */}
      <motion.div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.7 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewport}
        transition={reduced ? transition.reduced : { ...spring.seal, delay: beat.xxl }}
      >
        <span
          className="absolute h-11 w-11 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,106,0.34), transparent 70%)" }}
        />
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="relative">
          <path
            d="M12 22s7.5-6.6 7.5-12.4A7.5 7.5 0 0 0 4.5 9.6C4.5 15.4 12 22 12 22Z"
            fill="currentColor"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.4" r="2.6" fill="currentColor" />
        </svg>
      </motion.div>
    </div>
  );
}
