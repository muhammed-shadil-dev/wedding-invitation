"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { scrollSpring } from "@/lib/motion";

/**
 * ─────────────────────────────────────────────────────────────
 *  ATMOSPHERE
 *
 *  Grain and vignette: two fixed, pointer-transparent layers above
 *  everything, and most of what stops the page looking like flat CSS.
 *
 *  Both are night effects and both have to stand down as the ground
 *  warms to paper at the close. A dark vignette over a champagne
 *  ground reads as dirt in the corners, and grain at full strength on
 *  a light field looks like a bad scan rather than film.
 * ─────────────────────────────────────────────────────────────
 */
export function Atmosphere() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, scrollSpring.atmosphere);

  const vignette = useTransform(progress, [0, 0.72, 0.94], [1, 0.85, 0]);
  const grain = useTransform(progress, [0, 0.78, 0.96], [0.16, 0.13, 0.05]);

  return (
    <>
      <motion.div
        className="grain"
        style={{ opacity: reduced ? 0.1 : grain }}
        aria-hidden
      />
      <motion.div
        className="vignette"
        style={{ opacity: reduced ? 1 : vignette }}
        aria-hidden
      />
    </>
  );
}
