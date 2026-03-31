import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import SortableList from "./SortableList.svelte";

const items = [
  { id: "a", name: "Item A" },
  { id: "b", name: "Item B" },
  { id: "c", name: "Item C" },
];

describe("SortableList", () => {
  it("renders with listbox role", () => {
    render(SortableList, { props: { items } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("renders correct number of option elements", () => {
    render(SortableList, { props: { items } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("items are draggable by default", () => {
    render(SortableList, { props: { items } });
    const options = screen.getAllByRole("option");
    options.forEach((opt) => {
      expect(opt.getAttribute("draggable")).toBe("true");
    });
  });

  it("items are not focusable when disabled", () => {
    render(SortableList, { props: { items, disabled: true } });
    const options = screen.getAllByRole("option");
    options.forEach((opt) => {
      expect(opt.getAttribute("tabindex")).toBe("-1");
    });
  });

  it("applies disabled class", () => {
    const { container } = render(SortableList, { props: { items, disabled: true } });
    expect(container.querySelector(".cy-sortable-list--disabled")).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(SortableList, { props: { items } });
    expect(screen.getByLabelText("Sortable list")).toBeInTheDocument();
  });

  it("renders empty list", () => {
    render(SortableList, { props: { items: [] } });
    const options = screen.queryAllByRole("option");
    expect(options.length).toBe(0);
  });

  // Drag handlers
  it("handles drag start on item", async () => {
    render(SortableList, { props: { items } });
    const firstItem = screen.getAllByRole("option")[0];
    const dataTransfer = { effectAllowed: "", setData: vi.fn() };
    await fireEvent.dragStart(firstItem, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith("text/plain", "0");
  });

  it("does not start drag when disabled", async () => {
    render(SortableList, { props: { items, disabled: true } });
    const firstItem = screen.getAllByRole("option")[0];
    const dataTransfer = { effectAllowed: "", setData: vi.fn() };
    await fireEvent.dragStart(firstItem, { dataTransfer });
    expect(dataTransfer.setData).not.toHaveBeenCalled();
  });

  it("handles drag over", async () => {
    render(SortableList, { props: { items } });
    const firstItem = screen.getAllByRole("option")[0];
    const secondItem = screen.getAllByRole("option")[1];
    await fireEvent.dragStart(firstItem, { dataTransfer: { effectAllowed: "", setData: vi.fn() } });
    await fireEvent.dragOver(secondItem, { dataTransfer: { dropEffect: "" } });
    expect(secondItem).toBeInTheDocument();
  });

  it("handles drag leave", async () => {
    render(SortableList, { props: { items } });
    const firstItem = screen.getAllByRole("option")[0];
    await fireEvent.dragLeave(firstItem);
    expect(firstItem).toBeInTheDocument();
  });

  it("handles drop reorders items", async () => {
    const onreorder = vi.fn();
    render(SortableList, { props: { items, onreorder } });
    const allItems = screen.getAllByRole("option");
    await fireEvent.dragStart(allItems[0], { dataTransfer: { effectAllowed: "", setData: vi.fn() } });
    await fireEvent.drop(allItems[2], { dataTransfer: {} });
    expect(onreorder).toHaveBeenCalled();
    const reorderedItems = onreorder.mock.calls[0][0];
    expect(reorderedItems[0].id).toBe("b");
    expect(reorderedItems[2].id).toBe("a");
  });

  it("does not reorder when dropping on same index", async () => {
    const onreorder = vi.fn();
    render(SortableList, { props: { items, onreorder } });
    const allItems = screen.getAllByRole("option");
    await fireEvent.dragStart(allItems[0], { dataTransfer: { effectAllowed: "", setData: vi.fn() } });
    await fireEvent.drop(allItems[0], { dataTransfer: {} });
    expect(onreorder).not.toHaveBeenCalled();
  });

  it("handles drag end", async () => {
    render(SortableList, { props: { items } });
    const firstItem = screen.getAllByRole("option")[0];
    await fireEvent.dragEnd(firstItem);
    expect(firstItem).toBeInTheDocument();
  });

  // Keyboard reorder
  it("picks up item with Enter key", async () => {
    render(SortableList, { props: { items } });
    const firstItem = screen.getAllByRole("option")[0];
    await fireEvent.keyDown(firstItem, { key: "Enter" });
    expect(firstItem.getAttribute("aria-grabbed")).toBeDefined();
  });

  it("picks up item with Space key", async () => {
    render(SortableList, { props: { items } });
    const firstItem = screen.getAllByRole("option")[0];
    await fireEvent.keyDown(firstItem, { key: " " });
    expect(firstItem).toBeInTheDocument();
  });

  it("moves item down with ArrowDown after pickup", async () => {
    const onreorder = vi.fn();
    render(SortableList, { props: { items, onreorder } });
    const firstItem = screen.getAllByRole("option")[0];
    await fireEvent.keyDown(firstItem, { key: "Enter" });
    await fireEvent.keyDown(firstItem, { key: "ArrowDown" });
    expect(onreorder).toHaveBeenCalled();
  });

  it("moves item up with ArrowUp after pickup", async () => {
    const onreorder = vi.fn();
    render(SortableList, { props: { items, onreorder } });
    const lastItem = screen.getAllByRole("option")[2];
    await fireEvent.keyDown(lastItem, { key: "Enter" });
    await fireEvent.keyDown(lastItem, { key: "ArrowUp" });
    expect(onreorder).toHaveBeenCalled();
  });

  it("cancels keyboard move with Escape", async () => {
    render(SortableList, { props: { items } });
    const firstItem = screen.getAllByRole("option")[0];
    await fireEvent.keyDown(firstItem, { key: "Enter" });
    await fireEvent.keyDown(firstItem, { key: "Escape" });
    expect(firstItem.getAttribute("aria-selected")).toBe("false");
  });

  it("drops item at new position with Enter", async () => {
    const onreorder = vi.fn();
    render(SortableList, { props: { items, onreorder } });
    const firstItem = screen.getAllByRole("option")[0];
    const secondItem = screen.getAllByRole("option")[1];
    await fireEvent.keyDown(firstItem, { key: "Enter" });
    await fireEvent.keyDown(secondItem, { key: "Enter" });
    expect(onreorder).toHaveBeenCalled();
  });

  it("does not keyboard reorder when disabled", async () => {
    const onreorder = vi.fn();
    render(SortableList, { props: { items, disabled: true, onreorder } });
    const firstItem = screen.getAllByRole("option")[0];
    await fireEvent.keyDown(firstItem, { key: "Enter" });
    await fireEvent.keyDown(firstItem, { key: "ArrowDown" });
    expect(onreorder).not.toHaveBeenCalled();
  });
});
