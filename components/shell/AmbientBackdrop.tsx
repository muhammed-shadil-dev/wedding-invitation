"use client";

import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { motes, scrollSpring } from "@/lib/motion";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE BACKDROP
 *
 *  There is one continuous background behind the entire page, and
 *  its colour is a function of scroll position. The guest travels
 *  from midnight, through plum and dusk, into an amber dawn, and
 *  arrives at a warm glow for the closing words.
 *
 *  This is what makes the transitions between sections feel
 *  continuous. Sections do not fade between themselves — they are
 *  all standing in the same room while the light changes.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Scroll checkpoints and the sky at each one.
 *
 * The journey now finishes where the envelope started: on paper.
 * Night gives way to deep plum, then warm burgundy, then a muted
 * terracotta, and the last stretch comes up to champagne so the
 * closing words are read as dark ink on a warm ground rather than
 * pale text on a dark one.
 *
 * The final two stops are spread across the countdown and the reply,
 * so the light arrives gradually and there is no seam at the point
 * the closing begins.
 */
const STOPS = [0, 0.2, 0.38, 0.55, 0.72, 0.88, 1];

const TOP = ["#07060b", "#0d0a14", "#150f1e", "#241624", "#3c2130", "#7d4a3c", "#dcc4a0"];
const BOTTOM = ["#110d18", "#1b1424", "#241a2c", "#3a2130", "#5e3038", "#a96a4e", "#f4e7d2"];
/** The warm light source that rises as the story advances. */
const GLOW = ["#1a1228", "#241734", "#33203a", "#4a2a34", "#7c4038", "#c98a62", "#f8efdd"];

export function AmbientBackdrop() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();

  // Smoothed so the colour never steps on fast flicks.
  const progress = useSpring(scrollYProgress, scrollSpring.atmosphere);

  const top = useTransform(progress, STOPS, TOP);
  const bottom = useTransform(progress, STOPS, BOTTOM);
  const glow = useTransform(progress, STOPS, GLOW);

  // The glow also climbs the screen and swells, so the light feels
  // like it is approaching rather than simply changing hue.
  const glowY = useTransform(progress, [0, 1], ["118%", "58%"]);
  const glowScale = useTransform(progress, [0, 1], [0.85, 1.5]);
  // The glow pulls back at the very end: a bright bloom on an already
  // light ground reads as a blown-out photograph, not as dawn.
  const glowOpacity = useTransform(progress, [0, 0.5, 0.85, 1], [0.45, 0.58, 0.66, 0.28]);

  // The cold counter-light and the drifting motes are night effects.
  // Both are gone by the time the ground turns to paper — gold specks
  // on champagne are invisible, and a blue wash would go grey.
  const nightOpacity = useTransform(progress, [0, 0.6, 0.85], [0.4, 0.34, 0]);
  const moteOpacity = useTransform(progress, [0, 0.7, 0.88], [1, 1, 0]);

  const sky = useMotionTemplate`linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
  const halo = useMotionTemplate`radial-gradient(circle at center, ${glow} 0%, transparent 68%)`;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* The sky */}
      <motion.div className="absolute inset-0" style={{ backgroundImage: sky }} />

      {/* The rising light */}
      <motion.div
        className="absolute left-1/2 aspect-square w-[160vmax] -translate-x-1/2"
        style={{
          backgroundImage: halo,
          top: reduced ? "80%" : glowY,
          scale: reduced ? 1 : glowScale,
          opacity: reduced ? 0.5 : glowOpacity,
          translateY: "-50%",
          willChange: "transform, opacity",
        }}
      />

      {/* A cold counter-light from the top left, to keep the night from
          going flat before the dawn arrives.

          `closest-side` matters here: with the default farthest-corner
          sizing the gradient was still opaque where the element ended,
          which drew a hard vertical edge down a phone screen. Sized to
          the closest side it always fades out inside its own box. */}
      <motion.div
        className="absolute -left-[40vw] -top-[40vh] h-[110vh] w-[110vw]"
        style={{
          opacity: reduced ? 0.4 : nightOpacity,
          background:
            "radial-gradient(circle closest-side, rgba(90,110,170,0.22) 0%, rgba(90,110,170,0.08) 45%, transparent 100%)",
        }}
      />

      <motion.div className="absolute inset-0" style={{ opacity: reduced ? 1 : moteOpacity }}>
        <Motes />
      </motion.div>
    </div>
  );
}


/** The drifting light. Field definition lives in the animation system. */
function Motes() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;

  return (
    <div className="absolute inset-0">
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute bottom-[-6vh] rounded-full bg-gold-light"
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            filter: "blur(0.5px)",
            boxShadow: "0 0 8px rgba(236,217,168,0.7)",
            ["--mote-x" as string]: `${m.drift}px`,
            ["--mote-opacity" as string]: m.opacity,
            animation: `mote ${m.duration}s linear ${m.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
