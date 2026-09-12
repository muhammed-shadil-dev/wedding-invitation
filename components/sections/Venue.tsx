"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Section, SceneTitle } from "@/components/ui/Section";
import { VenueMarker } from "@/components/ui/VenueMarker";
import { beat, fadeIn, riseIn } from "@/lib/motion";
import { directionsUrl, googleMapsUrl } from "@/lib/calendar";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE VENUE
 *
 *  The name first, then the place marked on an engraved medallion,
 *  then the two things a guest actually wants to do.
 *
 *  There is no embedded map. An iframe here dragged Google's popup,
 *  branding, controls and keyboard hints into the middle of a
 *  wedding invitation, none of which could be styled away, and on a
 *  phone it swallowed most of the screen for a picture nobody can
 *  navigate by. The buttons were always the real interaction — they
 *  are now the only one, and they open the genuine article.
 * ─────────────────────────────────────────────────────────────
 */
export function Venue() {
  return (
    <Section id="venue">
      <Reveal variants={fadeIn}>
        <SceneTitle label={site.scenes.venue.label}>
          <SplitText text={site.venue.name} as="span" />
        </SceneTitle>
      </Reveal>

      <Reveal variants={riseIn} delay={beat.md}>
        <p className="t-micro mt-5 text-center text-[0.62rem] tracking-[0.32em] text-ivory/75">
          {site.venue.line1}
          <span className="mx-2.5 text-gold/60">·</span>
          {site.venue.line2}
        </p>
      </Reveal>

      <Reveal variants={fadeIn} delay={beat.sm}>
        <div className="mt-12 flex justify-center">
          <VenueMarker className="aspect-square w-[min(56vw,208px)] text-gold" />
        </div>
      </Reveal>

      <Reveal variants={riseIn} delay={beat.sm} className="mt-12">
        <div className="flex flex-col items-center gap-6">
          {site.venue.note && (
            <p className="t-body measure-wide text-center text-pretty text-ivory/55">
              {site.venue.note}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href={googleMapsUrl}>
              <MapPinIcon />
              Open in Google Maps
            </Button>
            <Button href={directionsUrl} variant="ghost">
              Get directions
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 14.5s5-4.3 5-8a5 5 0 0 0-10 0c0 3.7 5 8 5 8Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.4" r="1.7" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
