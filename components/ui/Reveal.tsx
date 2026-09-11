"use client";

import { motion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import {
  motionSafe,
  orchestrate,
  riseIn,
  safeDelay,
  stagger,
  viewport,
} from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  /** An entrance from the animation system. Defaults to riseIn. */
  variants?: Variants;
  /** A delay from `beat`. Never a bare number at the call site. */
  delay?: number;
  className?: string;
  as?: ElementType;
};

/**
 * The single entrance wrapper. Every element that arrives on scroll
 * goes through this, which is why the whole page reads as though one
 * hand made it.
 */
export function Reveal({
  children,
  variants = riseIn,
  delay = 0,
  className,
  as = "div",
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const Component = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <Component
      className={className}
      variants={motionSafe(variants, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      transition={{ delay: safeDelay(delay, reduced) }}
    >
      {children}
    </Component>
  );
}

/**
 * Orchestrates a run of children so they arrive in sequence. Children
 * declare variants using the shared hidden/show names, which every
 * variant in lib/motion.ts does.
 */
export function RevealGroup({
  children,
  gap = stagger.base,
  delay = 0,
  className,
}: {
  children: ReactNode;
  gap?: number;
  delay?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduced ? orchestrate(0, 0) : orchestrate(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

/** A child of RevealGroup. Inherits the parent's hidden/show state. */
export function RevealItem({
  children,
  variants = riseIn,
  className,
  as = "div",
}: Omit<RevealProps, "delay">) {
  const reduced = usePrefersReducedMotion();
  const Component = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <Component className={className} variants={motionSafe(variants, reduced)}>
      {children}
    </Component>
  );
}
