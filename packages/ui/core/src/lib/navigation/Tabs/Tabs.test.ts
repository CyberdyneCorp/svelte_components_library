import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Tabs from "./Tabs.svelte";

const items = [
  { id: "tab1", label: "General" },
  { id: "tab2", label: "Settings" },
  { id: "tab3", label: "Advanced" },
];

describe("Tabs", () => {
  it("renders all tabs", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("marks active tab with aria-selected", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    const tab = screen.getByText("General");
    expect(tab).toHaveAttribute("aria-selected", "true");
  });

  it("has tablist role", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("calls onchange when tab is clicked", async () => {
    const onchange = vi.fn();
    render(Tabs, { props: { items, activeId: "tab1", onchange } });
    await fireEvent.click(screen.getByText("Settings"));
    expect(onchange).toHaveBeenCalledWith("tab2");
  });

  it("inactive tabs have tabindex -1", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    const settingsTab = screen.getByText("Settings");
    expect(settingsTab).toHaveAttribute("tabindex", "-1");
  });
});
