"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useSyncExternalStore } from "react";
import { getAudioEngine } from "@/lib/audio";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { beat, loop, spring, transition } from "@/lib/motion";
import { useInvitation } from "./InvitationProvider";

/**
 * The only persistent control on the page. It appears after the
 * envelope opens, because before that there is nothing to mute.
 *
 * Four bars that dance while sound is playing and settle flat when
 * muted — the state is legible at a glance without an icon swap.
 */
export function AudioToggle() {
  const { phase } = useInvitation();
  const reduced = usePrefersReducedMotion();
  const engine = getAudioEngine();

  const subscribe = useCallback((cb: () => void) => engine.subscribe(cb), [engine]);
  const playing = useSyncExternalStore(
    subscribe,
    () => engine.isPlaying,
    () => false
  );
  const started = useSyncExternalStore(
    subscribe,
    () => engine.hasStarted,
    () => false
  );

  const visible = phase !== "sealed" && started;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => engine.toggle()}
          aria-label={playing ? "Mute music" : "Play music"}
          aria-pressed={playing}
          className="control-glass fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full sm:right-7 sm:top-7"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ ...transition.entrance, delay: beat.lg }}
          whileTap={reduced ? undefined : { scale: 0.92 }}
        >
          <span className="flex h-4 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-[2px] rounded-full bg-gold-light"
                animate={
                  playing && !reduced
                    ? { height: ["30%", "100%", "45%", "80%", "30%"] }
                    : { height: "22%" }
                }
                transition={playing && !reduced ? loop.audio(i) : spring.tactile}
                style={{ height: "22%" }}
              />
            ))}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
