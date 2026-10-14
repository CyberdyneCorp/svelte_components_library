import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, it, expect, vi } from "vitest";
import SavedViews from "./SavedViews.svelte";
import type { SavedView } from "./types.js";

const views: SavedView<{ q: string }>[] = [
  { id: "all", name: "All", state: { q: "" }, builtin: true },
  { id: "mine", name: "Mine", state: { q: "owner:me" } },
];

function setup(props: Record<string, unknown> = {}) {
  const handlers = {
    onselect: vi.fn(),
    onsave: vi.fn(),
    onupdate: vi.fn(),
    onrename: vi.fn(),
    ondelete: vi.fn(),
  };
  render(SavedViews, { props: { views, activeId: "all", ...handlers, ...props } });
  return handlers;
}

async function openMenu() {
  await fireEvent.click(screen.getByRole("button", { name: "View actions" }));
  return screen.getByRole("menu");
}

describe("SavedViews", () => {
  it("selects a view", async () => {
    const { onselect } = setup();
    const select = screen.getByRole("combobox", { name: "View" });
    expect(select).toHaveValue("all");
    await fireEvent.change(select, { target: { value: "mine" } });
    expect(onselect).toHaveBeenCalledWith(views[1]);
    expect(select).toHaveValue("mine");
  });

  it("shows a Modified badge only while dirty", () => {
    setup({ dirty: true });
    expect(screen.getByText("Modified")).toBeInTheDocument();
  });

  it("saves the current state as a new view, rejecting duplicate names", async () => {
    const { onsave } = setup({ dirty: true });
    await fireEvent.click(screen.getByRole("button", { name: "Save as new view" }));
    const dialog = screen.getByRole("dialog");
    const input = within(dialog).getByRole("textbox", { name: "View name" });
    const confirm = within(dialog).getByRole("button", { name: "Save" });
    expect(confirm).toBeDisabled();
    await fireEvent.input(input, { target: { value: "mine " } });
    expect(confirm).toBeDisabled();
    expect(within(dialog).getByText("A view with this name already exists")).toBeInTheDocument();
    await fireEvent.input(input, { target: { value: "  Mine open " } });
    expect(confirm).toBeEnabled();
    await fireEvent.click(confirm);
    expect(onsave).toHaveBeenCalledWith("Mine open");
    await tick();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("submits the name with Enter", async () => {
    const { onsave } = setup();
    await fireEvent.click(screen.getByRole("button", { name: "Save as new view" }));
    const input = screen.getByRole("textbox", { name: "View name" });
    await fireEvent.input(input, { target: { value: "Open" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onsave).toHaveBeenCalledWith("Open");
  });

  it("keeps built-in views read-only", async () => {
    const { onupdate } = setup({ dirty: true });
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
    const menu = await openMenu();
    const items = within(menu).getAllByRole("menuitem").map((i) => i.textContent?.trim());
    expect(items).toEqual(["Save as new view"]);
    expect(onupdate).not.toHaveBeenCalled();
  });

  it("updates an editable dirty view with the primary action", async () => {
    const { onupdate } = setup({ activeId: "mine", dirty: true });
    await fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onupdate).toHaveBeenCalledWith(views[1]);
  });

  it("offers Save as new when the view is clean or onupdate is missing", () => {
    setup({ activeId: "mine", dirty: true, onupdate: undefined });
    expect(screen.getByRole("button", { name: "Save as new view" })).toBeInTheDocument();
  });

  it("renames the active view, allowing its own name", async () => {
    const { onrename } = setup({ activeId: "mine" });
    const menu = await openMenu();
    await fireEvent.click(within(menu).getByRole("menuitem", { name: "Rename" }));
    const dialog = screen.getByRole("dialog", { name: "Rename “Mine”" });
    const input = within(dialog).getByRole("textbox", { name: "View name" });
    expect(input).toHaveValue("Mine");
    const confirm = within(dialog).getByRole("button", { name: "Save" });
    expect(confirm).toBeEnabled();
    await fireEvent.input(input, { target: { value: "all" } });
    expect(confirm).toBeDisabled();
    await fireEvent.input(input, { target: { value: "My open items" } });
    await fireEvent.click(confirm);
    expect(onrename).toHaveBeenCalledWith(views[1], "My open items");
  });

  it("deletes the active view after confirmation", async () => {
    const { ondelete } = setup({ activeId: "mine" });
    const menu = await openMenu();
    await fireEvent.click(within(menu).getByRole("menuitem", { name: "Delete" }));
    const dialog = screen.getByRole("dialog", { name: "Delete “Mine”?" });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(ondelete).toHaveBeenCalledWith(views[1]);
  });

  it("hides Rename and Delete without their callbacks", async () => {
    setup({ activeId: "mine", onrename: undefined, ondelete: undefined });
    const menu = await openMenu();
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(1);
  });

  it("closes the name dialog on cancel without saving", async () => {
    const { onsave } = setup();
    await fireEvent.click(screen.getByRole("button", { name: "Save as new view" }));
    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onsave).not.toHaveBeenCalled();
  });

  it("does not touch browser storage", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const { onsave } = setup();
    await fireEvent.click(screen.getByRole("button", { name: "Save as new view" }));
    await fireEvent.input(screen.getByRole("textbox", { name: "View name" }), { target: { value: "X" } });
    await fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onsave).toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled();
  });
});
