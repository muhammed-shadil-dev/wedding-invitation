"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { lenis as lenisConfig } from "@/lib/motion";
import { useInvitation } from "./InvitationProvider";

/**
 * Lenis, wired to a single rAF loop shared with nothing else.
 *
 * Two rules:
 *  - While the envelope is sealed, scrolling is stopped. There is
 *    nothing below yet, and a page that scrolls behind a full-screen
 *    gate feels broken.
 *  - Under prefers-reduced-motion, Lenis is not created at all.
 *    Smoothed scrolling is itself motion, and some people who set
 *    that flag get motion sick from scroll easing specifically.
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const { phase } = useInvitation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis(lenisConfig);

    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Lock while sealed, release the moment the envelope starts opening
  // so the reveal can scroll the guest gently into the content.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (phase === "sealed") lenis.stop();
    else lenis.start();
  }, [phase]);

  return null;
}
