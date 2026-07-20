"use client";

import { CircleAlert, ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EffortSelector } from "@/components/ui/effort-selector";
import { Input } from "@/components/ui/input";
import type { InterpretationDraft } from "@/lib/ai/planning-commit";
import type { PlanningOutput } from "@/lib/ai/planning-contract";
import { isEffortOption } from "@/lib/effort-options";
import { displayIntentionEmoji } from "@/lib/intention-emoji";

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
      !isEffortOption(draft.effortMinutes),
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
            Check the action and time estimate before adding it to your flow.
          </p>
        </div>
      </div>

      <div className="mt-5 max-h-[52vh] space-y-4 overflow-y-auto pr-1">
        {drafts.map((draft, index) => {
          const source = output.newTasks[index];
          return (
            <fieldset key={draft.taskRef} className="rounded-xl border p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Intention {index + 1}
              </legend>
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="shrink-0 text-2xl">
                  {displayIntentionEmoji(source.emoji)}
                </span>
                <Input
                  aria-label={`Intention ${index + 1} action`}
                  value={draft.title}
                  onChange={(event) =>
                    updateDraft(index, { ...draft, title: event.target.value })
                  }
                  disabled={isSaving}
                  maxLength={180}
                  className="min-w-0 text-base"
                />
              </div>
              <div className="mt-4">
                <EffortSelector
                  name={`effort-${draft.taskRef}`}
                  value={isEffortOption(draft.effortMinutes) ? draft.effortMinutes : null}
                  onChange={(effortMinutes) =>
                    updateDraft(index, { ...draft, effortMinutes })
                  }
                  disabled={isSaving}
                  legend="Choose time effort"
                />
                {source.statedDeadline.value && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">Deadline you stated</Badge>
                  </div>
                )}
              </div>

            </fieldset>
          );
        })}
      </div>

      {output.clarifications.length > 0 && (
        <div className="mt-4 rounded-xl border border-warning/35 bg-warning/12 p-4">
          <p className="flex items-center gap-2 font-semibold">
            <CircleAlert aria-hidden="true" className="size-4 text-warning-foreground" />
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

      {hasUnconfirmedAssumption && (
        <div className="mt-4 rounded-xl border border-warning/35 bg-warning/12 p-4">
          <p className="flex items-center gap-2 font-semibold">
            <CircleAlert aria-hidden="true" className="size-4 text-warning-foreground" />
            More detail is needed
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Revise the transcript with the missing detail before adding this to
            your flow.
          </p>
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 flex items-start gap-2 text-sm text-error-foreground" role="alert">
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
          {isSaving ? "Saving your flow…" : "Add to my flow"}
        </Button>
        <Button variant="outline" onClick={onReviseTranscript} disabled={isSaving}>
          Revise transcript
        </Button>
      </div>
      {(hasBlockingClarification || hasUnconfirmedAssumption) && (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Revise the transcript with the missing detail before saving.
        </p>
      )}
    </div>
  );
}
