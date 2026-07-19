import {
  assertExecutionPlan,
  assertPlanMatchesTasks,
  assertTask,
  assertTranscript,
  type ExecutionPlan,
  type FlowneeSnapshot,
  type Task,
  type Transcript,
} from "@/lib/storage/schema";

export const FLOWNEE_DATABASE_NAME = "flownee";
export const FLOWNEE_DATABASE_VERSION = 1;

export const FLOWNEE_STORES = {
  transcripts: "transcripts",
  tasks: "tasks",
  plans: "plans",
  metadata: "metadata",
} as const;

type MetadataRecord = {
  key: "taskRevision";
  value: number;
};

type OpenDatabaseOptions = {
  factory?: IDBFactory;
  name?: string;
};

export type TaskMutation =
  | { kind: "upsert"; task: Task }
  | { kind: "delete"; taskId: string }
  | { kind: "delete-completed" }
  | { kind: "restore-postponed" };

export const LOCAL_PROVISIONAL_PLAN_MODEL = "local-provisional";

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), {
      once: true,
    });
    request.addEventListener(
      "error",
      () => reject(request.error ?? new Error("IndexedDB request failed.")),
      { once: true },
    );
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve(), { once: true });
    transaction.addEventListener(
      "abort",
      () => reject(transaction.error ?? new Error("IndexedDB transaction aborted.")),
      { once: true },
    );
    transaction.addEventListener(
      "error",
      () => reject(transaction.error ?? new Error("IndexedDB transaction failed.")),
      { once: true },
    );
  });
}

function createSchema(database: IDBDatabase): void {
  const transcripts = database.createObjectStore(FLOWNEE_STORES.transcripts, {
    keyPath: "id",
  });
  transcripts.createIndex("by-status", "status");
  transcripts.createIndex("by-created-at", "createdAt");

  const tasks = database.createObjectStore(FLOWNEE_STORES.tasks, {
    keyPath: "id",
  });
  tasks.createIndex("by-status", "status");
  tasks.createIndex("by-updated-at", "updatedAt");
  tasks.createIndex("by-source-transcript", "sourceTranscriptId");

  const plans = database.createObjectStore(FLOWNEE_STORES.plans, {
    keyPath: "id",
  });
  plans.createIndex("by-generated-at", "generatedAt");
  plans.createIndex("by-revision", "basedOnRevision", { unique: true });

  database.createObjectStore(FLOWNEE_STORES.metadata, { keyPath: "key" });
}

export function openFlowneeDatabase({
  factory = globalThis.indexedDB,
  name = FLOWNEE_DATABASE_NAME,
}: OpenDatabaseOptions = {}): Promise<IDBDatabase> {
  if (!factory) {
    return Promise.reject(new Error("IndexedDB is not available in this browser."));
  }

  return new Promise((resolve, reject) => {
    const request = factory.open(name, FLOWNEE_DATABASE_VERSION);

    request.addEventListener("upgradeneeded", (event) => {
      if (event.oldVersion === 0) createSchema(request.result);
    });
    request.addEventListener("success", () => resolve(request.result), {
      once: true,
    });
    request.addEventListener(
      "error",
      () => reject(request.error ?? new Error("Unable to open Flownee storage.")),
      { once: true },
    );
    request.addEventListener(
      "blocked",
      () => reject(new Error("Flownee storage upgrade is blocked by another tab.")),
      { once: true },
    );
  });
}

function readRevision(store: IDBObjectStore): Promise<number> {
  return requestToPromise<MetadataRecord | undefined>(store.get("taskRevision")).then(
    (record) => record?.value ?? 0,
  );
}

export class FlowneeRepository {
  private constructor(private readonly database: IDBDatabase) {}

  static async open(options: OpenDatabaseOptions = {}): Promise<FlowneeRepository> {
    return new FlowneeRepository(await openFlowneeDatabase(options));
  }

  close(): void {
    this.database.close();
  }

  async saveTranscript(transcript: Transcript): Promise<void> {
    assertTranscript(transcript);
    const transaction = this.database.transaction(
      FLOWNEE_STORES.transcripts,
      "readwrite",
    );
    transaction.objectStore(FLOWNEE_STORES.transcripts).put(transcript);
    await transactionToPromise(transaction);
  }

  async saveTasks(tasks: Task[]): Promise<number> {
    tasks.forEach(assertTask);
    const transaction = this.database.transaction(
      [FLOWNEE_STORES.tasks, FLOWNEE_STORES.metadata],
      "readwrite",
    );
    const taskStore = transaction.objectStore(FLOWNEE_STORES.tasks);
    const metadataStore = transaction.objectStore(FLOWNEE_STORES.metadata);
    const currentRevision = await readRevision(metadataStore);
    const nextRevision = currentRevision + 1;

    tasks.forEach((task) => taskStore.put(task));
    metadataStore.put({ key: "taskRevision", value: nextRevision });
    await transactionToPromise(transaction);

    return nextRevision;
  }

  async replaceCurrentPlan(plan: ExecutionPlan): Promise<void> {
    assertExecutionPlan(plan);
    const transaction = this.database.transaction(
      [FLOWNEE_STORES.tasks, FLOWNEE_STORES.plans, FLOWNEE_STORES.metadata],
      "readwrite",
    );
    const completion = transactionToPromise(transaction);
    const taskStore = transaction.objectStore(FLOWNEE_STORES.tasks);
    const planStore = transaction.objectStore(FLOWNEE_STORES.plans);
    const metadataStore = transaction.objectStore(FLOWNEE_STORES.metadata);

    const [tasks, revision] = await Promise.all([
      requestToPromise<Task[]>(taskStore.getAll()),
      readRevision(metadataStore),
    ]);

    try {
      assertPlanMatchesTasks(plan, tasks);
      if (plan.basedOnRevision !== revision) {
        throw new Error("Execution plan is stale for the current task revision.");
      }
    } catch (error) {
      transaction.abort();
      await completion.catch(() => undefined);
      throw error;
    }

    planStore.clear();
    planStore.put(plan);
    await completion;
  }

  async commitTasksAndPlan(tasks: Task[], plan: ExecutionPlan): Promise<number> {
    tasks.forEach(assertTask);
    assertExecutionPlan(plan);

    const transaction = this.database.transaction(
      [FLOWNEE_STORES.tasks, FLOWNEE_STORES.plans, FLOWNEE_STORES.metadata],
      "readwrite",
    );
    const completion = transactionToPromise(transaction);
    const taskStore = transaction.objectStore(FLOWNEE_STORES.tasks);
    const planStore = transaction.objectStore(FLOWNEE_STORES.plans);
    const metadataStore = transaction.objectStore(FLOWNEE_STORES.metadata);
    const [storedTasks, currentRevision] = await Promise.all([
      requestToPromise<Task[]>(taskStore.getAll()),
      readRevision(metadataStore),
    ]);
    const nextRevision = currentRevision + 1;
    const mergedTasks = new Map(storedTasks.map((task) => [task.id, task]));
    tasks.forEach((task) => mergedTasks.set(task.id, task));

    try {
      assertPlanMatchesTasks(plan, [...mergedTasks.values()]);
      if (plan.basedOnRevision !== nextRevision) {
        throw new Error("Execution plan revision does not match the task commit.");
      }
    } catch (error) {
      transaction.abort();
      await completion.catch(() => undefined);
      throw error;
    }

    tasks.forEach((task) => taskStore.put(task));
    planStore.clear();
    planStore.put(plan);
    metadataStore.put({ key: "taskRevision", value: nextRevision });
    await completion;

    return nextRevision;
  }

  async applyTaskMutation(
    mutation: TaskMutation,
    {
      changedAt = new Date().toISOString(),
      idFactory = () => crypto.randomUUID(),
    }: { changedAt?: string; idFactory?: () => string } = {},
  ): Promise<number> {
    if (!Number.isFinite(Date.parse(changedAt))) {
      throw new TypeError("Task mutation time must be a timestamp.");
    }
    if (mutation.kind === "upsert") assertTask(mutation.task);
    if (mutation.kind === "delete" && !mutation.taskId.trim()) {
      throw new TypeError("Task id is required for deletion.");
    }

    const transaction = this.database.transaction(
      [FLOWNEE_STORES.tasks, FLOWNEE_STORES.plans, FLOWNEE_STORES.metadata],
      "readwrite",
    );
    const completion = transactionToPromise(transaction);
    const taskStore = transaction.objectStore(FLOWNEE_STORES.tasks);
    const planStore = transaction.objectStore(FLOWNEE_STORES.plans);
    const metadataStore = transaction.objectStore(FLOWNEE_STORES.metadata);
    const [storedTasks, storedPlans, currentRevision] = await Promise.all([
      requestToPromise<Task[]>(taskStore.getAll()),
      requestToPromise<ExecutionPlan[]>(planStore.getAll()),
      readRevision(metadataStore),
    ]);
    const tasksById = new Map(storedTasks.map((task) => [task.id, task]));
    const deletedTaskIds = new Set<string>();
    const inactiveTargetIds = new Set<string>();

    try {
      if (mutation.kind === "upsert") {
        if (!tasksById.has(mutation.task.id)) {
          throw new Error("The task no longer exists.");
        }
        tasksById.set(mutation.task.id, mutation.task);
        if (mutation.task.status !== "active") {
          inactiveTargetIds.add(mutation.task.id);
        }
      } else if (mutation.kind === "delete") {
        if (!tasksById.has(mutation.taskId)) {
          throw new Error("The task no longer exists.");
        }
        tasksById.delete(mutation.taskId);
        deletedTaskIds.add(mutation.taskId);
        inactiveTargetIds.add(mutation.taskId);
      } else if (mutation.kind === "delete-completed") {
        const completedIds = [...tasksById.values()]
          .filter((task) => task.status === "completed")
          .map((task) => task.id);
        if (completedIds.length === 0) {
          throw new Error("There are no completed items to clean.");
        }
        for (const id of completedIds) {
          tasksById.delete(id);
          deletedTaskIds.add(id);
          inactiveTargetIds.add(id);
        }
      } else {
        const postponedTasks = [...tasksById.values()].filter(
          (task) => task.status === "postponed",
        );
        if (postponedTasks.length === 0) {
          throw new Error("There are no later items to restore.");
        }
        for (const task of postponedTasks) {
          tasksById.set(task.id, {
            ...task,
            status: "active",
            updatedAt: changedAt,
          });
        }
      }

      if (inactiveTargetIds.size > 0) {
        for (const [id, task] of tasksById) {
          if (!task.dependencies.some((dependency) => inactiveTargetIds.has(dependency))) {
            continue;
          }
          tasksById.set(id, {
            ...task,
            dependencies: task.dependencies.filter(
              (dependency) => !inactiveTargetIds.has(dependency),
            ),
            updatedAt: changedAt,
          });
        }
      }
      [...tasksById.values()].forEach(assertTask);
    } catch (error) {
      transaction.abort();
      await completion.catch(() => undefined);
      throw error;
    }

    const nextRevision = currentRevision + 1;
    const activeTasks = [...tasksById.values()].filter(
      (task) => task.status === "active",
    );
    const activeIds = new Set(activeTasks.map((task) => task.id));
    const previousPlan = storedPlans[0];
    const taskOrder = (previousPlan?.taskOrder ?? []).filter((id) => activeIds.has(id));
    for (const task of activeTasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      if (!taskOrder.includes(task.id)) taskOrder.push(task.id);
    }

    planStore.clear();
    if (taskOrder.length > 0) {
      const provisionalPlan: ExecutionPlan = {
        id: idFactory(),
        taskOrder,
        nextTaskId: taskOrder[0],
        nextReason: "Your confirmed change is saved. Flownee is refreshing what makes sense next.",
        generatedAt: changedAt,
        basedOnRevision: nextRevision,
        model: LOCAL_PROVISIONAL_PLAN_MODEL,
      };
      assertPlanMatchesTasks(provisionalPlan, [...tasksById.values()]);
      planStore.put(provisionalPlan);
    }

    for (const id of deletedTaskIds) taskStore.delete(id);
    for (const task of tasksById.values()) taskStore.put(task);
    metadataStore.put({ key: "taskRevision", value: nextRevision });
    await completion;
    return nextRevision;
  }

  async loadSnapshot(): Promise<FlowneeSnapshot> {
    const transaction = this.database.transaction(
      [
        FLOWNEE_STORES.transcripts,
        FLOWNEE_STORES.tasks,
        FLOWNEE_STORES.plans,
        FLOWNEE_STORES.metadata,
      ],
      "readonly",
    );
    const transcriptStore = transaction.objectStore(FLOWNEE_STORES.transcripts);
    const taskStore = transaction.objectStore(FLOWNEE_STORES.tasks);
    const planStore = transaction.objectStore(FLOWNEE_STORES.plans);
    const metadataStore = transaction.objectStore(FLOWNEE_STORES.metadata);
    const [transcripts, tasks, plans, taskRevision] = await Promise.all([
      requestToPromise<Transcript[]>(transcriptStore.getAll()),
      requestToPromise<Task[]>(taskStore.getAll()),
      requestToPromise<ExecutionPlan[]>(planStore.getAll()),
      readRevision(metadataStore),
    ]);
    await transactionToPromise(transaction);

    transcripts.forEach(assertTranscript);
    tasks.forEach(assertTask);
    plans.forEach(assertExecutionPlan);

    return {
      taskRevision,
      transcripts,
      tasks,
      currentPlan: plans[0] ?? null,
    };
  }

  async clearAll(): Promise<void> {
    const transaction = this.database.transaction(
      Object.values(FLOWNEE_STORES),
      "readwrite",
    );
    Object.values(FLOWNEE_STORES).forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });
    await transactionToPromise(transaction);
  }
}
