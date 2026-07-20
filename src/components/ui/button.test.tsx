import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button touch targets", () => {
  it("keeps every shared size at least 44px high", () => {
    const defaultMarkup = renderToStaticMarkup(<Button>Default</Button>);
    const smallMarkup = renderToStaticMarkup(<Button size="sm">Small</Button>);
    const iconMarkup = renderToStaticMarkup(
      <Button aria-label="Icon action" size="icon" />,
    );
    const smallIconMarkup = renderToStaticMarkup(
      <Button aria-label="Compact icon action" size="icon-sm" />,
    );

    expect(defaultMarkup).toContain("h-11");
    expect(smallMarkup).toContain("h-11");
    expect(iconMarkup).toContain("size-11");
    expect(smallIconMarkup).toContain("size-11");
  });
});
