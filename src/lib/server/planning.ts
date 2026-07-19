import {
  FLOWNEE_PLANNING_MODEL,
  FLOWNEE_PLANNING_REASONING_EFFORT,
  FLOWNEE_PLANNING_TEXT_FORMAT,
  assertPlanningRequest,
  parsePlanningOutput,
  type PlanningOutput,
  type PlanningRequest,
} from "@/lib/ai/planning-contract";
import {
  FLOWNEE_PLANNING_INSTRUCTIONS,
  createPlanningInput,
} from "@/lib/ai/planning-prompt";

export const PLANNING_TIMEOUT_MS = 55_000;
export const PLANNING_MAX_OUTPUT_TOKENS = 5_000;

export class PlanningError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "PlanningError";
  }
}

export type PlanningResult = {
  output: PlanningOutput;
  model: string;
  providerRequestId: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  } | null;
};

type PlanTasksOptions = {
  apiKey: string;
  request: PlanningRequest;
  fetchImplementation?: typeof fetch;
  timeoutMs?: number;
};

type ProviderContent = {
  type?: unknown;
  text?: unknown;
  refusal?: unknown;
};

type ProviderOutputItem = {
  type?: unknown;
  content?: unknown;
};

type ProviderResponse = {
  id?: unknown;
  status?: unknown;
  model?: unknown;
  output?: unknown;
  usage?: {
    input_tokens?: unknown;
    output_tokens?: unknown;
    total_tokens?: unknown;
  } | null;
};

function extractStructuredText(response: ProviderResponse): string {
  if (response.status !== "completed" || !Array.isArray(response.output)) {
    throw new PlanningError(
      "Flownee could not finish updating your plan. Your previous plan is still available.",
      502,
      "PLANNING_INCOMPLETE",
      true,
    );
  }

  const texts: string[] = [];
  for (const item of response.output as ProviderOutputItem[]) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const content of item.content as ProviderContent[]) {
      if (content.type === "refusal") {
        throw new PlanningError(
          "Flownee could not interpret this capture. You can revise it and try again.",
          422,
          "PLANNING_REFUSED",
        );
      }
      if (content.type === "output_text" && typeof content.text === "string") {
        texts.push(content.text);
      }
    }
  }

  if (texts.length !== 1 || texts[0].trim().length === 0) {
    throw new PlanningError(
      "Flownee received an incomplete plan. Your previous plan is still available.",
      502,
      "PLANNING_OUTPUT_MISSING",
      true,
    );
  }
  return texts[0];
}

function parseUsage(value: ProviderResponse["usage"]): PlanningResult["usage"] {
  if (!value) return null;
  const { input_tokens, output_tokens, total_tokens } = value;
  if (
    typeof input_tokens !== "number" ||
    typeof output_tokens !== "number" ||
    typeof total_tokens !== "number"
  ) {
    return null;
  }
  return {
    inputTokens: input_tokens,
    outputTokens: output_tokens,
    totalTokens: total_tokens,
  };
}

export async function planTasks({
  apiKey,
  request,
  fetchImplementation = fetch,
  timeoutMs = PLANNING_TIMEOUT_MS,
}: PlanTasksOptions): Promise<PlanningResult> {
  assertPlanningRequest(request);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImplementation("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: FLOWNEE_PLANNING_MODEL,
        instructions: FLOWNEE_PLANNING_INSTRUCTIONS,
        input: createPlanningInput(request),
        reasoning: { effort: FLOWNEE_PLANNING_REASONING_EFFORT },
        max_output_tokens: PLANNING_MAX_OUTPUT_TOKENS,
        store: false,
        text: {
          verbosity: "low",
          format: FLOWNEE_PLANNING_TEXT_FORMAT,
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new PlanningError(
          "Planning is busy right now. Your confirmed capture is saved; retry shortly.",
          429,
          "PLANNING_RATE_LIMITED",
          true,
        );
      }
      throw new PlanningError(
        "Planning is temporarily unavailable. Your confirmed capture and previous plan are safe.",
        502,
        "PLANNING_PROVIDER_ERROR",
        true,
      );
    }

    let providerResult: ProviderResponse;
    try {
      providerResult = (await response.json()) as ProviderResponse;
    } catch {
      throw new PlanningError(
        "Flownee received an unreadable plan. Your previous plan is still available.",
        502,
        "PLANNING_INVALID_RESPONSE",
        true,
      );
    }

    const structuredText = extractStructuredText(providerResult);
    let parsed: unknown;
    try {
      parsed = JSON.parse(structuredText);
    } catch {
      throw new PlanningError(
        "Flownee received an invalid plan. Your previous plan is still available.",
        502,
        "PLANNING_INVALID_JSON",
        true,
      );
    }

    let output: PlanningOutput;
    try {
      output = parsePlanningOutput(parsed, request);
    } catch {
      throw new PlanningError(
        "Flownee rejected an inconsistent plan. Your previous plan is still available.",
        502,
        "PLANNING_SCHEMA_REJECTED",
        true,
      );
    }

    return {
      output,
      model:
        typeof providerResult.model === "string" && providerResult.model.length > 0
          ? providerResult.model
          : FLOWNEE_PLANNING_MODEL,
      providerRequestId: response.headers.get("x-request-id"),
      usage: parseUsage(providerResult.usage),
    };
  } catch (error) {
    if (error instanceof PlanningError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new PlanningError(
        "Planning took too long. Your confirmed capture and previous plan are safe.",
        504,
        "PLANNING_TIMEOUT",
        true,
      );
    }
    throw new PlanningError(
      "Could not reach planning. Check your connection and retry.",
      503,
      "PLANNING_UNAVAILABLE",
      true,
    );
  } finally {
    clearTimeout(timeout);
  }
}
