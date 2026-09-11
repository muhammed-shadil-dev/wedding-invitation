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

/** Scroll checkpoints and the sky at each one. */
const STOPS = [0, 0.22, 0.42, 0.62, 0.82, 1];

const TOP = ["#07060b", "#0d0a14", "#150f1e", "#1d1424", "#241820", "#2a1a18"];
const BOTTOM = ["#110d18", "#1b1424", "#241a2c", "#33202a", "#412734", "#4a2a24"];
/** The warm light source that rises as the story advances. */
const GLOW = ["#1a1228", "#241734", "#33203a", "#4a2a30", "#6b3d2a", "#8a4f36"];

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
  const glowOpacity = useTransform(progress, [0, 0.5, 1], [0.45, 0.58, 0.72]);

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
      <div
        className="absolute -left-[40vw] -top-[40vh] h-[110vh] w-[110vw] opacity-40"
        style={{
          background:
            "radial-gradient(circle closest-side, rgba(90,110,170,0.22) 0%, rgba(90,110,170,0.08) 45%, transparent 100%)",
        }}
      />

      <Motes />
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
