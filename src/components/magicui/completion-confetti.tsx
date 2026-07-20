"use client";

import { useEffect, useRef } from "react";
import type { Options as ConfettiOptions } from "canvas-confetti";

import {
  Confetti,
  type ConfettiRef,
} from "@/components/magicui/confetti";
import { cn } from "@/lib/utils";

export const FLOWNEE_COMPLETION_CONFETTI_OPTIONS = {
  particleCount: 36,
  spread: 58,
  startVelocity: 26,
  gravity: 0.9,
  ticks: 110,
  scalar: 0.75,
  origin: { x: 0.5, y: 0.72 },
  colors: ["#525AFF", "#4AB5B5", "#6D8BC0", "#8FD9FB"],
  disableForReducedMotion: true,
} satisfies ConfettiOptions;

export function shouldPlayCompletionConfetti({
  trigger,
  previousTrigger,
  reducedMotion,
}: {
  trigger: number;
  previousTrigger: number;
  reducedMotion: boolean;
}) {
  return trigger > 0 && trigger !== previousTrigger && !reducedMotion;
}

export function CompletionConfetti({
  trigger,
  className,
}: {
  trigger: number;
  className?: string;
}) {
  const confettiRef = useRef<ConfettiRef>(null);
  const previousTriggerRef = useRef(trigger);

  useEffect(() => {
    const previousTrigger = previousTriggerRef.current;
    previousTriggerRef.current = trigger;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (
      shouldPlayCompletionConfetti({
        trigger,
        previousTrigger,
        reducedMotion,
      })
    ) {
      confettiRef.current?.fire();
    }
  }, [trigger]);

  return (
    <Confetti
      ref={confettiRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-y-0 left-1/2 z-[70] h-svh w-full max-w-[430px] -translate-x-1/2 motion-reduce:hidden",
        className,
      )}
      data-slot="completion-confetti"
      manualstart
      options={FLOWNEE_COMPLETION_CONFETTI_OPTIONS}
    />
  );
}
