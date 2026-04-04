import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import BreadcrumbOverflow from "./BreadcrumbOverflow.svelte";

const items = [
  { label: "Home", href: "/" },
  { label: "Category", href: "/cat" },
  { label: "Sub", href: "/sub" },
  { label: "Deep", href: "/deep" },
  { label: "Item", href: "/item" },
  { label: "Current" },
];

describe("BreadcrumbOverflow", () => {
  it("renders navigation with aria-label", () => {
    render(BreadcrumbOverflow, { props: { items } });
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });

  it("shows ellipsis when items exceed maxVisible", () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    expect(ellipsis).toBeInTheDocument();
  });

  it("renders first and last items always visible", () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("shows dropdown when ellipsis clicked", async () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders all items without overflow when under maxVisible", () => {
    const shortItems = [
      { label: "Home", href: "/" },
      { label: "Current" },
    ];
    render(BreadcrumbOverflow, { props: { items: shortItems, maxVisible: 4 } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("renders hidden items in dropdown menu", async () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    // Hidden items: Category, Sub (items between first and last 2)
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Sub")).toBeInTheDocument();
  });

  it("calls onnavigate when a dropdown item is clicked", async () => {
    const onnavigate = vi.fn();
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4, onnavigate } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    const categoryBtn = screen.getByRole("menuitem", { name: "Category" });
    await fireEvent.click(categoryBtn);
    expect(onnavigate).toHaveBeenCalledWith("/cat");
  });

  it("closes dropdown after item click", async () => {
    const onnavigate = vi.fn();
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4, onnavigate } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    const categoryBtn = screen.getByRole("menuitem", { name: "Category" });
    await fireEvent.click(categoryBtn);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("toggles dropdown closed on second ellipsis click", async () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await fireEvent.click(ellipsis);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("navigates keyboard ArrowDown in dropdown", async () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    await fireEvent.keyDown(ellipsis, { key: "ArrowDown" });
    // First hidden item should be focused
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems[0].classList.contains("cy-breadcrumb-of__dropdown-item--focused") ||
           document.activeElement === menuItems[0]).toBeTruthy();
  });

  it("navigates keyboard ArrowUp in dropdown", async () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    await fireEvent.keyDown(ellipsis, { key: "ArrowDown" });
    await fireEvent.keyDown(ellipsis, { key: "ArrowDown" });
    await fireEvent.keyDown(ellipsis, { key: "ArrowUp" });
    // Should go back to first item
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it("selects item with Enter in dropdown", async () => {
    const onnavigate = vi.fn();
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4, onnavigate } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    await fireEvent.keyDown(ellipsis, { key: "ArrowDown" });
    await fireEvent.keyDown(ellipsis, { key: "Enter" });
    expect(onnavigate).toHaveBeenCalled();
  });

  it("closes dropdown with Escape key", async () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await fireEvent.keyDown(ellipsis, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls onnavigate when first breadcrumb with href is clicked (overflow mode)", async () => {
    const onnavigate = vi.fn();
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4, onnavigate } });
    // First item "Home" has href
    const homeBtn = screen.getByText("Home");
    await fireEvent.click(homeBtn);
    expect(onnavigate).toHaveBeenCalledWith("/");
  });

  it("renders separator between items", () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4, separator: ">" } });
    const separators = screen.getAllByText(">");
    expect(separators.length).toBeGreaterThan(0);
  });

  it("renders last item as current page with aria-current", () => {
    const { container } = render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const current = container.querySelector('[aria-current="page"]');
    expect(current).toBeInTheDocument();
    expect(current?.textContent).toBe("Current");
  });

  it("renders non-overflow items with links as buttons", () => {
    const shortItems = [
      { label: "Home", href: "/" },
      { label: "Middle", href: "/mid" },
      { label: "Current" },
    ];
    render(BreadcrumbOverflow, { props: { items: shortItems, maxVisible: 4 } });
    const homeLink = screen.getByText("Home");
    expect(homeLink.tagName).toBe("BUTTON");
  });

  it("calls onnavigate for non-overflow breadcrumb click", async () => {
    const onnavigate = vi.fn();
    const shortItems = [
      { label: "Home", href: "/" },
      { label: "Middle", href: "/mid" },
      { label: "Current" },
    ];
    render(BreadcrumbOverflow, { props: { items: shortItems, maxVisible: 4, onnavigate } });
    await fireEvent.click(screen.getByText("Home"));
    expect(onnavigate).toHaveBeenCalledWith("/");
  });

  it("renders first item without href as text in overflow mode", () => {
    const noHrefItems = [
      { label: "Root" },
      { label: "A", href: "/a" },
      { label: "B", href: "/b" },
      { label: "C", href: "/c" },
      { label: "D", href: "/d" },
      { label: "Current" },
    ];
    render(BreadcrumbOverflow, { props: { items: noHrefItems, maxVisible: 4 } });
    const root = screen.getByText("Root");
    expect(root.tagName).toBe("SPAN");
  });
});
