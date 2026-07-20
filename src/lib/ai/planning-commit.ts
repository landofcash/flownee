import type {
  NewTaskOutput,
  PlanningOutput,
  PlanningRequest,
} from "@/lib/ai/planning-contract";
import type { ExecutionPlan, Task } from "@/lib/storage/schema";
import { isEffortOption } from "@/lib/effort-options";
import { isSingleIntentionEmoji } from "@/lib/intention-emoji";

export type InterpretationDraft = {
  taskRef: string;
  title: string;
  notes: string;
  effortMinutes: number;
  assumptions: Array<{
    key: string;
    text: string;
    required: boolean;
    accepted: boolean;
  }>;
};

export type PlanningCommit = {
  tasks: Task[];
  plan: ExecutionPlan | null;
};

export function createInterpretationDrafts(
  output: PlanningOutput,
): InterpretationDraft[] {
  return output.newTasks.map((task) => ({
    taskRef: task.taskRef,
    title: task.title,
    notes: task.notes ?? "",
    effortMinutes: task.effort.minutes,
    assumptions: task.assumptions.map((assumption) => ({
      key: assumption.key,
      text: assumption.text,
      required: assumption.needsConfirmation,
      accepted: !assumption.needsConfirmation,
    })),
  }));
}

function requireDraft(
  drafts: InterpretationDraft[],
  task: NewTaskOutput,
): InterpretationDraft {
  const matches = drafts.filter((draft) => draft.taskRef === task.taskRef);
  if (matches.length !== 1) {
    throw new TypeError(`Interpretation draft for ${task.taskRef} is missing or duplicated.`);
  }
  return matches[0];
}

export function buildPlanningCommit({
  request,
  output,
  drafts,
  model,
  now,
  idFactory,
}: {
  request: PlanningRequest;
  output: PlanningOutput;
  drafts: InterpretationDraft[];
  model: string;
  now: string;
  idFactory: () => string;
}): PlanningCommit {
  if (!model.trim()) throw new TypeError("Planning model is required.");
  if (!Number.isFinite(Date.parse(now))) throw new TypeError("Commit time is invalid.");
  if (drafts.length !== output.newTasks.length) {
    throw new TypeError("Every interpreted task must have exactly one review draft.");
  }
  if (output.newTasks.length > 0 && request.transcript === null) {
    throw new TypeError("New tasks require a confirmed voice transcript.");
  }

  const refToId = new Map(request.activeTasks.map((task) => [task.id, task.id]));
  for (const task of output.newTasks) refToId.set(task.taskRef, idFactory());

  const tasks = output.newTasks.map((task) => {
    const draft = requireDraft(drafts, task);
    const title = draft.title.trim();
    const notes = draft.notes.trim();
    if (!title) throw new TypeError("Every interpreted task needs a title.");
    if (!isSingleIntentionEmoji(task.emoji)) {
      throw new TypeError("Every interpreted task needs exactly one emoji.");
    }
    if (!isEffortOption(draft.effortMinutes)) {
      throw new TypeError(
        "Every effort estimate must use a supported time option.",
      );
    }
    const assumptions = task.assumptions.map((assumption) => {
      const reviewed = draft.assumptions.find((item) => item.key === assumption.key);
      if (!reviewed || reviewed.text !== assumption.text) {
        throw new TypeError("The reviewed assumptions no longer match the plan.");
      }
      if (reviewed.required && !reviewed.accepted) {
        throw new TypeError("Confirm each important assumption before saving.");
      }
      return {
        id: idFactory(),
        text: assumption.text,
        status: "confirmed" as const,
      };
    });
    const dependencies = task.dependencies.map((dependency) => {
      const id = refToId.get(dependency.taskRef);
      if (!id) throw new TypeError(`Unknown dependency ${dependency.taskRef}.`);
      return id;
    });

    return {
      id: refToId.get(task.taskRef)!,
      title,
      emoji: task.emoji,
      notes: notes || null,
      sourceTranscriptId: request.transcript!.id,
      status: "active" as const,
      statedDeadline: task.statedDeadline.value,
      estimatedEffortMinutes: draft.effortMinutes,
      effortSource:
        draft.effortMinutes === task.effort.minutes
          ? task.effort.source
          : ("user-edited" as const),
      contexts: [...new Set(task.contexts.map((context) => context.label))],
      dependencies,
      assumptions,
      createdAt: now,
      updatedAt: now,
    } satisfies Task;
  });

  if (output.plan.status === "no-action") return { tasks, plan: null };
  const taskOrder = output.plan.orderedTaskRefs.map((ref) => {
    const id = refToId.get(ref);
    if (!id) throw new TypeError(`Unknown plan reference ${ref}.`);
    return id;
  });
  const nextTaskId = output.plan.nextTaskRef
    ? refToId.get(output.plan.nextTaskRef)
    : null;
  if (!nextTaskId || !output.plan.nextReason) {
    throw new TypeError("The ready plan is missing its next action.");
  }

  return {
    tasks,
    plan: {
      id: idFactory(),
      taskOrder,
      nextTaskId,
      nextReason: output.plan.nextReason,
      generatedAt: now,
      basedOnRevision: request.taskRevision + (tasks.length > 0 ? 1 : 0),
      model,
    },
  };
}
