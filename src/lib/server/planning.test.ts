import { describe, expect, it, vi } from "vitest";

import {
  planningOutputFixture,
  planningRequestFixture,
} from "@/lib/ai/fixtures/planning-test-fixture";
import {
  FLOWNEE_PLANNING_INSTRUCTIONS,
} from "@/lib/ai/planning-prompt";
import {
  PlanningError,
  planTasks,
} from "@/lib/server/planning";

function providerResponse(output: unknown = planningOutputFixture): Response {
  return new Response(
    JSON.stringify({
      id: "resp_1",
      status: "completed",
      model: "gpt-5.6-sol",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
      usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 },
    }),
    { status: 200, headers: { "x-request-id": "req_plan_1" } },
  );
}

describe("GPT-5.6 planning provider", () => {
  it("uses a stateless strict Responses request and returns validated output", async () => {
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValue(providerResponse());

    const result = await planTasks({
      apiKey: "test-key",
      request: planningRequestFixture,
      fetchImplementation: providerFetch,
    });

    expect(result).toEqual({
      output: planningOutputFixture,
      model: "gpt-5.6-sol",
      providerRequestId: "req_plan_1",
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
    });
    const [url, init] = providerFetch.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      model: "gpt-5.6-sol",
      instructions: FLOWNEE_PLANNING_INSTRUCTIONS,
      reasoning: { effort: "medium" },
      store: false,
      text: { verbosity: "low", format: { type: "json_schema", strict: true } },
    });
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer test-key",
    );
    expect(JSON.stringify(result)).not.toContain("test-key");
  });

  it("rejects semantically inconsistent structured output", async () => {
    const invalid = structuredClone(planningOutputFixture);
    invalid.plan.orderedTaskRefs = ["unknown"];
    invalid.plan.nextTaskRef = "unknown";

    await expect(
      planTasks({
        apiKey: "test-key",
        request: planningRequestFixture,
        fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(providerResponse(invalid)),
      }),
    ).rejects.toMatchObject<Partial<PlanningError>>({
      code: "PLANNING_SCHEMA_REJECTED",
      retryable: true,
    });
  });

  it("handles refusal content without attempting to parse it", async () => {
    const refusal = new Response(
      JSON.stringify({
        status: "completed",
        model: "gpt-5.6-sol",
        output: [{ type: "message", content: [{ type: "refusal", refusal: "No" }] }],
      }),
      { status: 200 },
    );
    await expect(
      planTasks({
        apiKey: "test-key",
        request: planningRequestFixture,
        fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(refusal),
      }),
    ).rejects.toMatchObject({ code: "PLANNING_REFUSED" });
  });
});
