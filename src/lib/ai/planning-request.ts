import {
  FLOWNEE_PLANNING_SCHEMA_VERSION,
  type PlanningRequest,
} from "@/lib/ai/planning-contract";
import type { FlowneeSnapshot } from "@/lib/storage/schema";

function activeTaskInputs(snapshot: FlowneeSnapshot): PlanningRequest["activeTasks"] {
  return snapshot.tasks
    .filter((task) => task.status === "active")
    .map((task) => ({
      id: task.id,
      title: task.title,
      notes: task.notes,
      statedDeadline: task.statedDeadline,
      estimatedEffortMinutes: task.estimatedEffortMinutes,
      effortSource: task.effortSource,
      contexts: task.contexts,
      dependencies: task.dependencies,
      assumptions: task.assumptions,
    }));
}

function planningContext() {
  return {
    capturedAt: new Date().toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
}

export function createCapturePlanningRequest(
  snapshot: FlowneeSnapshot,
  transcript: { id: string; text: string },
): PlanningRequest {
  return {
    schemaVersion: FLOWNEE_PLANNING_SCHEMA_VERSION,
    operation: "capture",
    transcript,
    taskRevision: snapshot.taskRevision,
    activeTasks: activeTaskInputs(snapshot),
    planningContext: planningContext(),
  };
}

export function createReplanningRequest(snapshot: FlowneeSnapshot): PlanningRequest {
  return {
    schemaVersion: FLOWNEE_PLANNING_SCHEMA_VERSION,
    operation: "replan",
    transcript: null,
    taskRevision: snapshot.taskRevision,
    activeTasks: activeTaskInputs(snapshot),
    planningContext: planningContext(),
  };
}
