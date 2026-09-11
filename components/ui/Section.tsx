import type { ReactNode } from "react";

/**
 * Every scene shares this shell, so vertical rhythm and the reading
 * measure stay constant down the whole page. Scenes differ in what
 * they say, never in how they are set.
 */
export function Section({
  id,
  children,
  className = "",
  /** Full-bleed scenes (the gallery) opt out of the measure. */
  bleed = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative w-full ${bleed ? "" : "px-6 sm:px-8"} py-20 md:py-28 lg:py-32 ${className}`}
    >
      <div className={bleed ? "w-full" : "mx-auto w-full max-w-[620px] lg:max-w-[740px]"}>
        {children}
      </div>
    </section>
  );
}

/**
 * The opening of a scene: a gold label, then the name of the scene.
 * Kept together because the pair is the hierarchy — a title without
 * its label reads as a heading on a web page rather than a moment in
 * an evening.
 */
export function SceneTitle({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <header className={`flex flex-col items-center text-center ${className}`}>
      <p className="t-eyebrow mb-5">{label}</p>
      <h2 className="t-display text-balance text-ivory">{children}</h2>
    </header>
  );
}

/** The single italic sentence that sets a scene. */
export function Lede({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`t-lede measure-wide text-pretty text-center text-ivory/55 ${className}`}>
      {children}
    </p>
  );
}
