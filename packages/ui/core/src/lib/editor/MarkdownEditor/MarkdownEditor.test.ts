import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import MarkdownEditor from "./MarkdownEditor.svelte";

describe("MarkdownEditor", () => {
  it("renders the component", () => {
    render(MarkdownEditor);
    const el = document.querySelector(".cy-md-editor");
    expect(el).toBeInTheDocument();
  });

  it("renders a textarea in default split mode", () => {
    render(MarkdownEditor);
    const textarea = document.querySelector("textarea");
    expect(textarea).toBeInTheDocument();
  });

  it("applies placeholder text", () => {
    render(MarkdownEditor, { props: { placeholder: "Type here..." } });
    const textarea = document.querySelector("textarea");
    expect(textarea).toHaveAttribute("placeholder", "Type here...");
  });

  it("shows toolbar when showToolbar is true and not in preview mode", () => {
    render(MarkdownEditor, { props: { showToolbar: true } });
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("hides toolbar when showToolbar is false", () => {
    render(MarkdownEditor, { props: { showToolbar: false } });
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar).not.toBeInTheDocument();
  });

  it("hides toolbar in readonly mode", () => {
    render(MarkdownEditor, { props: { readonly: true } });
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar).not.toBeInTheDocument();
  });

  it("renders mode tabs", () => {
    render(MarkdownEditor);
    const editBtn = screen.getByText("Edit");
    const splitBtn = screen.getByText("Split");
    const previewBtn = screen.getByText("Preview");
    expect(editBtn).toBeInTheDocument();
    expect(splitBtn).toBeInTheDocument();
    expect(previewBtn).toBeInTheDocument();
  });

  it("applies custom height style", () => {
    render(MarkdownEditor, { props: { height: "800px" } });
    const el = document.querySelector(".cy-md-editor") as HTMLElement;
    expect(el.style.height).toBe("800px");
  });

  it("shows label when provided", () => {
    render(MarkdownEditor, { props: { label: "My Editor" } });
    const label = document.querySelector(".cy-md-editor__label");
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toBe("My Editor");
  });

  it("does not show label when not provided", () => {
    render(MarkdownEditor);
    const label = document.querySelector(".cy-md-editor__label");
    expect(label).not.toBeInTheDocument();
  });

  // Mode switching
  it("defaults to split mode", () => {
    render(MarkdownEditor);
    const splitBtn = screen.getByText("Split");
    expect(splitBtn.classList.contains("cy-md-editor__mode-btn--active")).toBe(
      true,
    );
  });

  it("shows both textarea and preview in split mode", () => {
    render(MarkdownEditor);
    const textarea = document.querySelector(".cy-md-editor__textarea");
    const preview = document.querySelector(".cy-md-editor__preview-pane");
    const divider = document.querySelector(".cy-md-editor__divider");
    expect(textarea).toBeInTheDocument();
    expect(preview).toBeInTheDocument();
    expect(divider).toBeInTheDocument();
  });

  it("switches to edit mode", async () => {
    render(MarkdownEditor);
    const editBtn = screen.getByText("Edit");
    await fireEvent.click(editBtn);

    expect(
      editBtn.classList.contains("cy-md-editor__mode-btn--active"),
    ).toBe(true);
    const textarea = document.querySelector(".cy-md-editor__textarea");
    const preview = document.querySelector(".cy-md-editor__preview-pane");
    expect(textarea).toBeInTheDocument();
    expect(preview).not.toBeInTheDocument();
  });

  it("switches to preview mode", async () => {
    render(MarkdownEditor);
    const previewBtn = screen.getByText("Preview");
    await fireEvent.click(previewBtn);

    expect(
      previewBtn.classList.contains("cy-md-editor__mode-btn--active"),
    ).toBe(true);
    const textarea = document.querySelector(".cy-md-editor__textarea");
    const preview = document.querySelector(".cy-md-editor__preview-pane");
    expect(textarea).not.toBeInTheDocument();
    expect(preview).toBeInTheDocument();
  });

  it("hides toolbar in preview mode", async () => {
    render(MarkdownEditor, { props: { showToolbar: true } });
    const previewBtn = screen.getByText("Preview");
    await fireEvent.click(previewBtn);
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar).not.toBeInTheDocument();
  });

  it("shows toolbar when switching back from preview to edit", async () => {
    render(MarkdownEditor, { props: { showToolbar: true } });
    const previewBtn = screen.getByText("Preview");
    await fireEvent.click(previewBtn);

    const editBtn = screen.getByText("Edit");
    await fireEvent.click(editBtn);
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("edit pane has full class in edit mode", async () => {
    render(MarkdownEditor);
    const editBtn = screen.getByText("Edit");
    await fireEvent.click(editBtn);
    const editPane = document.querySelector(".cy-md-editor__edit-pane");
    expect(
      editPane?.classList.contains("cy-md-editor__edit-pane--full"),
    ).toBe(true);
  });

  it("preview pane has full class in preview mode", async () => {
    render(MarkdownEditor);
    const previewBtn = screen.getByText("Preview");
    await fireEvent.click(previewBtn);
    const previewPane = document.querySelector(
      ".cy-md-editor__preview-pane",
    );
    expect(
      previewPane?.classList.contains("cy-md-editor__preview-pane--full"),
    ).toBe(true);
  });

  it("content area has split class in split mode", () => {
    render(MarkdownEditor);
    const content = document.querySelector(".cy-md-editor__content");
    expect(
      content?.classList.contains("cy-md-editor__content--split"),
    ).toBe(true);
  });

  // Input handling
  it("calls onchange when textarea value changes", async () => {
    const onchange = vi.fn();
    render(MarkdownEditor, { props: { onchange } });
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    textarea.value = "new content";
    await fireEvent.input(textarea);
    expect(onchange).toHaveBeenCalledWith("new content");
  });

  // Tab handling
  it("inserts 2 spaces on Tab key", async () => {
    render(MarkdownEditor);
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    textarea.value = "hello";
    textarea.selectionStart = 5;
    textarea.selectionEnd = 5;

    await fireEvent.keyDown(textarea, { key: "Tab" });
    expect(textarea.value).toBe("hello  ");
    expect(textarea.selectionStart).toBe(7);
  });

  // Enter auto-indent
  it("auto-indents on Enter when current line has leading whitespace", async () => {
    render(MarkdownEditor);
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    textarea.value = "  indented";
    textarea.selectionStart = 10;
    textarea.selectionEnd = 10;

    await fireEvent.keyDown(textarea, { key: "Enter" });
    expect(textarea.value).toBe("  indented\n  ");
  });

  it("does not auto-indent on Enter when no leading whitespace", async () => {
    render(MarkdownEditor);
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    textarea.value = "hello";
    textarea.selectionStart = 5;
    textarea.selectionEnd = 5;

    // This should not prevent default since there's no indent
    await fireEvent.keyDown(textarea, { key: "Enter" });
    // Value should not change (browser default Enter is not simulated in jsdom)
    expect(textarea.value).toBe("hello");
  });

  // Readonly
  it("sets textarea readonly attribute", () => {
    render(MarkdownEditor, { props: { readonly: true } });
    const textarea = document.querySelector("textarea");
    expect(textarea).toHaveAttribute("readonly");
  });

  it("shows preview with value content", () => {
    render(MarkdownEditor, {
      props: { value: "**bold**", mode: "split" },
    });
    const preview = document.querySelector(".cy-md-editor__preview-pane");
    expect(preview).toBeInTheDocument();
  });

  it("textarea has spellcheck disabled", () => {
    render(MarkdownEditor);
    const textarea = document.querySelector("textarea");
    expect(textarea?.getAttribute("spellcheck")).toBe("false");
  });

  // Debounce behavior
  it("updates debounced value after typing", async () => {
    vi.useFakeTimers();
    const onchange = vi.fn();
    render(MarkdownEditor, { props: { onchange } });

    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    textarea.value = "first change";
    await fireEvent.input(textarea);

    textarea.value = "second change";
    await fireEvent.input(textarea);

    // onchange is called immediately (not debounced)
    expect(onchange).toHaveBeenCalledTimes(2);
    expect(onchange).toHaveBeenLastCalledWith("second change");

    vi.useRealTimers();
  });

  it("clears debounce timer on subsequent inputs", async () => {
    vi.useFakeTimers();
    render(MarkdownEditor);

    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    textarea.value = "a";
    await fireEvent.input(textarea);

    textarea.value = "ab";
    await fireEvent.input(textarea);

    textarea.value = "abc";
    await fireEvent.input(textarea);

    // Advance past debounce timer
    vi.advanceTimersByTime(200);

    vi.useRealTimers();
  });

  // Scroll sync
  it("handles textarea scroll without error", async () => {
    render(MarkdownEditor, { props: { mode: "split", value: "line\n".repeat(100) } });
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    await fireEvent.scroll(textarea);
    // Should not throw
  });

  // Initial value
  it("renders initial value in textarea", () => {
    render(MarkdownEditor, { props: { value: "Hello World" } });
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Hello World");
  });

  // Mode prop binding
  it("respects initial mode prop", () => {
    render(MarkdownEditor, { props: { mode: "edit" } });
    const editBtn = screen.getByText("Edit");
    expect(
      editBtn.classList.contains("cy-md-editor__mode-btn--active"),
    ).toBe(true);
  });

  it("respects initial mode=preview prop", () => {
    render(MarkdownEditor, { props: { mode: "preview" } });
    const previewBtn = screen.getByText("Preview");
    expect(
      previewBtn.classList.contains("cy-md-editor__mode-btn--active"),
    ).toBe(true);
    const textarea = document.querySelector("textarea");
    expect(textarea).not.toBeInTheDocument();
  });
});
