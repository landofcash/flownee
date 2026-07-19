import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";

import {
  FLOWNEE_DATABASE_VERSION,
  FLOWNEE_STORES,
  FlowneeRepository,
  openFlowneeDatabase,
} from "@/lib/storage/database";
import type {
  ExecutionPlan,
  Task,
  Transcript,
} from "@/lib/storage/schema";

const timestamp = "2026-07-18T15:00:00.000Z";

function makeTranscript(overrides: Partial<Transcript> = {}): Transcript {
  return {
    id: "transcript-1",
    text: "Start the wash and pay the electricity bill.",
    status: "confirmed",
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Start the dark-clothes wash",
    notes: null,
    sourceTranscriptId: "transcript-1",
    status: "active",
    statedDeadline: null,
    estimatedEffortMinutes: 10,
    effortSource: "ai-estimate",
    contexts: ["home"],
    dependencies: [],
    assumptions: [
      {
        id: "assumption-1",
        text: "The washing machine is available.",
        status: "pending",
      },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function makePlan(overrides: Partial<ExecutionPlan> = {}): ExecutionPlan {
  return {
    id: "plan-1",
    taskOrder: ["task-1"],
    nextTaskId: "task-1",
    nextReason: "It can run while you handle something else.",
    generatedAt: timestamp,
    basedOnRevision: 1,
    model: "gpt-5.6-test-fixture",
    ...overrides,
  };
}

describe("Flownee IndexedDB", () => {
  let factory: IDBFactory;
  let databaseName: string;

  beforeEach(() => {
    factory = new IDBFactory();
    databaseName = `flownee-test-${crypto.randomUUID()}`;
  });

  it("creates the versioned stores and lookup indexes", async () => {
    const database = await openFlowneeDatabase({ factory, name: databaseName });

    expect(database.version).toBe(FLOWNEE_DATABASE_VERSION);
    expect([...database.objectStoreNames]).toEqual(
      expect.arrayContaining(Object.values(FLOWNEE_STORES)),
    );

    const transaction = database.transaction(
      [FLOWNEE_STORES.transcripts, FLOWNEE_STORES.tasks, FLOWNEE_STORES.plans],
      "readonly",
    );
    expect([
      ...transaction.objectStore(FLOWNEE_STORES.transcripts).indexNames,
    ]).toEqual(expect.arrayContaining(["by-status", "by-created-at"]));
    expect([...transaction.objectStore(FLOWNEE_STORES.tasks).indexNames]).toEqual(
      expect.arrayContaining([
        "by-status",
        "by-updated-at",
        "by-source-transcript",
      ]),
    );
    expect([...transaction.objectStore(FLOWNEE_STORES.plans).indexNames]).toEqual(
      expect.arrayContaining(["by-generated-at", "by-revision"]),
    );

    database.close();
  });

  it("round-trips a confirmed transcript, tasks, revision, and current plan", async () => {
    const repository = await FlowneeRepository.open({
      factory,
      name: databaseName,
    });
    const transcript = makeTranscript();
    const task = makeTask();
    const plan = makePlan();

    await repository.saveTranscript(transcript);
    expect(await repository.saveTasks([task])).toBe(1);
    await repository.replaceCurrentPlan(plan);

    expect(await repository.loadSnapshot()).toEqual({
      taskRevision: 1,
      transcripts: [transcript],
      tasks: [task],
      currentPlan: plan,
    });
    repository.close();
  });

  it("atomically commits new tasks with a plan based on the new revision", async () => {
    const repository = await FlowneeRepository.open({
      factory,
      name: databaseName,
    });

    expect(await repository.commitTasksAndPlan([makeTask()], makePlan())).toBe(1);
    const snapshot = await repository.loadSnapshot();

    expect(snapshot.taskRevision).toBe(1);
    expect(snapshot.tasks).toHaveLength(1);
    expect(snapshot.currentPlan?.nextTaskId).toBe("task-1");
    repository.close();
  });

  it("rejects stale plans and preserves the last valid plan", async () => {
    const repository = await FlowneeRepository.open({
      factory,
      name: databaseName,
    });
    const originalPlan = makePlan();
    await repository.commitTasksAndPlan([makeTask()], originalPlan);
    await repository.saveTasks([
      makeTask({ title: "Start the wash now", updatedAt: "2026-07-18T15:05:00.000Z" }),
    ]);

    await expect(repository.replaceCurrentPlan(originalPlan)).rejects.toThrow(
      "stale",
    );
    expect((await repository.loadSnapshot()).currentPlan).toEqual(originalPlan);
    repository.close();
  });

  it("commits completion immediately with a valid provisional plan", async () => {
    const repository = await FlowneeRepository.open({ factory, name: databaseName });
    const secondTask = makeTask({
      id: "task-2",
      title: "Pay the bill",
      assumptions: [],
    });
    await repository.commitTasksAndPlan(
      [makeTask(), secondTask],
      makePlan({ taskOrder: ["task-1", "task-2"] }),
    );

    await repository.applyTaskMutation(
      {
        kind: "upsert",
        task: makeTask({ status: "completed", updatedAt: "2026-07-18T15:05:00.000Z" }),
      },
      { changedAt: "2026-07-18T15:05:00.000Z", idFactory: () => "provisional-1" },
    );

    const snapshot = await repository.loadSnapshot();
    expect(snapshot.taskRevision).toBe(2);
    expect(snapshot.currentPlan).toMatchObject({
      taskOrder: ["task-2"],
      nextTaskId: "task-2",
      basedOnRevision: 2,
      model: "local-provisional",
    });
    repository.close();
  });

  it("deletes a task, cleans dependencies, and clears the plan when no active work remains", async () => {
    const repository = await FlowneeRepository.open({ factory, name: databaseName });
    const completedDependent = makeTask({
      id: "task-2",
      status: "completed",
      dependencies: ["task-1"],
      assumptions: [],
    });
    await repository.commitTasksAndPlan([makeTask(), completedDependent], makePlan());

    await repository.applyTaskMutation(
      { kind: "delete", taskId: "task-1" },
      { changedAt: "2026-07-18T15:05:00.000Z" },
    );

    const snapshot = await repository.loadSnapshot();
    expect(snapshot.tasks).toEqual([
      expect.objectContaining({ id: "task-2", dependencies: [] }),
    ]);
    expect(snapshot.currentPlan).toBeNull();
    repository.close();
  });

  it("rejects an AI plan returned for the revision before a newer task action", async () => {
    const repository = await FlowneeRepository.open({ factory, name: databaseName });
    await repository.commitTasksAndPlan([makeTask()], makePlan());
    const responseForRevisionOne = makePlan({ id: "late-plan", basedOnRevision: 1 });
    await repository.applyTaskMutation(
      {
        kind: "upsert",
        task: makeTask({ title: "Start the wash now", updatedAt: "2026-07-18T15:05:00.000Z" }),
      },
      { changedAt: "2026-07-18T15:05:00.000Z" },
    );

    await expect(repository.replaceCurrentPlan(responseForRevisionOne)).rejects.toThrow("stale");
    expect((await repository.loadSnapshot()).currentPlan?.model).toBe("local-provisional");
    repository.close();
  });

  it("rejects structurally invalid tasks before writing anything", async () => {
    const repository = await FlowneeRepository.open({
      factory,
      name: databaseName,
    });
    const invalidTask = makeTask({
      estimatedEffortMinutes: null,
      effortSource: "ai-estimate",
    });

    await expect(repository.saveTasks([invalidTask])).rejects.toThrow(
      "set together",
    );
    expect((await repository.loadSnapshot()).tasks).toEqual([]);
    repository.close();
  });

  it("clears every user-content store", async () => {
    const repository = await FlowneeRepository.open({
      factory,
      name: databaseName,
    });
    await repository.saveTranscript(makeTranscript());
    await repository.commitTasksAndPlan([makeTask()], makePlan());

    await repository.clearAll();

    expect(await repository.loadSnapshot()).toEqual({
      taskRevision: 0,
      transcripts: [],
      tasks: [],
      currentPlan: null,
    });
    repository.close();
  });
});
