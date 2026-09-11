"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Divider } from "@/components/ui/Ornament";
import { Section, SceneTitle } from "@/components/ui/Section";
import { useCountdown, usePrefersReducedMotion } from "@/lib/hooks";
import { beat, fadeIn, riseIn, transition } from "@/lib/motion";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE COUNTDOWN
 *
 *  Only the figure that actually changed animates. Replacing all
 *  eight numerals every second makes the scene twitch, and a page
 *  that twitches cannot feel expensive.
 *
 *  The seconds are set quieter than the rest for the same reason:
 *  they are the least important number here, and the only one that
 *  moves often enough to pull the eye off the words.
 * ─────────────────────────────────────────────────────────────
 */
export function Countdown() {
  const { time, ready } = useCountdown(site.weddingDate);

  const units = [
    { value: time.days, label: "Days" },
    { value: time.hours, label: "Hours" },
    { value: time.minutes, label: "Minutes" },
    { value: time.seconds, label: "Seconds" },
  ];

  return (
    <Section id="countdown">
      <Reveal variants={fadeIn}>
        <SceneTitle label={time.past ? site.scenes.countdown.pastLabel : site.scenes.countdown.label}>
          <SplitText
            text={time.past ? site.scenes.countdown.pastTitle : site.scenes.countdown.title}
            by="line"
            as="span"
          />
        </SceneTitle>
      </Reveal>

      {!time.past && (
        <div className="mt-14 grid grid-cols-4 gap-2 sm:gap-6">
          {units.map((unit, i) => (
            <Unit
              key={unit.label}
              value={unit.value}
              label={unit.label}
              ready={ready}
              index={i}
              quiet={unit.label === "Seconds"}
            />
          ))}
        </div>
      )}

      {site.invitation.blessing && (
        <>
          <Divider className="mt-16" />
          <Reveal variants={riseIn} delay={beat.sm}>
            <p className="t-lede mt-10 text-center text-ivory/55">
              {site.invitation.blessing}
            </p>
          </Reveal>
        </>
      )}
    </Section>
  );
}

function Unit({
  value,
  label,
  ready,
  index,
  quiet,
}: {
  value: number;
  label: string;
  ready: boolean;
  index: number;
  quiet?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const display = String(value).padStart(2, "0");

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ ...transition.entrance, delay: reduced ? 0 : index * beat.xs }}
    >
      <div
        className={`relative flex h-[64px] w-full items-center justify-center overflow-hidden sm:h-[88px] ${
          quiet ? "opacity-55" : ""
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            className="absolute font-display text-[clamp(1.85rem,9vw,3.25rem)] font-light leading-none tabular-nums text-ivory"
            initial={reduced || !ready ? { opacity: 0 } : { y: "55%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: "-55%", opacity: 0 }}
            transition={reduced ? transition.reduced : transition.tick}
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* A hairline under each figure, like a printed ledger */}
      <span className="h-px w-full max-w-[52px] bg-gold/25" />

      <span className="t-micro text-[0.48rem] tracking-[0.26em] text-ivory/40 sm:text-[0.55rem]">
        {label}
      </span>
    </motion.div>
  );
}
