import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CopyButton from "./CopyButton.svelte";

describe("CopyButton", () => {
  it("renders with default props", () => {
    render(CopyButton, { props: { text: "copy me" } });
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(CopyButton, { props: { text: "data", label: "Copy code" } });
    const btn = screen.getByRole("button", { name: "Copy code" });
    expect(btn).toBeInTheDocument();
  });

  it("copies text to clipboard on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(CopyButton, { props: { text: "hello" } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("applies variant class", () => {
    render(CopyButton, { props: { text: "x", variant: "outline" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("outline");
  });

  it("shows copied state after successful clipboard write", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(CopyButton, { props: { text: "hello" } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    // After click, the button should show "Copied!" label and aria-label
    expect(btn.getAttribute("aria-label")).toBe("Copied");
    expect(btn.textContent).toContain("Copied!");
  });

  it("resets copied state after timeout", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(CopyButton, { props: { text: "hello" } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(btn.getAttribute("aria-label")).toBe("Copied");

    vi.advanceTimersByTime(2000);
    await vi.advanceTimersByTimeAsync(0);
    // After 2000ms the state resets
    await waitFor(() => expect(btn.getAttribute("aria-label")).toBe("Copy"));
    vi.useRealTimers();
  });

  it("falls back to execCommand when clipboard API fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("not allowed"));
    Object.assign(navigator, { clipboard: { writeText } });

    const execCommand = vi.fn();
    document.execCommand = execCommand;

    render(CopyButton, { props: { text: "fallback text" } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(btn.getAttribute("aria-label")).toBe("Copied");
  });

  it("clears previous timeout on rapid clicks", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(CopyButton, { props: { text: "hello" } });
    const btn = screen.getByRole("button");

    await fireEvent.click(btn);
    vi.advanceTimersByTime(1000);
    // Click again before timeout expires
    await fireEvent.click(btn);
    vi.advanceTimersByTime(1500);
    // Should still be in copied state since second click reset the timer
    expect(btn.getAttribute("aria-label")).toBe("Copied");

    vi.advanceTimersByTime(500);
    await vi.advanceTimersByTimeAsync(0);
    // Now 2000ms after second click, should reset
    await waitFor(() => expect(btn.getAttribute("aria-label")).toBe("Copy"));
    vi.useRealTimers();
  });

  it("applies size class sm", () => {
    render(CopyButton, { props: { text: "x", size: "sm" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("sm");
  });

  it("displays custom label", () => {
    render(CopyButton, { props: { text: "x", label: "Copy snippet" } });
    const btn = screen.getByRole("button");
    expect(btn.textContent).toContain("Copy snippet");
    expect(btn.getAttribute("title")).toBe("Copy snippet");
  });

  it("shows Copied! title after click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(CopyButton, { props: { text: "x" } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(btn.getAttribute("title")).toBe("Copied!");
  });

  it("applies copied class after click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(CopyButton, { props: { text: "x" } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(btn.className).toContain("copied");
  });

  it("fallback also resets copied state after timeout", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockRejectedValue(new Error("fail"));
    Object.assign(navigator, { clipboard: { writeText } });
    document.execCommand = vi.fn();

    render(CopyButton, { props: { text: "x" } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(btn.getAttribute("aria-label")).toBe("Copied");

    vi.advanceTimersByTime(2000);
    await vi.advanceTimersByTimeAsync(0);
    await waitFor(() => expect(btn.getAttribute("aria-label")).toBe("Copy"));
    vi.useRealTimers();
  });
});
