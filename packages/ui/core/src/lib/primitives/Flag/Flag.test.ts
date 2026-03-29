import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Flag from "./Flag.svelte";

describe("Flag", () => {
  it("renders with default props", () => {
    const { container } = render(Flag);
    const flag = container.querySelector(".cy-flag");
    expect(flag).toBeInTheDocument();
  });

  it("displays variant text in uppercase", () => {
    const { container } = render(Flag, { props: { variant: "beta" } });
    const flag = container.querySelector(".cy-flag");
    expect(flag?.textContent).toBe("BETA");
  });

  it("applies variant class", () => {
    const { container } = render(Flag, { props: { variant: "deprecated" } });
    const flag = container.querySelector(".cy-flag");
    expect(flag?.className).toContain("deprecated");
  });

  it("applies size class", () => {
    const { container } = render(Flag, { props: { size: "sm" } });
    const flag = container.querySelector(".cy-flag");
    expect(flag?.className).toContain("sm");
  });
});
