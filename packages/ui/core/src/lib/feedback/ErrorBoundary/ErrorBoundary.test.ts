import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary.svelte";

describe("ErrorBoundary", () => {
  it("shows error state when error prop is set", () => {
    render(ErrorBoundary, { props: { error: "Something failed" } });
    expect(screen.getByText("Something failed")).toBeInTheDocument();
  });

  it("displays custom title", () => {
    render(ErrorBoundary, { props: { error: "err", title: "Custom Error" } });
    expect(screen.getByText("Custom Error")).toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(ErrorBoundary, {
      props: { error: "err", description: "Please try again" },
    });
    expect(screen.getByText("Please try again")).toBeInTheDocument();
  });

  it("shows retry button when onretry is provided", () => {
    const onretry = vi.fn();
    render(ErrorBoundary, { props: { error: "err", onretry } });
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("calls onretry when retry button clicked", async () => {
    const onretry = vi.fn();
    render(ErrorBoundary, { props: { error: "err", onretry } });
    await fireEvent.click(screen.getByText("Try Again"));
    expect(onretry).toHaveBeenCalledOnce();
  });
});
