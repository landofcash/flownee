import type { FlowneeSnapshot, Task } from "@/lib/storage/schema";
import { LOCAL_PROVISIONAL_PLAN_MODEL } from "@/lib/storage/database";

export type PlannedTask = {
  id: string;
  title: string;
  emoji?: string;
  estimatedEffortMinutes: number | null;
};

export type EmptyHomeState = {
  status: "empty";
};

export type LoadingHomeState = {
  status: "loading";
};

export type CompleteHomeState = {
  status: "all-complete";
  completedCount: number;
};

export type PlanHomeState = {
  status: "plan";
  isUpdating: boolean;
  nextTask: PlannedTask;
  reason: string;
  upcomingTasks: PlannedTask[];
};

export type HomeState =
  | EmptyHomeState
  | LoadingHomeState
  | CompleteHomeState
  | PlanHomeState;

export const emptyHomeState: EmptyHomeState = { status: "empty" };

export const sampleHomeState: PlanHomeState = {
  status: "plan",
  isUpdating: false,
  nextTask: {
    id: "sample-laundry",
    title: "Start the dark-clothes wash",
    emoji: "🧺",
    estimatedEffortMinutes: 10,
  },
  reason:
    "It takes little active time, and the machine can run while you handle something else.",
  upcomingTasks: [
    {
      id: "sample-bill",
      title: "Pay the electricity bill",
      emoji: "💡",
      estimatedEffortMinutes: 5,
    },
    {
      id: "sample-gift",
      title: "Check the gift deadline and buy the present",
      emoji: "🎁",
      estimatedEffortMinutes: 30,
    },
    {
      id: "sample-call",
      title: "Call Maria",
      emoji: "📞",
      estimatedEffortMinutes: 10,
    },
  ],
};

export function getHomeStateForDemo(demo?: string): HomeState {
  if (demo === "sample") return sampleHomeState;
  if (demo === "updating") return { ...sampleHomeState, isUpdating: true };
  if (demo === "complete") {
    return { status: "all-complete", completedCount: 4 };
  }
  if (demo === "loading") return { status: "loading" };

  return emptyHomeState;
}

function toPlannedTask(task: Task): PlannedTask {
  return {
    id: task.id,
    title: task.title,
    emoji: task.emoji,
    estimatedEffortMinutes: task.estimatedEffortMinutes,
  };
}

export function homeStateFromSnapshot(snapshot: FlowneeSnapshot): HomeState {
  const activeTasks = snapshot.tasks.filter((task) => task.status === "active");
  if (activeTasks.length === 0) {
    const completedCount = snapshot.tasks.filter(
      (task) => task.status === "completed",
    ).length;
    return completedCount > 0
      ? { status: "all-complete", completedCount }
      : emptyHomeState;
  }
  if (!snapshot.currentPlan) return { status: "loading" };

  const tasksById = new Map(activeTasks.map((task) => [task.id, task]));
  const ordered = snapshot.currentPlan.taskOrder
    .map((id) => tasksById.get(id))
    .filter((task): task is Task => task !== undefined);
  const nextTask = tasksById.get(snapshot.currentPlan.nextTaskId);
  if (!nextTask || ordered.length !== activeTasks.length) return { status: "loading" };

  return {
    status: "plan",
    isUpdating: snapshot.currentPlan.model === LOCAL_PROVISIONAL_PLAN_MODEL,
    nextTask: toPlannedTask(nextTask),
    reason: snapshot.currentPlan.nextReason,
    upcomingTasks: ordered.slice(1).map(toPlannedTask),
  };
}
