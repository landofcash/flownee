import { describe, expect, it } from "vitest";

import {
  FALLBACK_INTENTION_EMOJI,
  displayIntentionEmoji,
  isSingleIntentionEmoji,
} from "@/lib/intention-emoji";

describe("intention emoji", () => {
  it.each(["📞", "🛒", "🏃🏽", "👨‍👩‍👧‍👦"])("accepts one emoji grapheme: %s", (emoji) => {
    expect(isSingleIntentionEmoji(emoji)).toBe(true);
  });

  it.each(["", "call", "📞 🛒", "📞call"])("rejects non-single emoji content: %s", (value) => {
    expect(isSingleIntentionEmoji(value)).toBe(false);
  });

  it("uses a neutral fallback for legacy or invalid values", () => {
    expect(displayIntentionEmoji(undefined)).toBe(FALLBACK_INTENTION_EMOJI);
    expect(displayIntentionEmoji("not an emoji")).toBe(FALLBACK_INTENTION_EMOJI);
  });
});
