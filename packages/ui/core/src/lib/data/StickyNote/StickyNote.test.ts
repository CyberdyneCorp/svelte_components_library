import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import StickyNote from "./StickyNote.svelte";

describe("StickyNote", () => {
  it("renders with note role", () => {
    render(StickyNote, { props: { title: "Note" } });
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(StickyNote, { props: { title: "Important" } });
    expect(screen.getByText("Important")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(StickyNote, { props: { variant: "warning", title: "Warn" } });
    expect(container.querySelector(".cy-sticky-note--warning")).toBeInTheDocument();
  });

  it("defaults to note variant", () => {
    const { container } = render(StickyNote, { props: { title: "Default" } });
    expect(container.querySelector(".cy-sticky-note--note")).toBeInTheDocument();
  });

  it("renders without title", () => {
    const { container } = render(StickyNote);
    expect(container.querySelector(".cy-sticky-note__header")).not.toBeInTheDocument();
  });
});
