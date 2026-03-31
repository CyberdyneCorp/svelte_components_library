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
    expect(screen.getByText("General")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Settings")).toHaveAttribute("aria-selected", "false");
  });

  it("has tablist role", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("all buttons have tab role", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("calls onchange when tab is clicked", async () => {
    const onchange = vi.fn();
    render(Tabs, { props: { items, activeId: "tab1", onchange } });
    await fireEvent.click(screen.getByText("Settings"));
    expect(onchange).toHaveBeenCalledWith("tab2");
  });

  it("active tab has tabindex 0", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    expect(screen.getByText("General")).toHaveAttribute("tabindex", "0");
  });

  it("inactive tabs have tabindex -1", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    expect(screen.getByText("Settings")).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText("Advanced")).toHaveAttribute("tabindex", "-1");
  });

  it("updates active tab on click", async () => {
    const onchange = vi.fn();
    render(Tabs, { props: { items, activeId: "tab1", onchange } });
    await fireEvent.click(screen.getByText("Advanced"));
    expect(onchange).toHaveBeenCalledWith("tab3");
  });

  // Keyboard navigation
  it("navigates right with ArrowRight", async () => {
    const onchange = vi.fn();
    render(Tabs, { props: { items, activeId: "tab1", onchange } });
    const generalTab = screen.getByText("General");
    await fireEvent.keyDown(generalTab, { key: "ArrowRight" });
    expect(onchange).toHaveBeenCalledWith("tab2");
  });

  it("navigates left with ArrowLeft", async () => {
    const onchange = vi.fn();
    render(Tabs, { props: { items, activeId: "tab2", onchange } });
    const settingsTab = screen.getByText("Settings");
    await fireEvent.keyDown(settingsTab, { key: "ArrowLeft" });
    expect(onchange).toHaveBeenCalledWith("tab1");
  });

  it("wraps around from last to first with ArrowRight", async () => {
    const onchange = vi.fn();
    render(Tabs, { props: { items, activeId: "tab3", onchange } });
    const advancedTab = screen.getByText("Advanced");
    await fireEvent.keyDown(advancedTab, { key: "ArrowRight" });
    expect(onchange).toHaveBeenCalledWith("tab1");
  });

  it("wraps around from first to last with ArrowLeft", async () => {
    const onchange = vi.fn();
    render(Tabs, { props: { items, activeId: "tab1", onchange } });
    const generalTab = screen.getByText("General");
    await fireEvent.keyDown(generalTab, { key: "ArrowLeft" });
    expect(onchange).toHaveBeenCalledWith("tab3");
  });

  it("does not navigate on other keys", async () => {
    const onchange = vi.fn();
    render(Tabs, { props: { items, activeId: "tab1", onchange } });
    const generalTab = screen.getByText("General");
    await fireEvent.keyDown(generalTab, { key: "ArrowDown" });
    expect(onchange).not.toHaveBeenCalled();
  });

  // Active class
  it("applies active class to current tab", () => {
    const { container } = render(Tabs, { props: { items, activeId: "tab2" } });
    const activeTab = container.querySelector(".cy-tabs__tab--active");
    expect(activeTab?.textContent).toBe("Settings");
  });

  it("does not apply active class to other tabs", () => {
    const { container } = render(Tabs, { props: { items, activeId: "tab2" } });
    const tabs = container.querySelectorAll(".cy-tabs__tab--active");
    expect(tabs).toHaveLength(1);
  });
});
