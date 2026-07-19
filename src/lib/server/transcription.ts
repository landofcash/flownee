export const TRANSCRIPTION_MODEL = "gpt-4o-transcribe";
export const MAX_TRANSCRIPTION_BYTES = 6 * 1024 * 1024;
export const TRANSCRIPTION_TIMEOUT_MS = 45_000;

const ALLOWED_AUDIO_TYPES = new Map([
  ["audio/webm", "webm"],
  ["audio/mp4", "mp4"],
  ["audio/ogg", "ogg"],
]);

export class TranscriptionError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "TranscriptionError";
  }
}

export type TranscriptionResult = {
  text: string;
  model: typeof TRANSCRIPTION_MODEL;
  providerRequestId: string | null;
};

function baseMimeType(type: string): string {
  return type.split(";", 1)[0]?.trim().toLowerCase() ?? "";
}

export function audioExtensionForMimeType(type: string): string | null {
  return ALLOWED_AUDIO_TYPES.get(baseMimeType(type)) ?? null;
}

export function validateAudioFile(file: File): void {
  if (file.size === 0) {
    throw new TranscriptionError(
      "The recording is empty. Please record again.",
      400,
      "EMPTY_AUDIO",
    );
  }
  if (file.size > MAX_TRANSCRIPTION_BYTES) {
    throw new TranscriptionError(
      "The recording is too large. Keep it under 90 seconds and retry.",
      413,
      "AUDIO_TOO_LARGE",
    );
  }
  if (!audioExtensionForMimeType(file.type)) {
    throw new TranscriptionError(
      "This recording format is not supported.",
      415,
      "UNSUPPORTED_AUDIO_TYPE",
    );
  }
}

type TranscribeAudioOptions = {
  apiKey: string;
  fetchImplementation?: typeof fetch;
  file: File;
  timeoutMs?: number;
};

type ProviderTranscription = {
  text?: unknown;
};

export async function transcribeAudio({
  apiKey,
  fetchImplementation = fetch,
  file,
  timeoutMs = TRANSCRIPTION_TIMEOUT_MS,
}: TranscribeAudioOptions): Promise<TranscriptionResult> {
  validateAudioFile(file);

  const extension = audioExtensionForMimeType(file.type);
  const providerBody = new FormData();
  providerBody.append(
    "file",
    file,
    `flownee-capture.${extension ?? "webm"}`,
  );
  providerBody.append("model", TRANSCRIPTION_MODEL);
  providerBody.append("response_format", "json");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImplementation(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: providerBody,
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new TranscriptionError(
          "Voice processing is busy right now. Please retry shortly.",
          429,
          "TRANSCRIPTION_RATE_LIMITED",
          true,
        );
      }

      throw new TranscriptionError(
        "Voice processing is temporarily unavailable. Your recording is still on this device.",
        502,
        "TRANSCRIPTION_PROVIDER_ERROR",
        true,
      );
    }

    const result = (await response.json()) as ProviderTranscription;
    if (typeof result.text !== "string" || result.text.trim().length === 0) {
      throw new TranscriptionError(
        "No speech was found in the recording. You can retry or record again.",
        422,
        "EMPTY_TRANSCRIPT",
      );
    }

    return {
      text: result.text.trim(),
      model: TRANSCRIPTION_MODEL,
      providerRequestId: response.headers.get("x-request-id"),
    };
  } catch (error) {
    if (error instanceof TranscriptionError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new TranscriptionError(
        "Voice processing took too long. Your recording is still on this device.",
        504,
        "TRANSCRIPTION_TIMEOUT",
        true,
      );
    }

    throw new TranscriptionError(
      "Could not reach voice processing. Check your connection and retry.",
      503,
      "TRANSCRIPTION_UNAVAILABLE",
      true,
    );
  } finally {
    clearTimeout(timeout);
  }
}
