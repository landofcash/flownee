import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { TaskActionsDialog } from "@/components/home/task-actions-dialog";
import type { Task } from "@/lib/storage/schema";

const task: Task = {
  id: "task-1",
  title: "Buy coffee beans",
  emoji: "☕",
  notes: null,
  sourceTranscriptId: "transcript-1",
  status: "active",
  statedDeadline: null,
  estimatedEffortMinutes: 10,
  effortSource: "ai-estimate",
  contexts: ["grocery shopping"],
  dependencies: [],
  assumptions: [],
  createdAt: "2026-07-20T09:00:00.000Z",
  updatedAt: "2026-07-20T09:00:00.000Z",
};

describe("TaskActionsDialog", () => {
  it("shows the stored emoji beside the intention title", () => {
    const markup = renderToStaticMarkup(
      <TaskActionsDialog
        task={task}
        busy={false}
        errorMessage=""
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onPostpone={vi.fn()}
        onRestore={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(markup).toContain("☕");
    expect(markup).toContain("Buy coffee beans");
  });
});
