import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ContextMenu from "./ContextMenu.svelte";

describe("ContextMenu", () => {
  const items = [
    { label: "Copy", icon: "copy", onclick: vi.fn() },
    { label: "Delete", icon: "delete", onclick: vi.fn(), variant: "danger" as const },
  ];

  it("renders trigger area", () => {
    const { container } = render(ContextMenu, { props: { items } });
    const trigger = container.querySelector(".cy-context-trigger");
    expect(trigger).toBeInTheDocument();
  });

  it("does not show menu by default", () => {
    const { container } = render(ContextMenu, { props: { items } });
    const menu = container.querySelector(".cy-context-menu");
    expect(menu).not.toBeInTheDocument();
  });

  it("shows menu on context menu event", async () => {
    const { container } = render(ContextMenu, { props: { items } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    const menu = container.querySelector("[role='menu']");
    expect(menu).toBeInTheDocument();
  });

  it("renders menu items with correct role", async () => {
    const { container } = render(ContextMenu, { props: { items } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);
  });

  it("displays item labels", async () => {
    const { container } = render(ContextMenu, { props: { items } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls item onclick when menu item is clicked", async () => {
    const copyFn = vi.fn();
    const menuItems = [
      { label: "Copy", icon: "copy", onclick: copyFn },
    ];
    const { container } = render(ContextMenu, { props: { items: menuItems } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    await fireEvent.click(screen.getByText("Copy"));
    expect(copyFn).toHaveBeenCalled();
  });

  it("hides menu after item click", async () => {
    const { container } = render(ContextMenu, { props: { items } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    expect(container.querySelector("[role='menu']")).toBeInTheDocument();
    await fireEvent.click(screen.getByText("Copy"));
    expect(container.querySelector("[role='menu']")).not.toBeInTheDocument();
  });

  it("applies danger variant class to danger items", async () => {
    const { container } = render(ContextMenu, { props: { items } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    const dangerItem = container.querySelector(".cy-context-menu__item--danger");
    expect(dangerItem).toBeInTheDocument();
    expect(dangerItem?.textContent).toContain("Delete");
  });

  it("renders icons for items with known icon names", async () => {
    const { container } = render(ContextMenu, { props: { items } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    const icons = container.querySelectorAll(".cy-context-menu__icon");
    expect(icons.length).toBe(2); // copy and delete both have icons
  });

  it("positions menu at contextmenu event coordinates", async () => {
    const { container } = render(ContextMenu, { props: { items } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger, { clientX: 200, clientY: 300 });
    const menu = container.querySelector(".cy-context-menu") as HTMLElement;
    expect(menu.style.left).toBe("200px");
    expect(menu.style.top).toBe("300px");
  });

  it("does not render menu items without icon path", async () => {
    const noIconItems = [
      { label: "Action", onclick: vi.fn() },
    ];
    const { container } = render(ContextMenu, { props: { items: noIconItems } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    const icons = container.querySelectorAll(".cy-context-menu__icon");
    expect(icons.length).toBe(0);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders items with unknown icon name without icon svg", async () => {
    const unknownIconItems = [
      { label: "Mystery", icon: "nonexistent", onclick: vi.fn() },
    ];
    const { container } = render(ContextMenu, { props: { items: unknownIconItems } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    const icons = container.querySelectorAll(".cy-context-menu__icon");
    expect(icons.length).toBe(0);
    expect(screen.getByText("Mystery")).toBeInTheDocument();
  });

  it("renders all known icon types", async () => {
    const allIconItems = [
      { label: "Copy", icon: "copy", onclick: vi.fn() },
      { label: "Edit", icon: "edit", onclick: vi.fn() },
      { label: "Delete", icon: "delete", onclick: vi.fn() },
      { label: "Download", icon: "download", onclick: vi.fn() },
      { label: "Share", icon: "share", onclick: vi.fn() },
    ];
    const { container } = render(ContextMenu, { props: { items: allIconItems } });
    const trigger = container.querySelector(".cy-context-trigger")!;
    await fireEvent.contextMenu(trigger);
    const icons = container.querySelectorAll(".cy-context-menu__icon");
    expect(icons.length).toBe(5);
  });
});
