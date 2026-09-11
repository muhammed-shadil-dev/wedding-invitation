"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Monogram } from "@/components/ui/Monogram";
import { Bismillah, CoupleNames, InvitationHeading } from "@/components/ui/CoupleNames";
import { useInvitation } from "@/components/shell/InvitationProvider";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { arrival, loop, safeDelay, transition } from "@/lib/motion";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE ARRIVAL
 *
 *  This scene reuses the gate's composition — the same hairline, the
 *  same invocation, the same names in foil, rendered by the same
 *  components.
 *
 *  So they do not move when they arrive. They resolve, under the
 *  bloom, while the gate fades. Anything that travelled here would
 *  give away that a second screen had taken over. Only the elements
 *  the gate never showed — the request, the monogram, the date — are
 *  allowed to rise.
 *
 *  Leaving is the opposite: the scene recedes rather than scrolling
 *  flatly off the top, so it feels like walking away from it.
 * ─────────────────────────────────────────────────────────────
 */
export function Hero() {
  const { isOpen } = useInvitation();
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const opacity = useTransform(scrollYProgress, [0, 0.78], [1, 0]);

  const show = isOpen;
  const at = (seconds: number) => safeDelay(seconds, reduced);

  /** The gate already showed these. They only resolve. */
  const echo = (delay = 0) => ({
    initial: { opacity: 0 },
    animate: show ? { opacity: 1 } : {},
    transition: { ...transition.slow, delay: at(delay) },
  });

  /** The gate never showed these. They may travel. */
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: show ? { opacity: 1, y: 0 } : {},
    transition: { ...transition.slow, delay: at(delay) },
  });

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 py-24"
    >
      <motion.div
        className="flex flex-col items-center text-center"
        style={reduced ? undefined : { y, scale, opacity, willChange: "transform, opacity" }}
      >
        <motion.div
          className="hairline mb-[clamp(1rem,3.5vh,2rem)] h-px w-40 origin-center"
          {...echo(arrival.echo.at)}
        />

        <motion.div {...echo(arrival.echo.at)}>
          <Bismillah />
        </motion.div>

        <motion.h1
          className="t-hero mt-[clamp(0.75rem,2.5vh,1.5rem)] text-ivory"
          {...echo(arrival.echo.at)}
        >
          <CoupleNames />
        </motion.h1>

        {/* The request. It names what the guest is being invited to,
            so it arrives after the names it refers to. */}
        <motion.div
          className="t-micro mt-8 text-[0.58rem] leading-[2] tracking-[0.28em] text-gold/80"
          {...enter(arrival.request.at)}
        >
          <InvitationHeading />
        </motion.div>

        <motion.div className="mt-10" {...enter(arrival.monogram.at)}>
          <Monogram
            initials={site.couple.monogram}
            size={84}
            delay={arrival.monogram.at + 0.2}
          />
        </motion.div>

        <motion.div
          className="mt-9 flex flex-col items-center gap-2"
          {...enter(arrival.date.at)}
        >
          <p className="t-micro text-[0.7rem] tracking-[0.42em] text-gold/90">
            {site.invitation.dateStamp}
          </p>
          <p className="t-micro text-ivory/40">{site.invitation.place}</p>
        </motion.div>
      </motion.div>

      <ScrollCue show={show} delay={at(arrival.cue.at)} />
    </section>
  );
}

/**
 * A thread of light that falls, over and over. It is the only loop in
 * the invitation proper, and it exists to answer the one question a
 * guest is definitely asking on first sight: is there more below?
 */
function ScrollCue({ show, delay }: { show: boolean; delay: number }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={show ? { opacity: 1 } : {}}
      transition={{ ...transition.fade, delay }}
    >
      <span className="t-micro text-[0.5rem] text-ivory/35">Scroll</span>
      <span className="relative block h-10 w-px overflow-hidden bg-ivory/12">
        {!reduced && (
          <motion.span
            className="absolute inset-x-0 block h-1/2 bg-linear-to-b from-transparent to-gold"
            animate={{ y: ["-100%", "200%"] }}
            transition={loop.cue}
          />
        )}
      </span>
    </motion.div>
  );
}
