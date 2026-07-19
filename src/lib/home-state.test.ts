import { describe, expect, it } from "vitest";

import {
  emptyHomeState,
  getHomeStateForDemo,
  homeStateFromSnapshot,
} from "@/lib/home-state";

describe("getHomeStateForDemo", () => {
  it("defaults to the truthful first-run empty state", () => {
    expect(getHomeStateForDemo()).toEqual(emptyHomeState);
  });

  it("keeps the valid sample plan visible while updating", () => {
    const state = getHomeStateForDemo("updating");

    expect(state.status).toBe("plan");
    if (state.status === "plan") {
      expect(state.isUpdating).toBe(true);
      expect(state.nextTask.title).toBe("Start the dark-clothes wash");
    }
  });

  it("returns an explicit completed-day state", () => {
    expect(getHomeStateForDemo("complete")).toEqual({
      status: "all-complete",
      completedCount: 4,
    });
  });
});

describe("homeStateFromSnapshot", () => {
  it("renders the persisted plan in its stored order", () => {
    const state = homeStateFromSnapshot({
      taskRevision: 1,
      transcripts: [],
      tasks: [
        {
          id: "task-1",
          title: "Call Maria",
          notes: null,
          sourceTranscriptId: "transcript-1",
          status: "active",
          statedDeadline: null,
          estimatedEffortMinutes: 10,
          effortSource: "ai-estimate",
          contexts: ["phone"],
          dependencies: [],
          assumptions: [],
          createdAt: "2026-07-18T18:00:00.000Z",
          updatedAt: "2026-07-18T18:00:00.000Z",
        },
      ],
      currentPlan: {
        id: "plan-1",
        taskOrder: ["task-1"],
        nextTaskId: "task-1",
        nextReason: "It is quick and meaningful.",
        generatedAt: "2026-07-18T18:00:00.000Z",
        basedOnRevision: 1,
        model: "gpt-5.6-sol",
      },
    });

    expect(state).toMatchObject({
      status: "plan",
      nextTask: { id: "task-1", title: "Call Maria" },
      reason: "It is quick and meaningful.",
    });
  });
});
