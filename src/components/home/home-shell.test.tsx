import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  CleanDoneDialog,
  FlowUpdateOverlay,
  PlanRecommendation,
  SavedItemsCard,
} from "@/components/home/home-shell";
import { sampleHomeState } from "@/lib/home-state";
import type { Task, TaskStatus } from "@/lib/storage/schema";

function savedTask(id: string, title: string, status: TaskStatus): Task {
  return {
    id,
    title,
    notes: null,
    sourceTranscriptId: "transcript-1",
    status,
    statedDeadline: null,
    estimatedEffortMinutes: 5,
    effortSource: "ai-estimate",
    contexts: [],
    dependencies: [],
    assumptions: [],
    createdAt: "2026-07-19T12:00:00.000Z",
    updatedAt: "2026-07-19T12:00:00.000Z",
  };
}

describe("home recommendation actions", () => {
  it("uses matching primary buttons and a clock for Do later", () => {
    const markup = renderToStaticMarkup(
      <PlanRecommendation
        state={sampleHomeState}
        actionsDisabled={false}
        onComplete={vi.fn()}
        onPostpone={vi.fn()}
        onManage={vi.fn()}
      />,
    );
    const buttons = [...markup.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].map(
      ([button]) => button,
    );
    const doneButton = buttons.find((button) => button.includes("Done"));
    const laterButton = buttons.find((button) => button.includes("Do later"));

    expect(doneButton).toContain('data-variant="default"');
    expect(laterButton).toContain('data-variant="default"');
    expect(laterButton).toContain("lucide-clock-3");
  });

  it("shows the intention emoji beside the next-action title", () => {
    const markup = renderToStaticMarkup(
      <PlanRecommendation
        state={sampleHomeState}
        actionsDisabled={false}
        onComplete={vi.fn()}
        onPostpone={vi.fn()}
        onManage={vi.fn()}
      />,
    );

    expect(markup).toContain("🧺");
    expect(markup).toContain("Start the dark-clothes wash");
  });
});

describe("flow update overlay", () => {
  it("renders a blocking accessible progress dialog only while visible", () => {
    expect(renderToStaticMarkup(<FlowUpdateOverlay visible={false} />)).toBe("");

    const markup = renderToStaticMarkup(<FlowUpdateOverlay visible />);
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("Updating your flow");
    expect(markup).toContain(
      "Your change is saved. Flownee is finding what makes sense next.",
    );
    expect(markup).not.toContain("button");
  });
});

describe("saved items", () => {
  it("crosses out completed titles but not postponed titles", () => {
    const markup = renderToStaticMarkup(
      <SavedItemsCard
        tasks={[
          savedTask("completed", "Completed intention", "completed"),
          savedTask("postponed", "Postponed intention", "postponed"),
        ]}
        busy={false}
        onManage={vi.fn()}
        onRequestCleanDone={vi.fn()}
        onRestoreLater={vi.fn()}
      />,
    );
    const completedTitle = markup.match(
      /<span class="([^"]*)">Completed intention<\/span>/,
    );
    const postponedTitle = markup.match(
      /<span class="([^"]*)">Postponed intention<\/span>/,
    );

    expect(completedTitle?.[1]).toContain("line-through");
    expect(completedTitle?.[1]).toContain("text-muted-foreground");
    expect(postponedTitle?.[1]).not.toContain("line-through");
    expect(markup).toMatch(/data-variant="default"[^>]*>Clean done<\/button>/);
    expect(markup).toMatch(/data-variant="default"[^>]*>Restore for later<\/button>/);
  });

  it("uses the neutral emoji fallback for legacy saved intentions", () => {
    const markup = renderToStaticMarkup(
      <SavedItemsCard
        tasks={[savedTask("legacy", "Legacy intention", "completed")]}
        busy={false}
        onManage={vi.fn()}
        onRequestCleanDone={vi.fn()}
        onRestoreLater={vi.fn()}
      />,
    );

    expect(markup).toContain("✨");
    expect(markup).toContain("Legacy intention");
  });

  it("shows an explicit confirmation before cleaning completed items", () => {
    expect(
      renderToStaticMarkup(
        <CleanDoneDialog
          open={false}
          completedCount={1}
          busy={false}
          errorMessage=""
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />,
      ),
    ).toBe("");

    const markup = renderToStaticMarkup(
      <CleanDoneDialog
        open
        completedCount={1}
        busy={false}
        errorMessage=""
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("Permanently remove this completed item? This cannot be undone.");
    expect(markup).toContain("Confirm clean done");
    expect(markup).toContain("Close clean done confirmation");
  });
});
