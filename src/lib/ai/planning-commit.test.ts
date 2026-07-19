import { describe, expect, it } from "vitest";

import {
  buildPlanningCommit,
  createInterpretationDrafts,
} from "@/lib/ai/planning-commit";
import {
  planningOutputFixture,
  planningRequestFixture,
} from "@/lib/ai/fixtures/planning-test-fixture";

describe("reviewed planning commit", () => {
  it("maps temporary references and user edits into atomic storage records", () => {
    const drafts = createInterpretationDrafts(planningOutputFixture);
    drafts[0].title = "Call Maria tonight";
    drafts[0].effortMinutes = 15;
    let sequence = 0;

    const commit = buildPlanningCommit({
      request: planningRequestFixture,
      output: planningOutputFixture,
      drafts,
      model: "gpt-5.6-sol",
      now: "2026-07-18T18:05:00.000Z",
      idFactory: () => `generated-${++sequence}`,
    });

    expect(commit.tasks).toHaveLength(1);
    expect(commit.tasks[0]).toMatchObject({
      id: "generated-1",
      title: "Call Maria tonight",
      estimatedEffortMinutes: 15,
      effortSource: "user-edited",
      sourceTranscriptId: "transcript-1",
    });
    expect(commit.plan).toMatchObject({
      taskOrder: ["generated-1"],
      nextTaskId: "generated-1",
      basedOnRevision: 1,
    });
  });

  it("requires explicit acceptance of important assumptions", () => {
    const output = structuredClone(planningOutputFixture);
    output.newTasks[0].assumptions = [
      { key: "availability", text: "Maria is available now.", needsConfirmation: true },
    ];
    const drafts = createInterpretationDrafts(output);

    expect(() =>
      buildPlanningCommit({
        request: planningRequestFixture,
        output,
        drafts,
        model: "gpt-5.6-sol",
        now: "2026-07-18T18:05:00.000Z",
        idFactory: () => crypto.randomUUID(),
      }),
    ).toThrow("Confirm each important assumption");
  });
});
