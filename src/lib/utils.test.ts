import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins conditional class names", () => {
    expect(cn("base", false && "hidden", { active: true })).toBe(
      "base active",
    );
  });

  it("resolves conflicting Tailwind utilities in favor of the last value", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
  });
});
