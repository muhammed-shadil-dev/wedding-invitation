"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useMounted } from "@/lib/hooks";
import { shareMessage, shareUrl, whatsappShareUrl } from "@/lib/calendar";
import { site } from "@/site.config";

/**
 * ─────────────────────────────────────────────────────────────
 *  SHARE
 *
 *  Three routes, in the order they actually work on a phone:
 *
 *    1. The native share sheet, where the browser offers it. It
 *       reaches every app the guest has, rather than the one we
 *       guessed for them.
 *    2. WhatsApp, which is how this invitation will in fact be
 *       passed around.
 *    3. Copy the link, which always works.
 *
 *  The whole row is mount-gated. Every link here is built from
 *  `window.location`, so rendering it on the server would bake in a
 *  different address than the client computes and hydration would
 *  mismatch. It sits at the foot of a long page behind a scroll
 *  reveal, so nothing is lost by waiting for the client.
 * ─────────────────────────────────────────────────────────────
 */
export function ShareInvitation() {
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);

  const canShare =
    mounted && typeof navigator !== "undefined" && typeof navigator.share === "function";

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: site.meta.title,
        text: shareMessage(),
        url: shareUrl(),
      });
    } catch {
      // The guest dismissed the sheet. Nothing to report.
    }
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard refused (insecure context, or denied). The WhatsApp
      // route and the address bar both still work.
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="t-micro text-[0.5rem] tracking-[0.3em] text-ivory/40">
        {site.share.label}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {canShare && (
          <Button onClick={nativeShare}>
            <ShareIcon />
            Share
          </Button>
        )}

        <Button href={whatsappShareUrl()} variant={canShare ? "ghost" : "gold"}>
          WhatsApp
        </Button>

        <Button onClick={copy} variant="ghost">
          {copied ? "Link copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 10.6V1.9M8 1.9 5.2 4.7M8 1.9l2.8 2.8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 8.2v4.6c0 .7.6 1.3 1.3 1.3h6.6c.7 0 1.3-.6 1.3-1.3V8.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
