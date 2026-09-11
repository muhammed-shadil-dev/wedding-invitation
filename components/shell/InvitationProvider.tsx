"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAudioEngine } from "@/lib/audio";

type Phase = "sealed" | "opening" | "open";

type InvitationState = {
  phase: Phase;
  /** True once the envelope animation has finished and content is live. */
  isOpen: boolean;
  /** Called by the seal. Starts the envelope timeline and the music. */
  open: () => void;
  /** Called by the envelope timeline when it completes. */
  completeOpening: () => void;
};

const Ctx = createContext<InvitationState | null>(null);

/**
 * Holds the one piece of state the whole site pivots on: whether the
 * invitation has been opened. The gate, the scroll lock, the audio and
 * the content reveal all read from here, so they can never disagree.
 */
export function InvitationProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("sealed");

  const open = useCallback(() => {
    setPhase((current) => {
      if (current !== "sealed") return current;
      // The music starts here and nowhere else: this call is inside the
      // user gesture, which is the only moment browsers will allow it.
      void getAudioEngine().start();
      return "opening";
    });
  }, []);

  const completeOpening = useCallback(() => {
    setPhase((current) => (current === "opening" ? "open" : current));
  }, []);

  const value = useMemo<InvitationState>(
    () => ({ phase, isOpen: phase === "open", open, completeOpening }),
    [phase, open, completeOpening]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInvitation(): InvitationState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInvitation must be used inside <InvitationProvider>");
  return ctx;
}
