import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EffortSelector } from "@/components/ui/effort-selector";

describe("EffortSelector", () => {
  it("renders six radio options with exactly one selected", () => {
    const markup = renderToStaticMarkup(
      <EffortSelector name="effort-test" value={30} onChange={() => undefined} />,
    );

    expect(markup.match(/type="radio"/g)).toHaveLength(6);
    expect(markup.match(/checked=""/g)).toHaveLength(1);
    expect(markup).toContain("5′");
    expect(markup).toContain("60′");
    expect(markup).toContain("120′+");
    expect(markup).not.toContain('type="number"');
    expect(markup.match(/min-h-11/g)).toHaveLength(6);
  });
});
