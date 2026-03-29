import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Badge from "./Badge.svelte";

describe("Badge", () => {
  it("renders with default props", () => {
    const { container } = render(Badge);
    const badge = container.querySelector(".cy-badge");
    expect(badge).toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(Badge, { props: { variant: "success" } });
    const badge = container.querySelector(".cy-badge");
    expect(badge?.className).toContain("success");
  });

  it("applies size class", () => {
    const { container } = render(Badge, { props: { size: "sm" } });
    const badge = container.querySelector(".cy-badge");
    expect(badge?.className).toContain("sm");
  });

  it("renders as a span element", () => {
    const { container } = render(Badge);
    const badge = container.querySelector("span.cy-badge");
    expect(badge).toBeInTheDocument();
  });
});
