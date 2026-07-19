export const FLOWNEE_SCHEMA_VERSION = 1 as const;

export type TranscriptStatus = "draft" | "confirmed" | "failed";
export type TaskStatus = "active" | "completed" | "postponed";
export type EffortSource = "ai-estimate" | "user-stated" | "user-edited";
export type AssumptionStatus = "pending" | "confirmed" | "rejected";

export type Transcript = {
  id: string;
  text: string;
  status: TranscriptStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskAssumption = {
  id: string;
  text: string;
  status: AssumptionStatus;
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  sourceTranscriptId: string;
  status: TaskStatus;
  statedDeadline: string | null;
  estimatedEffortMinutes: number | null;
  effortSource: EffortSource | null;
  contexts: string[];
  dependencies: string[];
  assumptions: TaskAssumption[];
  createdAt: string;
  updatedAt: string;
};

export type ExecutionPlan = {
  id: string;
  taskOrder: string[];
  nextTaskId: string;
  nextReason: string;
  generatedAt: string;
  basedOnRevision: number;
  model: string;
};

export type FlowneeSnapshot = {
  taskRevision: number;
  transcripts: Transcript[];
  tasks: Task[];
  currentPlan: ExecutionPlan | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new TypeError(message);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value))
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function hasUniqueValues(values: string[]): boolean {
  return new Set(values).size === values.length;
}

export function assertTranscript(value: unknown): asserts value is Transcript {
  requireCondition(isRecord(value), "Transcript must be an object.");
  requireCondition(isNonEmptyString(value.id), "Transcript id is required.");
  requireCondition(typeof value.text === "string", "Transcript text is required.");
  requireCondition(
    value.status === "draft" ||
      value.status === "confirmed" ||
      value.status === "failed",
    "Transcript status is invalid.",
  );
  requireCondition(
    isIsoTimestamp(value.createdAt),
    "Transcript createdAt must be a timestamp.",
  );
  requireCondition(
    isIsoTimestamp(value.updatedAt),
    "Transcript updatedAt must be a timestamp.",
  );
}

function assertAssumption(value: unknown): asserts value is TaskAssumption {
  requireCondition(isRecord(value), "Task assumption must be an object.");
  requireCondition(isNonEmptyString(value.id), "Task assumption id is required.");
  requireCondition(
    isNonEmptyString(value.text),
    "Task assumption text is required.",
  );
  requireCondition(
    value.status === "pending" ||
      value.status === "confirmed" ||
      value.status === "rejected",
    "Task assumption status is invalid.",
  );
}

export function assertTask(value: unknown): asserts value is Task {
  requireCondition(isRecord(value), "Task must be an object.");
  requireCondition(isNonEmptyString(value.id), "Task id is required.");
  requireCondition(isNonEmptyString(value.title), "Task title is required.");
  requireCondition(
    value.notes === null || typeof value.notes === "string",
    "Task notes must be text or null.",
  );
  requireCondition(
    isNonEmptyString(value.sourceTranscriptId),
    "Task sourceTranscriptId is required.",
  );
  requireCondition(
    value.status === "active" ||
      value.status === "completed" ||
      value.status === "postponed",
    "Task status is invalid.",
  );
  requireCondition(
    value.statedDeadline === null || isIsoTimestamp(value.statedDeadline),
    "Task statedDeadline must be a timestamp or null.",
  );
  requireCondition(
    value.estimatedEffortMinutes === null ||
      (typeof value.estimatedEffortMinutes === "number" &&
        Number.isInteger(value.estimatedEffortMinutes) &&
        value.estimatedEffortMinutes > 0),
    "Task effort must be a positive whole number or null.",
  );
  requireCondition(
    value.effortSource === null ||
      value.effortSource === "ai-estimate" ||
      value.effortSource === "user-stated" ||
      value.effortSource === "user-edited",
    "Task effort source is invalid.",
  );
  requireCondition(
    (value.estimatedEffortMinutes === null) === (value.effortSource === null),
    "Task effort and effort source must be set together.",
  );
  requireCondition(isStringArray(value.contexts), "Task contexts are invalid.");
  requireCondition(
    hasUniqueValues(value.contexts),
    "Task contexts must be unique.",
  );
  requireCondition(
    isStringArray(value.dependencies),
    "Task dependencies are invalid.",
  );
  requireCondition(
    hasUniqueValues(value.dependencies),
    "Task dependencies must be unique.",
  );
  requireCondition(
    !value.dependencies.includes(value.id),
    "Task cannot depend on itself.",
  );
  requireCondition(Array.isArray(value.assumptions), "Task assumptions are invalid.");
  value.assumptions.forEach(assertAssumption);
  requireCondition(
    hasUniqueValues(value.assumptions.map((assumption) => assumption.id)),
    "Task assumption ids must be unique.",
  );
  requireCondition(
    isIsoTimestamp(value.createdAt),
    "Task createdAt must be a timestamp.",
  );
  requireCondition(
    isIsoTimestamp(value.updatedAt),
    "Task updatedAt must be a timestamp.",
  );
}

export function assertExecutionPlan(
  value: unknown,
): asserts value is ExecutionPlan {
  requireCondition(isRecord(value), "Execution plan must be an object.");
  requireCondition(isNonEmptyString(value.id), "Execution plan id is required.");
  requireCondition(
    isStringArray(value.taskOrder) && value.taskOrder.length > 0,
    "Execution plan taskOrder must contain at least one task.",
  );
  requireCondition(
    hasUniqueValues(value.taskOrder),
    "Execution plan taskOrder must not contain duplicates.",
  );
  requireCondition(
    isNonEmptyString(value.nextTaskId),
    "Execution plan nextTaskId is required.",
  );
  requireCondition(
    value.taskOrder[0] === value.nextTaskId,
    "Execution plan nextTaskId must be first in taskOrder.",
  );
  requireCondition(
    isNonEmptyString(value.nextReason),
    "Execution plan nextReason is required.",
  );
  requireCondition(
    isIsoTimestamp(value.generatedAt),
    "Execution plan generatedAt must be a timestamp.",
  );
  requireCondition(
    typeof value.basedOnRevision === "number" &&
      Number.isInteger(value.basedOnRevision) &&
      value.basedOnRevision >= 0,
    "Execution plan revision is invalid.",
  );
  requireCondition(isNonEmptyString(value.model), "Execution plan model is required.");
}

export function assertPlanMatchesTasks(
  plan: ExecutionPlan,
  tasks: Task[],
): void {
  assertExecutionPlan(plan);
  tasks.forEach(assertTask);

  const activeIds = tasks
    .filter((task) => task.status === "active")
    .map((task) => task.id);

  requireCondition(
    activeIds.length === plan.taskOrder.length &&
      activeIds.every((id) => plan.taskOrder.includes(id)),
    "Execution plan must contain every active task and no inactive tasks.",
  );
}
