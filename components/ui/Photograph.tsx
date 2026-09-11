"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { fadeIn, scrollSpring, settleIn, viewportEarly } from "@/lib/motion";

/**
 * ─────────────────────────────────────────────────────────────
 *  PHOTOGRAPH
 *
 *  Every picture on the site comes through here, and that is the
 *  point: one grade, one frame weight, one parallax law. Unrelated
 *  images shot on different days read as one film because nothing
 *  is allowed to be treated differently.
 *
 *  The parallax is deliberately small. The frame holds still and
 *  the picture drifts inside it — the guest should never notice the
 *  movement, only that the page has air in it.
 * ─────────────────────────────────────────────────────────────
 */
export function Photograph({
  src,
  alt,
  className = "",
  /** Percentage of its own height the picture drifts. Keep it under 12. */
  drift = 8,
  /** Overrides the frame shape. Defaults to the standard square-ish radius. */
  shape = "",
  caption,
  priority,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  drift?: number;
  shape?: string;
  caption?: ReactNode;
  priority?: boolean;
  children?: ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, scrollSpring.drift);

  // The picture is oversized by twice the drift and travels exactly
  // its own overflow — so it is flush with the top of the frame at one
  // end of the pass and flush with the bottom at the other, and never
  // exposes an edge in between.
  const overflow = ((2 * drift) / (100 + 2 * drift)) * 100;
  const y = useTransform(smooth, [0, 1], ["0%", `-${overflow.toFixed(2)}%`]);

  return (
    <motion.div
      ref={ref}
      className={`photo-frame ${shape} ${className}`}
      variants={reduced ? fadeIn : settleIn}
      initial="hidden"
      whileInView="show"
      viewport={viewportEarly}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        style={{
          y: reduced ? 0 : y,
          // Oversized so the drift never exposes an edge of the frame.
          height: `${100 + drift * 2}%`,
          willChange: reduced ? undefined : "transform",
        }}
        className="absolute inset-x-0 top-0 w-full object-cover"
      />

      <span className="photo-grade" aria-hidden />
      <span className="photo-bloom" aria-hidden />
      <span className="photo-edge" aria-hidden />

      {caption && <span className="photo-caption">{caption}</span>}
      {children}
    </motion.div>
  );
}
