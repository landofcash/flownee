"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Info,
  ListTodo,
  LoaderCircle,
  MoreHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { NetworkStatus } from "@/components/home/network-status";
import { CompletionConfetti } from "@/components/magicui/completion-confetti";
import { ShineBorder } from "@/components/magicui/shine-border";
import { TaskActionsDialog } from "@/components/home/task-actions-dialog";
import { AppHeader } from "@/components/layout/app-header";
import { VoiceCapture } from "@/components/voice/voice-capture";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  homeStateFromSnapshot,
  type HomeState,
  type PlannedTask,
} from "@/lib/home-state";
import { buildPlanningCommit } from "@/lib/ai/planning-commit";
import { parsePlanningOutput } from "@/lib/ai/planning-contract";
import { createReplanningRequest } from "@/lib/ai/planning-request";
import {
  FlowneeRepository,
  type TaskMutation,
} from "@/lib/storage/database";
import type { FlowneeSnapshot, Task } from "@/lib/storage/schema";
import { effortLabel } from "@/lib/effort-options";
import { displayIntentionEmoji } from "@/lib/intention-emoji";
import {
  CompletionCelebrationQueue,
  persistWithCompletionFeedback,
  shouldCelebrateTaskStatus,
} from "@/lib/completion-feedback";

type HomeShellProps = {
  state: HomeState;
  useLocalData?: boolean;
};

export function FlowUpdateOverlay({ visible }: { visible: boolean }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex touch-none items-center justify-center bg-[var(--overlay)] px-6 backdrop-blur-md">
      <div
        aria-describedby="flow-update-description"
        aria-labelledby="flow-update-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-primary/25 bg-background p-7 text-center shadow-2xl outline-none"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <span className="animate-flownee-gradient mx-auto flex size-20 items-center justify-center rounded-full bg-flownee-gradient p-1 motion-reduce:animate-none">
          <span className="flex size-full items-center justify-center rounded-full bg-background text-primary">
            <LoaderCircle
              aria-hidden="true"
              className="size-9 animate-spin motion-reduce:animate-none"
            />
          </span>
        </span>
        <h2
          className="mt-5 text-2xl font-semibold tracking-[-0.03em]"
          id="flow-update-title"
        >
          Updating your flow
        </h2>
        <p
          className="mt-2 text-sm leading-6 text-muted-foreground"
          id="flow-update-description"
        >
          Your change is saved. Flownee is finding what makes sense next.
        </p>
      </div>
    </div>
  );
}

function EffortBadge({ minutes }: { minutes: number | null }) {
  return (
    <Badge variant="scheduled" className="gap-1.5 px-2.5 py-1 font-medium">
      <Clock3 aria-hidden="true" />
      {minutes === null ? "Estimate pending" : `About ${effortLabel(minutes)}`}
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
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-scheduled text-xs font-semibold text-scheduled-foreground">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-start gap-2 text-sm font-medium leading-5 text-foreground">
          <span aria-hidden="true" className="shrink-0 text-base leading-5">
            {displayIntentionEmoji(task.emoji)}
          </span>
          <span>{task.title}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="sr-only">Estimated effort: </span>
          <span>
            {task.estimatedEffortMinutes === null
              ? "Estimate pending"
              : effortLabel(task.estimatedEffortMinutes)}
          </span>
        </p>
      </div>
      {onManage ? (
        <Button
          variant="ghost"
          size="icon-lg"
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

export function EmptyRecommendation() {
  return (
    <section
      aria-labelledby="empty-flow-title"
      className="flex flex-col items-center py-9 text-center sm:py-12"
      data-slot="empty-recommendation"
    >
      <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-highlight/30 text-foreground">
        <Sparkles aria-hidden="true" className="size-7" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        What should I do now?
      </p>
        <h2
        className="mt-3 max-w-md text-balance text-2xl font-semibold tracking-[-0.035em] sm:text-3xl"
        id="empty-flow-title"
      >
          Start with what’s on your mind.
        </h2>
      <p className="mt-4 max-w-md text-pretty leading-7 text-muted-foreground">
          Tell Flownee about a task, idea, errand, or person you want to call.
          It will help you make sense of what comes next.
      </p>
    </section>
  );
}

export function LoadingRecommendation() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="loading-flow-title"
      className="flex flex-col items-center py-9 text-center sm:py-12"
      data-slot="loading-recommendation"
    >
      <span className="relative mb-5 flex size-14 items-center justify-center rounded-2xl bg-scheduled text-scheduled-foreground">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-support/15 motion-reduce:animate-none" />
        <CircleDot aria-hidden="true" className="relative size-7" />
      </span>
      <h2
        className="text-2xl font-semibold tracking-[-0.03em]"
        id="loading-flow-title"
      >
          Finding your saved flow…
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
          This happens on your device—no AI request is needed.
      </p>
    </section>
  );
}

export function CompleteRecommendation({ count }: { count: number }) {
  return (
    <section
      aria-labelledby="complete-flow-title"
      className="flex flex-col items-center py-9 text-center sm:py-12"
      data-slot="complete-recommendation"
    >
      <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-completed text-completed-foreground">
        <CheckCircle2 aria-hidden="true" className="size-8" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-completed-foreground">
        All clear
      </p>
      <h2
        className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl"
        id="complete-flow-title"
      >
          You’ve finished your flow.
      </h2>
      <p className="mt-4 max-w-md leading-7 text-muted-foreground">
          {count} {count === 1 ? "item is" : "items are"} complete. Enjoy the
          space—or add anything else that’s on your mind.
      </p>
    </section>
  );
}

export function PlanRecommendation({
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
    <section
      aria-labelledby="current-intention-title"
      className="relative py-1"
      data-slot="current-recommendation"
    >
      <div className="space-y-3">
        <div
          className="flex flex-wrap items-center gap-2"
          data-slot="current-recommendation-meta"
        >
          <Badge variant="important" className="gap-1.5">
            <Sparkles aria-hidden="true" />
            Do this now
          </Badge>
          <EffortBadge minutes={state.nextTask.estimatedEffortMinutes} />
          {state.isUpdating && (
            <Badge variant="completed" className="gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-flow motion-reduce:animate-none" />
              Updating your flow
            </Badge>
          )}
        </div>
        <h2
          id="current-intention-title"
          className="flex items-start gap-2.5 text-balance text-2xl font-semibold leading-[1.2] tracking-[-0.035em] sm:text-3xl"
        >
          <span aria-hidden="true" className="shrink-0 leading-none">
            {displayIntentionEmoji(state.nextTask.emoji)}
          </span>
          <span>{state.nextTask.title}</span>
        </h2>
      </div>

      <div className="mt-6 border-t border-border/80 pt-5">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Why this makes sense
          </p>
          <p className="mt-2 max-w-xl text-pretty text-base leading-7 text-foreground/80">
            {state.reason}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/80 pt-5">
        <Button
          className="relative h-11 overflow-hidden"
          disabled={actionsDisabled}
          onClick={() => onComplete(state.nextTask.id)}
        >
          {!actionsDisabled && (
            <ShineBorder
              animation="repeat"
              borderWidth={1.5}
              duration={5}
              shineColor={["#8FD9FB", "#4AB5B5", "#525AFF"]}
            />
          )}
          <Check aria-hidden="true" />
          Done
        </Button>
        <Button
          className="h-11"
          disabled={actionsDisabled}
          onClick={() => onPostpone(state.nextTask.id)}
        >
          <Clock3 aria-hidden="true" />
          Do later
        </Button>
        <Button
          disabled={actionsDisabled}
          variant="ghost"
          size="icon-lg"
          className="ml-auto"
          aria-label="More task actions"
          onClick={() => onManage(state.nextTask.id)}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

export function UpcomingCard({ state, onManage }: { state: HomeState; onManage?: (taskId: string) => void }) {
  const upcoming = state.status === "plan" ? state.upcomingTasks : [];

  return (
    <section
      aria-labelledby="upcoming-title"
      className="border-t border-border/80 pt-5"
      data-slot="upcoming-section"
    >
      <div>
        <div className="flex items-center gap-2">
          <ListTodo aria-hidden="true" className="size-4 text-support" />
          <h3 className="text-base font-semibold" id="upcoming-title">
            Next items in your current flow
          </h3>
        </div>
      </div>
      <div className="mt-4">
        {upcoming.length > 0 ? (
          <ol className="divide-y">
            {upcoming.map((task, index) => (
              <TaskRow key={task.id} task={task} index={index} onManage={onManage} />
            ))}
          </ol>
        ) : (
          <p className="py-3 text-sm text-muted-foreground">
            Nothing is waiting for you.
          </p>
        )}
      </div>
    </section>
  );
}

type SavedItemsCardProps = {
  tasks: Task[];
  busy: boolean;
  onManage: (taskId: string) => void;
  onRequestCleanDone: () => void;
  onRestoreLater: () => void;
};

export function SavedItemsCard({
  tasks,
  busy,
  onManage,
  onRequestCleanDone,
  onRestoreLater,
}: SavedItemsCardProps) {
  if (tasks.length === 0) return null;
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const postponedCount = tasks.filter((task) => task.status === "postponed").length;
  const sortedTasks = [
    ...tasks.filter((task) => task.status === "postponed"),
    ...tasks.filter((task) => task.status === "completed"),
  ];
  return (
    <section
      aria-labelledby="saved-items-title"
      className="mt-6 border-t border-border/80 pt-5"
      data-slot="saved-items-section"
    >
      <div>
        <h3 className="text-base font-semibold" id="saved-items-title">
          Postponed and completed items
        </h3>
      </div>
      <ul className="mt-4 divide-y">
          {sortedTasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Badge variant="outline">{task.status === "completed" ? "Done" : "Later"}</Badge>
              <span aria-hidden="true" className="shrink-0 text-base">
                {displayIntentionEmoji(task.emoji)}
              </span>
              <span
                className={`min-w-0 flex-1 break-words text-sm font-medium leading-5 ${
                  task.status === "completed"
                    ? "text-muted-foreground line-through decoration-2"
                    : ""
                }`}
              >
                {task.title}
              </span>
              <Button variant="ghost" size="icon-lg" aria-label={`Manage ${task.title}`} onClick={() => onManage(task.id)}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </li>
          ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
          <Button
            className="h-11"
            disabled={busy || completedCount === 0}
            onClick={onRequestCleanDone}
          >
            Clean done
          </Button>
          <Button
            className="h-11"
            disabled={busy || postponedCount === 0}
            onClick={onRestoreLater}
          >
            Restore for later
          </Button>
      </div>
    </section>
  );
}

type CleanDoneDialogProps = {
  open: boolean;
  completedCount: number;
  busy: boolean;
  errorMessage: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function CleanDoneDialog({
  open,
  completedCount,
  busy,
  errorMessage,
  onClose,
  onConfirm,
}: CleanDoneDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-[var(--overlay)] backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <section
        aria-describedby="clean-done-description"
        aria-labelledby="clean-done-title"
        aria-modal="true"
        className="w-full rounded-t-3xl border bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl outline-none sm:max-w-[430px] sm:rounded-2xl sm:p-6"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Postponed and completed items
            </p>
            <h2
              className="mt-1 text-2xl font-semibold tracking-[-0.03em]"
              id="clean-done-title"
            >
              Clean done items?
            </h2>
          </div>
          <Button
            aria-label="Close clean done confirmation"
            disabled={busy}
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <p
          className="mt-5 text-sm leading-6 text-muted-foreground"
          id="clean-done-description"
        >
          Permanently remove {completedCount === 1
            ? "this completed item"
            : `all ${completedCount} completed items`}? This cannot be undone.
        </p>

        {errorMessage && (
          <p className="mt-4 text-sm text-error-foreground" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            disabled={busy || completedCount === 0}
            onClick={onConfirm}
            variant="destructive"
          >
            <Trash2 aria-hidden="true" />
            Confirm clean done
          </Button>
          <Button disabled={busy} onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>
      </section>
    </div>
  );
}

export function HomeShell({
  state: initialState,
  useLocalData = false,
}: HomeShellProps) {
  const [state, setState] = useState<HomeState>(
    useLocalData ? { status: "loading" } : initialState,
  );
  const [snapshot, setSnapshot] = useState<FlowneeSnapshot | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [planningError, setPlanningError] = useState("");
  const [confirmCleanDone, setConfirmCleanDone] = useState(false);
  const [completionCelebrationTrigger, setCompletionCelebrationTrigger] =
    useState(0);
  const [isFlowUpdateBlocking, setIsFlowUpdateBlocking] = useState(
    !useLocalData && initialState.status === "plan" && initialState.isUpdating,
  );
  const replanAttemptRef = useRef(0);
  const replanAbortRef = useRef<AbortController | null>(null);
  const [completionCelebrationQueue] = useState(
    () => new CompletionCelebrationQueue(),
  );

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

  const releaseCompletionCelebration = useCallback(() => {
    if (!completionCelebrationQueue.release()) return;
    setCompletionCelebrationTrigger((current) => current + 1);
  }, [completionCelebrationQueue]);

  const requestReplan = useCallback(async (nextSnapshot: FlowneeSnapshot) => {
    if (nextSnapshot.tasks.every((task) => task.status !== "active")) {
      setIsFlowUpdateBlocking(false);
      releaseCompletionCelebration();
      return;
    }
    replanAbortRef.current?.abort();
    const controller = new AbortController();
    replanAbortRef.current = controller;
    const attempt = replanAttemptRef.current + 1;
    replanAttemptRef.current = attempt;
    setIsFlowUpdateBlocking(true);
    setPlanningError("");
    let repository: FlowneeRepository | null = null;

    try {
      const request = createReplanningRequest(nextSnapshot);
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
      if (attempt === replanAttemptRef.current) {
        setIsFlowUpdateBlocking(false);
        releaseCompletionCelebration();
      }
    }
  }, [releaseCompletionCelebration]);

  async function mutateTask(
    mutation: TaskMutation,
    {
      replan = true,
      celebrate = false,
    }: { replan?: boolean; celebrate?: boolean } = {},
  ) {
    if (!useLocalData) return;
    if (replan) setIsFlowUpdateBlocking(true);
    setActionBusy(true);
    setActionError("");
    setPlanningError("");
    replanAbortRef.current?.abort();
    replanAttemptRef.current += 1;
    let repository: FlowneeRepository | null = null;
    try {
      repository = await FlowneeRepository.open();
      const openedRepository = repository;
      const nextSnapshot = await persistWithCompletionFeedback({
        persist: () => openedRepository.applyTaskMutation(mutation),
        load: () => openedRepository.loadSnapshot(),
        celebrate,
        onStoredCompletion: () => completionCelebrationQueue.queue(),
      });
      setSnapshot(nextSnapshot);
      setState(homeStateFromSnapshot(nextSnapshot));
      setSelectedTask(null);
      setConfirmCleanDone(false);
      setActionBusy(false);
      if (replan) {
        if (nextSnapshot.tasks.some((task) => task.status === "active")) {
          void requestReplan(nextSnapshot);
        } else {
          setIsFlowUpdateBlocking(false);
          releaseCompletionCelebration();
        }
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "That change could not be saved on this device.");
      setActionBusy(false);
      if (replan) setIsFlowUpdateBlocking(false);
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
    void mutateTask(
      {
        kind: "upsert",
        task: { ...task, status, updatedAt: new Date().toISOString() },
      },
      { celebrate: shouldCelebrateTaskStatus(status) },
    );
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

  const savedTasks = snapshot?.tasks
    .filter((task) => task.status !== "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) ?? [];
  const completedSavedCount = savedTasks.filter(
    (task) => task.status === "completed",
  ).length;
  const appIsInert = isFlowUpdateBlocking || confirmCleanDone;

  return (
    <>
    <div
      aria-hidden={appIsInert || undefined}
      className="mx-auto min-h-svh max-w-[430px] border-x border-border/70 bg-background text-foreground shadow-[0_0_45px_-28px_rgb(82_90_255_/_0.3)]"
      inert={appIsInert || undefined}
    >
      <NetworkStatus />
      <AppHeader />

      <main className="mx-auto px-4 pb-[calc(10rem+env(safe-area-inset-bottom))] pt-7 sm:px-6 sm:pt-10">
        <div className="mb-7 sm:mb-9">
          <p className="text-sm font-medium text-primary">Your flow</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            What makes sense next
          </h1>
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
              actionsDisabled={!useLocalData || actionBusy || isFlowUpdateBlocking}
              onComplete={(taskId) => updateStatus(taskId, "completed")}
              onPostpone={(taskId) => updateStatus(taskId, "postponed")}
              onManage={openTask}
            />
          )}
          <UpcomingCard state={state} onManage={useLocalData ? openTask : undefined} />
        </div>

        {planningError && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm" role="alert">
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
          <p className="mt-5 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error-foreground" role="alert">
            {actionError}
          </p>
        )}

        {useLocalData && (
          <SavedItemsCard
            tasks={savedTasks}
            busy={actionBusy || isFlowUpdateBlocking}
            onManage={openTask}
            onRequestCleanDone={() => {
              setActionError("");
              setConfirmCleanDone(true);
            }}
            onRestoreLater={() =>
              void mutateTask({ kind: "restore-postponed" })
            }
          />
        )}

        <div className="mt-6 flex items-start gap-2 border-t border-border/80 pt-4 text-xs leading-5 text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <p>
            Tasks and plans stay in this browser. Voice will only be sent for
            processing after you choose to record.
          </p>
        </div>
      </main>

      <VoiceCapture
        onFlowChanged={refreshLocalState}
        onPlanningStateChange={handlePlanningStateChange}
      />
      <TaskActionsDialog
        key={selectedTask?.id ?? "closed"}
        task={selectedTask}
        busy={actionBusy || isFlowUpdateBlocking}
        errorMessage={actionError}
        onClose={() => setSelectedTask(null)}
        onComplete={(task) => updateStatus(task.id, "completed")}
        onPostpone={(task) => updateStatus(task.id, "postponed")}
        onRestore={(task) => updateStatus(task.id, "active")}
        onSave={(task, changes) => {
          void mutateTask({
            kind: "upsert",
            task: {
              ...task,
              title: changes.title.trim(),
              notes: changes.notes.trim() || null,
              estimatedEffortMinutes: changes.effortMinutes,
              effortSource: "user-edited",
              updatedAt: new Date().toISOString(),
            },
          });
        }}
        onDelete={(task) => void mutateTask({ kind: "delete", taskId: task.id })}
      />
    </div>
    <CleanDoneDialog
      open={confirmCleanDone}
      completedCount={completedSavedCount}
      busy={actionBusy}
      errorMessage={actionError}
      onClose={() => {
        setActionError("");
        setConfirmCleanDone(false);
      }}
      onConfirm={() =>
        void mutateTask({ kind: "delete-completed" }, { replan: false })
      }
    />
    <FlowUpdateOverlay visible={isFlowUpdateBlocking} />
    <CompletionConfetti trigger={completionCelebrationTrigger} />
    </>
  );
}
