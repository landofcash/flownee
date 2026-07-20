import { describe, expect, it, vi } from "vitest";

import {
  CompletionCelebrationQueue,
  persistWithCompletionFeedback,
  shouldCelebrateTaskStatus,
} from "@/lib/completion-feedback";

describe("completion feedback boundary", () => {
  it("queues feedback only after persistence and snapshot loading succeed", async () => {
    const events: string[] = [];

    const result = await persistWithCompletionFeedback({
      persist: async () => {
        events.push("persisted");
      },
      load: async () => {
        events.push("loaded");
        return "snapshot";
      },
      celebrate: true,
      onStoredCompletion: () => events.push("queued"),
    });

    expect(result).toBe("snapshot");
    expect(events).toEqual(["persisted", "loaded", "queued"]);
  });

  it("does not queue feedback after persistence or snapshot failure", async () => {
    const onStoredCompletion = vi.fn();

    await expect(
      persistWithCompletionFeedback({
        persist: async () => {
          throw new Error("persistence failed");
        },
        load: async () => "snapshot",
        celebrate: true,
        onStoredCompletion,
      }),
    ).rejects.toThrow("persistence failed");

    await expect(
      persistWithCompletionFeedback({
        persist: async () => undefined,
        load: async () => {
          throw new Error("snapshot failed");
        },
        celebrate: true,
        onStoredCompletion,
      }),
    ).rejects.toThrow("snapshot failed");

    expect(onStoredCompletion).not.toHaveBeenCalled();
  });

  it("does not queue non-completion mutations", async () => {
    const onStoredCompletion = vi.fn();

    await persistWithCompletionFeedback({
      persist: async () => undefined,
      load: async () => "snapshot",
      celebrate: false,
      onStoredCompletion,
    });

    expect(onStoredCompletion).not.toHaveBeenCalled();
    expect(shouldCelebrateTaskStatus("completed")).toBe(true);
    expect(shouldCelebrateTaskStatus("active")).toBe(false);
    expect(shouldCelebrateTaskStatus("postponed")).toBe(false);
  });

  it("releases a queued celebration exactly once", () => {
    const queue = new CompletionCelebrationQueue();

    expect(queue.release()).toBe(false);
    queue.queue();
    expect(queue.release()).toBe(true);
    expect(queue.release()).toBe(false);
  });
});
