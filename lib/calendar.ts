import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  CALENDAR
 *
 *  Two ways to keep the date, both built by hand because a calendar
 *  file is thirteen lines of text and does not warrant a dependency:
 *
 *    Google Calendar — a template URL, which is what an Android
 *    phone and most desktop browsers want.
 *
 *    .ics — a Blob the browser downloads, which is what iOS,
 *    Apple Calendar and Outlook want.
 *
 *  Times are emitted in UTC (the Z form), so the event lands at the
 *  right local moment for a guest in any timezone.
 * ─────────────────────────────────────────────────────────────
 */

/** 2026-11-08T11:30:00+05:30 → 20261108T060000Z */
function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eventFields() {
  const wedding = site.events[0];
  return {
    title: `${site.couple.brideFull} & ${site.couple.groomFull} — ${wedding.name}`,
    start: toCalendarStamp(site.weddingDate),
    end: toCalendarStamp(site.weddingEndsAt),
    location: `${wedding.venue}, ${wedding.address}`,
    details: site.invitation.heading.join(" "),
  };
}

/** A Google Calendar "add event" URL. */
export function googleCalendarUrl(): string {
  const e = eventFields();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${e.start}/${e.end}`,
    location: e.location,
    details: e.details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** The same event as an .ics file body. */
export function icsBody(): string {
  const e = eventFields();
  // Folding is not needed at these lengths, but CRLF line endings are
  // required by RFC 5545 and some clients genuinely reject LF alone.
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.start}-wedding@invitation`,
    `DTSTAMP:${e.start}`,
    `DTSTART:${e.start}`,
    `DTEND:${e.end}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `LOCATION:${escapeIcs(e.location)}`,
    `DESCRIPTION:${escapeIcs(e.details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Commas, semicolons and newlines are structural in ICS. */
function escapeIcs(value: string): string {
  return value
    .replace(/([,;\\])/g, "\\$1")
    .replace(/\r?\n/g, "\\n");
}

/** Hands the guest an .ics file. Browser-only. */
export function downloadIcs() {
  const blob = new Blob([icsBody()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nehda-and-umar-wedding.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next turn, so the download has taken the reference.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ── Maps ──────────────────────────────────────────────────── */

const mapQuery = encodeURIComponent(site.venue.mapQuery);

/** Opens the venue's place page. */
export const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

/** Opens turn-by-turn directions from wherever the guest is. */
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

/* ── Contact ───────────────────────────────────────────────── */

/** The number exactly as printed, for a tel: link. */
export const telUrl = `tel:${site.rsvp.phone}`;

/** The same number in international form, which wa.me requires. */
export function whatsappUrl(message = site.rsvp.whatsappMessage): string {
  const number = `${site.rsvp.dialCode}${site.rsvp.phone}`.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/* ── Sharing ───────────────────────────────────────────────── */

/** The live address of the invitation, resolved in the browser. */
export function shareUrl(): string {
  if (typeof window === "undefined") return site.meta.url;
  return `${window.location.origin}${window.location.pathname}`;
}

export function shareMessage(): string {
  return site.share.message.replace("{url}", shareUrl());
}

/** A WhatsApp share of the invitation itself, not the RSVP. */
export function whatsappShareUrl(): string {
  return `https://wa.me/?text=${encodeURIComponent(shareMessage())}`;
}
