"use client";

import { CircleAlert, Clock3, Info, ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InterpretationDraft } from "@/lib/ai/planning-commit";
import type { PlanningOutput } from "@/lib/ai/planning-contract";

type InterpretationReviewProps = {
  drafts: InterpretationDraft[];
  output: PlanningOutput;
  isSaving: boolean;
  errorMessage: string;
  onChange: (drafts: InterpretationDraft[]) => void;
  onConfirm: () => void;
  onReviseTranscript: () => void;
};

export function InterpretationReview({
  drafts,
  output,
  isSaving,
  errorMessage,
  onChange,
  onConfirm,
  onReviseTranscript,
}: InterpretationReviewProps) {
  const hasBlockingClarification = output.clarifications.some(
    (clarification) => clarification.blocking,
  );
  const hasUnconfirmedAssumption = drafts.some((draft) =>
    draft.assumptions.some(
      (assumption) => assumption.required && !assumption.accepted,
    ),
  );
  const hasInvalidDraft = drafts.some(
    (draft) =>
      draft.title.trim().length === 0 ||
      !Number.isInteger(draft.effortMinutes) ||
      draft.effortMinutes < 1 ||
      draft.effortMinutes > 480,
  );

  function updateDraft(index: number, next: InterpretationDraft) {
    onChange(drafts.map((draft, itemIndex) => (itemIndex === index ? next : draft)));
  }

  return (
    <div>
      <div className="flex items-start gap-3 rounded-xl border bg-secondary/35 p-4">
        <ListChecks aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold">
            {drafts.length} {drafts.length === 1 ? "intention" : "intentions"} found
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Review the titles, notes, estimates, and important assumptions before
            they are saved to your flow.
          </p>
        </div>
      </div>

      <div className="mt-5 max-h-[52vh] space-y-4 overflow-y-auto pr-1">
        {drafts.map((draft, index) => {
          const source = output.newTasks[index];
          return (
            <fieldset key={draft.taskRef} className="rounded-xl border p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Item {index + 1}
              </legend>
              <label className="block text-sm font-semibold">
                Action
                <input
                  value={draft.title}
                  onChange={(event) =>
                    updateDraft(index, { ...draft, title: event.target.value })
                  }
                  disabled={isSaving}
                  maxLength={180}
                  className="mt-2 w-full rounded-lg border bg-card px-3 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>
              <label className="mt-4 block text-sm font-semibold">
                Notes <span className="font-normal text-muted-foreground">(optional)</span>
                <textarea
                  value={draft.notes}
                  onChange={(event) =>
                    updateDraft(index, { ...draft, notes: event.target.value })
                  }
                  disabled={isSaving}
                  maxLength={1_000}
                  rows={2}
                  className="mt-2 w-full resize-y rounded-lg border bg-card px-3 py-2.5 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <Clock3 aria-hidden="true" className="size-4 text-primary" />
                  Effort
                  <input
                    type="number"
                    min={1}
                    max={480}
                    step={1}
                    value={draft.effortMinutes}
                    onChange={(event) =>
                      updateDraft(index, {
                        ...draft,
                        effortMinutes: Number(event.target.value),
                      })
                    }
                    disabled={isSaving}
                    className="w-20 rounded-lg border bg-card px-2 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  min
                </label>
                <Badge variant="outline">
                  {source.effort.source === "user-stated"
                    ? "You stated this"
                    : "AI estimate"}
                </Badge>
                {source.statedDeadline.value && (
                  <Badge variant="secondary">Deadline you stated</Badge>
                )}
              </div>

              {draft.assumptions.length > 0 && (
                <div className="mt-4 rounded-lg bg-muted/55 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <Info aria-hidden="true" className="size-3.5" />
                    Assumptions
                  </p>
                  <div className="mt-2 space-y-2">
                    {draft.assumptions.map((assumption, assumptionIndex) => (
                      <label
                        key={assumption.key}
                        className="flex items-start gap-2 text-sm leading-5"
                      >
                        <input
                          type="checkbox"
                          checked={assumption.accepted}
                          disabled={isSaving || !assumption.required}
                          onChange={(event) => {
                            const assumptions = draft.assumptions.map((item, itemIndex) =>
                              itemIndex === assumptionIndex
                                ? { ...item, accepted: event.target.checked }
                                : item,
                            );
                            updateDraft(index, { ...draft, assumptions });
                          }}
                          className="mt-0.5 size-4 accent-[var(--primary)]"
                        />
                        <span>
                          {assumption.text}
                          {!assumption.required && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (low impact)
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      {output.clarifications.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="flex items-center gap-2 font-semibold">
            <CircleAlert aria-hidden="true" className="size-4 text-amber-700" />
            A detail may need clarification
          </p>
          {output.clarifications.map((clarification) => (
            <p key={`${clarification.taskRef}:${clarification.question}`} className="mt-2 text-sm leading-6">
              {clarification.question}
              <span className="block text-xs text-muted-foreground">
                {clarification.reason}
              </span>
            </p>
          ))}
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 flex items-start gap-2 text-sm text-destructive" role="alert">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {errorMessage}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          onClick={onConfirm}
          disabled={
            isSaving ||
            hasBlockingClarification ||
            hasUnconfirmedAssumption ||
            hasInvalidDraft
          }
        >
          {isSaving ? "Saving your flow…" : "Add and update my flow"}
        </Button>
        <Button variant="outline" onClick={onReviseTranscript} disabled={isSaving}>
          Revise transcript
        </Button>
      </div>
      {(hasBlockingClarification || hasUnconfirmedAssumption) && (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {hasBlockingClarification
            ? "Revise the transcript with the missing detail before saving."
            : "Confirm the important assumption to continue."}
        </p>
      )}
    </div>
  );
}
