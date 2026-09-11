"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Section, SceneTitle } from "@/components/ui/Section";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { beat, fadeIn, riseIn, transition, viewport } from "@/lib/motion";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE VENUE
 *
 *  The map is the one thing here that belongs to somebody else, so
 *  it is treated like a framed photograph: gold hairline, the same
 *  corner radius as every other frame, and graded to sit inside the
 *  night rather than punch a bright white hole in it.
 *
 *  It also does not take the scroll until it is asked to. A map that
 *  swallows a thumb swipe halfway down a long page is one of the most
 *  reliable ways to lose a guest.
 * ─────────────────────────────────────────────────────────────
 */
export function Venue() {
  const reduced = usePrefersReducedMotion();
  const [live, setLive] = useState(false);

  const query = encodeURIComponent(site.venue.mapQuery);
  const embed = `https://www.google.com/maps?q=${query}&output=embed&z=15`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  return (
    <Section id="venue">
      <Reveal variants={fadeIn}>
        <SceneTitle label={site.scenes.venue.label}>
          <SplitText text={site.venue.name} as="span" />
        </SceneTitle>
      </Reveal>

      <Reveal variants={riseIn} delay={beat.md}>
        <p className="t-micro mt-5 text-center text-[0.6rem] tracking-[0.3em] text-ivory/45">
          {site.venue.line1}
          <span className="mx-2 text-gold/50">·</span>
          {site.venue.line2}
        </p>
      </Reveal>

      <motion.div
        className="photo-frame relative mt-12 border border-gold/25"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewport}
        transition={transition.slow}
      >
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
          <iframe
            src={embed}
            title={`Map showing ${site.venue.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
            style={{
              filter: "grayscale(0.5) contrast(0.9) brightness(0.82) sepia(0.18)",
              pointerEvents: live ? "auto" : "none",
            }}
          />

          {!live && (
            <button
              type="button"
              onClick={() => setLive(true)}
              className="absolute inset-0 flex items-end justify-center bg-ink/25 pb-6 transition-colors duration-500 hover:bg-ink/10"
              aria-label="Activate the map"
            >
              <span className="control-glass t-micro rounded-full px-5 py-2.5 text-[0.52rem] text-gold-light">
                Tap to explore the map
              </span>
            </button>
          )}
        </div>
      </motion.div>

      <Reveal variants={riseIn} delay={beat.sm} className="mt-10">
        <div className="flex flex-col items-center gap-7">
          {site.venue.note && (
            <p className="t-body measure-wide text-center text-pretty text-ivory/55">
              {site.venue.note}
            </p>
          )}
          <Button href={directions}>Get directions</Button>
        </div>
      </Reveal>
    </Section>
  );
}
