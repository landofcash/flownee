export const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;

export type AudioMimeType = (typeof AUDIO_MIME_CANDIDATES)[number];

export type AudioMimeSupport = {
  mimeType: AudioMimeType;
  supported: boolean;
};

export type RecordingCapabilities = {
  isSecureContext: boolean;
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
  mimeTypes: AudioMimeSupport[];
  preferredMimeType: AudioMimeType | null;
};

type CapabilityEnvironment = {
  isSecureContext: boolean;
  mediaDevices?: Pick<MediaDevices, "getUserMedia">;
  MediaRecorder?: Pick<typeof MediaRecorder, "isTypeSupported">;
};

export function inspectRecordingCapabilities(
  environment: CapabilityEnvironment,
): RecordingCapabilities {
  const hasMediaDevices = environment.mediaDevices !== undefined;
  const hasGetUserMedia =
    hasMediaDevices &&
    typeof environment.mediaDevices?.getUserMedia === "function";
  const hasMediaRecorder = environment.MediaRecorder !== undefined;
  const mimeTypes = AUDIO_MIME_CANDIDATES.map((mimeType) => ({
    mimeType,
    supported:
      hasMediaRecorder &&
      environment.MediaRecorder?.isTypeSupported(mimeType) === true,
  }));

  return {
    isSecureContext: environment.isSecureContext,
    hasMediaDevices,
    hasGetUserMedia,
    hasMediaRecorder,
    mimeTypes,
    preferredMimeType:
      mimeTypes.find((candidate) => candidate.supported)?.mimeType ?? null,
  };
}

export function inspectCurrentBrowser(): RecordingCapabilities {
  return inspectRecordingCapabilities({
    isSecureContext: globalThis.isSecureContext,
    mediaDevices: globalThis.navigator?.mediaDevices,
    MediaRecorder: globalThis.MediaRecorder,
  });
}

export type RecordingSample = {
  blob: Blob;
  requestedMimeType: AudioMimeType | null;
  actualMimeType: string;
  durationMs: number;
  byteLength: number;
  audioTrackCount: number;
};

type RecordSampleOptions = {
  durationMs?: number;
  permissionTimeoutMs?: number;
};

export async function requestMicrophoneStream(
  timeoutMs: number,
): Promise<MediaStream> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      settled = true;
      reject(
        new Error(
          "Microphone permission was not resolved. Check the browser permission prompt and retry.",
        ),
      );
    }, timeoutMs);

    void navigator.mediaDevices
      .getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false,
      })
      .then((stream) => {
        if (settled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        settled = true;
        window.clearTimeout(timeout);
        resolve(stream);
      })
      .catch((error: unknown) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}

export async function recordMicrophoneSample({
  durationMs = 3_000,
  permissionTimeoutMs = 15_000,
}: RecordSampleOptions = {}): Promise<RecordingSample> {
  const capabilities = inspectCurrentBrowser();

  if (!capabilities.isSecureContext) {
    throw new Error("Microphone recording requires HTTPS or localhost.");
  }
  if (!capabilities.hasGetUserMedia || !capabilities.hasMediaRecorder) {
    throw new Error("This browser does not provide the required recording APIs.");
  }
  if (durationMs < 250 || durationMs > 10_000) {
    throw new RangeError("Diagnostic recording duration must be 250–10000 ms.");
  }
  if (permissionTimeoutMs < 1_000 || permissionTimeoutMs > 60_000) {
    throw new RangeError("Permission timeout must be 1000–60000 ms.");
  }

  const stream = await requestMicrophoneStream(permissionTimeoutMs);

  const chunks: BlobPart[] = [];
  const recorder = capabilities.preferredMimeType
    ? new MediaRecorder(stream, { mimeType: capabilities.preferredMimeType })
    : new MediaRecorder(stream);
  const startedAt = performance.now();

  try {
    const stopped = new Promise<void>((resolve, reject) => {
      recorder.addEventListener(
        "dataavailable",
        (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        },
      );
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.addEventListener(
        "error",
        () => reject(new Error("MediaRecorder failed.")),
        { once: true },
      );
    });

    recorder.start(250);
    window.setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, durationMs);
    await stopped;

    const actualMimeType = recorder.mimeType || capabilities.preferredMimeType || "";
    const blob = new Blob(chunks, {
      type: actualMimeType,
    });

    if (blob.size === 0) {
      throw new Error("The browser completed recording but produced no audio data.");
    }

    return {
      blob,
      requestedMimeType: capabilities.preferredMimeType,
      actualMimeType: blob.type,
      durationMs: Math.round(performance.now() - startedAt),
      byteLength: blob.size,
      audioTrackCount: stream.getAudioTracks().length,
    };
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export function describeRecordingError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Microphone access was not allowed. Enable it in the browser’s site settings and retry.";
    }
    if (error.name === "NotFoundError") {
      return "No microphone was found on this device.";
    }
    if (error.name === "NotReadableError") {
      return "The microphone is busy or unavailable to this browser.";
    }
  }

  return error instanceof Error ? error.message : "The recording test failed.";
}
