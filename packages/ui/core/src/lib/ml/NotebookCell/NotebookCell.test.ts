import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import NotebookCell from "./NotebookCell.svelte";

describe("NotebookCell", () => {
  it("renders with default props", () => {
    render(NotebookCell);
    const el = document.querySelector(".cy-nc");
    expect(el).toBeInTheDocument();
  });

  it("displays cell number", () => {
    render(NotebookCell, { props: { cellNumber: 5 } });
    expect(screen.getByText("[5]")).toBeInTheDocument();
  });

  it("displays the language badge", () => {
    render(NotebookCell, { props: { language: "python" } });
    expect(screen.getByText("python")).toBeInTheDocument();
  });

  it("renders a textarea for code input", () => {
    render(NotebookCell, { props: { cellNumber: 1 } });
    expect(screen.getByLabelText("Code cell 1")).toBeInTheDocument();
  });

  it("calls onrun when run button is clicked", async () => {
    const onrun = vi.fn();
    render(NotebookCell, { props: { onrun } });
    const runBtn = screen.getByTitle("Run cell (Ctrl+Enter)");
    await fireEvent.click(runBtn);
    expect(onrun).toHaveBeenCalledOnce();
  });
});
