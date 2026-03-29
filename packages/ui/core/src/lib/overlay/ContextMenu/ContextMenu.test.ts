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
});
