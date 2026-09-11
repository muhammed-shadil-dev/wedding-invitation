"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { Envelope3D } from "./Envelope3D";
import { useInvitation } from "@/components/shell/InvitationProvider";
import { usePrefersReducedMotion, useScrollLock } from "@/lib/hooks";
import { ease, loop, overture, safeDelay, spring, transition } from "@/lib/motion";
import { Bismillah, CoupleNames } from "@/components/ui/CoupleNames";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE OPENING
 *
 *  The choreography lives in lib/motion.ts as `overture`. Roughly
 *  six seconds pass before the guest is asked to do anything, and
 *  nothing is tappable until the envelope has arrived.
 *
 *  The handover at the end is the important part. When the camera
 *  has pushed all the way into the card, a warm bloom fills the
 *  screen; the invitation resolves underneath it; then the gate
 *  fades and the bloom clears onto a composition that is already
 *  in place. The guest never sees one screen replace another —
 *  they see the card open into light.
 * ─────────────────────────────────────────────────────────────
 */
export function OpeningScreen() {
  const { phase, open, completeOpening } = useInvitation();
  const reduced = usePrefersReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  const bloom = useRef<HTMLDivElement>(null);

  useScrollLock(phase !== "open");

  const handleComplete = useCallback(() => {
    // The invitation is told to resolve at the same moment the gate
    // begins to fade, so the two cross under the bloom rather than
    // taking turns.
    setDismissed(true);
    completeOpening();
  }, [completeOpening]);

  const opening = phase === "opening";
  const at = (seconds: number) => safeDelay(seconds, reduced);

  return (
    <AnimatePresence>
      {phase !== "open" && (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden bg-ink px-6 py-[max(1.25rem,3vh)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: dismissed ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? transition.reduced : transition.bloom}
        >
          {/* A pool of warm light gathers on the floor of the frame */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[130vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,106,0.16) 0%, rgba(90,60,120,0.08) 38%, transparent 68%)",
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: overture.light.duration,
              ease: ease.veil,
              delay: at(overture.light.at),
            }}
          />

          {/* ── The words ─────────────────────────────────── */}
          <motion.div
            className="relative z-10 flex shrink-0 flex-col items-center text-center"
            animate={
              opening
                ? { opacity: 0, y: reduced ? 0 : -24, filter: "blur(4px)" }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            transition={transition.entrance}
          >
            <motion.div
              className="hairline mb-[clamp(1rem,3.5vh,2rem)] h-px w-40 origin-center"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: overture.rule.duration,
                ease: ease.veil,
                delay: at(overture.rule.at),
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: overture.eyebrow.duration,
                ease: ease.silk,
                delay: at(overture.eyebrow.at),
              }}
            >
              <Bismillah />
            </motion.div>

            <motion.h1
              className="t-hero mt-[clamp(0.75rem,2.5vh,1.5rem)] text-ivory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: overture.names.duration,
                ease: ease.silk,
                delay: at(overture.names.at),
              }}
            >
              <CoupleNames />
            </motion.h1>
          </motion.div>

          {/* ── The envelope ──────────────────────────────── */}
          <motion.div
            className="relative z-10 mt-[clamp(1rem,4vh,2.5rem)]"
            initial={{ opacity: 0, scale: 0.86, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: overture.envelope.duration,
              ease: ease.silk,
              delay: at(overture.envelope.at),
            }}
          >
            {/* The breathing is the only idle loop in the opening, and
                it exists to say "this is waiting for you". It stops the
                instant it is answered. */}
            <div
              style={
                reduced || opening
                  ? undefined
                  : {
                      animation: `breathe ${overture.breathe.duration}s ease-in-out ${overture.breathe.at}s infinite`,
                    }
              }
            >
              <Envelope3D open={opening} bloom={bloom} onComplete={handleComplete} />
            </div>
          </motion.div>

          {/* ── The invitation to act ─────────────────────── */}
          <motion.div
            className="relative z-10 mt-[clamp(1.25rem,4.5vh,3rem)] flex flex-col items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={opening ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            transition={{
              duration: overture.invite.duration,
              ease: ease.silk,
              delay: opening ? 0 : at(overture.invite.at),
            }}
          >
            <OpenButton onOpen={open} disabled={opening} />
            <p className="t-micro mt-[clamp(0.75rem,2vh,1.25rem)] text-ivory/35">
              Sound on, if you can
            </p>
          </motion.div>

          {/* ── The handover ──────────────────────────────── */}
          <div
            ref={bloom}
            aria-hidden
            data-role="bloom"
            className="pointer-events-none absolute inset-0 z-20 opacity-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, #fdf6e6 0%, #f0e0c0 30%, #d8b98a 62%, #8a6b45 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The single most important button on the site. A gold hairline ring
 * with a slow pulse travelling outward from it — the visual equivalent
 * of a hand held out, and the only loop running at this moment.
 */
function OpenButton({ onOpen, disabled }: { onOpen: () => void; disabled: boolean }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      className="group relative rounded-full px-10 py-4 disabled:pointer-events-none"
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={spring.tactile}
    >
      <span className="absolute inset-0 rounded-full border border-gold/50 transition-colors duration-700 group-hover:border-gold" />

      {!reduced && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-gold/40"
          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
          transition={loop.invite}
        />
      )}

      <span className="relative t-micro text-[0.68rem] tracking-[0.34em] text-gold-light">
        Open Invitation
      </span>
    </motion.button>
  );
}
