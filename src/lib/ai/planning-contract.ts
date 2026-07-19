import type { EffortSource, TaskAssumption } from "@/lib/storage/schema";

export const FLOWNEE_PLANNING_SCHEMA_VERSION = 1 as const;
export const FLOWNEE_PLANNING_MODEL = "gpt-5.6-sol" as const;
export const FLOWNEE_PLANNING_REASONING_EFFORT = "medium" as const;

export type ExistingTaskInput = {
  id: string;
  title: string;
  notes: string | null;
  statedDeadline: string | null;
  estimatedEffortMinutes: number | null;
  effortSource: EffortSource | null;
  contexts: string[];
  dependencies: string[];
  assumptions: TaskAssumption[];
};

export type PlanningRequest = {
  schemaVersion: typeof FLOWNEE_PLANNING_SCHEMA_VERSION;
  operation: "capture" | "replan";
  transcript: {
    id: string;
    text: string;
  } | null;
  taskRevision: number;
  activeTasks: ExistingTaskInput[];
  planningContext: {
    capturedAt: string;
    timeZone: string;
  };
};

export type NewTaskRef = `new:${string}`;
export type TaskRef = string;
export type AttributeSource = "user-stated" | "ai-inferred";

export type NewTaskOutput = {
  taskRef: NewTaskRef;
  title: string;
  notes: string | null;
  statedDeadline: {
    value: string | null;
    source: "user-stated" | "none";
  };
  effort: {
    minutes: number;
    source: "user-stated" | "ai-estimate";
    rationale: string;
  };
  contexts: Array<{
    label: string;
    source: AttributeSource;
  }>;
  dependencies: Array<{
    taskRef: TaskRef;
    source: AttributeSource;
  }>;
  assumptions: Array<{
    key: string;
    text: string;
    needsConfirmation: boolean;
  }>;
};

export type PlanningOutput = {
  schemaVersion: typeof FLOWNEE_PLANNING_SCHEMA_VERSION;
  newTasks: NewTaskOutput[];
  clarifications: Array<{
    taskRef: TaskRef | null;
    question: string;
    reason: string;
    blocking: boolean;
  }>;
  plan: {
    status: "ready" | "no-action";
    orderedTaskRefs: TaskRef[];
    nextTaskRef: TaskRef | null;
    nextReason: string | null;
    parallelGroups: Array<{
      taskRefs: TaskRef[];
      reason: string;
    }>;
  };
};

type JsonSchema = Record<string, unknown>;

const nullableString = (): JsonSchema => ({ type: ["string", "null"] });

const strictObject = (
  properties: Record<string, JsonSchema>,
  description?: string,
): JsonSchema => ({
  type: "object",
  ...(description ? { description } : {}),
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const sourcedLabelSchema = strictObject({
  label: { type: "string" },
  source: { type: "string", enum: ["user-stated", "ai-inferred"] },
});

const dependencySchema = strictObject({
  taskRef: { type: "string" },
  source: { type: "string", enum: ["user-stated", "ai-inferred"] },
});

const existingTaskInputSchema = strictObject({
  id: { type: "string" },
  title: { type: "string" },
  notes: nullableString(),
  statedDeadline: nullableString(),
  estimatedEffortMinutes: { type: ["integer", "null"], minimum: 1 },
  effortSource: {
    type: ["string", "null"],
    enum: ["ai-estimate", "user-stated", "user-edited", null],
  },
  contexts: { type: "array", items: { type: "string" } },
  dependencies: { type: "array", items: { type: "string" } },
  assumptions: {
    type: "array",
    items: strictObject({
      id: { type: "string" },
      text: { type: "string" },
      status: { type: "string", enum: ["pending", "confirmed", "rejected"] },
    }),
  },
});

export const FLOWNEE_PLANNING_INPUT_SCHEMA = strictObject({
  schemaVersion: { type: "integer", enum: [FLOWNEE_PLANNING_SCHEMA_VERSION] },
  operation: { type: "string", enum: ["capture", "replan"] },
  transcript: {
    anyOf: [
      strictObject({
        id: { type: "string" },
        text: { type: "string", maxLength: 12_000 },
      }),
      { type: "null" },
    ],
  },
  taskRevision: { type: "integer", minimum: 0 },
  activeTasks: {
    type: "array",
    maxItems: 100,
    items: existingTaskInputSchema,
  },
  planningContext: strictObject({
    capturedAt: { type: "string" },
    timeZone: { type: "string" },
  }),
});

const newTaskSchema = strictObject({
  taskRef: {
    type: "string",
    description: "Temporary unique reference beginning with new:, such as new:1.",
  },
  title: { type: "string", description: "Concise actionable title." },
  notes: nullableString(),
  statedDeadline: strictObject({
    value: nullableString(),
    source: { type: "string", enum: ["user-stated", "none"] },
  }),
  effort: strictObject({
    minutes: { type: "integer", minimum: 1, maximum: 480 },
    source: { type: "string", enum: ["user-stated", "ai-estimate"] },
    rationale: { type: "string" },
  }),
  contexts: { type: "array", items: sourcedLabelSchema },
  dependencies: { type: "array", items: dependencySchema },
  assumptions: {
    type: "array",
    items: strictObject({
      key: { type: "string" },
      text: { type: "string" },
      needsConfirmation: { type: "boolean" },
    }),
  },
});

export const FLOWNEE_PLANNING_OUTPUT_SCHEMA = strictObject({
  schemaVersion: { type: "integer", enum: [FLOWNEE_PLANNING_SCHEMA_VERSION] },
  newTasks: { type: "array", items: newTaskSchema },
  clarifications: {
    type: "array",
    items: strictObject({
      taskRef: nullableString(),
      question: { type: "string" },
      reason: { type: "string" },
      blocking: { type: "boolean" },
    }),
  },
  plan: strictObject({
    status: { type: "string", enum: ["ready", "no-action"] },
    orderedTaskRefs: { type: "array", items: { type: "string" } },
    nextTaskRef: nullableString(),
    nextReason: nullableString(),
    parallelGroups: {
      type: "array",
      items: strictObject({
        taskRefs: { type: "array", items: { type: "string" } },
        reason: { type: "string" },
      }),
    },
  }),
});

export const FLOWNEE_PLANNING_TEXT_FORMAT = {
  type: "json_schema",
  name: "flownee_execution_plan_v1",
  description:
    "Extracts spoken intentions and produces a complete, explainable active-task plan.",
  strict: true,
  schema: FLOWNEE_PLANNING_OUTPUT_SCHEMA,
} as const;

function fail(message: string): never {
  throw new TypeError(message);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${label} must be non-empty text.`);
  }
  return value;
}

function nullableText(value: unknown, label: string): string | null {
  if (value === null) return null;
  return nonEmptyString(value, label);
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) fail(`${label} must be an array.`);
  return value;
}

function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) fail(`${label} must be unique.`);
}

function exactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  label: string,
): void {
  const actual = Object.keys(value);
  if (
    actual.length !== keys.length ||
    actual.some((key) => !keys.includes(key))
  ) {
    fail(`${label} contains missing or unknown fields.`);
  }
}

function isoTimestamp(value: unknown, label: string): string {
  const text = nonEmptyString(value, label);
  if (!Number.isFinite(Date.parse(text))) fail(`${label} must be an ISO timestamp.`);
  return text;
}

export function assertPlanningRequest(
  value: unknown,
): asserts value is PlanningRequest {
  const request = record(value, "Planning request");
  exactKeys(
    request,
    ["schemaVersion", "operation", "transcript", "taskRevision", "activeTasks", "planningContext"],
    "Planning request",
  );
  if (request.schemaVersion !== FLOWNEE_PLANNING_SCHEMA_VERSION) {
    fail("Planning request schemaVersion is unsupported.");
  }
  if (request.operation !== "capture" && request.operation !== "replan") {
    fail("Planning operation is invalid.");
  }
  if (request.operation === "capture") {
    const transcript = record(request.transcript, "Transcript");
    exactKeys(transcript, ["id", "text"], "Transcript");
    nonEmptyString(transcript.id, "Transcript id");
    const transcriptText = nonEmptyString(transcript.text, "Transcript text");
    if (transcriptText.length > 12_000) fail("Transcript text exceeds 12,000 characters.");
  } else if (request.transcript !== null) {
    fail("A replan request must not contain a transcript.");
  }
  if (
    typeof request.taskRevision !== "number" ||
    !Number.isInteger(request.taskRevision) ||
    request.taskRevision < 0
  ) {
    fail("Task revision must be a non-negative integer.");
  }
  const tasks = array(request.activeTasks, "Active tasks");
  if (tasks.length > 100) fail("Active task snapshot exceeds 100 tasks.");
  const ids = tasks.map((item, index) => {
    const task = record(item, `Active task ${index}`);
    const label = `Active task ${index}`;
    exactKeys(
      task,
      [
        "id",
        "title",
        "notes",
        "statedDeadline",
        "estimatedEffortMinutes",
        "effortSource",
        "contexts",
        "dependencies",
        "assumptions",
      ],
      label,
    );
    const id = nonEmptyString(task.id, `${label} id`);
    nonEmptyString(task.title, `${label} title`);
    if (task.notes !== null) nonEmptyString(task.notes, `${label} notes`);
    if (task.statedDeadline !== null) {
      isoTimestamp(task.statedDeadline, `${label} statedDeadline`);
    }
    const effortPresent = task.estimatedEffortMinutes !== null;
    if (
      effortPresent &&
      (typeof task.estimatedEffortMinutes !== "number" ||
        !Number.isInteger(task.estimatedEffortMinutes) ||
        task.estimatedEffortMinutes < 1)
    ) {
      fail(`${label} estimated effort must be a positive whole number or null.`);
    }
    if (
      task.effortSource !== null &&
      task.effortSource !== "ai-estimate" &&
      task.effortSource !== "user-stated" &&
      task.effortSource !== "user-edited"
    ) {
      fail(`${label} effort source is invalid.`);
    }
    if (effortPresent !== (task.effortSource !== null)) {
      fail(`${label} effort and source must be set together.`);
    }
    const contexts = array(task.contexts, `${label} contexts`).map((item, itemIndex) =>
      nonEmptyString(item, `${label} context ${itemIndex}`),
    );
    unique(contexts, `${label} contexts`);
    const dependencies = array(task.dependencies, `${label} dependencies`).map(
      (item, itemIndex) => nonEmptyString(item, `${label} dependency ${itemIndex}`),
    );
    unique(dependencies, `${label} dependencies`);
    if (dependencies.includes(id)) fail(`${label} cannot depend on itself.`);
    const assumptions = array(task.assumptions, `${label} assumptions`).map(
      (item, itemIndex) => {
        const assumption = record(item, `${label} assumption ${itemIndex}`);
        exactKeys(
          assumption,
          ["id", "text", "status"],
          `${label} assumption ${itemIndex}`,
        );
        if (
          assumption.status !== "pending" &&
          assumption.status !== "confirmed" &&
          assumption.status !== "rejected"
        ) {
          fail(`${label} assumption ${itemIndex} status is invalid.`);
        }
        nonEmptyString(assumption.text, `${label} assumption ${itemIndex} text`);
        return nonEmptyString(assumption.id, `${label} assumption ${itemIndex} id`);
      },
    );
    unique(assumptions, `${label} assumption ids`);
    return id;
  });
  unique(ids, "Active task ids");
  const context = record(request.planningContext, "Planning context");
  exactKeys(context, ["capturedAt", "timeZone"], "Planning context");
  isoTimestamp(context.capturedAt, "Planning context capturedAt");
  nonEmptyString(context.timeZone, "Planning context timeZone");
}

function parseNewTask(value: unknown, index: number): NewTaskOutput {
  const label = `New task ${index}`;
  const task = record(value, label);
  exactKeys(
    task,
    [
      "taskRef",
      "title",
      "notes",
      "statedDeadline",
      "effort",
      "contexts",
      "dependencies",
      "assumptions",
    ],
    label,
  );
  const taskRef = nonEmptyString(task.taskRef, `${label} taskRef`);
  if (!taskRef.startsWith("new:")) fail(`${label} taskRef must begin with new:.`);
  const deadline = record(task.statedDeadline, `${label} statedDeadline`);
  exactKeys(deadline, ["value", "source"], `${label} statedDeadline`);
  const deadlineValue =
    deadline.value === null
      ? null
      : isoTimestamp(deadline.value, `${label} deadline value`);
  if (
    (deadlineValue === null && deadline.source !== "none") ||
    (deadlineValue !== null && deadline.source !== "user-stated")
  ) {
    fail(`${label} deadline must be null/none or explicitly user-stated.`);
  }
  const effort = record(task.effort, `${label} effort`);
  exactKeys(effort, ["minutes", "source", "rationale"], `${label} effort`);
  if (
    typeof effort.minutes !== "number" ||
    !Number.isInteger(effort.minutes) ||
    effort.minutes < 1 ||
    effort.minutes > 480
  ) {
    fail(`${label} effort must be 1-480 whole minutes.`);
  }
  if (effort.source !== "user-stated" && effort.source !== "ai-estimate") {
    fail(`${label} effort source is invalid.`);
  }
  const contexts = array(task.contexts, `${label} contexts`).map((item, itemIndex) => {
    const context = record(item, `${label} context ${itemIndex}`);
    exactKeys(context, ["label", "source"], `${label} context ${itemIndex}`);
    const source = context.source;
    if (source !== "user-stated" && source !== "ai-inferred") {
      fail(`${label} context ${itemIndex} source is invalid.`);
    }
    return {
      label: nonEmptyString(context.label, `${label} context ${itemIndex} label`),
      source: source as AttributeSource,
    };
  });
  unique(contexts.map((context) => context.label), `${label} context labels`);
  const dependencies = array(task.dependencies, `${label} dependencies`).map(
    (item, itemIndex) => {
      const dependency = record(item, `${label} dependency ${itemIndex}`);
      exactKeys(dependency, ["taskRef", "source"], `${label} dependency ${itemIndex}`);
      const source = dependency.source;
      if (source !== "user-stated" && source !== "ai-inferred") {
        fail(`${label} dependency ${itemIndex} source is invalid.`);
      }
      return {
        taskRef: nonEmptyString(
          dependency.taskRef,
          `${label} dependency ${itemIndex} taskRef`,
        ),
        source: source as AttributeSource,
      };
    },
  );
  unique(dependencies.map((dependency) => dependency.taskRef), `${label} dependencies`);
  const assumptions = array(task.assumptions, `${label} assumptions`).map(
    (item, itemIndex) => {
      const assumption = record(item, `${label} assumption ${itemIndex}`);
      exactKeys(
        assumption,
        ["key", "text", "needsConfirmation"],
        `${label} assumption ${itemIndex}`,
      );
      if (typeof assumption.needsConfirmation !== "boolean") {
        fail(`${label} assumption ${itemIndex} needsConfirmation must be boolean.`);
      }
      return {
        key: nonEmptyString(assumption.key, `${label} assumption ${itemIndex} key`),
        text: nonEmptyString(assumption.text, `${label} assumption ${itemIndex} text`),
        needsConfirmation: assumption.needsConfirmation,
      };
    },
  );
  unique(assumptions.map((assumption) => assumption.key), `${label} assumption keys`);
  nonEmptyString(effort.rationale, `${label} effort rationale`);
  return {
    taskRef: taskRef as NewTaskRef,
    title: nonEmptyString(task.title, `${label} title`),
    notes: task.notes === null ? null : nullableText(task.notes, `${label} notes`),
    statedDeadline: {
      value: deadlineValue,
      source: deadline.source as "user-stated" | "none",
    },
    effort: {
      minutes: effort.minutes,
      source: effort.source,
      rationale: effort.rationale as string,
    },
    contexts,
    dependencies,
    assumptions,
  };
}

export function parsePlanningOutput(
  value: unknown,
  request: PlanningRequest,
): PlanningOutput {
  assertPlanningRequest(request);
  const output = record(value, "Planning output");
  exactKeys(output, ["schemaVersion", "newTasks", "clarifications", "plan"], "Planning output");
  if (output.schemaVersion !== FLOWNEE_PLANNING_SCHEMA_VERSION) {
    fail("Planning output schemaVersion is unsupported.");
  }
  const newTasks = array(output.newTasks, "New tasks").map(parseNewTask);
  const newRefs = newTasks.map((task) => task.taskRef);
  unique(newRefs, "New task references");
  const existingRefs = request.activeTasks.map((task) => task.id);
  const validRefs = new Set([...existingRefs, ...newRefs]);

  for (const task of newTasks) {
    for (const dependency of task.dependencies) {
      if (!validRefs.has(dependency.taskRef)) {
        fail(`Dependency references unknown task ${dependency.taskRef}.`);
      }
      if (dependency.taskRef === task.taskRef) fail("A task cannot depend on itself.");
    }
  }

  const clarifications = array(output.clarifications, "Clarifications").map(
    (item, index) => {
      const clarification = record(item, `Clarification ${index}`);
      exactKeys(
        clarification,
        ["taskRef", "question", "reason", "blocking"],
        `Clarification ${index}`,
      );
      const taskRef =
        clarification.taskRef === null
          ? null
          : nonEmptyString(clarification.taskRef, `Clarification ${index} taskRef`);
      if (taskRef !== null && !validRefs.has(taskRef)) {
        fail(`Clarification references unknown task ${taskRef}.`);
      }
      if (typeof clarification.blocking !== "boolean") {
        fail(`Clarification ${index} blocking must be boolean.`);
      }
      return {
        taskRef,
        question: nonEmptyString(clarification.question, `Clarification ${index} question`),
        reason: nonEmptyString(clarification.reason, `Clarification ${index} reason`),
        blocking: clarification.blocking,
      };
    },
  );

  if (request.operation === "replan" && (newTasks.length > 0 || clarifications.length > 0)) {
    fail("A replan may not create tasks or ask transcript clarifications.");
  }

  const plan = record(output.plan, "Plan");
  exactKeys(
    plan,
    ["status", "orderedTaskRefs", "nextTaskRef", "nextReason", "parallelGroups"],
    "Plan",
  );
  if (plan.status !== "ready" && plan.status !== "no-action") {
    fail("Plan status is invalid.");
  }
  const orderedTaskRefs = array(plan.orderedTaskRefs, "Plan order").map((ref, index) =>
    nonEmptyString(ref, `Plan order ${index}`),
  );
  unique(orderedTaskRefs, "Plan order");
  if (
    orderedTaskRefs.length !== validRefs.size ||
    orderedTaskRefs.some((ref) => !validRefs.has(ref))
  ) {
    fail("Plan must contain every active and new task exactly once.");
  }
  const nextTaskRef =
    plan.nextTaskRef === null
      ? null
      : nonEmptyString(plan.nextTaskRef, "Plan nextTaskRef");
  const nextReason =
    plan.nextReason === null ? null : nonEmptyString(plan.nextReason, "Plan nextReason");
  if (validRefs.size === 0) {
    if (
      plan.status !== "no-action" ||
      nextTaskRef !== null ||
      nextReason !== null ||
      orderedTaskRefs.length !== 0
    ) {
      fail("An empty task set must produce a no-action plan.");
    }
  } else if (
    plan.status !== "ready" ||
    nextTaskRef !== orderedTaskRefs[0] ||
    nextReason === null
  ) {
    fail("A non-empty plan must be ready and put its explained next task first.");
  }
  const parallelGroups = array(plan.parallelGroups, "Parallel groups").map(
    (item, index) => {
      const group = record(item, `Parallel group ${index}`);
      exactKeys(group, ["taskRefs", "reason"], `Parallel group ${index}`);
      const taskRefs = array(group.taskRefs, `Parallel group ${index} taskRefs`).map(
        (ref, refIndex) => nonEmptyString(ref, `Parallel group ${index} ref ${refIndex}`),
      );
      unique(taskRefs, `Parallel group ${index} task refs`);
      if (taskRefs.length < 2 || taskRefs.some((ref) => !validRefs.has(ref))) {
        fail(`Parallel group ${index} must contain at least two known tasks.`);
      }
      return {
        taskRefs,
        reason: nonEmptyString(group.reason, `Parallel group ${index} reason`),
      };
    },
  );

  return {
    schemaVersion: FLOWNEE_PLANNING_SCHEMA_VERSION,
    newTasks,
    clarifications,
    plan: {
      status: plan.status,
      orderedTaskRefs,
      nextTaskRef,
      nextReason,
      parallelGroups,
    },
  };
}
