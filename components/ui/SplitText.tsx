"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { lineReveal, reducedVariants, stagger, viewport } from "@/lib/motion";

/**
 * Text that rises out of its own baseline, token by token.
 *
 * Each token sits in an overflow-hidden box and slides up from below,
 * so the words appear to be revealed by the page rather than flown in
 * from somewhere else. That distinction is the entire effect.
 *
 * Used only on the lines that carry the story — scene titles and the
 * closing quote. Applying it to body copy would turn reading into
 * waiting.
 */
export function SplitText({
  text,
  /** Words (default), or whole lines separated by " / ". */
  by = "word",
  className,
  gap = stagger.tight,
  delay = 0,
  as = "span",
}: {
  text: string;
  by?: "word" | "line";
  className?: string;
  gap?: number;
  delay?: number;
  as?: ElementType;
}) {
  const reduced = usePrefersReducedMotion();
  const Wrapper = motion[as as keyof typeof motion] as typeof motion.span;
  const tokens = by === "line" ? text.split(" / ") : text.split(" ");

  if (reduced) {
    return (
      <motion.span
        className={className}
        variants={reducedVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        {text}
      </motion.span>
    );
  }

  return (
    <Wrapper
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      transition={{ staggerChildren: gap, delayChildren: delay }}
      aria-label={text}
    >
      {tokens.map((token, i) => (
        <span
          key={`${token}-${i}`}
          aria-hidden
          style={{
            display: by === "line" ? "block" : "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            // Descenders would be clipped by overflow:hidden, so the
            // box is grown and pulled back by the same amount.
            paddingBottom: "0.16em",
            marginBottom: "-0.16em",
          }}
        >
          <motion.span
            style={{ display: "inline-block", willChange: "transform" }}
            variants={lineReveal}
          >
            {token}
            {by === "word" && i < tokens.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  );
}
