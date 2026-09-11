import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ─────────────────────────────────────────────────────────────
 *  RSVP
 *
 *  Two sinks, tried in order:
 *
 *   1. RSVP_WEBHOOK_URL — set it to a Google Apps Script, a Zapier
 *      catch hook, a Slack webhook or your own endpoint, and every
 *      response is forwarded there as JSON.
 *   2. data/rsvp.jsonl — a local append-only log. Works out of the
 *      box in development and on any server with a writable disk.
 *
 *  If BOTH fail the endpoint says so with a 503 rather than
 *  pretending. A wedding site that silently drops RSVPs is worse
 *  than one with no form at all.
 * ─────────────────────────────────────────────────────────────
 */

type Payload = {
  name: string;
  contact: string;
  attending: "yes" | "no";
  guests: number;
  events: string[];
  message: string;
};

const LIMITS = { name: 120, contact: 160, message: 1200 } as const;

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function parse(body: unknown): Payload | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Malformed request." };
  const raw = body as Record<string, unknown>;

  const name = clean(raw.name, LIMITS.name);
  if (name.length < 2) return { error: "Please tell us your name." };

  const contact = clean(raw.contact, LIMITS.contact);
  if (contact.length < 5) return { error: "Please leave a phone number or email." };

  const attending = raw.attending === "no" ? "no" : "yes";

  const guestsRaw = Number(raw.guests);
  const guests = Number.isFinite(guestsRaw)
    ? Math.min(10, Math.max(1, Math.round(guestsRaw)))
    : 1;

  const events = Array.isArray(raw.events)
    ? raw.events.filter((e): e is string => typeof e === "string").slice(0, 12)
    : [];

  return {
    name,
    contact,
    attending,
    guests: attending === "no" ? 0 : guests,
    events: attending === "no" ? [] : events,
    message: clean(raw.message, LIMITS.message),
  };
}

async function forward(record: object): Promise<boolean> {
  const url = process.env.RSVP_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function persist(record: object): Promise<boolean> {
  try {
    const dir = join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(join(dir, "rsvp.jsonl"), `${JSON.stringify(record)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = parse(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const record = { ...parsed, receivedAt: new Date().toISOString() };

  // Both are attempted: a webhook that succeeds should not stop the
  // local copy being written, because a local copy costs nothing and
  // has saved more than one wedding.
  const [forwarded, stored] = await Promise.all([forward(record), persist(record)]);

  if (!forwarded && !stored) {
    return NextResponse.json(
      { error: "We could not record that. Please message us directly." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
