import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Kanban from "./Kanban.svelte";

const columns = [
  {
    id: "todo",
    title: "To Do",
    color: "#ff0000",
    items: [
      { id: "1", title: "Task 1", description: "Description 1", tags: ["bug"], assignee: "Alice", priority: "high" as const },
      { id: "2", title: "Task 2", priority: "low" as const },
    ],
  },
  {
    id: "done",
    title: "Done",
    items: [
      { id: "3", title: "Task 3", tags: ["feature", "docs"], priority: "critical" as const },
    ],
  },
];

describe("Kanban", () => {
  it("renders all columns", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders column item counts", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders card titles", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("renders card descriptions when present", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("Description 1")).toBeInTheDocument();
  });

  it("renders card tags", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("bug")).toBeInTheDocument();
    expect(screen.getByText("feature")).toBeInTheDocument();
    expect(screen.getByText("docs")).toBeInTheDocument();
  });

  it("renders card assignee", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("calls onitemclick when card is clicked", async () => {
    const onitemclick = vi.fn();
    render(Kanban, { props: { columns, onitemclick } });
    await fireEvent.click(screen.getByText("Task 1"));
    expect(onitemclick).toHaveBeenCalledWith(columns[0].items[0]);
  });

  it("calls onitemclick on Enter keydown", async () => {
    const onitemclick = vi.fn();
    render(Kanban, { props: { columns, onitemclick } });
    const card = screen.getByText("Task 1").closest("[role='button']")!;
    await fireEvent.keyDown(card, { key: "Enter" });
    expect(onitemclick).toHaveBeenCalledWith(columns[0].items[0]);
  });

  it("cards are draggable", () => {
    render(Kanban, { props: { columns } });
    const card = screen.getByText("Task 1").closest("[draggable='true']");
    expect(card).toBeInTheDocument();
  });

  it("columns have region role with proper aria-label", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByRole("region", { name: "To Do" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Done" })).toBeInTheDocument();
  });

  it("handles drag start", async () => {
    render(Kanban, { props: { columns } });
    const card = screen.getByText("Task 1").closest("[draggable='true']")!;
    const dataTransfer = { effectAllowed: "", setData: vi.fn() };
    await fireEvent.dragStart(card, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith("text/plain", "1");
  });

  it("handles drag over on column", async () => {
    render(Kanban, { props: { columns } });
    const col = screen.getByRole("region", { name: "Done" });
    await fireEvent.dragOver(col, { dataTransfer: { dropEffect: "" } });
    expect(col).toBeInTheDocument();
  });

  it("handles drag leave on column", async () => {
    render(Kanban, { props: { columns } });
    const col = screen.getByRole("region", { name: "Done" });
    await fireEvent.dragLeave(col);
    expect(col).toBeInTheDocument();
  });

  it("handles drop calls onmove", async () => {
    const onmove = vi.fn();
    render(Kanban, { props: { columns, onmove } });
    const card = screen.getByText("Task 1").closest("[draggable='true']")!;
    const doneCol = screen.getByRole("region", { name: "Done" });

    await fireEvent.dragStart(card, { dataTransfer: { effectAllowed: "", setData: vi.fn() } });
    await fireEvent.drop(doneCol, { dataTransfer: {} });
    expect(onmove).toHaveBeenCalledWith("1", "todo", "done");
  });

  it("does not call onmove when dropping on same column", async () => {
    const onmove = vi.fn();
    render(Kanban, { props: { columns, onmove } });
    const card = screen.getByText("Task 1").closest("[draggable='true']")!;
    const todoCol = screen.getByRole("region", { name: "To Do" });

    await fireEvent.dragStart(card, { dataTransfer: { effectAllowed: "", setData: vi.fn() } });
    await fireEvent.drop(todoCol, { dataTransfer: {} });
    expect(onmove).not.toHaveBeenCalled();
  });

  it("handles drag end resets state", async () => {
    render(Kanban, { props: { columns } });
    const card = screen.getByText("Task 1").closest("[draggable='true']")!;
    await fireEvent.dragEnd(card);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("renders with empty columns", () => {
    render(Kanban, { props: { columns: [] } });
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("renders column with no items", () => {
    const emptyCols = [{ id: "empty", title: "Empty Col", items: [] }];
    render(Kanban, { props: { columns: emptyCols } });
    expect(screen.getByText("Empty Col")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
