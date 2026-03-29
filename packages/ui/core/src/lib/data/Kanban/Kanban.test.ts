import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Kanban from "./Kanban.svelte";

const columns = [
  {
    id: "todo",
    title: "To Do",
    items: [
      { id: "1", title: "Task 1", description: "First task" },
      { id: "2", title: "Task 2", tags: ["bug"] },
    ],
  },
  {
    id: "done",
    title: "Done",
    items: [{ id: "3", title: "Task 3" }],
  },
];

describe("Kanban", () => {
  it("renders column titles", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders card titles", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("renders item counts per column", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders card descriptions", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("First task")).toBeInTheDocument();
  });

  it("renders tags on cards", () => {
    render(Kanban, { props: { columns } });
    expect(screen.getByText("bug")).toBeInTheDocument();
  });
});
