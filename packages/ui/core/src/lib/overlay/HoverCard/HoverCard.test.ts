import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import HoverCardHarness from "./HoverCardHarness.test.svelte";

const root = () => document.querySelector(".cy-hover-card") as HTMLElement;
const card = () => document.querySelector(".cy-hover-card__content");

describe("HoverCard", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("opens only after openDelay on hover", async () => {
    render(HoverCardHarness);
    await fireEvent.pointerEnter(root());
    await vi.advanceTimersByTimeAsync(499);
    expect(card()).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(screen.getByText("Ada Lovelace, analyst")).toBeInTheDocument();
  });

  it("cancels opening when the pointer leaves early", async () => {
    render(HoverCardHarness);
    await fireEvent.pointerEnter(root());
    await vi.advanceTimersByTimeAsync(300);
    await fireEvent.pointerLeave(root());
    await vi.advanceTimersByTimeAsync(1000);
    expect(card()).toBeNull();
  });

  it("closes after closeDelay and stays open on re-entry", async () => {
    render(HoverCardHarness, { props: { open: true } });
    await fireEvent.pointerLeave(root());
    await vi.advanceTimersByTimeAsync(100);
    // The pointer reaches the card (inside the root) before closeDelay elapses.
    await fireEvent.pointerEnter(root());
    await vi.advanceTimersByTimeAsync(500);
    expect(card()).not.toBeNull();
    await fireEvent.pointerLeave(root());
    await vi.advanceTimersByTimeAsync(200);
    expect(card()).toBeNull();
  });

  it("opens on keyboard focus and stays open while focus moves into the card", async () => {
    render(HoverCardHarness);
    const trigger = screen.getByRole("link", { name: "@ada" });
    trigger.focus();
    await vi.advanceTimersByTimeAsync(500);
    const profile = screen.getByRole("link", { name: "View profile" });
    // DOM order: the card follows the trigger, so Tab lands on its link.
    expect(trigger.compareDocumentPosition(profile) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    profile.focus();
    await vi.advanceTimersByTimeAsync(1000);
    expect(card()).not.toBeNull();
  });

  it("closes when focus leaves both trigger and card", async () => {
    render(HoverCardHarness);
    screen.getByRole("link", { name: "@ada" }).focus();
    await vi.advanceTimersByTimeAsync(500);
    screen.getByRole("button", { name: "Outside" }).focus();
    await vi.advanceTimersByTimeAsync(200);
    expect(card()).toBeNull();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    render(HoverCardHarness);
    screen.getByRole("link", { name: "@ada" }).focus();
    await vi.advanceTimersByTimeAsync(500);
    screen.getByRole("link", { name: "View profile" }).focus();
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(card()).toBeNull();
    expect(screen.getByRole("link", { name: "@ada" })).toHaveFocus();
  });

  it("clears pending timers on unmount", async () => {
    const { unmount } = render(HoverCardHarness);
    await fireEvent.pointerEnter(root());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
