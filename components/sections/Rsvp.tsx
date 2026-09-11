"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { Section, SceneTitle } from "@/components/ui/Section";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { beat, fadeIn, loop, riseIn, spring, transition } from "@/lib/motion";
import { site } from "@/site.config";

type Status = "idle" | "sending" | "done" | "error";

/**
 * ─────────────────────────────────────────────────────────────
 *  RSVP
 *
 *  The form is set on the same card stock as the events, because
 *  this is the one place the guest writes back on the invitation
 *  rather than reading it.
 *
 *  Inputs are underlines, not boxes: it should feel like filling
 *  in a reply card with a pen, and boxes on a wedding invitation
 *  look like a tax return.
 * ─────────────────────────────────────────────────────────────
 */
export function Rsvp() {
  const reduced = usePrefersReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [events, setEvents] = useState<string[]>(site.events.map((e) => e.id));

  const toggleEvent = (id: string) =>
    setEvents((current) =>
      current.includes(id) ? current.filter((e) => e !== id) : [...current, id]
    );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          contact: form.get("contact"),
          attending,
          guests: form.get("guests"),
          events,
          message: form.get("message"),
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const call = `tel:${site.rsvp.phone}`;

  return (
    <Section id="rsvp">
      <Reveal variants={fadeIn}>
        <SceneTitle label={site.scenes.rsvp.label}>
          <SplitText text={site.scenes.rsvp.title} by="line" as="span" />
        </SceneTitle>
      </Reveal>

      {site.rsvp.deadline && (
        <Reveal variants={riseIn} delay={beat.md}>
          <p className="t-micro mt-5 text-center text-[0.58rem] tracking-[0.28em] text-gold/75">
            {site.rsvp.deadline}
          </p>
        </Reveal>
      )}

      <Reveal variants={riseIn} delay={beat.md} className="mt-7">
        <div className="flex flex-col items-center gap-3">
          <p className="t-micro text-[0.52rem] tracking-[0.3em] text-ivory/45">
            RSVP
          </p>
          <a
            href={`tel:${site.rsvp.phone}`}
            className="font-display text-[1.65rem] leading-none tracking-[0.06em] text-gold-light transition-colors duration-500 hover:text-ivory"
          >
            {site.rsvp.phone}
          </a>
        </div>
      </Reveal>

      <motion.div
        className="paper relative mt-12 overflow-hidden rounded-[4px] px-6 py-10 sm:px-10 sm:py-12"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={transition.slow}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[10px] rounded-[2px] border border-[#c9a86a]/30"
        />

        <AnimatePresence mode="wait">
          {status === "done" ? (
            <ThankYou key="done" />
          ) : (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              className="relative flex flex-col gap-8"
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={transition.exit}
            >
              <Field label="Your name" name="name" placeholder="As we should write it" required />
              <Field
                label="Phone or email"
                name="contact"
                placeholder="So we can reach you"
                required
              />

              <Choice attending={attending} onChange={setAttending} />

              <AnimatePresence initial={false}>
                {attending === "yes" && (
                  <motion.div
                    key="details"
                    className="flex flex-col gap-8 overflow-hidden"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={transition.entrance}
                  >
                    <Field
                      label="How many of you"
                      name="guests"
                      type="number"
                      defaultValue="1"
                      min={1}
                      max={10}
                    />
                    {/* With a single celebration there is nothing to
                        choose between, so the picker stays away. */}
                    {site.events.length > 1 && (
                      <EventPicker selected={events} onToggle={toggleEvent} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Field
                label="A note for us"
                name="message"
                placeholder="Optional, and always read"
                multiline
              />

              {status === "error" && (
                <motion.p
                  className="t-caption text-center text-[#8c2f39]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}{" "}
                  <a href={call} className="underline underline-offset-4">
                    Call us instead
                  </a>
                  .
                </motion.p>
              )}

              <SubmitButton status={status} />
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
}

/** A ruled line with a floating label. No boxes anywhere. */
function Field({
  label,
  name,
  placeholder,
  type = "text",
  required,
  multiline,
  defaultValue,
  min,
  max,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  defaultValue?: string;
  min?: number;
  max?: number;
}) {
  const shared =
    "peer w-full border-0 border-b border-[#c9a86a]/35 bg-transparent pb-2 pt-1 font-display text-[1.05rem] font-normal text-[#3a3129] outline-none transition-colors duration-500 placeholder:text-[#a89573]/60 focus:border-[#8a6b33]";

  return (
    <label className="relative flex flex-col gap-2 text-left">
      <span className="t-micro text-[0.5rem] tracking-[0.3em] text-[#9a8560]">
        {label}
        {required && <span className="ml-1 text-[#b8434f]">*</span>}
      </span>

      {multiline ? (
        <textarea name={name} placeholder={placeholder} rows={3} className={`${shared} resize-none`} />
      ) : (
        <input
          name={name}
          type={type}
          inputMode={type === "number" ? "numeric" : undefined}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          min={min}
          max={max}
          className={shared}
        />
      )}

      {/* The line thickens under focus, drawn from the left */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#8a6b33] transition-transform duration-700 ease-[var(--ease-silk)] peer-focus:scale-x-100"
      />
    </label>
  );
}

/** Yes or no, as two ruled options rather than a select. */
function Choice({
  attending,
  onChange,
}: {
  attending: "yes" | "no";
  onChange: (value: "yes" | "no") => void;
}) {
  const reduced = usePrefersReducedMotion();

  const options = [
    { value: "yes" as const, label: "Joyfully accepts" },
    { value: "no" as const, label: "Regretfully declines" },
  ];

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="t-micro mb-2 text-[0.5rem] tracking-[0.3em] text-[#9a8560]">
        Your reply
      </legend>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const active = attending === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className="relative overflow-hidden rounded-[2px] border border-[#c9a86a]/40 px-3 py-4 text-center"
            >
              {active && (
                <motion.span
                  layoutId="rsvp-choice"
                  className="absolute inset-0 bg-[#2e2620]"
                  transition={reduced ? transition.reduced : spring.paper}
                />
              )}
              <span
                className={`relative t-micro text-[0.52rem] tracking-[0.2em] transition-colors duration-500 ${
                  active ? "text-[#ecd9a8]" : "text-[#7a6a55]"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Which celebrations they can make. Defaults to all of them. */
function EventPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="t-micro mb-2 text-[0.5rem] tracking-[0.3em] text-[#9a8560]">
        We will be at
      </legend>

      <div className="flex flex-wrap gap-2">
        {site.events.map((event) => {
          const active = selected.includes(event.id);
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onToggle(event.id)}
              aria-pressed={active}
              className={`t-micro rounded-full border px-4 py-2 text-[0.52rem] tracking-[0.2em] transition-all duration-500 ${
                active
                  ? "border-[#8a6b33] bg-[#8a6b33]/12 text-[#5c4620]"
                  : "border-[#c9a86a]/35 text-[#a89573]"
              }`}
            >
              {event.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The send button, with the wax-seal red reserved for this one act. */
function SubmitButton({ status }: { status: Status }) {
  const reduced = usePrefersReducedMotion();
  const sending = status === "sending";

  return (
    <button
      type="submit"
      disabled={sending}
      className="group relative mt-2 self-center overflow-hidden rounded-full border border-[#8a6b33]/50 px-10 py-4 disabled:opacity-60"
    >
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-[#2e2620] transition-transform duration-[700ms] ease-[var(--ease-silk)] group-hover:scale-y-100 group-focus-visible:scale-y-100" />
      <span className="relative t-micro flex items-center gap-3 text-[0.56rem] tracking-[0.3em] text-[#5c4620] transition-colors duration-500 group-hover:text-[#ecd9a8]">
        {sending ? "Sending" : "Send our reply"}
        {sending && !reduced && (
          <motion.span
            className="block h-1 w-1 rounded-full bg-current"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={loop.sending}
          />
        )}
      </span>
    </button>
  );
}

/**
 * The reply has been sent, so a seal is pressed onto the card. It is
 * the same wax seal the guest broke to get in — the invitation closing
 * itself again, which is a nicer full stop than a green tick.
 */
function ThankYou() {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      key="thanks"
      className="relative flex flex-col items-center py-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transition.entrance}
    >
      <motion.div
        className="relative h-[86px] w-[86px]"
        initial={reduced ? { opacity: 0 } : { scale: 2.4, opacity: 0, rotate: -14 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={reduced ? transition.reduced : { ...spring.paper, delay: beat.sm }}
      >
        <div
          className="absolute inset-0"
          style={{
            clipPath:
              "polygon(50% 0%, 68% 4%, 84% 14%, 95% 30%, 100% 50%, 95% 70%, 83% 86%, 66% 96%, 50% 100%, 33% 96%, 16% 85%, 5% 69%, 0% 50%, 6% 29%, 17% 14%, 33% 4%)",
            background:
              "radial-gradient(circle at 34% 28%, #b8434f 0%, #8c2f39 42%, #6b2029 78%, #521a20 100%)",
            boxShadow: "inset 0 -3px 8px rgba(0,0,0,0.45), 0 6px 14px rgba(0,0,0,0.3)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-[1.25rem] leading-none"
            style={{ color: "#e8c9a0", textShadow: "0 1px 0 rgba(0,0,0,0.55)" }}
          >
            {site.couple.monogram[0]}
            <span className="font-script mx-[1px] text-[0.9rem]">&amp;</span>
            {site.couple.monogram[1]}
          </span>
        </div>
      </motion.div>

      <motion.p
        className="t-title mt-8 text-[#23392c]"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition.slow, delay: reduced ? 0 : beat.xl }}
      >
        {site.rsvp.thankYou}
      </motion.p>

      <motion.p
        className="t-body measure mt-4 text-pretty text-[#7a6a55]"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition.slow, delay: reduced ? 0 : beat.xxl }}
      >
        {site.scenes.rsvp.note}
      </motion.p>
    </motion.div>
  );
}
