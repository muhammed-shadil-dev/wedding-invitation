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
 *  By now the backdrop has travelled all the way to its ember, so
 *  this scene barely needs any colour of its own. It stops adding
 *  and lets the light finish the page.
 *
 *  The quote grows very slightly as it is approached. It is the only
 *  place on the site where something moves toward the guest, which is
 *  exactly why it is saved for the last line.
 * ─────────────────────────────────────────────────────────────
 */
export function Closing() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0.25, 1]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 py-24 text-center"
    >
      <motion.div
        className="flex w-full max-w-[540px] flex-col items-center"
        style={reduced ? undefined : { scale, opacity, willChange: "transform, opacity" }}
      >
        <Flourish className="mb-10 h-8 w-28 text-gold-light/70" />

        <blockquote className="t-display text-balance italic text-ivory/90">
          <SplitText text={site.closing.quote} gap={stagger.tight} as="span" />
        </blockquote>

        <Reveal variants={riseIn} delay={beat.lg} className="mt-12">
          <div className="hairline h-px w-24" />
        </Reveal>

        <Reveal variants={riseIn} delay={beat.xl}>
          <p className="t-script mt-5 text-[2.4rem] text-ivory/85">
            {site.couple.brideFirst} &amp; {site.couple.groomFirst}
          </p>
        </Reveal>

        <motion.div
          className="mt-14"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={transition.slow}
        >
          <Monogram initials={site.couple.monogram} size={78} delay={beat.lg} />
        </motion.div>

        <Reveal variants={riseIn} delay={beat.md} className="mt-14">
          <div className="flex flex-col items-center gap-3">
            <p className="t-micro text-[0.52rem] tracking-[0.3em] text-ivory/45">
              {site.closing.signoff}
            </p>
            <p className="t-title text-gold-light/85">{site.closing.wellWishers}</p>
          </div>
        </Reveal>

        <Reveal variants={riseIn} delay={beat.md} className="mt-16">
          <ShareInvitation />
        </Reveal>

        <Reveal variants={riseIn} delay={beat.lg}>
          <p className="t-micro mt-14 text-[0.5rem] tracking-[0.28em] text-ivory/45">
            {site.credits}
          </p>
        </Reveal>
      </motion.div>
    </section>
  );
}
