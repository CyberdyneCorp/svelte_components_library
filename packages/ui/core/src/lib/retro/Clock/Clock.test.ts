import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi, afterEach } from "vitest";
import Clock from "./Clock.svelte";

const fixed = new Date("2026-04-14T14:30:45Z");

afterEach(() => vi.useRealTimers());

describe("Clock", () => {
  it("renders timer role", () => {
    render(Clock, { props: { now: fixed } });
    expect(screen.getByRole("timer", { name: "Clock" })).toBeInTheDocument();
  });
  it("shows time", () => {
    render(Clock, { props: { now: fixed, locale: "en-US" } });
    expect(screen.getByTestId("cy-clock-time")).not.toBeEmptyDOMElement();
  });
  it("hides date by default", () => {
    render(Clock, { props: { now: fixed } });
    expect(screen.queryByTestId("cy-clock-date")).not.toBeInTheDocument();
  });
  it("shows date when showDate=true", () => {
    render(Clock, { props: { now: fixed, showDate: true } });
    expect(screen.getByTestId("cy-clock-date")).toBeInTheDocument();
  });
  it("formats with 12h when hour12=true", () => {
    render(Clock, { props: { now: fixed, locale: "en-US", hour12: true } });
    const txt = screen.getByTestId("cy-clock-time").textContent ?? "";
    expect(txt).toMatch(/AM|PM/i);
  });
  it("formats with 24h when hour12=false", () => {
    render(Clock, { props: { now: fixed, locale: "en-US", hour12: false } });
    const txt = screen.getByTestId("cy-clock-time").textContent ?? "";
    expect(txt).not.toMatch(/AM|PM/i);
  });
  it("shows seconds when showSeconds=true", () => {
    render(Clock, { props: { now: fixed, locale: "en-US", showSeconds: true, hour12: false } });
    const txt = screen.getByTestId("cy-clock-time").textContent ?? "";
    expect(txt.split(":").length).toBe(3);
  });
  it("ticks internal time when now not provided", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    render(Clock, { props: { tickIntervalMs: 1000 } });
    const before = screen.getByTestId("cy-clock-time").textContent;
    vi.setSystemTime(new Date("2026-01-01T12:30:00Z"));
    await vi.advanceTimersByTimeAsync(1000);
    const after = screen.getByTestId("cy-clock-time").textContent;
    expect(after).not.toBe(before);
  });
  it("does not tick when now is bound externally", () => {
    vi.useFakeTimers();
    render(Clock, { props: { now: fixed, tickIntervalMs: 1000 } });
    const before = screen.getByTestId("cy-clock-time").textContent;
    vi.advanceTimersByTime(5000);
    expect(screen.getByTestId("cy-clock-time").textContent).toBe(before);
  });
});
