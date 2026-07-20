import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { AppHeader } from "@/components/layout/app-header";

describe("AppHeader", () => {
  it("renders the shared Flownee home link and logo", () => {
    const markup = renderToStaticMarkup(<AppHeader />);

    expect(markup).toContain('aria-label="Flownee home"');
    expect(markup).toContain('href="/"');
    expect(markup).toContain("flownee-mark-v2.png");
    expect(markup).toContain("Flownee");
    expect(markup).toContain('aria-label="Help"');
    expect(markup).toContain('href="/help"');
    expect(markup).toContain('aria-label="Settings"');
    expect(markup).toContain('href="/settings"');
    expect(markup).toContain('aria-label="Switch to dark mode"');
    expect(markup.match(/data-size="icon-lg"/g)).toHaveLength(3);
    expect(markup).toContain('width="60"');
    expect(markup).toContain('height="17"');
  });

  it("renders optional page actions", () => {
    const markup = renderToStaticMarkup(
      <AppHeader actions={<button type="button">Page action</button>} />,
    );

    expect(markup).toContain("Page action");
  });
});
