import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, afterEach } from "vitest";
import PixelNotification from "./PixelNotification.svelte";

afterEach(() => vi.useRealTimers());

describe("PixelNotification", () => {
  it("renders when open", () => {
    render(PixelNotification, { props: { message: "Hi" } });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
  it("renders title and message", () => {
    render(PixelNotification, { props: { title: "Saved", message: "All good" } });
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });
  it("omits title when not provided", () => {
    const { container } = render(PixelNotification, { props: { message: "x" } });
    expect(container.querySelector(".cy-pnotif__title")).not.toBeInTheDocument();
  });
  it.each(["info", "success", "warning", "error"] as const)("applies %s variant", (variant) => {
    const { container } = render(PixelNotification, { props: { message: "x", variant } });
    expect(container.querySelector(`.cy-pnotif--${variant}`)).toBeInTheDocument();
  });
  it("fires onDismiss on close click", async () => {
    const onDismiss = vi.fn();
    const { container } = render(PixelNotification, { props: { message: "x", onDismiss } });
    await fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(onDismiss).toHaveBeenCalled();
    expect(container.querySelector(".cy-pnotif")).not.toBeInTheDocument();
  });
  it("omits close button when not dismissible", () => {
    render(PixelNotification, { props: { message: "x", dismissible: false } });
    expect(screen.queryByLabelText("Dismiss")).not.toBeInTheDocument();
  });
  it("auto-dismisses after duration", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(PixelNotification, { props: { message: "x", durationMs: 1000, onDismiss } });
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalled();
  });
  it("does not auto-dismiss when durationMs=0", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(PixelNotification, { props: { message: "x", durationMs: 0, onDismiss } });
    vi.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
  });
  it("does not render when open=false", () => {
    const { container } = render(PixelNotification, { props: { open: false, message: "x" } });
    expect(container.querySelector(".cy-pnotif")).not.toBeInTheDocument();
  });
});
