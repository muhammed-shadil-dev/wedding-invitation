"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { AmbientBackdrop } from "./AmbientBackdrop";
import { Atmosphere } from "./Atmosphere";
import { AudioToggle } from "./AudioToggle";
import { ScrollProgress } from "./ScrollProgress";
import { SmoothScroll } from "./SmoothScroll";
import { useInvitation } from "./InvitationProvider";
import { OpeningScreen } from "@/components/gate/OpeningScreen";
import { SceneBreak } from "@/components/ui/Ornament";
import { Hero } from "@/components/sections/Hero";
import { Families } from "@/components/sections/Families";
import { Story } from "@/components/sections/Story";
import { Events } from "@/components/sections/Events";
import { Venue } from "@/components/sections/Venue";
import { Gallery } from "@/components/sections/Gallery";
import { Countdown } from "@/components/sections/Countdown";
import { Rsvp } from "@/components/sections/Rsvp";
import { Closing } from "@/components/sections/Closing";
import { beat, transition } from "@/lib/motion";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE INVITATION
 *
 *  The running order, stitched.
 *
 *  Between each pair of scenes sits the same mark: a thread dropping
 *  from the scene above, through a diamond, into the scene below. It
 *  is the punctuation of the document, and it is the reason the page
 *  reads as one continuous morning rather than a stack of sections.
 *  Every junction carries it except the last — the closing opens with
 *  a flourish of its own, and two marks in a row would stutter at the
 *  moment the page should be letting go.
 *
 *  The order is composed from the content that actually exists. The
 *  story and the gallery appear the moment their arrays in
 *  site.config.ts have anything in them, and stay out of the way
 *  until then, breaks and all. Nothing has to be commented out.
 *
 *  The content is always mounted; it is the gate that sits on top of
 *  it. So fonts and the map iframe are decoded and ready by the time
 *  the envelope finishes opening, and no guest ever waits for a scene
 *  to load — every scene loaded while they were watching the seal
 *  break.
 * ─────────────────────────────────────────────────────────────
 */
export function Invitation() {
  const { phase } = useInvitation();

  const scenes = [
    { key: "families", node: <Families /> },
    ...(site.story.length ? [{ key: "story", node: <Story /> }] : []),
    { key: "events", node: <Events /> },
    { key: "venue", node: <Venue /> },
    ...(site.gallery.length ? [{ key: "gallery", node: <Gallery /> }] : []),
    { key: "countdown", node: <Countdown /> },
    { key: "rsvp", node: <Rsvp /> },
  ];

  return (
    <>
      <AmbientBackdrop />
      <SmoothScroll />
      <Atmosphere />
      <AudioToggle />
      <ScrollProgress />

      <OpeningScreen />

      <motion.main
        // Hidden from assistive technology until it is genuinely reachable.
        aria-hidden={phase !== "open"}
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "sealed" ? 0 : 1 }}
        transition={{
          ...transition.fade,
          delay: phase === "opening" ? beat.md : 0,
        }}
      >
        <Hero />

        {scenes.map((scene) => (
          <Fragment key={scene.key}>
            <SceneBreak />
            {scene.node}
          </Fragment>
        ))}

        <Closing />
      </motion.main>
    </>
  );
}
