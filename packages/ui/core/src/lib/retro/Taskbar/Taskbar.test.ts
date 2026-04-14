import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Taskbar from "./Taskbar.svelte";

describe("Taskbar", () => {
  it("renders empty state when no items", () => {
    render(Taskbar, { props: { items: [] } });
    expect(screen.getByText("No open windows")).toBeInTheDocument();
  });

  it("renders all items", () => {
    render(Taskbar, {
      props: {
        items: [
          { id: "a", label: "Terminal" },
          { id: "b", label: "Team" },
        ],
      },
    });
    expect(screen.getByText("Terminal")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
  });

  it("has accessible toolbar role and label", () => {
    render(Taskbar, { props: { items: [], ariaLabel: "Bar" } });
    expect(screen.getByRole("toolbar", { name: "Bar" })).toBeInTheDocument();
  });

  it("renders icons when provided", () => {
    render(Taskbar, {
      props: { items: [{ id: "a", label: "T", icon: "💻" }] },
    });
    expect(screen.getByText("💻")).toBeInTheDocument();
  });

  it("marks active item with aria-pressed", () => {
    render(Taskbar, {
      props: {
        items: [
          { id: "a", label: "Terminal", active: true },
          { id: "b", label: "Team", active: false },
        ],
      },
    });
    expect(screen.getByText("Terminal").closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Team").closest("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("applies active modifier class", () => {
    const { container } = render(Taskbar, {
      props: { items: [{ id: "a", label: "T", active: true }] },
    });
    expect(container.querySelector(".cy-taskbar__item--active")).toBeInTheDocument();
  });

  it("applies minimized modifier class", () => {
    const { container } = render(Taskbar, {
      props: { items: [{ id: "a", label: "T", minimized: true }] },
    });
    expect(container.querySelector(".cy-taskbar__item--minimized")).toBeInTheDocument();
  });

  it("fires onItemClick with id", async () => {
    const onItemClick = vi.fn();
    render(Taskbar, {
      props: { items: [{ id: "terminal", label: "T" }], onItemClick },
    });
    await fireEvent.click(screen.getByText("T"));
    expect(onItemClick).toHaveBeenCalledWith("terminal");
  });

  it("applies bottom position class by default", () => {
    const { container } = render(Taskbar, { props: { items: [] } });
    expect(container.querySelector(".cy-taskbar--bottom")).toBeInTheDocument();
  });

  it("applies top position class", () => {
    const { container } = render(Taskbar, { props: { items: [], position: "top" } });
    expect(container.querySelector(".cy-taskbar--top")).toBeInTheDocument();
  });

  it("does not render empty message when items exist", () => {
    render(Taskbar, { props: { items: [{ id: "a", label: "T" }] } });
    expect(screen.queryByText("No open windows")).not.toBeInTheDocument();
  });
});
