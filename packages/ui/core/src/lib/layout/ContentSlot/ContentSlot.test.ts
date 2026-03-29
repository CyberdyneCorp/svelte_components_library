import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ContentSlot from "./ContentSlot.svelte";

describe("ContentSlot", () => {
  it("renders with default props", () => {
    const { container } = render(ContentSlot);
    const slot = container.querySelector(".cy-content-slot");
    expect(slot).toBeInTheDocument();
  });

  it("applies padding class", () => {
    const { container } = render(ContentSlot, { props: { padding: "lg" } });
    const slot = container.querySelector(".cy-content-slot");
    expect(slot?.className).toContain("pad-lg");
  });

  it("sets data-slot attribute when name is provided", () => {
    const { container } = render(ContentSlot, { props: { name: "sidebar" } });
    const slot = container.querySelector("[data-slot='sidebar']");
    expect(slot).toBeInTheDocument();
  });

  it("does not set data-slot when name is empty", () => {
    const { container } = render(ContentSlot, { props: { name: "" } });
    const slot = container.querySelector(".cy-content-slot");
    expect(slot?.getAttribute("data-slot")).toBeNull();
  });

  it("applies none padding class", () => {
    const { container } = render(ContentSlot, { props: { padding: "none" } });
    const slot = container.querySelector(".cy-content-slot");
    expect(slot?.className).toContain("pad-none");
  });
});
