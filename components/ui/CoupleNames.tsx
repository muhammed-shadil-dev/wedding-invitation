import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  THE NAMES
 *
 *  Rendered by exactly one component so the opening screen and the
 *  invitation cannot drift apart. The handover depends on the guest
 *  seeing the same treatment on both sides of the bloom, and the
 *  surest way to guarantee that is to have one piece of markup.
 *
 *  The names are stacked over three lines with the ampersand between
 *  them, the way they are set on a printed card. Stacking is also
 *  what makes two full names fit at 360px without the display size
 *  having to collapse to something apologetic.
 * ─────────────────────────────────────────────────────────────
 */
export function CoupleNames({ className = "" }: { className?: string }) {
  const { brideFull, groomFull } = site.couple;

  return (
    <span className={`flex flex-col items-center leading-[1.04] ${className}`}>
      <span className="foil">{brideFull}</span>
      <span className="amp my-[0.06em] text-[0.72em]">&amp;</span>
      <span className="foil">{groomFull}</span>
    </span>
  );
}

/** The request, set as the three lines the card sets it in. */
export function InvitationHeading({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-col items-center gap-1 ${className}`}>
      {site.invitation.heading.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

/**
 * The invocation. Marked rtl and lang="ar" so the shaping engine and
 * any screen reader both treat it as Arabic rather than as a run of
 * unfamiliar characters.
 */
export function Bismillah({
  className = "",
  transliteration = true,
}: {
  className?: string;
  transliteration?: boolean;
}) {
  return (
    <span className={`flex flex-col items-center ${className}`}>
      <span className="t-arabic text-gold-light/90" dir="rtl" lang="ar">
        {site.bismillah.arabic}
      </span>
      {transliteration && (
        <span className="t-micro mt-1 text-[0.52rem] tracking-[0.26em] text-ivory/45">
          {site.bismillah.transliteration}
        </span>
      )}
    </span>
  );
}
