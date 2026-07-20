export const FALLBACK_INTENTION_EMOJI = "✨";

const emojiPresentation = /(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;

export function isSingleIntentionEmoji(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const candidate = value.trim();
  if (!candidate || !emojiPresentation.test(candidate)) return false;

  const segments = [...new Intl.Segmenter(undefined, {
    granularity: "grapheme",
  }).segment(candidate)];
  return segments.length === 1 && segments[0].segment === candidate;
}

export function displayIntentionEmoji(value?: string | null): string {
  return isSingleIntentionEmoji(value) ? value.trim() : FALLBACK_INTENTION_EMOJI;
}
