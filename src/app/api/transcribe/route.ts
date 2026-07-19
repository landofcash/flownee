import { NextRequest, NextResponse } from "next/server";

import {
  MAX_TRANSCRIPTION_BYTES,
  TranscriptionError,
  transcribeAudio,
} from "@/lib/server/transcription";
import {
  consumeRequestLimit,
  rateLimitConfiguration,
  rateLimitHeaders,
  requestClientKey,
} from "@/lib/server/request-throttle";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MULTIPART_BYTES = MAX_TRANSCRIPTION_BYTES + 128 * 1024;

function errorResponse(
  error: TranscriptionError,
  additionalHeaders: Record<string, string> = {},
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
      },
    },
    {
      status: error.status,
      headers: { "Cache-Control": "no-store", ...additionalHeaders },
    },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (process.env.AI_FEATURES_ENABLED !== "true") {
    return errorResponse(
      new TranscriptionError(
        "Voice processing is temporarily disabled.",
        503,
        "AI_DISABLED",
        true,
      ),
    );
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse(
      new TranscriptionError(
        "Voice processing is not configured.",
        503,
        "AI_NOT_CONFIGURED",
      ),
    );
  }

  const requestOrigin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    fetchSite === "cross-site" ||
    (requestOrigin !== null && requestOrigin !== request.nextUrl.origin)
  ) {
    return errorResponse(
      new TranscriptionError("Cross-site requests are not allowed.", 403, "FORBIDDEN"),
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
    return errorResponse(
      new TranscriptionError(
        "The recording upload is too large.",
        413,
        "UPLOAD_TOO_LARGE",
      ),
    );
  }

  const limit = rateLimitConfiguration("transcribe");
  const decision = consumeRequestLimit({
    scope: "transcribe",
    clientKey: requestClientKey(request),
    ...limit,
  });
  const limitHeaders = rateLimitHeaders(decision);
  if (!decision.allowed) {
    return errorResponse(
      new TranscriptionError(
        `Voice processing is paused after repeated requests. Try again in ${decision.retryAfterSeconds} seconds.`,
        429,
        "RATE_LIMITED",
        true,
      ),
      limitHeaders,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      new TranscriptionError(
        "The recording upload could not be read.",
        400,
        "INVALID_MULTIPART",
      ),
    );
  }

  const audio = formData.get("audio");
  if (!(audio instanceof File)) {
    return errorResponse(
      new TranscriptionError(
        "A recording file is required.",
        400,
        "AUDIO_REQUIRED",
      ),
    );
  }

  try {
    const result = await transcribeAudio({ apiKey, file: audio });

    return NextResponse.json(result, {
      status: 200,
      headers: { "Cache-Control": "no-store", ...limitHeaders },
    });
  } catch (error) {
    if (error instanceof TranscriptionError) return errorResponse(error, limitHeaders);

    return errorResponse(
      new TranscriptionError(
        "Voice processing failed safely. Your recording remains on this device.",
        500,
        "TRANSCRIPTION_FAILED",
        true,
      ),
      limitHeaders,
    );
  }
}
