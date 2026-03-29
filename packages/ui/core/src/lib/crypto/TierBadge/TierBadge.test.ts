import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TierBadge from "./TierBadge.svelte";

describe("TierBadge", () => {
  it("renders with default tier", () => {
    const { container } = render(TierBadge, { props: { tier: 1 } });
    const badge = container.querySelector(".cy-tier");
    expect(badge).toBeInTheDocument();
  });

  it("displays tier level", () => {
    render(TierBadge, { props: { tier: 3 } });
    expect(screen.getByText("T3")).toBeInTheDocument();
  });

  it("displays tier name as label", () => {
    render(TierBadge, { props: { tier: 2 } });
    // text-transform: uppercase is CSS-only; source text is "Verified"
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("displays custom label", () => {
    render(TierBadge, { props: { tier: 1, label: "Starter" } });
    expect(screen.getByText("Starter")).toBeInTheDocument();
  });

  it("hides level when showLevel is false", () => {
    render(TierBadge, { props: { tier: 3, showLevel: false } });
    expect(screen.queryByText("T3")).not.toBeInTheDocument();
  });
});
