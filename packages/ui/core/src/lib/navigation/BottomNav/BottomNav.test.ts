import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import BottomNav from "./BottomNav.svelte";

const items = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "search", label: "Search", icon: "⌕" },
  { id: "notifications", label: "Notifications", icon: "🔔", badge: 3 },
];

describe("BottomNav", () => {
  it("renders the navigation", () => {
    render(BottomNav, { props: { items, activeId: "home" } });
    expect(screen.getByRole("navigation", { name: "Bottom navigation" })).toBeInTheDocument();
  });

  it("displays all items", () => {
    render(BottomNav, { props: { items, activeId: "home" } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("marks active item", () => {
    render(BottomNav, { props: { items, activeId: "home" } });
    const homeBtn = screen.getByText("Home").closest("button");
    expect(homeBtn?.className).toContain("active");
  });

  it("displays badge", () => {
    render(BottomNav, { props: { items, activeId: "home" } });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onchange when item is clicked", async () => {
    const onchange = vi.fn();
    render(BottomNav, { props: { items, activeId: "home", onchange } });
    await fireEvent.click(screen.getByText("Search"));
    expect(onchange).toHaveBeenCalledWith("search");
  });
});
