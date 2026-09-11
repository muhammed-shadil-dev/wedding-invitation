"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { beat, scrollSpring, transition } from "@/lib/motion";
import { useInvitation } from "./InvitationProvider";

/**
 * A one-pixel gold thread down the right edge that fills as the guest
 * moves through the invitation. Deliberately not a chunky progress bar
 * — it should read as a bookmark ribbon, noticed only if looked for.
 */
export function ScrollProgress() {
  const { phase } = useInvitation();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, scrollSpring.thread);

  return (
    <AnimatePresence>
      {phase === "open" && (
        <motion.div
          className="pointer-events-none fixed right-0 top-0 z-40 hidden h-screen w-px sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ...transition.fade, delay: beat.xxl }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-ivory/8" />
          <motion.div
            className="absolute inset-x-0 top-0 h-full origin-top bg-linear-to-b from-gold-light to-gold"
            style={{ scaleY, willChange: "transform" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
