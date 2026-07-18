import { describe, expect, it } from "vitest";

import { productIdentity } from "./product-identity";

describe("productIdentity", () => {
  it("keeps the Flownee product promise available to the application shell", () => {
    expect(productIdentity.name).toBe("Flownee");
    expect(productIdentity.promise).toContain("what you should do now");
  });
});
