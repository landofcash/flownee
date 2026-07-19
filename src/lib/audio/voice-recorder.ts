import {
  inspectCurrentBrowser,
  requestMicrophoneStream,
  type AudioMimeType,
  type RecordingSample,
} from "@/lib/audio/recording-capabilities";

export class RecordingCancelledError extends Error {
  constructor() {
    super("Recording cancelled.");
    this.name = "RecordingCancelledError";
  }
}

export type VoiceRecordingSession = {
  mimeType: AudioMimeType | null;
  result: Promise<RecordingSample>;
  stop: () => void;
  cancel: () => void;
};

type StartVoiceRecordingOptions = {
  maxDurationMs?: number;
  permissionTimeoutMs?: number;
};

export async function startVoiceRecording({
  maxDurationMs = 90_000,
  permissionTimeoutMs = 15_000,
}: StartVoiceRecordingOptions = {}): Promise<VoiceRecordingSession> {
  const capabilities = inspectCurrentBrowser();
  if (!capabilities.isSecureContext) {
    throw new Error("Microphone recording requires HTTPS or localhost.");
  }
  if (!capabilities.hasGetUserMedia || !capabilities.hasMediaRecorder) {
    throw new Error("Voice recording is not supported in this browser.");
  }

  const stream = await requestMicrophoneStream(permissionTimeoutMs);
  const chunks: BlobPart[] = [];
  const recorder = capabilities.preferredMimeType
    ? new MediaRecorder(stream, { mimeType: capabilities.preferredMimeType })
    : new MediaRecorder(stream);
  const startedAt = performance.now();
  let cancelled = false;
  let settled = false;

  const cleanup = () => {
    stream.getTracks().forEach((track) => track.stop());
  };

  let resolveResult!: (sample: RecordingSample) => void;
  let rejectResult!: (error: unknown) => void;
  const result = new Promise<RecordingSample>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  const maxDurationTimer = window.setTimeout(() => {
    if (recorder.state !== "inactive") recorder.stop();
  }, maxDurationMs);

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  recorder.addEventListener(
    "stop",
    () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(maxDurationTimer);
      cleanup();

      if (cancelled) {
        rejectResult(new RecordingCancelledError());
        return;
      }

      const actualMimeType =
        recorder.mimeType || capabilities.preferredMimeType || "";
      const blob = new Blob(chunks, { type: actualMimeType });
      if (blob.size === 0) {
        rejectResult(new Error("The recording contained no audio data."));
        return;
      }

      resolveResult({
        blob,
        requestedMimeType: capabilities.preferredMimeType,
        actualMimeType: blob.type,
        durationMs: Math.round(performance.now() - startedAt),
        byteLength: blob.size,
        audioTrackCount: stream.getAudioTracks().length,
      });
    },
    { once: true },
  );
  recorder.addEventListener(
    "error",
    () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(maxDurationTimer);
      cleanup();
      rejectResult(new Error("Voice recording failed."));
    },
    { once: true },
  );

  recorder.start(250);

  return {
    mimeType: capabilities.preferredMimeType,
    result,
    stop: () => {
      if (recorder.state !== "inactive") recorder.stop();
    },
    cancel: () => {
      cancelled = true;
      if (recorder.state !== "inactive") recorder.stop();
    },
  };
}
