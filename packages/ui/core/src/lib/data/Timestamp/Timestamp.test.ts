import { render, screen } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import Timestamp from "./Timestamp.svelte";

const now = new Date("2026-10-14T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);
const timeEl = (container: HTMLElement) => container.querySelector("time") as HTMLTimeElement;

describe("Timestamp", () => {
  it("renders relative past time with ISO datetime and absolute title", () => {
    const value = ago(3 * 60_000);
    const { container } = render(Timestamp, { props: { value, now, locale: "en", live: false } });
    const el = timeEl(container);
    expect(el).toHaveTextContent("3 minutes ago");
    expect(el).toHaveAttribute("datetime", value.toISOString());
    expect(el.getAttribute("title")).toBeTruthy();
  });

  it("uses calendar words and future phrasing", () => {
    render(Timestamp, { props: { value: ago(24 * 3_600_000), now, locale: "en", live: false } });
    expect(screen.getByText("yesterday")).toBeInTheDocument();
    render(Timestamp, { props: { value: ago(-2 * 3_600_000), now, locale: "en", live: false } });
    expect(screen.getByText("in 2 hours")).toBeInTheDocument();
  });

  it("renders absolute text in the given time zone without a title", () => {
    const { container } = render(Timestamp, {
      props: { value: now, now, format: "absolute", locale: "en-US", timeZone: "UTC" },
    });
    const el = timeEl(container);
    expect(el).toHaveTextContent("Oct 14, 2026, 12:00 PM");
    expect(el).not.toHaveAttribute("title");
  });

  it("renders absolute then relative text in both mode", () => {
    const { container } = render(Timestamp, {
      props: { value: ago(60_000), now, format: "both", locale: "en-US", timeZone: "UTC", live: false },
    });
    expect(timeEl(container)).toHaveTextContent("Oct 14, 2026, 11:59 AM (1 minute ago)");
  });

  it("shows the invalid label without a datetime", () => {
    const { container } = render(Timestamp, { props: { value: "not a date" } });
    const el = timeEl(container);
    expect(el).toHaveTextContent("Invalid date");
    expect(el).not.toHaveAttribute("datetime");
  });

  it("accepts a translated invalid label", () => {
    render(Timestamp, { props: { value: "nope", invalidLabel: "Data inválida" } });
    expect(screen.getByText("Data inválida")).toBeInTheDocument();
  });
});

describe("Timestamp live updates", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("moves from seconds to minutes as time passes", async () => {
    const { container } = render(Timestamp, { props: { value: ago(50_000), now, locale: "en" } });
    expect(timeEl(container)).toHaveTextContent("50 seconds ago");
    await vi.advanceTimersByTimeAsync(20_000);
    expect(timeEl(container)).toHaveTextContent("1 minute ago");
  });

  it("does not update when live is false", async () => {
    const { container } = render(Timestamp, { props: { value: ago(50_000), now, locale: "en", live: false } });
    await vi.advanceTimersByTimeAsync(20_000);
    expect(timeEl(container)).toHaveTextContent("50 seconds ago");
  });

  it("clears its timer on unmount", () => {
    const { unmount } = render(Timestamp, { props: { value: ago(50_000), now, locale: "en" } });
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
