import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { InterpretationReview } from "@/components/voice/interpretation-review";
import { planningOutputFixture } from "@/lib/ai/fixtures/planning-test-fixture";
import { createInterpretationDrafts } from "@/lib/ai/planning-commit";

function renderReview(output = planningOutputFixture) {
  return renderToStaticMarkup(
    <InterpretationReview
      drafts={createInterpretationDrafts(output)}
      output={output}
      isSaving={false}
      errorMessage=""
      onChange={() => undefined}
      onConfirm={() => undefined}
      onReviseTranscript={() => undefined}
    />,
  );
}

describe("InterpretationReview", () => {
  it("keeps the review focused on action and effort", () => {
    const markup = renderReview();

    expect(markup).toContain("Intention 1");
    expect(markup).toContain("📞");
    expect(markup).toContain('aria-label="Intention 1 action"');
    expect(markup).toContain("Choose time effort");
    expect(markup).toContain("Add to my flow");
    expect(markup).not.toContain(">Action<");
    expect(markup).not.toContain("Choose one");
    expect(markup).not.toContain("Time effort");
    expect(markup).not.toContain("AI estimate");
    expect(markup).not.toContain("Changed by you");
    expect(markup).not.toContain("You stated this");
    expect(markup).not.toContain("Notes");
    expect(markup).not.toContain("Assumptions");
    expect(markup).not.toContain("Add and update my flow");
  });

  it("blocks an important uncertainty without exposing assumption controls", () => {
    const output = structuredClone(planningOutputFixture);
    output.newTasks[0].assumptions = [
      {
        key: "availability",
        text: "Maria is available now.",
        needsConfirmation: true,
      },
    ];
    const markup = renderReview(output);

    expect(markup).toContain("More detail is needed");
    expect(markup).toContain("Revise the transcript");
    expect(markup).not.toContain("Maria is available now.");
    expect(markup).not.toContain('type="checkbox"');
    expect(markup).toContain("disabled");
  });
});
