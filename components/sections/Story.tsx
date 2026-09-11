"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Section, SceneTitle } from "@/components/ui/Section";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { beat, fadeIn, riseIn, scrollSpring, stagger, transition, viewport } from "@/lib/motion";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE STORY
 *
 *  A thread drawn down the page.
 *
 *  The vertical line is not decoration: its height is tied to scroll
 *  position, so it is literally being drawn as the guest reads, and
 *  each beat's marker lights as the line reaches it. It is the same
 *  gold thread that punctuates every scene break on the site, here
 *  doing a job rather than a flourish.
 * ─────────────────────────────────────────────────────────────
 */
export function Story() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const scaleY = useSpring(scrollYProgress, scrollSpring.thread);

  return (
    <Section id="story">
      <Reveal variants={fadeIn}>
        <SceneTitle label={site.scenes.story.label}>
          <SplitText text={site.scenes.story.title} by="line" as="span" />
        </SceneTitle>
      </Reveal>

      <div ref={ref} className="relative mt-16 pl-9 sm:mt-20 sm:pl-14">
        <div className="absolute bottom-2 left-[3px] top-2 w-px bg-ivory/10" />
        <motion.div
          className="absolute bottom-2 left-[3px] top-2 w-px origin-top bg-linear-to-b from-gold-light via-gold to-gold/20"
          style={{ scaleY: reduced ? 1 : scaleY, willChange: "transform" }}
        />

        <div className="flex flex-col gap-14 sm:gap-18">
          {site.story.map((moment) => (
            <Beat key={moment.year} moment={moment} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function Beat({ moment }: { moment: (typeof site.story)[number] }) {
  const reduced = usePrefersReducedMotion();

  return (
    <RevealGroup gap={stagger.loose} className="relative">
      <motion.span
        className="absolute -left-9 top-[9px] block h-[7px] w-[7px] rounded-full bg-gold sm:-left-14"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={viewport}
        transition={{ ...transition.entrance, delay: reduced ? 0 : beat.sm }}
        style={{ boxShadow: "0 0 12px rgba(201,168,106,0.8)" }}
        aria-hidden
      />

      <RevealItem variants={riseIn}>
        <span className="t-micro text-[0.58rem] tracking-[0.36em] text-gold/75">
          {moment.year}
        </span>
      </RevealItem>

      <RevealItem variants={riseIn}>
        <h3 className="t-title mt-3 text-ivory">{moment.title}</h3>
      </RevealItem>

      <RevealItem variants={riseIn}>
        <p className="t-body mt-3 max-w-[42ch] text-pretty text-ivory/55">{moment.body}</p>
      </RevealItem>
    </RevealGroup>
  );
}
