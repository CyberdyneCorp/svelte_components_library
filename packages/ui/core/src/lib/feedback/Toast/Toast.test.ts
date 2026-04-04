import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tick } from "svelte";
import Toast from "./Toast.svelte";
import ToastTest from "./ToastTest.svelte";

describe("Toast", () => {
  beforeEach(() => {
    cleanup();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders with aria-live polite region", () => {
    const { container } = render(Toast);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it("starts with no toast items", () => {
    const { container } = render(Toast);
    const toasts = container.querySelectorAll('[role="alert"]');
    expect(toasts.length).toBe(0);
  });

  it("renders the container element", () => {
    const { container } = render(Toast);
    const toastContainer = container.querySelector(".cy-toast-container");
    expect(toastContainer).toBeInTheDocument();
  });

  it("container has correct class", () => {
    const { container } = render(Toast);
    expect(container.querySelector(".cy-toast-container")).toBeTruthy();
  });

  it("shows a success toast when triggered via context", async () => {
    const { container } = render(ToastTest, { props: { variant: "success", message: "Saved!" } });
    const btn = screen.getByTestId("toast-trigger");
    await fireEvent.click(btn);
    expect(container.querySelector(".cy-toast--success")).toBeInTheDocument();
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("shows a warning toast", async () => {
    const { container } = render(ToastTest, { props: { variant: "warning", message: "Careful!" } });
    const btn = screen.getByTestId("toast-trigger");
    await fireEvent.click(btn);
    expect(container.querySelector(".cy-toast--warning")).toBeInTheDocument();
  });

  it("shows an error toast", async () => {
    const { container } = render(ToastTest, { props: { variant: "error", message: "Failed!" } });
    const btn = screen.getByTestId("toast-trigger");
    await fireEvent.click(btn);
    expect(container.querySelector(".cy-toast--error")).toBeInTheDocument();
  });

  it("shows an info toast", async () => {
    const { container } = render(ToastTest, { props: { variant: "info", message: "FYI" } });
    const btn = screen.getByTestId("toast-trigger");
    await fireEvent.click(btn);
    expect(container.querySelector(".cy-toast--info")).toBeInTheDocument();
  });

  it("dismisses toast on close button click", async () => {
    const { container } = render(ToastTest, { props: { variant: "success", message: "Gone soon" } });
    await fireEvent.click(screen.getByTestId("toast-trigger"));
    expect(container.querySelectorAll('[role="alert"]').length).toBe(1);
    const closeBtn = screen.getByLabelText("Dismiss");
    await fireEvent.click(closeBtn);
    // The dismissing animation takes 300ms
    vi.advanceTimersByTime(350);
    await tick();
    expect(container.querySelectorAll('[role="alert"]').length).toBe(0);
  });

  it("auto-dismisses after 5 seconds", async () => {
    const { container } = render(ToastTest, { props: { variant: "success", message: "Auto" } });
    await fireEvent.click(screen.getByTestId("toast-trigger"));
    expect(container.querySelectorAll('[role="alert"]').length).toBe(1);
    // After 5s the dismiss kicks in, then 300ms for animation
    vi.advanceTimersByTime(5500);
    await tick();
    expect(container.querySelectorAll('[role="alert"]').length).toBe(0);
  });

  it("adds dismissing class before removal", async () => {
    const { container } = render(ToastTest, { props: { variant: "success", message: "Fading" } });
    await fireEvent.click(screen.getByTestId("toast-trigger"));
    const closeBtn = screen.getByLabelText("Dismiss");
    await fireEvent.click(closeBtn);
    await tick();
    expect(container.querySelector(".cy-toast--dismissing")).toBeInTheDocument();
    vi.advanceTimersByTime(350);
    await tick();
    expect(container.querySelector(".cy-toast--dismissing")).not.toBeInTheDocument();
  });

  it("shows action button when toast has action", async () => {
    const { container } = render(ToastTest, { props: { variant: "success", message: "Act", withAction: true } });
    await fireEvent.click(screen.getByTestId("toast-trigger"));
    expect(container.querySelector(".cy-toast__action")).toBeInTheDocument();
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  it("clicking action button calls action onclick and dismisses", async () => {
    const { container } = render(ToastTest, { props: { variant: "success", message: "Act", withAction: true } });
    await fireEvent.click(screen.getByTestId("toast-trigger"));
    const actionBtn = screen.getByText("Undo");
    await fireEvent.click(actionBtn);
    vi.advanceTimersByTime(350);
    await tick();
    expect(container.querySelectorAll('[role="alert"]').length).toBe(0);
  });

  it("can show multiple toasts", async () => {
    const { container } = render(ToastTest, { props: { variant: "success", message: "First" } });
    const btn = screen.getByTestId("toast-trigger");
    await fireEvent.click(btn);
    await fireEvent.click(btn);
    expect(container.querySelectorAll('[role="alert"]').length).toBe(2);
  });

  it("each toast has an icon svg", async () => {
    const { container } = render(ToastTest, { props: { variant: "error", message: "Err" } });
    await fireEvent.click(screen.getByTestId("toast-trigger"));
    expect(container.querySelector(".cy-toast__icon")).toBeInTheDocument();
  });
});
