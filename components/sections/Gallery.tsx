"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Photograph } from "@/components/ui/Photograph";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { SceneTitle } from "@/components/ui/Section";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { fadeIn, riseIn, transition } from "@/lib/motion";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE PHOTOGRAPHS
 *
 *  Laid out as a photo essay, not a gallery of cards.
 *
 *  A uniform grid tells the guest that every picture is worth the
 *  same, which is never true. So the plates here vary in width,
 *  in shape, in which margin they sit against, and in how far they
 *  are pushed down the page. Two of them run nearly edge to edge and
 *  carry the scene; the others are quieter and set in from one side.
 *
 *  Captions sit outside the frame, in the margin, numbered — the way
 *  plates are captioned in a printed book rather than labelled on a
 *  website. The eye travels down the page instead of scanning rows.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * The rhythm of the essay. Index-matched to site.gallery.
 *
 * `width` is the mobile treatment and `side` which margin it hugs;
 * `col` takes over on wide screens where there is room for a real
 * asymmetric grid. `lift` overlaps a plate into the one above it,
 * which is what stops the page reading as a stack.
 */
const PLATES = [
  { width: "w-full", side: "mx-auto", aspect: "aspect-[4/5]", col: "sm:col-span-7 sm:col-start-1", lift: "", drift: 9 },
  { width: "w-[76%]", side: "ml-auto", aspect: "aspect-square", col: "sm:col-span-5 sm:col-start-8", lift: "lg:-mt-24", drift: 6 },
  { width: "w-[64%]", side: "mr-auto", aspect: "aspect-[3/4]", col: "sm:col-span-4 sm:col-start-2", lift: "lg:mt-4", drift: 7 },
  { width: "w-full", side: "mx-auto", aspect: "aspect-[21/9]", col: "sm:col-span-12 sm:col-start-1", lift: "", drift: 11 },
  { width: "w-[70%]", side: "mr-auto", aspect: "aspect-[4/5]", col: "sm:col-span-5 sm:col-start-1", lift: "", drift: 6 },
  { width: "w-[78%]", side: "ml-auto", aspect: "aspect-square", col: "sm:col-span-6 sm:col-start-7", lift: "lg:-mt-20", drift: 6 },
] as const;

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="gallery" className="relative w-full px-5 py-20 sm:px-8 md:py-28 lg:py-32">
      <div className="mx-auto w-full max-w-[620px] lg:max-w-[740px]">
        <Reveal variants={fadeIn}>
          <SceneTitle label={site.scenes.gallery.label}>
            <SplitText text={site.scenes.gallery.title} by="line" as="span" />
          </SceneTitle>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid w-full max-w-[1040px] grid-cols-1 gap-y-14 sm:grid-cols-12 sm:gap-x-6 sm:gap-y-20 lg:mt-28">
        {site.gallery.map((item, i) => {
          const plate = PLATES[i % PLATES.length];
          return (
            <figure
              key={item.src}
              className={`${plate.col} ${plate.lift} ${plate.width} ${plate.side} sm:w-full`}
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                className="group block w-full text-left"
                aria-label={`View ${item.alt}`}
              >
                <Photograph
                  src={item.src}
                  alt={item.alt}
                  drift={plate.drift}
                  className={`${plate.aspect} w-full`}
                />
              </button>

              {/* The caption, in the margin, numbered like a plate */}
              <Reveal variants={riseIn} as="figcaption" className="mt-3 flex items-baseline gap-3">
                <span className="t-micro text-[0.5rem] text-gold/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-ivory/10" />
                {item.caption && (
                  <span className="t-micro text-[0.5rem] text-ivory/45">{item.caption}</span>
                )}
              </Reveal>
            </figure>
          );
        })}
      </div>

      <Lightbox
        index={active}
        onClose={() => setActive(null)}
        onStep={(d) =>
          setActive((current) =>
            current === null
              ? null
              : (current + d + site.gallery.length) % site.gallery.length
          )
        }
      />
    </section>
  );
}

/**
 * Full-bleed viewing. A horizontal flick moves through the set, which
 * is what a thumb tries first; Escape and the arrow keys are there
 * because a viewer you cannot leave is a viewer people close by
 * reloading the page.
 */
function Lightbox({
  index,
  onClose,
  onStep,
}: {
  index: number | null;
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const open = index !== null;
  const item = open ? site.gallery[index] : null;

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    },
    [onClose, onStep]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onKey]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/96 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? transition.reduced : transition.veil}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.alt}
        >
          <motion.figure
            className="relative max-h-[82vh] w-full max-w-[520px]"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={transition.entrance}
            onClick={(e) => e.stopPropagation()}
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) onStep(1);
              else if (info.offset.x > 70) onStep(-1);
            }}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="max-h-[82vh] w-full rounded-[2px] object-contain"
              draggable={false}
            />
            <figcaption className="mt-4 flex items-center justify-center gap-3">
              <span className="t-micro text-[0.5rem] text-gold/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.caption && (
                <span className="t-micro text-[0.5rem] text-ivory/50">{item.caption}</span>
              )}
            </figcaption>
          </motion.figure>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="control-glass absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-gold-light"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
