import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const switchedOn = process.env.AI_FEATURES_ENABLED === "true";
  const configured = Boolean(process.env.OPENAI_API_KEY?.trim());
  return NextResponse.json(
    {
      enabled: switchedOn && configured,
      reason: !switchedOn
        ? "temporarily-disabled"
        : !configured
          ? "not-configured"
          : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
