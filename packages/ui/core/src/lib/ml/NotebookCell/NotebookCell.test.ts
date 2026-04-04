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

  it("calls ondelete when delete button is clicked", async () => {
    const ondelete = vi.fn();
    render(NotebookCell, { props: { ondelete } });
    const deleteBtn = screen.getByTitle("Delete cell");
    await fireEvent.click(deleteBtn);
    expect(ondelete).toHaveBeenCalledOnce();
  });

  it("calls onrun on Ctrl+Enter keydown", async () => {
    const onrun = vi.fn();
    render(NotebookCell, { props: { onrun, cellNumber: 1 } });
    const textarea = screen.getByLabelText("Code cell 1");
    await fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    expect(onrun).toHaveBeenCalledOnce();
  });

  it("calls onrun on Meta+Enter keydown", async () => {
    const onrun = vi.fn();
    render(NotebookCell, { props: { onrun, cellNumber: 1 } });
    const textarea = screen.getByLabelText("Code cell 1");
    await fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });
    expect(onrun).toHaveBeenCalledOnce();
  });

  it("does not call onrun on plain Enter keydown", async () => {
    const onrun = vi.fn();
    render(NotebookCell, { props: { onrun, cellNumber: 1 } });
    const textarea = screen.getByLabelText("Code cell 1");
    await fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onrun).not.toHaveBeenCalled();
  });

  it("displays text output", () => {
    render(NotebookCell, { props: { output: "Hello World", outputType: "text" } });
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("displays error output with error class", () => {
    const { container } = render(NotebookCell, {
      props: { output: "Error: something", outputType: "error", status: "error" },
    });
    const errorOutput = container.querySelector(".cy-nc__output--error");
    expect(errorOutput).toBeInTheDocument();
    expect(screen.getByText("Error: something")).toBeInTheDocument();
  });

  it("displays image output", () => {
    const { container } = render(NotebookCell, {
      props: { output: "https://example.com/plot.png", outputType: "image" },
    });
    const img = container.querySelector(".cy-nc__output-img") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("plot.png");
  });

  it("displays HTML output", () => {
    const { container } = render(NotebookCell, {
      props: { output: "<strong>Bold</strong>", outputType: "html" },
    });
    const strong = container.querySelector("strong");
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe("Bold");
  });

  it("sanitizes HTML output removing script tags", () => {
    const { container } = render(NotebookCell, {
      props: { output: '<div>Safe</div><script>alert("xss")</script>', outputType: "html" },
    });
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(screen.getByText("Safe")).toBeInTheDocument();
  });

  it("toggles output collapsed state", async () => {
    const { container } = render(NotebookCell, {
      props: { output: "some output", outputType: "text" },
    });
    expect(screen.getByText("some output")).toBeInTheDocument();
    const toggle = container.querySelector(".cy-nc__output-toggle")!;
    await fireEvent.click(toggle);
    expect(screen.queryByText("some output")).not.toBeInTheDocument();
    // Click again to expand
    await fireEvent.click(toggle);
    expect(screen.getByText("some output")).toBeInTheDocument();
  });

  it("displays line numbers in gutter", () => {
    render(NotebookCell, { props: { code: "line1\nline2\nline3" } });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows spinner when status is running", () => {
    const { container } = render(NotebookCell, { props: { status: "running" } });
    const spinner = container.querySelector(".cy-nc__spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("shows success icon when status is success", () => {
    const { container } = render(NotebookCell, { props: { status: "success" } });
    const nc = container.querySelector(".cy-nc--success");
    expect(nc).toBeInTheDocument();
  });

  it("shows error icon when status is error", () => {
    const { container } = render(NotebookCell, { props: { status: "error" } });
    const nc = container.querySelector(".cy-nc--error");
    expect(nc).toBeInTheDocument();
  });

  it("does not show output section when output is empty", () => {
    const { container } = render(NotebookCell, { props: { output: "" } });
    const outputWrapper = container.querySelector(".cy-nc__output-wrapper");
    expect(outputWrapper).not.toBeInTheDocument();
  });
});
