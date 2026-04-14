import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import RetroContextMenu from "./RetroContextMenu.svelte";

const items = [
  { id: "copy", label: "Copy", icon: "📋", shortcut: "⌘C" },
  { id: "cut", label: "Cut", shortcut: "⌘X" },
  { id: "sep", label: "", separator: true },
  { id: "paste", label: "Paste", shortcut: "⌘V" },
  { id: "off", label: "Off", disabled: true },
];

describe("RetroContextMenu", () => {
  it("does not render when closed", () => {
    render(RetroContextMenu, { props: { items } });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
  it("renders menu when open", () => {
    render(RetroContextMenu, { props: { items, open: true } });
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
  it("applies x/y position", () => {
    const { container } = render(RetroContextMenu, { props: { items, open: true, x: 100, y: 200 } });
    const el = container.querySelector<HTMLElement>(".cy-rctx")!;
    expect(el.style.left).toBe("100px");
    expect(el.style.top).toBe("200px");
  });
  it("renders items and shortcuts", () => {
    render(RetroContextMenu, { props: { items, open: true } });
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("⌘C")).toBeInTheDocument();
  });
  it("renders separator", () => {
    render(RetroContextMenu, { props: { items, open: true } });
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
  it("fires onSelect and onItemSelect", async () => {
    const onItemSelect = vi.fn();
    const onSelect = vi.fn();
    const { container } = render(RetroContextMenu, {
      props: {
        items: [{ id: "a", label: "A", onSelect }],
        open: true,
        onItemSelect,
      },
    });
    await fireEvent.click(screen.getByText("A"));
    expect(onSelect).toHaveBeenCalled();
    expect(onItemSelect).toHaveBeenCalledWith("a");
    expect(container.querySelector(".cy-rctx")).not.toBeInTheDocument();
  });
  it("skips disabled items", async () => {
    const onItemSelect = vi.fn();
    render(RetroContextMenu, { props: { items, open: true, onItemSelect } });
    await fireEvent.click(screen.getByText("Off"));
    expect(onItemSelect).not.toHaveBeenCalled();
  });
  it("closes on Escape", async () => {
    const { container } = render(RetroContextMenu, { props: { items, open: true } });
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(container.querySelector(".cy-rctx")).not.toBeInTheDocument();
  });
  it("closes on outside click", async () => {
    const { container } = render(RetroContextMenu, { props: { items, open: true } });
    await fireEvent.click(document.body);
    expect(container.querySelector(".cy-rctx")).not.toBeInTheDocument();
  });
  it("fires onClose when closed", async () => {
    const onClose = vi.fn();
    render(RetroContextMenu, { props: { items, open: true, onClose } });
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
