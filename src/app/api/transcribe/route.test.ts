import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/transcribe/route";
import { resetRequestLimitsForTests } from "@/lib/server/request-throttle";

function requestWithAudio(headers: HeadersInit = {}): NextRequest {
  const body = new FormData();
  body.append(
    "audio",
    new File([new Uint8Array([1, 2, 3])], "capture.webm", {
      type: "audio/webm;codecs=opus",
    }),
  );

  return new NextRequest("http://localhost:3000/api/transcribe", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      ...headers,
    },
    body,
  });
}

describe("POST /api/transcribe", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    resetRequestLimitsForTests();
  });

  it("keeps the route behind the server-side feature switch", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "false");
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    const response = await POST(requestWithAudio());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "AI_DISABLED" },
    });
  });

  it("rejects cross-site browser requests before provider access", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const providerFetch = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", providerFetch);

    const response = await POST(
      requestWithAudio({
        origin: "https://attacker.example",
        "sec-fetch-site": "cross-site",
      }),
    );

    expect(response.status).toBe(403);
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it("returns a no-store transcript without exposing the API key", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ text: "Call Maria tomorrow." }), {
          status: 200,
          headers: { "x-request-id": "req_route_test" },
        }),
      ),
    );

    const response = await POST(requestWithAudio());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload).toEqual({
      text: "Call Maria tomorrow.",
      model: "gpt-4o-transcribe",
      providerRequestId: "req_route_test",
    });
    expect(JSON.stringify(payload)).not.toContain("test-key");
  });

  it("throttles repeated transcription requests before a second provider call", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("AI_TRANSCRIBE_RATE_LIMIT", "1");
    vi.stubEnv("AI_RATE_LIMIT_WINDOW_SECONDS", "60");
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ text: "Call Maria." }), { status: 200 }),
    );
    vi.stubGlobal("fetch", providerFetch);

    expect((await POST(requestWithAudio())).status).toBe(200);
    const response = await POST(requestWithAudio());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBeTruthy();
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "RATE_LIMITED", retryable: true },
    });
    expect(providerFetch).toHaveBeenCalledTimes(1);
  });
});
