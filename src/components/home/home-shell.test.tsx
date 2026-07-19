import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
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
        confirmCleanDone={false}
        onManage={vi.fn()}
        onRequestCleanDone={vi.fn()}
        onCancelCleanDone={vi.fn()}
        onConfirmCleanDone={vi.fn()}
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

  it("shows an explicit confirmation before cleaning completed items", () => {
    const markup = renderToStaticMarkup(
      <SavedItemsCard
        tasks={[savedTask("completed", "Completed intention", "completed")]}
        busy={false}
        confirmCleanDone
        onManage={vi.fn()}
        onRequestCleanDone={vi.fn()}
        onCancelCleanDone={vi.fn()}
        onConfirmCleanDone={vi.fn()}
        onRestoreLater={vi.fn()}
      />,
    );

    expect(markup).toContain("Permanently remove this completed item?");
    expect(markup).toContain("Confirm clean done");
  });
});
