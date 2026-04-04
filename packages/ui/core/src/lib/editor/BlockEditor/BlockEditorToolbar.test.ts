import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import BlockEditorToolbar from "./BlockEditorToolbar.svelte";

function makeTextarea(value = ""): HTMLTextAreaElement {
  const el = document.createElement("textarea");
  el.value = value;
  el.selectionStart = value.length;
  el.selectionEnd = value.length;
  el.setSelectionRange = vi.fn();
  el.focus = vi.fn();
  document.body.appendChild(el);
  return el;
}

describe("BlockEditorToolbar", () => {
  it("renders toolbar with role", () => {
    render(BlockEditorToolbar);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("renders all formatting buttons", () => {
    render(BlockEditorToolbar);
    expect(screen.getByTitle("Bold (Ctrl+B)")).toBeInTheDocument();
    expect(screen.getByTitle("Italic (Ctrl+I)")).toBeInTheDocument();
    expect(screen.getByTitle("Strikethrough")).toBeInTheDocument();
    expect(screen.getByTitle("Link (Ctrl+K)")).toBeInTheDocument();
    expect(screen.getByTitle("Image")).toBeInTheDocument();
    expect(screen.getByTitle("Inline code")).toBeInTheDocument();
    expect(screen.getByTitle("Code block")).toBeInTheDocument();
    expect(screen.getByTitle("Blockquote")).toBeInTheDocument();
    expect(screen.getByTitle("Bullet list")).toBeInTheDocument();
    expect(screen.getByTitle("Numbered list")).toBeInTheDocument();
    expect(screen.getByTitle("Task list")).toBeInTheDocument();
    expect(screen.getByTitle("Horizontal rule")).toBeInTheDocument();
    expect(screen.getByTitle("Table")).toBeInTheDocument();
    expect(screen.getByTitle("Mermaid diagram")).toBeInTheDocument();
  });

  it("disables all buttons when no textarea", () => {
    const { container } = render(BlockEditorToolbar);
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.disabled).toBe(true);
    });
  });

  it("disables buttons when disabled prop is true", () => {
    const textarea = makeTextarea();
    const { container } = render(BlockEditorToolbar, {
      props: { textarea, disabled: true },
    });
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.disabled).toBe(true);
    });
    textarea.remove();
  });

  it("enables buttons when textarea is provided", () => {
    const textarea = makeTextarea();
    render(BlockEditorToolbar, { props: { textarea } });
    expect(screen.getByTitle("Bold (Ctrl+B)")).not.toBeDisabled();
    textarea.remove();
  });

  it("calls oninsert when bold button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Bold (Ctrl+B)"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when italic button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Italic (Ctrl+I)"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when strikethrough button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Strikethrough"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when link button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Link (Ctrl+K)"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when image button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Image"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when inline code button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Inline code"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when code block button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Code block"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when blockquote button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Blockquote"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when bullet list button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Bullet list"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when numbered list button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Numbered list"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when task list button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Task list"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when horizontal rule button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Horizontal rule"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when table button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Table"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("calls oninsert when mermaid button is clicked", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Mermaid diagram"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("shows heading dropdown when heading button is clicked", async () => {
    const textarea = makeTextarea();
    render(BlockEditorToolbar, { props: { textarea } });
    await fireEvent.click(screen.getByTitle("Heading"));
    expect(screen.getByText("H1")).toBeInTheDocument();
    expect(screen.getByText("H2")).toBeInTheDocument();
    expect(screen.getByText("H3")).toBeInTheDocument();
    expect(screen.getByText("H4")).toBeInTheDocument();
    textarea.remove();
  });

  it("calls oninsert when heading level is selected", async () => {
    const textarea = makeTextarea();
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await fireEvent.click(screen.getByTitle("Heading"));
    await fireEvent.click(screen.getByText("H2"));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("closes heading dropdown after selection", async () => {
    const textarea = makeTextarea();
    render(BlockEditorToolbar, { props: { textarea } });
    await fireEvent.click(screen.getByTitle("Heading"));
    expect(screen.getByText("H1")).toBeInTheDocument();
    await fireEvent.click(screen.getByText("H1"));
    expect(screen.queryByText("H1")).not.toBeInTheDocument();
    textarea.remove();
  });

  it("applies disabled class when isDisabled", () => {
    const { container } = render(BlockEditorToolbar);
    const toolbar = container.querySelector(".cy-block-editor__toolbar--disabled");
    expect(toolbar).toBeInTheDocument();
  });

  it("does not apply disabled class when textarea is provided", () => {
    const textarea = makeTextarea();
    const { container } = render(BlockEditorToolbar, { props: { textarea } });
    const toolbar = container.querySelector(".cy-block-editor__toolbar--disabled");
    expect(toolbar).not.toBeInTheDocument();
    textarea.remove();
  });

  it("renders custom actions when provided", () => {
    const textarea = makeTextarea();
    const customActions = [
      { label: "Custom", icon: "<span>C</span>", action: vi.fn() },
    ];
    render(BlockEditorToolbar, { props: { textarea, customActions } });
    expect(screen.getByTitle("Custom")).toBeInTheDocument();
    textarea.remove();
  });

  it("calls custom action when custom button is clicked", async () => {
    const textarea = makeTextarea();
    const actionFn = vi.fn();
    const customActions = [
      { label: "Custom", icon: "<span>C</span>", action: actionFn },
    ];
    render(BlockEditorToolbar, { props: { textarea, customActions } });
    await fireEvent.click(screen.getByTitle("Custom"));
    expect(actionFn).toHaveBeenCalledWith(textarea);
    textarea.remove();
  });

  it("closes heading dropdown on window click", async () => {
    const textarea = makeTextarea();
    render(BlockEditorToolbar, { props: { textarea } });
    await fireEvent.click(screen.getByTitle("Heading"));
    expect(screen.getByText("H1")).toBeInTheDocument();
    await fireEvent.click(document.body);
    expect(screen.queryByText("H1")).not.toBeInTheDocument();
    textarea.remove();
  });

  // Keyboard shortcuts on textarea
  it("handles Ctrl+B keyboard shortcut for bold", async () => {
    const textarea = makeTextarea("some text");
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    // Wait for $effect to register the keydown listener
    await new Promise((r) => setTimeout(r, 10));
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true, bubbles: true }));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("handles Ctrl+I keyboard shortcut for italic", async () => {
    const textarea = makeTextarea("some text");
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await new Promise((r) => setTimeout(r, 10));
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "i", ctrlKey: true, bubbles: true }));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("handles Ctrl+K keyboard shortcut for link", async () => {
    const textarea = makeTextarea("some text");
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await new Promise((r) => setTimeout(r, 10));
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    expect(oninsert).toHaveBeenCalled();
    textarea.remove();
  });

  it("ignores keyboard shortcuts without modifier key", async () => {
    const textarea = makeTextarea("some text");
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, oninsert } });
    await new Promise((r) => setTimeout(r, 10));
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true }));
    expect(oninsert).not.toHaveBeenCalled();
    textarea.remove();
  });

  it("ignores keyboard shortcuts when disabled", async () => {
    const textarea = makeTextarea("some text");
    const oninsert = vi.fn();
    render(BlockEditorToolbar, { props: { textarea, disabled: true, oninsert } });
    await new Promise((r) => setTimeout(r, 10));
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true, bubbles: true }));
    expect(oninsert).not.toHaveBeenCalled();
    textarea.remove();
  });
});
