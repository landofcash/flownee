"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Brain,
  CircleAlert,
  LoaderCircle,
  Mic,
  RotateCcw,
  Square,
  Trash2,
  X,
} from "lucide-react";

import { InterpretationReview } from "@/components/voice/interpretation-review";
import { ShineBorder } from "@/components/magicui/shine-border";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  buildPlanningCommit,
  createInterpretationDrafts,
  type InterpretationDraft,
} from "@/lib/ai/planning-commit";
import {
  parsePlanningOutput,
  type PlanningOutput,
  type PlanningRequest,
} from "@/lib/ai/planning-contract";
import { createCapturePlanningRequest } from "@/lib/ai/planning-request";
import {
  describeRecordingError,
  type RecordingSample,
} from "@/lib/audio/recording-capabilities";
import {
  RecordingCancelledError,
  startVoiceRecording,
  type VoiceRecordingSession,
} from "@/lib/audio/voice-recorder";
import { FlowneeRepository } from "@/lib/storage/database";

export type CaptureState =
  | "idle"
  | "checking"
  | "requesting"
  | "recording"
  | "transcribing"
  | "review"
  | "planning"
  | "interpretation"
  | "committing"
  | "error"
  | "planning-error"
  | "unavailable";

export function shouldShowFlowneeImageMock(state: CaptureState): boolean {
  return state === "checking" || state === "requesting" || state === "recording";
}

export const FLOWNEE_INTENTION_IMAGES = [
  "/images/flownee/intention 1.webp",
  "/images/flownee/intention 2.webp",
  "/images/flownee/intention 3.webp",
  "/images/flownee/intention 4.webp",
] as const;

export const FLOWNEE_BASE_IMAGE =
  "/images/flownee/main-brain-v2.png";

export const FLOWNEE_INTENTION_INTERVAL_MS = 2000;

export function nextFlowneeIntentionIndex(currentIndex: number): number {
  return (currentIndex + 1) % FLOWNEE_INTENTION_IMAGES.length;
}

export async function finishSuccessfulCapture(
  onFlowChanged: (() => void | Promise<void>) | undefined,
  closeCapture: () => void,
): Promise<void> {
  await onFlowChanged?.();
  closeCapture();
}

function FlowneeIntentionIllustration() {
  const [activeIntentionIndex, setActiveIntentionIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveIntentionIndex(nextFlowneeIntentionIndex);
    }, FLOWNEE_INTENTION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion]);

  return (
    <div
      aria-label="Flownee surrounded by changing everyday intentions"
      className="relative mx-auto mt-2 aspect-[8/5] w-full max-w-[365px]"
      role="img"
    >
      <div className="absolute inset-0 scale-[1.12]">
        <Image
          alt=""
          className="object-contain"
          fill
          priority
          sizes="(max-width: 430px) calc(100vw - 40px), 365px"
          src={FLOWNEE_BASE_IMAGE}
        />
        {FLOWNEE_INTENTION_IMAGES.map((src, index) => (
          <Image
            alt=""
            aria-hidden="true"
            className={`object-contain transition-opacity duration-200 ease-in-out motion-reduce:transition-none ${
              index === activeIntentionIndex ? "opacity-100" : "opacity-0"
            }`}
            fill
            key={src}
            priority
            sizes="(max-width: 430px) calc(100vw - 40px), 365px"
            src={src}
          />
        ))}
      </div>
    </div>
  );
}

type ApiError = {
  error?: {
    message?: string;
    retryable?: boolean;
  };
};

type ApiResult = {
  text?: string;
};

type PlanningApiResult = {
  output?: unknown;
  model?: unknown;
};

type VoiceCaptureProps = {
  onFlowChanged?: () => void | Promise<void>;
  onPlanningStateChange?: (isUpdating: boolean) => void;
};

function fileExtension(type: string): string {
  if (type.startsWith("audio/mp4")) return "mp4";
  if (type.startsWith("audio/ogg")) return "ogg";
  return "webm";
}

export function VoiceCapture({
  onFlowChanged,
  onPlanningStateChange,
}: VoiceCaptureProps = {}) {
  const [state, setState] = useState<CaptureState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasPendingAudio, setHasPendingAudio] = useState(false);
  const [planningRequest, setPlanningRequest] = useState<PlanningRequest | null>(null);
  const [planningOutput, setPlanningOutput] = useState<PlanningOutput | null>(null);
  const [planningModel, setPlanningModel] = useState("");
  const [interpretationDrafts, setInterpretationDrafts] = useState<InterpretationDraft[]>([]);
  const sessionRef = useRef<VoiceRecordingSession | null>(null);
  const pendingAudioRef = useRef<RecordingSample | null>(null);
  const transcriptIdRef = useRef<string | null>(null);
  const recordingAttemptRef = useRef(0);

  const isOpen = state !== "idle";

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        state !== "transcribing" &&
        state !== "planning" &&
        state !== "committing"
      ) {
        recordingAttemptRef.current += 1;
        sessionRef.current?.cancel();
        sessionRef.current = null;
        pendingAudioRef.current = null;
        setState("idle");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, state]);

  async function transcribe(sample: RecordingSample) {
    pendingAudioRef.current = sample;
    setHasPendingAudio(true);
    setState("transcribing");
    setErrorMessage("");

    try {
      const body = new FormData();
      body.append(
        "audio",
        sample.blob,
        `flownee-capture.${fileExtension(sample.actualMimeType)}`,
      );
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body,
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiError & ApiResult;

      if (!response.ok) {
        throw new Error(
          payload.error?.message ??
            "Voice processing failed safely. You can retry this recording.",
        );
      }
      if (typeof payload.text !== "string" || payload.text.trim().length === 0) {
        throw new Error("No speech was found. You can retry or record again.");
      }

      pendingAudioRef.current = null;
      setHasPendingAudio(false);
      setTranscript(payload.text.trim());
      setState("review");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Voice processing failed safely. You can retry this recording.",
      );
      setState("error");
    }
  }

  async function beginRecording() {
    const attempt = recordingAttemptRef.current + 1;
    recordingAttemptRef.current = attempt;
    setTranscript("");
    setErrorMessage("");
    setPlanningRequest(null);
    setPlanningOutput(null);
    setInterpretationDrafts([]);
    setPlanningModel("");
    transcriptIdRef.current = null;
    pendingAudioRef.current = null;
    setHasPendingAudio(false);
    setState("checking");

    try {
      const statusResponse = await fetch("/api/ai-status", { cache: "no-store" });
      if (statusResponse.ok) {
        const availability = (await statusResponse.json()) as {
          enabled?: unknown;
          reason?: unknown;
        };
        if (recordingAttemptRef.current !== attempt) return;
        if (availability.enabled === false) {
          setErrorMessage(
            availability.reason === "not-configured"
              ? "Voice processing is not configured yet. Your saved flow is still available."
              : "Voice processing is temporarily paused. Your saved flow is still available.",
          );
          setState("unavailable");
          return;
        }
      }
    } catch {
      // The protected POST route remains authoritative if this lightweight check fails.
    }

    if (recordingAttemptRef.current !== attempt) return;
    setState("requesting");

    try {
      const session = await startVoiceRecording();
      if (recordingAttemptRef.current !== attempt) {
        session.cancel();
        return;
      }
      sessionRef.current = session;
      setState("recording");

      void session.result
        .then((sample) => {
          if (sessionRef.current !== session) return;
          sessionRef.current = null;
          return transcribe(sample);
        })
        .catch((error: unknown) => {
          if (error instanceof RecordingCancelledError) return;
          setErrorMessage(describeRecordingError(error));
          setState("error");
        });
    } catch (error) {
      if (recordingAttemptRef.current !== attempt) return;
      setErrorMessage(describeRecordingError(error));
      setState("error");
    }
  }

  function stopRecording() {
    sessionRef.current?.stop();
  }

  function discardAndClose() {
    recordingAttemptRef.current += 1;
    sessionRef.current?.cancel();
    sessionRef.current = null;
    pendingAudioRef.current = null;
    setHasPendingAudio(false);
    setTranscript("");
    setErrorMessage("");
    setPlanningRequest(null);
    setPlanningOutput(null);
    setInterpretationDrafts([]);
    setPlanningModel("");
    transcriptIdRef.current = null;
    onPlanningStateChange?.(false);
    setState("idle");
  }

  async function requestPlan(text: string, transcriptId: string) {
    setState("planning");
    setErrorMessage("");
    onPlanningStateChange?.(true);
    let repository: FlowneeRepository | null = null;

    try {
      repository = await FlowneeRepository.open();
      const snapshot = await repository.loadSnapshot();
      const request = createCapturePlanningRequest(snapshot, {
        id: transcriptId,
        text,
      });
      setPlanningRequest(request);

      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiError & PlanningApiResult;
      if (!response.ok) {
        throw new Error(
          payload.error?.message ??
            "Planning failed safely. Your confirmed transcript and previous plan are safe.",
        );
      }
      if (typeof payload.model !== "string") {
        throw new Error("Flownee received an incomplete planning response.");
      }
      const output = parsePlanningOutput(payload.output, request);
      setPlanningOutput(output);
      setPlanningModel(payload.model);
      setInterpretationDrafts(createInterpretationDrafts(output));

      if (output.newTasks.length === 0) {
        if (output.plan.status === "ready") {
          const commit = buildPlanningCommit({
            request,
            output,
            drafts: [],
            model: payload.model,
            now: new Date().toISOString(),
            idFactory: () => crypto.randomUUID(),
          });
          if (commit.plan) await repository.replaceCurrentPlan(commit.plan);
        }
        await finishSuccessfulCapture(onFlowChanged, discardAndClose);
        return;
      }

      setState("interpretation");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Planning failed safely. Your confirmed transcript and previous plan are safe.",
      );
      onPlanningStateChange?.(false);
      setState("planning-error");
    } finally {
      repository?.close();
    }
  }

  async function confirmTranscript() {
    const text = transcript.trim();
    if (!text) {
      setErrorMessage("Review the transcript or record again before continuing.");
      return;
    }

    setErrorMessage("");
    const now = new Date().toISOString();
    const transcriptId = transcriptIdRef.current ?? crypto.randomUUID();
    transcriptIdRef.current = transcriptId;
    let repository: FlowneeRepository | null = null;

    try {
      repository = await FlowneeRepository.open();
      await repository.saveTranscript({
        id: transcriptId,
        text,
        status: "confirmed",
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      setErrorMessage(
        "The transcript could not be saved on this device. Your text is still here.",
      );
      setState("review");
      return;
    } finally {
      repository?.close();
    }

    await requestPlan(text, transcriptId);
  }

  async function confirmInterpretation() {
    if (!planningRequest || !planningOutput || !planningModel) return;
    setState("committing");
    setErrorMessage("");
    let repository: FlowneeRepository | null = null;
    try {
      const commit = buildPlanningCommit({
        request: planningRequest,
        output: planningOutput,
        drafts: interpretationDrafts,
        model: planningModel,
        now: new Date().toISOString(),
        idFactory: () => crypto.randomUUID(),
      });
      repository = await FlowneeRepository.open();
      if (commit.tasks.length > 0 && commit.plan) {
        await repository.commitTasksAndPlan(commit.tasks, commit.plan);
      } else if (commit.plan) {
        await repository.replaceCurrentPlan(commit.plan);
      }
      await finishSuccessfulCapture(onFlowChanged, discardAndClose);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your intentions could not be saved. The transcript and previous plan are safe.",
      );
      setState("interpretation");
    } finally {
      repository?.close();
    }
  }

  return (
    <>
      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-x border-t border-border/80 bg-background/90 pt-10 backdrop-blur-xl">
        <Button
          size="lg"
          className="relative mx-auto flex h-[calc(5rem+max(1rem,env(safe-area-inset-bottom)))] w-full flex-col gap-0.5 rounded-none px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_14px_35px_-14px_rgb(82_90_255_/_0.8)]"
          aria-label="Add an intention by voice"
          onClick={() => void beginRecording()}
        >
          <span className="absolute left-1/2 top-0 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border border-flow/70 bg-action text-action-foreground ring-4 ring-background shadow-[0_0_28px_var(--voice-glow)]">
            <ShineBorder
              animation="repeat"
              borderWidth={1.5}
              duration={5}
              shineColor={["#8FD9FB", "#4AB5B5", "#525AFF"]}
            />
            <Mic aria-hidden="true" className="size-7" />
          </span>
          <span className="mt-5 text-base leading-5 font-semibold">Add by voice</span>
          <span className="text-xs font-normal text-action-foreground/80">
            Tap once and speak naturally
          </span>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-[var(--overlay)] p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
          <section
            aria-labelledby="voice-capture-title"
            aria-modal="true"
            className="max-h-[96svh] min-h-[90svh] w-full overflow-y-auto rounded-t-3xl border bg-background px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:min-h-0 sm:max-w-[430px] sm:rounded-2xl sm:px-6 sm:pb-4 sm:pt-3"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="voice-capture-title"
                className="text-xl font-semibold tracking-[-0.03em]"
              >
                {state === "review"
                  ? "Does this look right?"
                  : state === "interpretation" || state === "committing"
                    ? "Review what Flownee understood"
                    : "Tell Flownee what’s on your mind"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close voice capture"
                onClick={discardAndClose}
                disabled={
                  state === "transcribing" ||
                  state === "planning" ||
                  state === "committing"
                }
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            {shouldShowFlowneeImageMock(state) && (
              <FlowneeIntentionIllustration />
            )}

            <div
              className={shouldShowFlowneeImageMock(state) ? "mt-4" : "mt-6"}
              aria-live="polite"
            >
              {state === "checking" && (
                <div className="flex flex-col items-center py-2 text-center">
                  <LoaderCircle aria-hidden="true" className="size-9 animate-spin text-primary motion-reduce:animate-none" />
                  <p className="mt-2 font-semibold">Getting voice capture ready</p>
                  <p className="mt-1 text-sm text-muted-foreground">Your saved tasks remain on this device.</p>
                </div>
              )}

              {state === "requesting" && (
                <div className="flex flex-col items-center py-2 text-center">
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-9 animate-spin text-primary motion-reduce:animate-none"
                  />
                  <p className="mt-2 font-semibold">Waiting for microphone access</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Allow access in your browser to start recording.
                  </p>
                </div>
              )}

              {state === "recording" && (
                <div className="flex flex-col items-center py-1 text-center">
                  <span className="animate-flownee-gradient animate-flownee-glow flex size-20 items-center justify-center rounded-full bg-flownee-gradient p-1 motion-reduce:animate-none">
                    <span className="flex size-full items-center justify-center rounded-full bg-action text-action-foreground">
                      <Mic aria-hidden="true" className="size-8" />
                    </span>
                  </span>
                  <p className="mt-2 text-lg font-semibold">Listening…</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Speak for up to 30 seconds. Nothing is uploaded until you stop.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button onClick={stopRecording}>
                      <Square aria-hidden="true" />
                      Stop and transcribe
                    </Button>
                    <Button variant="outline" onClick={discardAndClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {state === "transcribing" && (
                <div className="flex flex-col items-center py-8 text-center">
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-9 animate-spin text-flow motion-reduce:animate-none"
                  />
                  <p className="mt-4 font-semibold">Turning your voice into text</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your temporary recording stays available if this fails.
                  </p>
                </div>
              )}

              {state === "review" && (
                <div>
                  <label htmlFor="transcript-review" className="text-sm font-semibold">
                    Transcript
                  </label>
                  <Textarea
                    id="transcript-review"
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    maxLength={12_000}
                    rows={7}
                    className="mt-2 rounded-xl px-4 py-3 text-base leading-7"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Correct transcription mistakes here. This does not add new
                    text-based task capture.
                  </p>
                  {errorMessage && (
                    <p className="mt-3 flex items-start gap-2 text-sm text-error-foreground" role="alert">
                      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                      {errorMessage}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      onClick={() => void confirmTranscript()}
                      disabled={transcript.trim().length === 0}
                    >
                      Confirm and interpret
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void beginRecording()}
                    >
                      <RotateCcw aria-hidden="true" />
                      Record again
                    </Button>
                  </div>
                </div>
              )}

              {state === "planning" && (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="animate-flownee-gradient flex size-16 items-center justify-center rounded-2xl bg-flownee-gradient p-0.5 motion-reduce:animate-none">
                    <span className="flex size-full items-center justify-center rounded-[0.65rem] bg-surface text-primary">
                      <Brain aria-hidden="true" className="size-7" />
                    </span>
                  </span>
                  <p className="mt-4 font-semibold">Finding the natural next steps</p>
                  <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                    Your confirmed transcript is already safe on this device. Your
                    previous plan stays visible while Flownee reasons.
                  </p>
                </div>
              )}

              {(state === "interpretation" || state === "committing") &&
                planningOutput && (
                  <InterpretationReview
                    drafts={interpretationDrafts}
                    output={planningOutput}
                    isSaving={state === "committing"}
                    errorMessage={errorMessage}
                    onChange={setInterpretationDrafts}
                    onConfirm={() => void confirmInterpretation()}
                    onReviseTranscript={() => {
                      setErrorMessage("");
                      onPlanningStateChange?.(false);
                      setState("review");
                    }}
                  />
                )}

              {state === "planning-error" && (
                <div className="py-4">
                  <div className="rounded-xl border border-error/30 bg-error/10 p-4">
                    <p className="flex items-start gap-2 font-semibold text-error-foreground">
                      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                      Your flow could not be updated yet
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {errorMessage}
                    </p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    The confirmed transcript is saved locally and your previous plan
                    has not been replaced.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        const transcriptId = transcriptIdRef.current;
                        if (transcriptId) void requestPlan(transcript.trim(), transcriptId);
                      }}
                    >
                      <RotateCcw aria-hidden="true" />
                      Retry planning
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setErrorMessage("");
                        setState("review");
                      }}
                    >
                      Revise transcript
                    </Button>
                    <Button variant="ghost" onClick={discardAndClose}>
                      Close for now
                    </Button>
                  </div>
                </div>
              )}

              {state === "error" && (
                <div className="py-4">
                  <div className="rounded-xl border border-error/30 bg-error/10 p-4">
                    <p className="flex items-start gap-2 font-semibold text-error-foreground">
                      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                      Voice capture needs another try
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {errorMessage}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {hasPendingAudio && (
                      <Button
                        onClick={() => {
                          const sample = pendingAudioRef.current;
                          if (sample) void transcribe(sample);
                        }}
                      >
                        <RotateCcw aria-hidden="true" />
                        Retry transcription
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => void beginRecording()}>
                      <Mic aria-hidden="true" />
                      Record again
                    </Button>
                    <Button variant="ghost" onClick={discardAndClose}>
                      <Trash2 aria-hidden="true" />
                      Discard
                    </Button>
                  </div>
                </div>
              )}

              {state === "unavailable" && (
                <div className="py-4">
                  <div className="rounded-xl border border-primary/20 bg-secondary/45 p-4">
                    <p className="flex items-start gap-2 font-semibold">
                      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                      Voice capture is paused
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{errorMessage}</p>
                  </div>
                  <Button className="mt-5" variant="outline" onClick={discardAndClose}>Close</Button>
                </div>
              )}

            </div>

            <p className="mt-2 border-t pt-2 text-xs leading-5 text-muted-foreground">
              Audio is sent to OpenAI only for transcription and is not stored by
              Flownee after a successful transcript.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
