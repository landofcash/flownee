import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  CompletionConfetti,
  FLOWNEE_COMPLETION_CONFETTI_OPTIONS,
  shouldPlayCompletionConfetti,
} from "@/components/magicui/completion-confetti";

describe("completion confetti", () => {
  it("renders a contained, non-interactive manual canvas", () => {
    const markup = renderToStaticMarkup(<CompletionConfetti trigger={0} />);

    expect(markup).toContain('data-slot="completion-confetti"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("pointer-events-none");
    expect(markup).toContain("max-w-[430px]");
    expect(markup).toContain("motion-reduce:hidden");
  });

  it("uses one restrained Flownee-colored burst", () => {
    expect(FLOWNEE_COMPLETION_CONFETTI_OPTIONS).toMatchObject({
      particleCount: 36,
      spread: 58,
      startVelocity: 26,
      disableForReducedMotion: true,
      colors: ["#525AFF", "#4AB5B5", "#6D8BC0", "#8FD9FB"],
    });
  });

  it("plays only for a new positive trigger when motion is allowed", () => {
    expect(
      shouldPlayCompletionConfetti({
        trigger: 1,
        previousTrigger: 0,
        reducedMotion: false,
      }),
    ).toBe(true);
    expect(
      shouldPlayCompletionConfetti({
        trigger: 1,
        previousTrigger: 1,
        reducedMotion: false,
      }),
    ).toBe(false);
    expect(
      shouldPlayCompletionConfetti({
        trigger: 1,
        previousTrigger: 0,
        reducedMotion: true,
      }),
    ).toBe(false);
  });
});
