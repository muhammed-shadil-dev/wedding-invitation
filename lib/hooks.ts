"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Reduced-motion preference, live. Users can flip the OS setting
 * mid-session and the site responds without a reload.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** True once the component has mounted on the client. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target date has passed. */
  past: boolean;
};

const ZERO: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, past: false };

/**
 * Countdown to an ISO date. Renders zeros on the server and on the
 * first client paint, then ticks — so there is no hydration mismatch.
 */
export function useCountdown(targetIso: string): { time: TimeLeft; ready: boolean } {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [time, setTime] = useState<TimeLeft>(ZERO);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const compute = (): TimeLeft => {
      const diff = target - Date.now();
      if (diff <= 0) return { ...ZERO, past: true };
      const s = Math.floor(diff / 1000);
      return {
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60,
        past: false,
      };
    };

    setTime(compute());
    setReady(true);

    // Align the tick to the top of each second so the digits change together.
    let timeout = window.setTimeout(function tick() {
      setTime(compute());
      timeout = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    }, 1000 - (Date.now() % 1000));

    return () => window.clearTimeout(timeout);
  }, [target]);

  return { time, ready };
}

/**
 * Tracks an element's progress through the viewport, 0 → 1, on the
 * scroll thread via IntersectionObserver + rAF. Used by the backdrop
 * to shift the palette as the story advances.
 */
export function useElementProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let visible = false;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const seen = vh - rect.top;
      setProgress(Math.min(1, Math.max(0, seen / total)));
      if (visible) raf = requestAnimationFrame(measure);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) raf = requestAnimationFrame(measure);
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, progress };
}

/** Locks body scroll while the envelope gate is closed. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
