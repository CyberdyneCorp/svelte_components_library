import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import MarkdownToolbar from "./MarkdownToolbar.svelte";

function createTextarea(value = "", selStart = 0, selEnd = 0): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.selectionStart = selStart;
  textarea.selectionEnd = selEnd;
  document.body.appendChild(textarea);
  return textarea;
}

describe("MarkdownToolbar", () => {
  it("renders the component", () => {
    render(MarkdownToolbar);
    const el = document.querySelector(".cy-md-toolbar");
    expect(el).toBeInTheDocument();
  });

  it("renders toolbar buttons", () => {
    render(MarkdownToolbar);
    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("has bold formatting button", () => {
    render(MarkdownToolbar);
    const boldBtn = document.querySelector('[title="Bold (Ctrl+B)"]');
    expect(boldBtn).toBeInTheDocument();
  });

  it("has italic formatting button", () => {
    render(MarkdownToolbar);
    const italicBtn = document.querySelector('[title="Italic (Ctrl+I)"]');
    expect(italicBtn).toBeInTheDocument();
  });

  it("has strikethrough button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Strikethrough"]');
    expect(btn).toBeInTheDocument();
  });

  it("has link button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Link (Ctrl+K)"]');
    expect(btn).toBeInTheDocument();
  });

  it("has image button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Image"]');
    expect(btn).toBeInTheDocument();
  });

  it("has inline code button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Inline code"]');
    expect(btn).toBeInTheDocument();
  });

  it("has code block button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Code block"]');
    expect(btn).toBeInTheDocument();
  });

  it("has blockquote button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Blockquote"]');
    expect(btn).toBeInTheDocument();
  });

  it("has unordered list button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Unordered list"]');
    expect(btn).toBeInTheDocument();
  });

  it("has ordered list button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Ordered list"]');
    expect(btn).toBeInTheDocument();
  });

  it("has task list button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Task list"]');
    expect(btn).toBeInTheDocument();
  });

  it("has horizontal rule button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Horizontal rule"]');
    expect(btn).toBeInTheDocument();
  });

  it("has table button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Table"]');
    expect(btn).toBeInTheDocument();
  });

  it("has mermaid button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Mermaid diagram"]');
    expect(btn).toBeInTheDocument();
  });

  it("has heading button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Heading"]');
    expect(btn).toBeInTheDocument();
  });

  it("disables buttons when disabled prop is true", () => {
    render(MarkdownToolbar, { props: { disabled: true } });
    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("applies disabled class to toolbar", () => {
    render(MarkdownToolbar, { props: { disabled: true } });
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar?.classList.contains("cy-md-toolbar--disabled")).toBe(true);
  });

  it("does not apply disabled class when not disabled", () => {
    render(MarkdownToolbar);
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar?.classList.contains("cy-md-toolbar--disabled")).toBe(false);
  });

  // Insert functions - Bold
  it("inserts bold markdown around selected text", async () => {
    const textarea = createTextarea("hello world", 6, 11);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const boldBtn = document.querySelector('[title="Bold (Ctrl+B)"]') as HTMLElement;
    await fireEvent.click(boldBtn);

    expect(textarea.value).toBe("hello **world**");
    expect(oninsert).toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("inserts bold default text when nothing selected", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const boldBtn = document.querySelector('[title="Bold (Ctrl+B)"]') as HTMLElement;
    await fireEvent.click(boldBtn);

    expect(textarea.value).toBe("**bold text**");
    expect(oninsert).toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  // Italic
  it("inserts italic markdown", async () => {
    const textarea = createTextarea("word", 0, 4);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Italic (Ctrl+I)"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toBe("*word*");

    document.body.removeChild(textarea);
  });

  // Strikethrough
  it("inserts strikethrough markdown", async () => {
    const textarea = createTextarea("text", 0, 4);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Strikethrough"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toBe("~~text~~");

    document.body.removeChild(textarea);
  });

  // Link
  it("inserts link markdown", async () => {
    const textarea = createTextarea("click here", 0, 10);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Link (Ctrl+K)"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toBe("[click here](url)");

    document.body.removeChild(textarea);
  });

  // Image
  it("inserts image markdown", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Image"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toBe("![alt text](image-url)");

    document.body.removeChild(textarea);
  });

  // Inline code
  it("inserts inline code markdown", async () => {
    const textarea = createTextarea("variable", 0, 8);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Inline code"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toBe("`variable`");

    document.body.removeChild(textarea);
  });

  // Code block
  it("inserts code block", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Code block"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("```");

    document.body.removeChild(textarea);
  });

  // Blockquote
  it("inserts blockquote prefix", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Blockquote"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("> ");

    document.body.removeChild(textarea);
  });

  // Unordered list
  it("inserts unordered list prefix", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Unordered list"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("- ");

    document.body.removeChild(textarea);
  });

  // Ordered list
  it("inserts ordered list prefix", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Ordered list"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("1. ");

    document.body.removeChild(textarea);
  });

  // Task list
  it("inserts task list prefix", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Task list"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("- [ ] ");

    document.body.removeChild(textarea);
  });

  // Horizontal rule
  it("inserts horizontal rule", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Horizontal rule"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("---");

    document.body.removeChild(textarea);
  });

  // Table
  it("inserts table", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Table"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("| Header");

    document.body.removeChild(textarea);
  });

  // Mermaid
  it("inserts mermaid diagram block", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Mermaid diagram"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("```mermaid");

    document.body.removeChild(textarea);
  });

  // Heading dropdown
  it("toggles heading dropdown on click", async () => {
    const textarea = createTextarea("", 0, 0);
    render(MarkdownToolbar, { props: { textarea } });

    const headingBtn = document.querySelector('[title="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const dropdown = document.querySelector(".cy-md-toolbar__dropdown");
    expect(dropdown).toBeInTheDocument();

    document.body.removeChild(textarea);
  });

  it("closes heading dropdown on second click", async () => {
    const textarea = createTextarea("", 0, 0);
    render(MarkdownToolbar, { props: { textarea } });

    const headingBtn = document.querySelector('[title="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);
    await fireEvent.click(headingBtn);

    const dropdown = document.querySelector(".cy-md-toolbar__dropdown");
    expect(dropdown).not.toBeInTheDocument();

    document.body.removeChild(textarea);
  });

  it("inserts H1 heading from dropdown", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const headingBtn = document.querySelector('[title="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const h1Btn = Array.from(document.querySelectorAll(".cy-md-toolbar__dropdown button")).find(
      (b) => b.textContent === "H1",
    ) as HTMLElement;
    await fireEvent.click(h1Btn);

    expect(textarea.value).toContain("# ");
    expect(oninsert).toHaveBeenCalled();

    // Dropdown should close after selection
    const dropdown = document.querySelector(".cy-md-toolbar__dropdown");
    expect(dropdown).not.toBeInTheDocument();

    document.body.removeChild(textarea);
  });

  it("inserts H2 heading from dropdown", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const headingBtn = document.querySelector('[title="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const h2Btn = Array.from(document.querySelectorAll(".cy-md-toolbar__dropdown button")).find(
      (b) => b.textContent === "H2",
    ) as HTMLElement;
    await fireEvent.click(h2Btn);

    expect(textarea.value).toContain("## ");

    document.body.removeChild(textarea);
  });

  it("inserts H3 heading from dropdown", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const headingBtn = document.querySelector('[title="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const h3Btn = Array.from(document.querySelectorAll(".cy-md-toolbar__dropdown button")).find(
      (b) => b.textContent === "H3",
    ) as HTMLElement;
    await fireEvent.click(h3Btn);

    expect(textarea.value).toContain("### ");

    document.body.removeChild(textarea);
  });

  it("inserts H4 heading from dropdown", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const headingBtn = document.querySelector('[title="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const h4Btn = Array.from(document.querySelectorAll(".cy-md-toolbar__dropdown button")).find(
      (b) => b.textContent === "H4",
    ) as HTMLElement;
    await fireEvent.click(h4Btn);

    expect(textarea.value).toContain("#### ");

    document.body.removeChild(textarea);
  });

  it("closes heading dropdown on outside click", async () => {
    const textarea = createTextarea("", 0, 0);
    render(MarkdownToolbar, { props: { textarea } });

    const headingBtn = document.querySelector('[title="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    // Click outside
    await fireEvent.click(window);

    const dropdown = document.querySelector(".cy-md-toolbar__dropdown");
    expect(dropdown).not.toBeInTheDocument();

    document.body.removeChild(textarea);
  });

  // Keyboard shortcuts
  it("inserts bold on Ctrl+B", async () => {
    const textarea = createTextarea("text", 0, 4);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    // Keyboard shortcut is attached to textarea
    await fireEvent.keyDown(textarea, { key: "b", ctrlKey: true });

    expect(textarea.value).toBe("**text**");
    expect(oninsert).toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("inserts italic on Ctrl+I", async () => {
    const textarea = createTextarea("text", 0, 4);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    await fireEvent.keyDown(textarea, { key: "i", ctrlKey: true });

    expect(textarea.value).toBe("*text*");
    expect(oninsert).toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("inserts link on Ctrl+K", async () => {
    const textarea = createTextarea("text", 0, 4);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    await fireEvent.keyDown(textarea, { key: "k", ctrlKey: true });

    expect(textarea.value).toBe("[text](url)");
    expect(oninsert).toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("does not handle shortcuts when disabled", async () => {
    const textarea = createTextarea("text", 0, 4);
    render(MarkdownToolbar, { props: { textarea, disabled: true } });

    await fireEvent.keyDown(textarea, { key: "b", ctrlKey: true });

    // Value should not change
    expect(textarea.value).toBe("text");

    document.body.removeChild(textarea);
  });

  it("does not handle shortcuts without modifier key", async () => {
    const textarea = createTextarea("text", 0, 4);
    render(MarkdownToolbar, { props: { textarea } });

    await fireEvent.keyDown(textarea, { key: "b" });

    expect(textarea.value).toBe("text");

    document.body.removeChild(textarea);
  });

  it("handles Meta key (macOS) for bold", async () => {
    const textarea = createTextarea("text", 0, 4);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    await fireEvent.keyDown(textarea, { key: "b", metaKey: true });

    expect(textarea.value).toBe("**text**");

    document.body.removeChild(textarea);
  });

  // Toolbar buttons do nothing without textarea
  it("does nothing when clicking bold without textarea", async () => {
    render(MarkdownToolbar);

    const boldBtn = document.querySelector('[title="Bold (Ctrl+B)"]') as HTMLElement;
    // Should not throw
    await fireEvent.click(boldBtn);
  });

  // Has proper role
  it("has toolbar role", () => {
    render(MarkdownToolbar);
    const el = document.querySelector('[role="toolbar"]');
    expect(el).toBeInTheDocument();
  });

  // Separator rendering
  it("renders separators between button groups", () => {
    render(MarkdownToolbar);
    const seps = document.querySelectorAll(".cy-md-toolbar__sep");
    expect(seps.length).toBeGreaterThan(0);
  });

  // Inline math
  it("has inline math button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Inline math"]');
    expect(btn).toBeInTheDocument();
  });

  it("inserts inline math around selected text", async () => {
    const textarea = createTextarea("E = mc^2", 0, 8);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Inline math"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toBe("$E = mc^2$");
    expect(oninsert).toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("inserts inline math default text when nothing selected", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Inline math"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toBe("$E = mc^2$");
    expect(oninsert).toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  // Math block
  it("has math block button", () => {
    render(MarkdownToolbar);
    const btn = document.querySelector('[title="Math block"]');
    expect(btn).toBeInTheDocument();
  });

  it("inserts math block", async () => {
    const textarea = createTextarea("", 0, 0);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Math block"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(textarea.value).toContain("$$");
    expect(textarea.value).toContain("\\int_{a}^{b}");
    expect(oninsert).toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("code block insert adds proper newlines when cursor is mid-text", async () => {
    const textarea = createTextarea("some text here", 9, 9);
    const oninsert = vi.fn();
    render(MarkdownToolbar, { props: { textarea, oninsert } });

    const btn = document.querySelector('[title="Code block"]') as HTMLElement;
    await fireEvent.click(btn);

    // Should have newlines before code block since cursor was mid-text
    expect(textarea.value).toContain("\n\n```\ncode here\n```\n");

    document.body.removeChild(textarea);
  });
});
