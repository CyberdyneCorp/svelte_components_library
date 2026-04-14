import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PixelTabs from "./PixelTabs.svelte";

const items = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gamma", disabled: true },
  { id: "d", label: "Delta" },
];

describe("PixelTabs", () => {
  it("renders tablist", () => {
    render(PixelTabs, { props: { items } });
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
  it("renders every tab", () => {
    render(PixelTabs, { props: { items } });
    expect(screen.getAllByRole("tab")).toHaveLength(4);
  });
  it("marks value as selected", () => {
    render(PixelTabs, { props: { items, value: "b" } });
    const beta = screen.getByRole("tab", { name: /Beta/ });
    expect(beta).toHaveAttribute("aria-selected", "true");
  });
  it("unselected tabs are not selected", () => {
    render(PixelTabs, { props: { items, value: "b" } });
    expect(screen.getByRole("tab", { name: /Alpha/ })).toHaveAttribute("aria-selected", "false");
  });
  it("clicking a tab fires onChange", async () => {
    const onChange = vi.fn();
    render(PixelTabs, { props: { items, onChange } });
    await fireEvent.click(screen.getByRole("tab", { name: /Alpha/ }));
    expect(onChange).toHaveBeenCalledWith("a");
  });
  it("disabled tab cannot be selected", async () => {
    const onChange = vi.fn();
    render(PixelTabs, { props: { items, onChange } });
    await fireEvent.click(screen.getByRole("tab", { name: /Gamma/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
  it("ArrowRight moves to next non-disabled", async () => {
    const onChange = vi.fn();
    render(PixelTabs, { props: { items, value: "b", onChange } });
    const beta = screen.getByRole("tab", { name: /Beta/ });
    await fireEvent.keyDown(beta, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("d");
  });
  it("ArrowLeft moves to previous", async () => {
    const onChange = vi.fn();
    render(PixelTabs, { props: { items, value: "d", onChange } });
    const delta = screen.getByRole("tab", { name: /Delta/ });
    await fireEvent.keyDown(delta, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("b");
  });
  it("ArrowRight wraps from last", async () => {
    const onChange = vi.fn();
    render(PixelTabs, { props: { items, value: "d", onChange } });
    const delta = screen.getByRole("tab", { name: /Delta/ });
    await fireEvent.keyDown(delta, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("a");
  });
  it("active tab has tabindex=0, others -1", () => {
    render(PixelTabs, { props: { items, value: "a" } });
    expect(screen.getByRole("tab", { name: /Alpha/ })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: /Beta/ })).toHaveAttribute("tabindex", "-1");
  });
  it("custom aria-label applies to tablist", () => {
    render(PixelTabs, { props: { items, ariaLabel: "Sections" } });
    expect(screen.getByRole("tablist", { name: "Sections" })).toBeInTheDocument();
  });
});
