import {
  FLOWNEE_PLANNING_SCHEMA_VERSION,
  type PlanningOutput,
  type PlanningRequest,
} from "@/lib/ai/planning-contract";

export const planningRequestFixture: PlanningRequest = {
  schemaVersion: FLOWNEE_PLANNING_SCHEMA_VERSION,
  operation: "capture",
  transcript: { id: "transcript-1", text: "Call Maria." },
  taskRevision: 0,
  activeTasks: [],
  planningContext: {
    capturedAt: "2026-07-18T18:00:00.000Z",
    timeZone: "Europe/Lisbon",
  },
};

export const planningOutputFixture: PlanningOutput = {
  schemaVersion: FLOWNEE_PLANNING_SCHEMA_VERSION,
  newTasks: [
    {
      taskRef: "new:1",
      title: "Call Maria",
      notes: null,
      statedDeadline: { value: null, source: "none" },
      effort: {
        minutes: 10,
        source: "ai-estimate",
        rationale: "A short personal call.",
      },
      contexts: [{ label: "phone", source: "ai-inferred" }],
      dependencies: [],
      assumptions: [],
    },
  ],
  clarifications: [],
  plan: {
    status: "ready",
    orderedTaskRefs: ["new:1"],
    nextTaskRef: "new:1",
    nextReason: "It is a short action that can clear mental space.",
    parallelGroups: [],
  },
};
