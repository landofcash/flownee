"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Leaf,
  ListTodo,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { NetworkStatus } from "@/components/home/network-status";
import { TaskActionsDialog } from "@/components/home/task-actions-dialog";
import { PrivacyDataDialog } from "@/components/home/privacy-data-dialog";
import { VoiceCapture } from "@/components/voice/voice-capture";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  homeStateFromSnapshot,
  type HomeState,
  type PlannedTask,
} from "@/lib/home-state";
import { buildPlanningCommit } from "@/lib/ai/planning-commit";
import { parsePlanningOutput } from "@/lib/ai/planning-contract";
import { createReplanningRequest } from "@/lib/ai/planning-request";
import { FlowneeRepository } from "@/lib/storage/database";
import type { FlowneeSnapshot, Task } from "@/lib/storage/schema";

type HomeShellProps = {
  state: HomeState;
  useLocalData?: boolean;
};

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Leaf aria-hidden="true" className="size-[1.15rem]" strokeWidth={2.2} />
      </span>
      <span className="text-lg font-semibold tracking-[-0.025em]">Flownee</span>
    </div>
  );
}

function EffortBadge({ minutes }: { minutes: number | null }) {
  return (
    <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 font-medium">
      <Clock3 aria-hidden="true" />
      {minutes === null ? "Estimate pending" : `About ${minutes} min`}
    </Badge>
  );
}

function TaskRow({
  task,
  index,
  onManage,
}: {
  task: PlannedTask;
  index: number;
  onManage?: (taskId: string) => void;
}) {
  return (
    <li className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 text-foreground">
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {task.estimatedEffortMinutes === null
            ? "Estimate pending"
            : `Estimated ${task.estimatedEffortMinutes} min`}
        </p>
      </div>
      {onManage ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Manage ${task.title}`}
          onClick={() => onManage(task.id)}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      ) : (
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground/70" />
      )}
    </li>
  );
}

function EmptyRecommendation() {
  return (
    <Card className="min-h-[25rem] justify-center overflow-hidden border-border/80 shadow-[0_18px_50px_-28px_rgba(31,65,44,0.28)]">
      <CardContent className="flex flex-col items-center px-6 py-8 text-center sm:px-12">
        <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Sparkles aria-hidden="true" className="size-7" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          What should I do now?
        </p>
        <h1 className="mt-3 max-w-md text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Start with what’s on your mind.
        </h1>
        <p className="mt-4 max-w-md text-pretty leading-7 text-muted-foreground">
          Tell Flownee about a task, idea, errand, or person you want to call.
          It will help you make sense of what comes next.
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingRecommendation() {
  return (
    <Card className="min-h-[25rem] justify-center" aria-busy="true">
      <CardContent className="flex flex-col items-center px-8 text-center">
        <span className="relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/10 motion-reduce:animate-none" />
          <CircleDot aria-hidden="true" className="relative size-7" />
        </span>
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">
          Finding your saved flow…
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This happens on your device—no AI request is needed.
        </p>
      </CardContent>
    </Card>
  );
}

function CompleteRecommendation({ count }: { count: number }) {
  return (
    <Card className="min-h-[25rem] justify-center border-primary/20 bg-primary text-primary-foreground shadow-[0_18px_50px_-28px_rgba(31,65,44,0.5)]">
      <CardContent className="flex flex-col items-center px-8 text-center">
        <span className="mb-6 flex size-16 items-center justify-center rounded-full bg-white/15">
          <CheckCircle2 aria-hidden="true" className="size-8" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
          All clear
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          You’ve finished your flow.
        </h1>
        <p className="mt-4 max-w-md leading-7 text-primary-foreground/80">
          {count} {count === 1 ? "item is" : "items are"} complete. Enjoy the
          space—or add anything else that’s on your mind.
        </p>
      </CardContent>
    </Card>
  );
}

function PlanRecommendation({
  state,
  actionsDisabled,
  onComplete,
  onPostpone,
  onManage,
}: {
  state: Extract<HomeState, { status: "plan" }>;
  actionsDisabled: boolean;
  onComplete: (taskId: string) => void;
  onPostpone: (taskId: string) => void;
  onManage: (taskId: string) => void;
}) {
  return (
    <Card className="min-h-[25rem] border-primary/15 shadow-[0_18px_50px_-28px_rgba(31,65,44,0.3)]">
      <CardHeader className="gap-3 border-b bg-secondary/45 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="gap-1.5">
            <Sparkles aria-hidden="true" />
            Do this now
          </Badge>
          {state.isUpdating && (
            <Badge variant="outline" className="gap-1.5 bg-background/70">
              <span className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
              Updating your flow
            </Badge>
          )}
        </div>
        <CardTitle className="text-balance text-3xl leading-tight tracking-[-0.04em] sm:text-4xl">
          {state.nextTask.title}
        </CardTitle>
        <CardDescription>
          <EffortBadge minutes={state.nextTask.estimatedEffortMinutes} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Why this makes sense
          </p>
          <p className="mt-2 max-w-xl text-pretty text-base leading-7 text-foreground/80">
            {state.reason}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap gap-2 border-t pt-5">
        <Button disabled={actionsDisabled} onClick={() => onComplete(state.nextTask.id)}>
          <Check aria-hidden="true" />
          Done
        </Button>
        <Button
          disabled={actionsDisabled}
          variant="outline"
          onClick={() => onPostpone(state.nextTask.id)}
        >
          Do later
        </Button>
        <Button
          disabled={actionsDisabled}
          variant="ghost"
          size="icon"
          className="ml-auto"
          aria-label="More task actions"
          onClick={() => onManage(state.nextTask.id)}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function UpcomingCard({ state, onManage }: { state: HomeState; onManage?: (taskId: string) => void }) {
  const upcoming = state.status === "plan" ? state.upcomingTasks : [];

  return (
    <Card className="h-fit gap-4 py-5 shadow-none lg:sticky lg:top-6">
      <CardHeader className="px-5">
        <div className="flex items-center gap-2">
          <ListTodo aria-hidden="true" className="size-4 text-primary" />
          <CardTitle className="text-base">Up next</CardTitle>
        </div>
        <CardDescription>
          {upcoming.length > 0
            ? `${upcoming.length} more ${upcoming.length === 1 ? "item" : "items"} in your current flow`
            : "Your next steps will settle here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5">
        {upcoming.length > 0 ? (
          <ol className="divide-y">
            {upcoming.map((task, index) => (
              <TaskRow key={task.id} task={task} index={index} onManage={onManage} />
            ))}
          </ol>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/35 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing is waiting for you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SavedItemsCard({ tasks, onManage }: { tasks: Task[]; onManage: (taskId: string) => void }) {
  if (tasks.length === 0) return null;
  return (
    <Card className="mt-5 gap-3 py-5 shadow-none">
      <CardHeader className="px-5">
        <CardTitle className="text-base">Saved items</CardTitle>
        <CardDescription>Completed and postponed items stay on this device.</CardDescription>
      </CardHeader>
      <CardContent className="px-5">
        <ul className="divide-y">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Badge variant="outline">{task.status === "completed" ? "Done" : "Later"}</Badge>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{task.title}</span>
              <Button variant="ghost" size="icon-sm" aria-label={`Manage ${task.title}`} onClick={() => onManage(task.id)}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function HomeShell({ state: initialState, useLocalData = false }: HomeShellProps) {
  const [state, setState] = useState<HomeState>(
    useLocalData ? { status: "loading" } : initialState,
  );
  const [snapshot, setSnapshot] = useState<FlowneeSnapshot | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [planningError, setPlanningError] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyBusy, setPrivacyBusy] = useState(false);
  const [privacyError, setPrivacyError] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [voiceCaptureKey, setVoiceCaptureKey] = useState(0);
  const replanAttemptRef = useRef(0);
  const replanAbortRef = useRef<AbortController | null>(null);

  const refreshLocalState = useCallback(async () => {
    if (!useLocalData) return;
    let repository: FlowneeRepository | null = null;
    try {
      repository = await FlowneeRepository.open();
      const nextSnapshot = await repository.loadSnapshot();
      setSnapshot(nextSnapshot);
      setState(homeStateFromSnapshot(nextSnapshot));
    } catch {
      setState((current) =>
        current.status === "plan" ? { ...current, isUpdating: false } : current,
      );
    } finally {
      repository?.close();
    }
  }, [useLocalData]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void refreshLocalState(), 0);
    return () => window.clearTimeout(timeout);
  }, [refreshLocalState]);

  useEffect(() => () => replanAbortRef.current?.abort(), []);

  const requestReplan = useCallback(async (nextSnapshot: FlowneeSnapshot) => {
    if (nextSnapshot.tasks.every((task) => task.status !== "active")) return;
    replanAbortRef.current?.abort();
    const controller = new AbortController();
    replanAbortRef.current = controller;
    const attempt = replanAttemptRef.current + 1;
    replanAttemptRef.current = attempt;
    const request = createReplanningRequest(nextSnapshot);
    setPlanningError("");
    let repository: FlowneeRepository | null = null;

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = (await response.json()) as {
        output?: unknown;
        model?: unknown;
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(payload.error?.message ?? "Replanning is temporarily unavailable.");
      if (typeof payload.model !== "string") throw new Error("Flownee received an incomplete planning response.");
      const output = parsePlanningOutput(payload.output, request);
      const commit = buildPlanningCommit({
        request,
        output,
        drafts: [],
        model: payload.model,
        now: new Date().toISOString(),
        idFactory: () => crypto.randomUUID(),
      });
      if (attempt !== replanAttemptRef.current || !commit.plan) return;
      repository = await FlowneeRepository.open();
      await repository.replaceCurrentPlan(commit.plan);
      const refreshed = await repository.loadSnapshot();
      if (attempt !== replanAttemptRef.current) return;
      setSnapshot(refreshed);
      setState(homeStateFromSnapshot(refreshed));
    } catch (error) {
      if (controller.signal.aborted || attempt !== replanAttemptRef.current) return;
      const message = error instanceof Error ? error.message : "Replanning is temporarily unavailable.";
      if (message.toLocaleLowerCase().includes("stale")) return;
      setPlanningError(`Your change is saved. ${message}`);
      setState((current) => current.status === "plan" ? { ...current, isUpdating: false } : current);
    } finally {
      repository?.close();
    }
  }, []);

  async function mutateTask(mutation: { kind: "upsert"; task: Task } | { kind: "delete"; taskId: string }) {
    if (!useLocalData) return;
    setActionBusy(true);
    setActionError("");
    setPlanningError("");
    replanAbortRef.current?.abort();
    replanAttemptRef.current += 1;
    let repository: FlowneeRepository | null = null;
    try {
      repository = await FlowneeRepository.open();
      await repository.applyTaskMutation(mutation);
      const nextSnapshot = await repository.loadSnapshot();
      setSnapshot(nextSnapshot);
      setState(homeStateFromSnapshot(nextSnapshot));
      setSelectedTask(null);
      setActionBusy(false);
      void requestReplan(nextSnapshot);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "That change could not be saved on this device.");
      setActionBusy(false);
    } finally {
      repository?.close();
    }
  }

  function taskById(taskId: string): Task | undefined {
    return snapshot?.tasks.find((task) => task.id === taskId);
  }

  function updateStatus(taskId: string, status: Task["status"]) {
    const task = taskById(taskId);
    if (!task) return;
    void mutateTask({ kind: "upsert", task: { ...task, status, updatedAt: new Date().toISOString() } });
  }

  function openTask(taskId: string) {
    const task = taskById(taskId);
    if (!task) return;
    setActionError("");
    setSelectedTask(task);
  }

  function handlePlanningStateChange(isUpdating: boolean) {
    setState((current) => {
      if (current.status === "plan") return { ...current, isUpdating };
      if (isUpdating && current.status === "empty") return { status: "loading" };
      return current;
    });
    if (!isUpdating) void refreshLocalState();
  }

  async function deleteAllLocalData() {
    if (!useLocalData) return;
    setPrivacyBusy(true);
    setPrivacyError("");
    replanAbortRef.current?.abort();
    replanAttemptRef.current += 1;
    let repository: FlowneeRepository | null = null;
    try {
      repository = await FlowneeRepository.open();
      await repository.clearAll();
      const cleared = await repository.loadSnapshot();
      setSnapshot(cleared);
      setState(homeStateFromSnapshot(cleared));
      setSelectedTask(null);
      setPlanningError("");
      setActionError("");
      setVoiceCaptureKey((current) => current + 1);
      setPrivacyOpen(false);
      setDataMessage("All Flownee data stored in this browser was deleted.");
    } catch {
      setPrivacyError("Local data could not be deleted. Nothing was partially removed; please try again.");
    } finally {
      repository?.close();
      setPrivacyBusy(false);
    }
  }

  const savedTasks = snapshot?.tasks
    .filter((task) => task.status !== "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) ?? [];

  return (
    <div className="mx-auto min-h-svh max-w-[430px] border-x border-border/70 bg-background text-foreground shadow-[0_0_45px_-28px_rgba(31,103,58,0.45)]">
      <NetworkStatus />
      <header className="border-b border-border/70 bg-background/80 px-4 backdrop-blur-lg sm:px-6">
        <div className="mx-auto flex h-16 items-center justify-between">
          <Brand />
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-primary" />
              <span>Saved on this device</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Privacy and data"
              onClick={() => {
                setPrivacyError("");
                setPrivacyOpen(true);
              }}
            >
              <ShieldCheck aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 pb-40 pt-7 sm:px-6 sm:pt-10">
        <div className="mb-7 sm:mb-9">
          <p className="text-sm font-medium text-primary">Your flow</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            What makes sense next
          </h2>
        </div>

        <div className="grid items-start gap-5">
          {state.status === "empty" && <EmptyRecommendation />}
          {state.status === "loading" && <LoadingRecommendation />}
          {state.status === "all-complete" && (
            <CompleteRecommendation count={state.completedCount} />
          )}
          {state.status === "plan" && (
            <PlanRecommendation
              state={state}
              actionsDisabled={!useLocalData || actionBusy}
              onComplete={(taskId) => updateStatus(taskId, "completed")}
              onPostpone={(taskId) => updateStatus(taskId, "postponed")}
              onManage={openTask}
            />
          )}
          <UpcomingCard state={state} onManage={useLocalData ? openTask : undefined} />
        </div>

        {planningError && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm" role="alert">
            <p className="min-w-0 flex-1 text-muted-foreground">{planningError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (snapshot) void requestReplan(snapshot);
              }}
            >
              Retry flow
            </Button>
          </div>
        )}

        {actionError && !selectedTask && (
          <p className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
            {actionError}
          </p>
        )}

        {dataMessage && (
          <p className="mt-5 rounded-xl border border-primary/20 bg-secondary/45 p-4 text-sm text-foreground" role="status">
            {dataMessage}
          </p>
        )}

        {useLocalData && <SavedItemsCard tasks={savedTasks} onManage={openTask} />}

        <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <CircleDot aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <p>
            Tasks and plans stay in this browser. Voice will only be sent for
            processing after you choose to record.
          </p>
        </div>
      </main>

      <VoiceCapture
        key={voiceCaptureKey}
        onFlowChanged={refreshLocalState}
        onPlanningStateChange={handlePlanningStateChange}
      />
      {privacyOpen && (
        <PrivacyDataDialog
          busy={privacyBusy}
          canDelete={useLocalData}
          errorMessage={privacyError}
          onClose={() => setPrivacyOpen(false)}
          onDeleteAll={() => void deleteAllLocalData()}
        />
      )}
      <TaskActionsDialog
        key={selectedTask?.id ?? "closed"}
        task={selectedTask}
        busy={actionBusy}
        errorMessage={actionError}
        onClose={() => setSelectedTask(null)}
        onComplete={(task) => updateStatus(task.id, "completed")}
        onPostpone={(task) => updateStatus(task.id, "postponed")}
        onRestore={(task) => updateStatus(task.id, "active")}
        onSave={(task, changes) => {
          const effort = changes.effort === "" ? null : Number(changes.effort);
          void mutateTask({
            kind: "upsert",
            task: {
              ...task,
              title: changes.title.trim(),
              notes: changes.notes.trim() || null,
              estimatedEffortMinutes: effort,
              effortSource: effort === null ? null : "user-edited",
              updatedAt: new Date().toISOString(),
            },
          });
        }}
        onDelete={(task) => void mutateTask({ kind: "delete", taskId: task.id })}
      />
    </div>
  );
}
