import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  CleanDoneDialog,
  CompleteRecommendation,
  EmptyRecommendation,
  FlowUpdateOverlay,
  HomeShell,
  LoadingRecommendation,
  PlanRecommendation,
  SavedItemsCard,
  UpcomingCard,
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
    expect(doneButton).toContain('data-size="default"');
    expect(doneButton).toContain("h-11");
    expect(doneButton).toContain("animate-flownee-shine-repeat");
    expect(doneButton).toContain('aria-hidden="true"');
    expect(doneButton).toContain("pointer-events-none");
    expect(laterButton).toContain('data-variant="default"');
    expect(laterButton).toContain('data-size="default"');
    expect(laterButton).toContain("h-11");
    expect(laterButton).toContain("lucide-clock-3");
    expect(markup).toContain('data-size="icon-lg"');
  });

  it("does not render the completion shine when actions are disabled", () => {
    const markup = renderToStaticMarkup(
      <PlanRecommendation
        state={sampleHomeState}
        actionsDisabled
        onComplete={vi.fn()}
        onPostpone={vi.fn()}
        onManage={vi.fn()}
      />,
    );

    expect(markup).not.toContain("animate-flownee-shine-repeat");
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
    expect(markup).toContain('data-slot="current-recommendation"');
    expect(markup).toContain('aria-labelledby="current-intention-title"');
    expect(markup).toContain('<h2 id="current-intention-title"');
    expect(markup).not.toContain('data-slot="card"');
    expect(markup).not.toContain("border-l-2");
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
    expect(markup).toContain('data-slot="saved-items-section"');
    expect(markup).not.toContain('data-slot="card"');
    expect(markup).not.toContain("truncate");
    expect(markup.match(/data-size="icon-lg"/g)).toHaveLength(2);
    expect(markup.match(/h-11/g)).toHaveLength(2);
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

describe("open supporting flow sections", () => {
  it("renders Up next as an open section with 44px management controls", () => {
    const markup = renderToStaticMarkup(
      <UpcomingCard state={sampleHomeState} onManage={vi.fn()} />,
    );

    expect(markup).toContain('data-slot="upcoming-section"');
    expect(markup).toContain('aria-labelledby="upcoming-title"');
    expect(markup).toContain('data-size="icon-lg"');
    expect(markup).not.toContain('data-slot="card"');
  });

  it("renders empty, loading, and complete states without card wrappers", () => {
    const emptyMarkup = renderToStaticMarkup(<EmptyRecommendation />);
    const loadingMarkup = renderToStaticMarkup(<LoadingRecommendation />);
    const completeMarkup = renderToStaticMarkup(
      <CompleteRecommendation count={2} />,
    );

    expect(emptyMarkup).toContain('data-slot="empty-recommendation"');
    expect(loadingMarkup).toContain('data-slot="loading-recommendation"');
    expect(loadingMarkup).toContain('aria-busy="true"');
    expect(completeMarkup).toContain('data-slot="complete-recommendation"');
    expect(`${emptyMarkup}${loadingMarkup}${completeMarkup}`).not.toContain(
      'data-slot="card"',
    );
    expect(emptyMarkup).toContain("<h2");
    expect(loadingMarkup).toContain("<h2");
    expect(completeMarkup).toContain("<h2");
  });
});

describe("home accessibility frame", () => {
  it("uses one page heading, an informational privacy note, and safe-area clearance", () => {
    const markup = renderToStaticMarkup(
      <HomeShell state={sampleHomeState} useLocalData={false} />,
    );

    expect(markup).toContain("<h1");
    expect(markup).toContain("What makes sense next");
    expect(markup).toContain("lucide-info");
    expect(markup).toContain("border-t border-border/80 pt-4");
    expect(markup).toContain(
      "pb-[calc(10rem+env(safe-area-inset-bottom))]",
    );
  });
});
