"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { spring } from "@/lib/motion";

/**
 * One button shape for the whole site: a gold hairline that fills from
 * its base line, like ink soaking into paper. The fill runs on press
 * as well as hover, because the primary target here is a thumb.
 */
export function Button({
  children,
  onClick,
  href,
  type = "button",
  variant = "gold",
  className = "",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  variant?: "gold" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  const reduced = usePrefersReducedMotion();

  const base =
    "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 t-micro transition-colors duration-500 disabled:opacity-40";

  const skin =
    variant === "gold"
      ? "border border-gold/45 text-gold-light hover:text-ink"
      : "border border-ivory/20 text-ivory/75 hover:text-ivory";

  const content = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[700ms] ease-[var(--ease-silk)] group-hover:scale-y-100 group-focus-visible:scale-y-100 ${
          variant === "gold" ? "bg-gold" : "bg-ivory/10"
        }`}
      />
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </>
  );

  const press = reduced ? {} : { whileTap: { scale: 0.97 }, transition: spring.tactile };

  if (href) {
    const external = href.startsWith("http");
    return (
      <motion.a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`${base} ${skin} ${className}`}
        {...press}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${skin} ${className}`}
      {...press}
    >
      {content}
    </motion.button>
  );
}
