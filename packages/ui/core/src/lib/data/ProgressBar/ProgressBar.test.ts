import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ProgressBar from "./ProgressBar.svelte";

describe("ProgressBar", () => {
  it("renders a progressbar role", () => {
    render(ProgressBar, { props: { value: 50 } });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow to the value", () => {
    render(ProgressBar, { props: { value: 75 } });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
  });

  it("clamps value to 0-100", () => {
    render(ProgressBar, { props: { value: 120 } });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("shows label when showLabel is true", () => {
    render(ProgressBar, { props: { value: 42, showLabel: true } });
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(ProgressBar, { props: { value: 50, variant: "error" } });
    expect(container.querySelector(".cy-progress__fill--error")).toBeInTheDocument();
  });
});
