import { describe, expect, it } from "vitest";

import {
  FLOWNEE_PLANNING_OUTPUT_SCHEMA,
  FLOWNEE_PLANNING_INPUT_SCHEMA,
  FLOWNEE_PLANNING_SCHEMA_VERSION,
  FLOWNEE_PLANNING_TEXT_FORMAT,
  assertPlanningRequest,
  parsePlanningOutput,
  type PlanningOutput,
  type PlanningRequest,
} from "@/lib/ai/planning-contract";
import {
  PLANNING_EVALUATION_FIXTURES,
  evaluatePlanningFixture,
} from "@/lib/ai/fixtures/planning-evaluations";

const request: PlanningRequest = {
  schemaVersion: FLOWNEE_PLANNING_SCHEMA_VERSION,
  operation: "capture",
  transcript: { id: "transcript:1", text: "Pay the bill and call Maria." },
  taskRevision: 1,
  activeTasks: [
    {
      id: "task:existing",
      title: "Start the laundry",
      notes: null,
      statedDeadline: null,
      estimatedEffortMinutes: 10,
      effortSource: "ai-estimate",
      contexts: ["home"],
      dependencies: [],
      assumptions: [],
    },
  ],
  planningContext: {
    capturedAt: "2026-07-18T10:00:00.000+01:00",
    timeZone: "Europe/Lisbon",
  },
};

const output = (): PlanningOutput => ({
  schemaVersion: FLOWNEE_PLANNING_SCHEMA_VERSION,
  newTasks: [
    {
      taskRef: "new:1",
      title: "Pay the bill",
      notes: null,
      statedDeadline: { value: null, source: "none" },
      effort: { minutes: 5, source: "ai-estimate", rationale: "A quick online payment." },
      contexts: [{ label: "computer", source: "ai-inferred" }],
      dependencies: [],
      assumptions: [],
    },
    {
      taskRef: "new:2",
      title: "Call Maria",
      notes: null,
      statedDeadline: { value: null, source: "none" },
      effort: { minutes: 10, source: "ai-estimate", rationale: "A short personal call." },
      contexts: [{ label: "phone", source: "ai-inferred" }],
      dependencies: [],
      assumptions: [],
    },
  ],
  clarifications: [],
  plan: {
    status: "ready",
    orderedTaskRefs: ["task:existing", "new:1", "new:2"],
    nextTaskRef: "task:existing",
    nextReason: "Start the background cycle, then use its run time for the quick tasks.",
    parallelGroups: [
      {
        taskRefs: ["task:existing", "new:1"],
        reason: "The bill can be paid while the machine runs.",
      },
    ],
  },
});

function assertEveryObjectIsStrict(schema: unknown): void {
  if (Array.isArray(schema)) {
    schema.forEach(assertEveryObjectIsStrict);
    return;
  }
  if (typeof schema !== "object" || schema === null) return;
  const node = schema as Record<string, unknown>;
  if (node.type === "object") {
    expect(node.additionalProperties).toBe(false);
    const properties = node.properties as Record<string, unknown>;
    expect(node.required).toEqual(Object.keys(properties));
  }
  Object.values(node).forEach(assertEveryObjectIsStrict);
}

describe("Flownee GPT-5.6 planning contract", () => {
  it("exports a strict Responses API text format", () => {
    expect(FLOWNEE_PLANNING_TEXT_FORMAT.type).toBe("json_schema");
    expect(FLOWNEE_PLANNING_TEXT_FORMAT.strict).toBe(true);
    assertEveryObjectIsStrict(FLOWNEE_PLANNING_INPUT_SCHEMA);
    assertEveryObjectIsStrict(FLOWNEE_PLANNING_OUTPUT_SCHEMA);
  });

  it("validates the complete compact input snapshot", () => {
    expect(() => assertPlanningRequest(request)).not.toThrow();
    expect(() =>
      assertPlanningRequest({
        ...request,
        activeTasks: [{ ...request.activeTasks[0], unexpected: true }],
      }),
    ).toThrow("contains missing or unknown fields");
  });

  it("accepts a complete plan and preserves typed output", () => {
    expect(parsePlanningOutput(output(), request)).toEqual(output());
  });

  it.each([
    ["unknown plan reference", (candidate: PlanningOutput) => candidate.plan.orderedTaskRefs.splice(1, 1, "task:unknown")],
    ["duplicate plan reference", (candidate: PlanningOutput) => candidate.plan.orderedTaskRefs.splice(2, 1, "new:1")],
    ["next task not first", (candidate: PlanningOutput) => (candidate.plan.nextTaskRef = "new:1")],
    ["inconsistent deadline provenance", (candidate: PlanningOutput) => (candidate.newTasks[0].statedDeadline.source = "user-stated")],
    ["unknown dependency", (candidate: PlanningOutput) => candidate.newTasks[0].dependencies.push({ taskRef: "task:unknown", source: "ai-inferred" })],
  ])("rejects %s", (_name, mutate) => {
    const candidate = output();
    mutate(candidate);
    expect(() => parsePlanningOutput(candidate, request)).toThrow(TypeError);
  });

  it("accepts the explicit empty no-action state", () => {
    const emptyRequest: PlanningRequest = {
      ...request,
      activeTasks: [],
      taskRevision: 0,
    };
    const emptyOutput: PlanningOutput = {
      schemaVersion: 1,
      newTasks: [],
      clarifications: [],
      plan: {
        status: "no-action",
        orderedTaskRefs: [],
        nextTaskRef: null,
        nextReason: null,
        parallelGroups: [],
      },
    };
    expect(parsePlanningOutput(emptyOutput, emptyRequest)).toEqual(emptyOutput);
  });

  it("accepts a transcript-free replan and forbids task extraction", () => {
    const replanRequest: PlanningRequest = {
      ...request,
      operation: "replan",
      transcript: null,
    };
    const replanOutput: PlanningOutput = {
      schemaVersion: 1,
      newTasks: [],
      clarifications: [],
      plan: {
        status: "ready",
        orderedTaskRefs: ["task:existing"],
        nextTaskRef: "task:existing",
        nextReason: "It is the only active item.",
        parallelGroups: [],
      },
    };

    expect(parsePlanningOutput(replanOutput, replanRequest)).toEqual(replanOutput);
    expect(() =>
      parsePlanningOutput(
        {
          ...replanOutput,
          newTasks: output().newTasks.slice(0, 1),
          plan: {
            ...replanOutput.plan,
            orderedTaskRefs: ["task:existing", "new:1"],
          },
        },
        replanRequest,
      ),
    ).toThrow("may not create tasks");
  });

  it("requires transcript presence to match the operation", () => {
    expect(() => assertPlanningRequest({ ...request, transcript: null })).toThrow();
    expect(() =>
      assertPlanningRequest({ ...request, operation: "replan" }),
    ).toThrow("must not contain a transcript");
  });
});

describe("planning evaluation fixtures", () => {
  it("uses unique fixture ids and validates each request contract", () => {
    const ids = PLANNING_EVALUATION_FIXTURES.map((fixture) => fixture.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("transcript-prompt-injection");
    PLANNING_EVALUATION_FIXTURES.forEach((fixture) =>
      expect(() => assertPlanningRequest(fixture.request)).not.toThrow(),
    );
  });

  it("reports evaluation failures as readable issues", () => {
    const fixture = PLANNING_EVALUATION_FIXTURES.find(
      (item) => item.id === "passing-thought-to-action",
    );
    expect(fixture).toBeDefined();
    const badOutput = output();
    badOutput.newTasks[0].statedDeadline = {
      value: "2026-07-20T17:00:00.000+01:00",
      source: "user-stated",
    };
    expect(evaluatePlanningFixture(fixture!, badOutput)).toContain(
      "A deadline was invented for a transcript without one.",
    );
  });
});
