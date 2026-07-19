"use client";

import { useState } from "react";
import { Check, Clock3, RotateCcw, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/storage/schema";

type TaskActionsDialogProps = {
  task: Task | null;
  busy: boolean;
  errorMessage: string;
  onClose: () => void;
  onComplete: (task: Task) => void;
  onPostpone: (task: Task) => void;
  onRestore: (task: Task) => void;
  onSave: (task: Task, changes: { title: string; notes: string; effort: string }) => void;
  onDelete: (task: Task) => void;
};

export function TaskActionsDialog({
  task,
  busy,
  errorMessage,
  onClose,
  onComplete,
  onPostpone,
  onRestore,
  onSave,
  onDelete,
}: TaskActionsDialogProps) {
  const [title, setTitle] = useState(() => task?.title ?? "");
  const [notes, setNotes] = useState(() => task?.notes ?? "");
  const [effort, setEffort] = useState(() => task?.estimatedEffortMinutes?.toString() ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;
  const effortNumber = effort === "" ? null : Number(effort);
  const editIsValid =
    title.trim().length > 0 &&
    (effortNumber === null ||
      (Number.isInteger(effortNumber) && effortNumber >= 1 && effortNumber <= 480));

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/25 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <section
        aria-labelledby="task-actions-title"
        aria-modal="true"
        className="w-full rounded-t-3xl border bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:max-w-[430px] sm:rounded-2xl sm:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Manage item
            </p>
            <h2 id="task-actions-title" className="mt-1 truncate text-2xl font-semibold tracking-[-0.03em]">
              {task.title}
            </h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close task actions" onClick={onClose} disabled={busy}>
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {task.status === "active" ? (
            <>
              <Button onClick={() => onComplete(task)} disabled={busy}>
                <Check aria-hidden="true" /> Complete
              </Button>
              <Button variant="outline" onClick={() => onPostpone(task)} disabled={busy}>
                <Clock3 aria-hidden="true" /> Do later
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onRestore(task)} disabled={busy}>
              <RotateCcw aria-hidden="true" /> Bring back
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-4 border-t pt-5">
          <div>
            <label htmlFor="task-title" className="text-sm font-semibold">Title</label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              disabled={busy}
              className="mt-2 h-11 w-full rounded-lg border bg-card px-3 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <div>
            <label htmlFor="task-notes" className="text-sm font-semibold">Notes</label>
            <textarea
              id="task-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2_000}
              rows={3}
              disabled={busy}
              className="mt-2 w-full resize-y rounded-lg border bg-card px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <div>
            <label htmlFor="task-effort" className="text-sm font-semibold">Estimated minutes</label>
            <input
              id="task-effort"
              type="number"
              min={1}
              max={480}
              step={1}
              inputMode="numeric"
              value={effort}
              onChange={(event) => setEffort(event.target.value)}
              disabled={busy}
              className="mt-2 h-11 w-full rounded-lg border bg-card px-3 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        </div>

        {errorMessage && <p className="mt-4 text-sm text-destructive" role="alert">{errorMessage}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            onClick={() => onSave(task, { title, notes, effort })}
            disabled={busy || !editIsValid}
          >
            Save changes
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          {!confirmDelete ? (
            <Button className="ml-auto" variant="ghost" onClick={() => setConfirmDelete(true)} disabled={busy}>
              <Trash2 aria-hidden="true" /> Delete
            </Button>
          ) : (
            <Button className="ml-auto" variant="destructive" onClick={() => onDelete(task)} disabled={busy}>
              Delete permanently
            </Button>
          )}
        </div>
        {confirmDelete && (
          <p className="mt-2 text-right text-xs text-muted-foreground">
            This removes the item from this browser and cannot be undone.
          </p>
        )}
      </section>
    </div>
  );
}
