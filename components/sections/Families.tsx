"use client";

import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Flourish } from "@/components/ui/Ornament";
import { Section, SceneTitle } from "@/components/ui/Section";
import { beat, fadeIn, riseIn } from "@/lib/motion";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE FAMILIES
 *
 *  A wedding invitation names the parents before it names anything
 *  else, so this scene comes first after the arrival.
 *
 *  Each family sits inside a thin gold frame with a botanical sprig
 *  above it — the two marks the printed card uses most. There are no
 *  photographs here because none were given, and an invented face is
 *  worse than an honest absence: the frame carries the names instead.
 * ─────────────────────────────────────────────────────────────
 */
export function Families() {
  const { bride, groom } = site.families;

  return (
    <Section id="families">
      <Reveal variants={fadeIn}>
        <SceneTitle label={site.scenes.families.label}>
          <SplitText text={site.scenes.families.title} by="line" as="span" />
        </SceneTitle>
      </Reveal>

      <div className="mt-14 grid gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-7">
        <FamilyPanel family={bride} />
        <FamilyPanel family={groom} delay={beat.sm} />
      </div>
    </Section>
  );
}

function FamilyPanel({
  family,
  delay = 0,
}: {
  family: { label: string; names: string; address: readonly string[] };
  delay?: number;
}) {
  return (
    <Reveal variants={riseIn} delay={delay}>
      <article className="relative flex h-full flex-col items-center px-6 py-10 text-center">
        {/* The thin gold frame, drawn as a single hairline border */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[3px] border border-gold/22"
        />

        <Flourish className="mb-6 h-6 w-20 text-gold/55" />

        <p className="t-micro text-[0.52rem] tracking-[0.3em] text-gold/75">
          {family.label}
        </p>

        <h3 className="t-title mt-4 text-balance text-ivory">{family.names}</h3>

        {family.address.length > 0 && (
          <address className="t-body mt-4 not-italic text-pretty text-ivory/50">
            {family.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        )}
      </article>
    </Reveal>
  );
}
