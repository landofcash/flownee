import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/help" }));

import { HeaderNavigation } from "@/components/layout/header-navigation";

describe("HeaderNavigation", () => {
  it("links to help and settings and marks the current screen", () => {
    const markup = renderToStaticMarkup(<HeaderNavigation />);

    expect(markup).toContain('href="/help"');
    expect(markup).toContain('aria-label="Help"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('href="/settings"');
    expect(markup).toContain('aria-label="Settings"');
    expect(markup.match(/data-size="icon-lg"/g)).toHaveLength(2);
  });
});
