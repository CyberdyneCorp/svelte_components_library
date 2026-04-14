import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi, afterEach } from "vitest";
import BootScreen from "./BootScreen.svelte";

afterEach(() => vi.useRealTimers());

describe("BootScreen", () => {
  it("renders status role", () => {
    render(BootScreen);
    expect(screen.getByRole("status", { name: "Boot screen" })).toBeInTheDocument();
  });
  it("renders logo", () => {
    render(BootScreen, { props: { logo: "TestOS" } });
    expect(screen.getByText("TestOS")).toBeInTheDocument();
  });
  it("shows Ready immediately when lines empty", () => {
    render(BootScreen);
    expect(screen.getByTestId("cy-boot-ready")).toBeInTheDocument();
  });
  it("shows Ready immediately when autoStart=false", () => {
    render(BootScreen, { props: { lines: ["A", "B"], autoStart: false } });
    expect(screen.getByTestId("cy-boot-ready")).toBeInTheDocument();
  });
  it("types lines over time when autoStart=true", async () => {
    vi.useFakeTimers();
    render(BootScreen, { props: { lines: ["a", "b", "c"], typeSpeedMs: 100 } });
    expect(screen.queryByText(/\[OK\] a/)).not.toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(350);
    expect(screen.getByText(/\[OK\] a/)).toBeInTheDocument();
    expect(screen.getByText(/\[OK\] b/)).toBeInTheDocument();
    expect(screen.getByText(/\[OK\] c/)).toBeInTheDocument();
  });
  it("fires onDone when finished", async () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(BootScreen, { props: { lines: ["a"], typeSpeedMs: 50, onDone } });
    await vi.advanceTimersByTimeAsync(60);
    expect(onDone).toHaveBeenCalled();
  });
  it("fires onDone immediately when no lines", () => {
    const onDone = vi.fn();
    render(BootScreen, { props: { lines: [], onDone } });
    expect(onDone).toHaveBeenCalled();
  });
});
