import { NextRequest, NextResponse } from "next/server";

import { assertPlanningRequest } from "@/lib/ai/planning-contract";
import {
  PlanningError,
  planTasks,
} from "@/lib/server/planning";
import {
  consumeRequestLimit,
  rateLimitConfiguration,
  rateLimitHeaders,
  requestClientKey,
} from "@/lib/server/request-throttle";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PLANNING_BODY_BYTES = 128 * 1024;

function errorResponse(
  error: PlanningError,
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
      new PlanningError(
        "Planning is temporarily disabled. Your saved flow remains available.",
        503,
        "AI_DISABLED",
        true,
      ),
    );
  }
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse(
      new PlanningError("Planning is not configured.", 503, "AI_NOT_CONFIGURED"),
    );
  }

  const requestOrigin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    fetchSite === "cross-site" ||
    (requestOrigin !== null && requestOrigin !== request.nextUrl.origin)
  ) {
    return errorResponse(
      new PlanningError("Cross-site requests are not allowed.", 403, "FORBIDDEN"),
    );
  }
  if (request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
    return errorResponse(
      new PlanningError("A JSON planning request is required.", 415, "INVALID_CONTENT_TYPE"),
    );
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_PLANNING_BODY_BYTES) {
    return errorResponse(
      new PlanningError("The planning request is too large.", 413, "REQUEST_TOO_LARGE"),
    );
  }

  const limit = rateLimitConfiguration("plan");
  const decision = consumeRequestLimit({
    scope: "plan",
    clientKey: requestClientKey(request),
    ...limit,
  });
  const limitHeaders = rateLimitHeaders(decision);
  if (!decision.allowed) {
    return errorResponse(
      new PlanningError(
        `Planning is paused after repeated requests. Try again in ${decision.retryAfterSeconds} seconds. Your saved flow is safe.`,
        429,
        "RATE_LIMITED",
        true,
      ),
      limitHeaders,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
    assertPlanningRequest(body);
  } catch {
    return errorResponse(
      new PlanningError("The planning request is invalid.", 400, "INVALID_REQUEST"),
    );
  }

  try {
    const result = await planTasks({ apiKey, request: body });
    return NextResponse.json(result, {
      status: 200,
      headers: { "Cache-Control": "no-store", ...limitHeaders },
    });
  } catch (error) {
    if (error instanceof PlanningError) return errorResponse(error, limitHeaders);
    return errorResponse(
      new PlanningError(
        "Planning failed safely. Your confirmed capture and previous plan are safe.",
        500,
        "PLANNING_FAILED",
        true,
      ),
      limitHeaders,
    );
  }
}
