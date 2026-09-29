import { render, screen, fireEvent, within } from "@testing-library/svelte";
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

  it("names the tablist with ariaLabel and omits it by default", () => {
    const { unmount } = render(Tabs, { props: { items, activeId: "tab1" } });
    expect(screen.getByRole("tablist")).not.toHaveAttribute("aria-label");
    unmount();
    render(Tabs, { props: { items, activeId: "tab1", ariaLabel: "Settings sections" } });
    expect(screen.getByRole("tablist", { name: "Settings sections" })).toBeInTheDocument();
  });

  it("renders no navigation landmark or links for button tabs", () => {
    render(Tabs, { props: { items, activeId: "tab1" } });
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  describe("link tabs", () => {
    const links = [
      { id: "overview", label: "Overview", href: "/wallet/overview" },
      { id: "activity", label: "Activity", href: "/wallet/activity" },
      { id: "settings", label: "Settings", href: "/wallet/settings" },
    ];

    it("renders links inside a named navigation landmark", () => {
      render(Tabs, { props: { items: links, activeId: "activity", ariaLabel: "Wallet sections" } });
      const nav = screen.getByRole("navigation", { name: "Wallet sections" });
      const anchors = within(nav).getAllByRole("link");
      expect(anchors.map((a) => a.getAttribute("href"))).toEqual(links.map((l) => l.href));
    });

    it("is not an ARIA tab widget", () => {
      render(Tabs, { props: { items: links, activeId: "overview" } });
      expect(screen.queryByRole("tablist")).toBeNull();
      expect(screen.queryAllByRole("tab")).toHaveLength(0);
      for (const link of screen.getAllByRole("link")) {
        expect(link).not.toHaveAttribute("aria-selected");
        expect(link).not.toHaveAttribute("tabindex");
      }
    });

    it("marks only the active link with aria-current=page", () => {
      render(Tabs, { props: { items: links, activeId: "activity" } });
      expect(screen.getByRole("link", { name: "Activity" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Activity" })).toHaveClass("cy-tabs__tab--active");
      expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
      expect(screen.getByRole("link", { name: "Settings" })).not.toHaveAttribute("aria-current");
    });

    it("renders the links as a list", () => {
      render(Tabs, { props: { items: links, activeId: "overview" } });
      expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(3);
    });

    it("leaves arrow keys to the browser", async () => {
      const onchange = vi.fn();
      render(Tabs, { props: { items: links, activeId: "overview", onchange } });
      const first = screen.getByRole("link", { name: "Overview" });
      const notPrevented = await fireEvent.keyDown(first, { key: "ArrowRight" });
      expect(notPrevented).toBe(true);
      expect(onchange).not.toHaveBeenCalled();
    });
  });
});
