import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/plan/route";
import {
  planningOutputFixture,
  planningRequestFixture,
} from "@/lib/ai/fixtures/planning-test-fixture";
import { resetRequestLimitsForTests } from "@/lib/server/request-throttle";

function planningRequest(
  headers: HeadersInit = {},
  body: unknown = planningRequestFixture,
): NextRequest {
  return new NextRequest("http://localhost:3000/api/plan", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function providerResponse(): Response {
  return new Response(
    JSON.stringify({
      status: "completed",
      model: "gpt-5.6-sol",
      output: [
        {
          type: "message",
          content: [
            { type: "output_text", text: JSON.stringify(planningOutputFixture) },
          ],
        },
      ],
    }),
    { status: 200 },
  );
}

describe("POST /api/plan", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    resetRequestLimitsForTests();
  });

  it("rejects cross-site requests before provider access", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const providerFetch = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", providerFetch);

    const response = await POST(
      planningRequest({
        origin: "https://attacker.example",
        "sec-fetch-site": "cross-site",
      }),
    );
    expect(response.status).toBe(403);
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it("rejects malformed snapshots before provider access", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const providerFetch = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", providerFetch);

    const response = await POST(planningRequest({}, { transcript: {} }));
    expect(response.status).toBe(400);
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it("returns a validated no-store plan without exposing credentials", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(providerResponse()));

    const response = await POST(planningRequest());
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.output).toEqual(planningOutputFixture);
    expect(JSON.stringify(payload)).not.toContain("test-key");
  });

  it("throttles repeated planning requests before a second provider call", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("AI_PLAN_RATE_LIMIT", "1");
    vi.stubEnv("AI_RATE_LIMIT_WINDOW_SECONDS", "60");
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValue(providerResponse());
    vi.stubGlobal("fetch", providerFetch);

    expect((await POST(planningRequest())).status).toBe(200);
    const response = await POST(planningRequest());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBeTruthy();
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "RATE_LIMITED", retryable: true },
    });
    expect(providerFetch).toHaveBeenCalledTimes(1);
  });
});
