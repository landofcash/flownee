import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/ai-status/route";

describe("GET /api/ai-status", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reports the emergency switch without exposing configuration details", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "false");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      enabled: false,
      reason: "temporarily-disabled",
    });
  });

  it("reports availability only when enabled and configured", async () => {
    vi.stubEnv("AI_FEATURES_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    await expect((await GET()).json()).resolves.toEqual({ enabled: true, reason: null });
  });
});
