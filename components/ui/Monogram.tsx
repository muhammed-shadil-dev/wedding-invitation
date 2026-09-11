"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { dur, ease, safeDelay } from "@/lib/motion";

/**
 * The couple's initials inside a drawn ring.
 *
 * The ring draws itself with a stroke-dash animation — the one place
 * an SVG path animation earns its keep here, because it reads as an
 * engraving being cut rather than a shape fading in. It appears twice
 * on the site, at the start and at the end, and nowhere between.
 */
export function Monogram({
  initials,
  size = 84,
  className = "",
  animate = true,
  delay = 0,
}: {
  initials: readonly string[];
  size?: number;
  className?: string;
  animate?: boolean;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const draws = animate && !reduced;
  const engrave = { duration: dur.cinema, ease: ease.veil };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={`${initials[0]} and ${initials[1]}`}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-gold" aria-hidden>
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.55"
          initial={draws ? { pathLength: 0, opacity: 0 } : false}
          whileInView={draws ? { pathLength: 1, opacity: 0.55 } : undefined}
          viewport={{ once: true }}
          transition={{ ...engrave, delay: safeDelay(delay, reduced) }}
          style={{ rotate: -90, transformOrigin: "50% 50%" }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.35"
          opacity="0.3"
          initial={draws ? { pathLength: 0 } : false}
          whileInView={draws ? { pathLength: 1 } : undefined}
          viewport={{ once: true }}
          transition={{ ...engrave, delay: safeDelay(delay + 0.25, reduced) }}
          style={{ rotate: 90, transformOrigin: "50% 50%" }}
        />
      </svg>

      <span
        className="relative flex items-baseline font-display text-gold"
        style={{ fontSize: size * 0.34, letterSpacing: "0.02em" }}
      >
        <span>{initials[0]}</span>
        <span className="amp">&amp;</span>
        <span>{initials[1]}</span>
      </span>
    </div>
  );
}
