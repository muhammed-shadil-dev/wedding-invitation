"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Monogram } from "@/components/ui/Monogram";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Flourish } from "@/components/ui/Ornament";
import { ShareInvitation } from "@/components/ui/ShareInvitation";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { beat, riseIn, stagger, transition } from "@/lib/motion";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE CLOSING
 *
 *  The invitation ends on paper, which is where it began.
 *
 *  The scene lays its own champagne wash over the backdrop, fading in
 *  across its top third. Two things come of that. The transition into
 *  the close is gradual no matter where the global scroll gradient
 *  happens to be, and every word here is dark ink on a warm light
 *  ground instead of pale text on a dark one — which is the only
 *  reliable way to make it readable on a phone held outdoors.
 *
 *  Nothing here is dimmed to achieve its tone. Earlier this scene
 *  faded the whole block in from 25% opacity as it was approached,
 *  which meant the words were at their least readable exactly when a
 *  guest first met them. The scene now arrives at full strength and
 *  only the scale still moves.
 * ─────────────────────────────────────────────────────────────
 */
export function Closing() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  // The only movement left: the last line grows very slightly as it is
  // approached. It is the one place on the site where something comes
  // toward the guest, and it is saved for the final words.
  const scale = useTransform(scrollYProgress, [0, 1], [0.965, 1]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-28 text-center"
    >
      {/* The ground the closing stands on. Transparent at the top edge,
          so the scene warms out of whatever came before it rather than
          starting on a hard line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(169,106,78,0.55) 18%, var(--color-champagne) 46%, var(--color-ivory-warm) 100%)",
        }}
      />

      <motion.div
        className="flex w-full max-w-[540px] flex-col items-center"
        style={reduced ? undefined : { scale, willChange: "transform" }}
      >
        <Flourish className="mb-9 h-8 w-28 text-[#8a6b33]/70" />

        <blockquote className="t-display text-balance italic text-[#331d2a]">
          <SplitText text={site.closing.quote} gap={stagger.tight} as="span" />
        </blockquote>

        <Reveal variants={riseIn} delay={beat.md} className="mt-11">
          <div className="h-px w-24 bg-[#8a6b33]/55" />
        </Reveal>

        <Reveal variants={riseIn} delay={beat.lg}>
          <p className="t-script mt-8 text-[2.6rem] leading-none text-[#3f2233]">
            {site.couple.brideFirst} &amp; {site.couple.groomFirst}
          </p>
        </Reveal>

        <motion.div
          className="mt-9"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={transition.slow}
        >
          <Monogram initials={site.couple.monogram} size={74} delay={beat.lg} tone="ink" />
        </motion.div>

        <Reveal variants={riseIn} delay={beat.md} className="mt-12">
          <div className="flex flex-col items-center gap-2.5">
            <p className="t-micro text-[0.55rem] tracking-[0.32em] text-[#5c3a2e]">
              {site.closing.signoff}
            </p>
            <p className="t-title text-[#331d2a]">{site.closing.wellWishers}</p>
          </div>
        </Reveal>

        <Reveal variants={riseIn} delay={beat.md} className="mt-12">
          <div className="h-px w-24 bg-[#8a6b33]/45" />
        </Reveal>

        <Reveal variants={riseIn} delay={beat.md} className="mt-10">
          <ShareInvitation tone="ink" />
        </Reveal>

        <Reveal variants={riseIn} delay={beat.lg}>
          <p className="t-micro mt-14 text-[0.56rem] tracking-[0.3em] text-[#5c3a2e]">
            {site.credits}
          </p>
        </Reveal>
      </motion.div>
    </section>
  );
}
