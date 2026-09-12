"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Lede, Section, SceneTitle } from "@/components/ui/Section";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { beat, dur, ease, fadeIn, riseIn, viewport } from "@/lib/motion";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { Button } from "@/components/ui/Button";
import { site, type EventItem } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE CELEBRATIONS
 *
 *  Printed on the same card stock the envelope delivered, which is
 *  what ties this scene back to the opening: the guest has seen this
 *  paper before, in the dark, with a seal on it.
 *
 *  Each card sheds a few degrees of rotation as it arrives, so it
 *  reads as a card laid down on a table rather than a div fading in.
 *  Six degrees, no more — the moment the rotation becomes noticeable
 *  it stops being elegant and starts being an effect.
 * ─────────────────────────────────────────────────────────────
 */
export function Events() {
  return (
    <Section id="events">
      <Reveal variants={fadeIn}>
        <SceneTitle label={site.scenes.events.label}>
          <SplitText text={site.scenes.events.title} by="line" as="span" />
        </SceneTitle>
      </Reveal>

      {site.scenes.events.lede && (
        <Reveal variants={riseIn} delay={beat.md} className="mt-6">
          <Lede>{site.scenes.events.lede}</Lede>
        </Reveal>
      )}

      <div className="stage mt-14 flex flex-col gap-6">
        {site.events.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>

      <Reveal variants={riseIn} delay={beat.sm} className="mt-10">
        <div className="flex flex-col items-center gap-4">
          <p className="t-micro text-[0.5rem] tracking-[0.3em] text-ivory/40">
            Keep the date
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href={googleCalendarUrl()}>
              <CalendarIcon />
              Google Calendar
            </Button>
            {/* iOS, Apple Calendar and Outlook all want a file. */}
            <Button variant="ghost" onClick={downloadIcs}>
              Apple &amp; Outlook
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function EventCard({ event, index }: { event: EventItem; index: number }) {
  const reduced = usePrefersReducedMotion();
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.mapQuery
  )}`;

  return (
    <motion.article
      className="paper preserve-3d relative overflow-hidden rounded-[4px] px-6 py-9 text-center sm:px-10 sm:py-11"
      initial={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, y: 30, rotateX: 6, transformPerspective: 1200 }
      }
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={viewport}
      transition={{
        duration: dur.slow,
        ease: ease.silk,
        delay: reduced ? 0 : index * beat.xs,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[10px] rounded-[2px] border border-[#c9a86a]/30"
      />

      <div className="relative">
        <p className="t-micro text-[0.52rem] tracking-[0.34em] text-[#9a7c47]">
          {event.displayDate}
        </p>

        <h3 className="t-title mt-4 text-[2rem] leading-none text-[#23392c]">
          {event.name}
        </h3>

        {event.tagline && (
          <p className="t-lede mt-2 text-[0.95rem] text-[#5c6b5f]">{event.tagline}</p>
        )}

        <div className="mx-auto my-6 h-px w-10 bg-[#c9a86a]/50" />

        <dl className="flex flex-col gap-3 text-[#5c5245]">
          <Row label="Time" value={event.time} />
          <Row label="Where" value={event.venue} />
          <Row label="Address" value={event.address} />
          {event.dressCode && <Row label="Attire" value={event.dressCode} />}
        </dl>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-5 inline-flex min-h-[44px] items-center gap-2 px-4 py-3 t-micro text-[0.55rem] tracking-[0.28em] text-[#8a6b33] transition-colors duration-500 hover:text-[#5c4620]"
        >
          <span>Directions</span>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 13L13 3M13 3H6M13 3v7"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-500 group-hover:translate-x-[2px]"
            />
          </svg>
        </a>
      </div>
    </motion.article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <dt className="t-micro text-[0.5rem] tracking-[0.28em] text-[#a89573]">{label}</dt>
      <dd className="t-caption text-pretty">{value}</dd>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3.2" width="12" height="10.8" rx="1.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2 6.4h12M5.4 1.9v2.6M10.6 1.9v2.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
