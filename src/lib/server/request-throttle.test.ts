import { afterEach, describe, expect, it, vi } from "vitest";

import {
  consumeRequestLimit,
  rateLimitConfiguration,
  requestClientKey,
  resetRequestLimitsForTests,
} from "@/lib/server/request-throttle";

describe("AI request throttling", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetRequestLimitsForTests();
  });

  it("allows a bounded window and supplies an exact retry delay", () => {
    expect(consumeRequestLimit({ scope: "plan", clientKey: "a", limit: 2, windowMs: 10_000, now: 1_000 })).toMatchObject({ allowed: true, remaining: 1 });
    expect(consumeRequestLimit({ scope: "plan", clientKey: "a", limit: 2, windowMs: 10_000, now: 2_000 })).toMatchObject({ allowed: true, remaining: 0 });
    expect(consumeRequestLimit({ scope: "plan", clientKey: "a", limit: 2, windowMs: 10_000, now: 3_000 })).toEqual({
      allowed: false,
      limit: 2,
      remaining: 0,
      retryAfterSeconds: 8,
    });
    expect(consumeRequestLimit({ scope: "plan", clientKey: "a", limit: 2, windowMs: 10_000, now: 11_000 })).toMatchObject({ allowed: true, remaining: 1 });
  });

  it("isolates scopes and hashed client identities", () => {
    const first = new Request("https://flownee.example", {
      headers: { "x-nf-client-connection-ip": "192.0.2.1", "user-agent": "Flownee test" },
    });
    const second = new Request("https://flownee.example", {
      headers: { "x-nf-client-connection-ip": "192.0.2.2", "user-agent": "Flownee test" },
    });
    expect(requestClientKey(first)).not.toBe(requestClientKey(second));
    expect(requestClientKey(first)).not.toContain("192.0.2.1");
    expect(consumeRequestLimit({ scope: "plan", clientKey: "same", limit: 1, windowMs: 10_000, now: 0 }).allowed).toBe(true);
    expect(consumeRequestLimit({ scope: "transcribe", clientKey: "same", limit: 1, windowMs: 10_000, now: 0 }).allowed).toBe(true);
  });

  it("uses safe defaults when deployment overrides are invalid", () => {
    vi.stubEnv("AI_PLAN_RATE_LIMIT", "0");
    vi.stubEnv("AI_RATE_LIMIT_WINDOW_SECONDS", "not-a-number");
    expect(rateLimitConfiguration("plan")).toEqual({ limit: 20, windowMs: 600_000 });
  });
});
