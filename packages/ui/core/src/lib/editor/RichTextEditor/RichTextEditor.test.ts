import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RichTextEditor from "./RichTextEditor.svelte";

// jsdom does not implement execCommand / queryCommandState, so we stub them globally
beforeEach(() => {
  if (!document.execCommand) {
    (document as any).execCommand = vi.fn().mockReturnValue(true);
  }
  if (!document.queryCommandState) {
    (document as any).queryCommandState = vi.fn().mockReturnValue(false);
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RichTextEditor", () => {
  it("renders the component", () => {
    render(RichTextEditor);
    const el = document.querySelector(".cy-rte");
    expect(el).toBeInTheDocument();
  });

  it("renders an editable content area", () => {
    render(RichTextEditor);
    const editor = document.querySelector('[contenteditable="true"]');
    expect(editor).toBeInTheDocument();
  });

  it("makes content area not editable when readonly", () => {
    render(RichTextEditor, { props: { readonly: true } });
    const editor = document.querySelector('[contenteditable="false"]');
    expect(editor).toBeInTheDocument();
  });

  it("shows toolbar when showToolbar is true", () => {
    render(RichTextEditor, { props: { showToolbar: true } });
    const toolbar = document.querySelector(".cy-rte__toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("hides toolbar when showToolbar is false", () => {
    render(RichTextEditor, { props: { showToolbar: false } });
    const toolbar = document.querySelector(".cy-rte__toolbar");
    expect(toolbar).not.toBeInTheDocument();
  });

  it("hides toolbar in readonly mode", () => {
    render(RichTextEditor, { props: { readonly: true } });
    const toolbar = document.querySelector(".cy-rte__toolbar");
    expect(toolbar).not.toBeInTheDocument();
  });

  it("renders toolbar action buttons", () => {
    render(RichTextEditor, { props: { showToolbar: true } });
    const buttons = document.querySelectorAll(".cy-rte__toolbar button, .cy-rte__btn");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("applies custom height to editor", () => {
    render(RichTextEditor, { props: { height: "500px" } });
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    expect(editor.style.minHeight).toBe("500px");
  });

  it("applies readonly class", () => {
    render(RichTextEditor, { props: { readonly: true } });
    const el = document.querySelector(".cy-rte--readonly");
    expect(el).toBeInTheDocument();
  });

  it("does not apply readonly class when editable", () => {
    render(RichTextEditor);
    const el = document.querySelector(".cy-rte--readonly");
    expect(el).not.toBeInTheDocument();
  });

  it("sets placeholder via data attribute", () => {
    render(RichTextEditor, { props: { placeholder: "Write here..." } });
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    expect(editor.getAttribute("data-placeholder")).toBe("Write here...");
  });

  it("editor has proper accessibility attributes", () => {
    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    expect(editor.getAttribute("role")).toBe("textbox");
    expect(editor.getAttribute("aria-multiline")).toBe("true");
    expect(editor.getAttribute("aria-label")).toBe("Rich text editor");
    expect(editor.getAttribute("tabindex")).toBe("0");
  });

  it("toolbar has proper accessibility attributes", () => {
    render(RichTextEditor);
    const toolbar = document.querySelector(".cy-rte__toolbar");
    expect(toolbar?.getAttribute("role")).toBe("toolbar");
    expect(toolbar?.getAttribute("aria-label")).toBe("Text formatting");
  });

  // Toolbar buttons
  it("has bold button with correct aria-label", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Bold"]');
    expect(btn).toBeInTheDocument();
  });

  it("has italic button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Italic"]');
    expect(btn).toBeInTheDocument();
  });

  it("has underline button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Underline"]');
    expect(btn).toBeInTheDocument();
  });

  it("has strikethrough button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Strikethrough"]');
    expect(btn).toBeInTheDocument();
  });

  it("has heading button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Heading"]');
    expect(btn).toBeInTheDocument();
  });

  it("has bullet list button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Bullet list"]');
    expect(btn).toBeInTheDocument();
  });

  it("has ordered list button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Ordered list"]');
    expect(btn).toBeInTheDocument();
  });

  it("has insert link button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Insert link"]');
    expect(btn).toBeInTheDocument();
  });

  it("has remove link button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Remove link"]');
    expect(btn).toBeInTheDocument();
  });

  it("has blockquote button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Blockquote"]');
    expect(btn).toBeInTheDocument();
  });

  it("has code button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Code"]');
    expect(btn).toBeInTheDocument();
  });

  it("has horizontal rule button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Horizontal rule"]');
    expect(btn).toBeInTheDocument();
  });

  it("has undo button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Undo"]');
    expect(btn).toBeInTheDocument();
  });

  it("has redo button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Redo"]');
    expect(btn).toBeInTheDocument();
  });

  it("has clear formatting button", () => {
    render(RichTextEditor);
    const btn = document.querySelector('[aria-label="Clear formatting"]');
    expect(btn).toBeInTheDocument();
  });

  it("renders separators between button groups", () => {
    render(RichTextEditor);
    const seps = document.querySelectorAll(".cy-rte__separator");
    expect(seps.length).toBeGreaterThan(0);
  });

  // Exec command tests
  it("calls execCommand for bold on button click", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const boldBtn = document.querySelector('[aria-label="Bold"]') as HTMLElement;
    await fireEvent.click(boldBtn);

    expect(execSpy).toHaveBeenCalledWith("bold", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for italic on button click", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Italic"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("italic", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for underline on button click", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Underline"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("underline", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for strikeThrough on button click", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Strikethrough"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("strikeThrough", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for unordered list", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Bullet list"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("insertUnorderedList", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for ordered list", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Ordered list"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("insertOrderedList", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for blockquote", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Blockquote"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("formatBlock", false, "blockquote");

    execSpy.mockRestore();
  });

  it("calls execCommand for code block (pre)", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Code"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("formatBlock", false, "pre");

    execSpy.mockRestore();
  });

  it("calls execCommand for horizontal rule", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Horizontal rule"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("insertHorizontalRule", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for undo", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Undo"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("undo", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for redo", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Redo"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("redo", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for remove formatting", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Clear formatting"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("removeFormat", false, undefined);

    execSpy.mockRestore();
  });

  it("calls execCommand for remove link (unlink)", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const btn = document.querySelector('[aria-label="Remove link"]') as HTMLElement;
    await fireEvent.click(btn);

    expect(execSpy).toHaveBeenCalledWith("unlink", false, undefined);

    execSpy.mockRestore();
  });

  // Format tracking
  it("tracks bold active state", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState");
    stateSpy.mockImplementation((cmd) => cmd === "bold");
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.mouseUp(editor);

    const boldBtn = document.querySelector('[aria-label="Bold"]');
    expect(boldBtn?.classList.contains("cy-rte__btn--active")).toBe(true);

    stateSpy.mockRestore();
  });

  it("tracks italic active state", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState");
    stateSpy.mockImplementation((cmd) => cmd === "italic");
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.mouseUp(editor);

    const btn = document.querySelector('[aria-label="Italic"]');
    expect(btn?.classList.contains("cy-rte__btn--active")).toBe(true);

    stateSpy.mockRestore();
  });

  it("updates format state on keyup", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState");
    stateSpy.mockReturnValue(false);
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.keyUp(editor);

    expect(stateSpy).toHaveBeenCalled();

    stateSpy.mockRestore();
  });

  it("updates format state on focus", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState");
    stateSpy.mockReturnValue(false);

    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.focus(editor);

    expect(stateSpy).toHaveBeenCalled();

    stateSpy.mockRestore();
  });

  // Heading dropdown
  it("toggles heading dropdown", async () => {
    render(RichTextEditor);
    const headingBtn = document.querySelector('[aria-label="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const dropdown = document.querySelector(".cy-rte__dropdown-menu");
    expect(dropdown).toBeInTheDocument();
  });

  it("closes heading dropdown on second click", async () => {
    render(RichTextEditor);
    const headingBtn = document.querySelector('[aria-label="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);
    await fireEvent.click(headingBtn);

    const dropdown = document.querySelector(".cy-rte__dropdown-menu");
    expect(dropdown).not.toBeInTheDocument();
  });

  it("heading dropdown has correct aria-expanded", async () => {
    render(RichTextEditor);
    const headingBtn = document.querySelector('[aria-label="Heading"]') as HTMLElement;

    expect(headingBtn.getAttribute("aria-expanded")).toBe("false");

    await fireEvent.click(headingBtn);
    expect(headingBtn.getAttribute("aria-expanded")).toBe("true");
  });

  it("selects Heading 1 from dropdown", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const headingBtn = document.querySelector('[aria-label="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const h1Btn = Array.from(
      document.querySelectorAll(".cy-rte__dropdown-item"),
    ).find((b) => b.textContent === "Heading 1") as HTMLElement;
    await fireEvent.click(h1Btn);

    expect(execSpy).toHaveBeenCalledWith("formatBlock", false, "h1");

    // Dropdown should close
    const dropdown = document.querySelector(".cy-rte__dropdown-menu");
    expect(dropdown).not.toBeInTheDocument();

    execSpy.mockRestore();
  });

  it("selects Heading 2 from dropdown", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const headingBtn = document.querySelector('[aria-label="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const h2Btn = Array.from(
      document.querySelectorAll(".cy-rte__dropdown-item"),
    ).find((b) => b.textContent === "Heading 2") as HTMLElement;
    await fireEvent.click(h2Btn);

    expect(execSpy).toHaveBeenCalledWith("formatBlock", false, "h2");

    execSpy.mockRestore();
  });

  it("selects Heading 3 from dropdown", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const headingBtn = document.querySelector('[aria-label="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const h3Btn = Array.from(
      document.querySelectorAll(".cy-rte__dropdown-item"),
    ).find((b) => b.textContent === "Heading 3") as HTMLElement;
    await fireEvent.click(h3Btn);

    expect(execSpy).toHaveBeenCalledWith("formatBlock", false, "h3");

    execSpy.mockRestore();
  });

  it("selects Paragraph from heading dropdown", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const headingBtn = document.querySelector('[aria-label="Heading"]') as HTMLElement;
    await fireEvent.click(headingBtn);

    const pBtn = Array.from(
      document.querySelectorAll(".cy-rte__dropdown-item"),
    ).find((b) => b.textContent === "Paragraph") as HTMLElement;
    await fireEvent.click(pBtn);

    expect(execSpy).toHaveBeenCalledWith("formatBlock", false, "p");

    execSpy.mockRestore();
  });

  // Input handling
  it("captures content on input", async () => {
    const onchange = vi.fn();
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor, { props: { onchange } });

    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    editor.innerHTML = "<p>Hello world</p>";
    await fireEvent.input(editor);

    expect(onchange).toHaveBeenCalledWith("<p>Hello world</p>");
  });

  it("does not call onchange if content did not change", async () => {
    const onchange = vi.fn();
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor, { props: { value: "", onchange } });

    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    editor.innerHTML = "";
    await fireEvent.input(editor);

    expect(onchange).not.toHaveBeenCalled();
  });

  // Keyboard handling
  it("inserts indent on Tab key", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor);

    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.keyDown(editor, { key: "Tab" });

    expect(execSpy).toHaveBeenCalledWith("indent", false, undefined);

    execSpy.mockRestore();
  });

  it("updates format state on keydown", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    vi.spyOn(document, "execCommand").mockReturnValue(true);
    render(RichTextEditor);

    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.keyDown(editor, { key: "a" });

    expect(stateSpy).toHaveBeenCalled();

    stateSpy.mockRestore();
  });

  // Sanitization
  it("sanitizes script tags from HTML value", () => {
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor, {
      props: { value: '<p>Hello</p><script>alert("xss")</script>' },
    });

    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    expect(editor.innerHTML).not.toContain("<script");
  });

  it("sanitizes inline event handlers from value", () => {
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor, {
      props: { value: '<p onclick="alert()">Click</p>' },
    });

    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    expect(editor.innerHTML).not.toContain("onclick");
  });

  it("sanitizes javascript: protocol from value", () => {
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    render(RichTextEditor, {
      props: { value: '<a href="javascript:alert()">link</a>' },
    });

    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    expect(editor.innerHTML).not.toContain("javascript:");
  });

  // Link insertion
  it("inserts link via prompt", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    vi.spyOn(window, "prompt").mockReturnValue("https://example.com");

    render(RichTextEditor);
    const linkBtn = document.querySelector('[aria-label="Insert link"]') as HTMLElement;
    await fireEvent.click(linkBtn);

    expect(execSpy).toHaveBeenCalledWith("createLink", false, "https://example.com");

    execSpy.mockRestore();
  });

  it("does not insert link when prompt is cancelled", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    vi.spyOn(window, "prompt").mockReturnValue(null);

    render(RichTextEditor);
    const linkBtn = document.querySelector('[aria-label="Insert link"]') as HTMLElement;
    await fireEvent.click(linkBtn);

    // createLink should not have been called
    expect(execSpy).not.toHaveBeenCalledWith("createLink", false, expect.anything());

    execSpy.mockRestore();
  });

  it("sanitizes javascript: URLs in link insertion", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    vi.spyOn(window, "prompt").mockReturnValue("javascript:alert(1)");

    render(RichTextEditor);
    const linkBtn = document.querySelector('[aria-label="Insert link"]') as HTMLElement;
    await fireEvent.click(linkBtn);

    expect(execSpy).toHaveBeenCalledWith("createLink", false, "#");

    execSpy.mockRestore();
  });

  it("sanitizes data: URLs in link insertion", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    vi.spyOn(window, "prompt").mockReturnValue("data:text/html,<script>alert(1)</script>");

    render(RichTextEditor);
    const linkBtn = document.querySelector('[aria-label="Insert link"]') as HTMLElement;
    await fireEvent.click(linkBtn);

    expect(execSpy).toHaveBeenCalledWith("createLink", false, "#");

    execSpy.mockRestore();
  });

  it("sanitizes vbscript: URLs in link insertion", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    vi.spyOn(window, "prompt").mockReturnValue("vbscript:alert(1)");

    render(RichTextEditor);
    const linkBtn = document.querySelector('[aria-label="Insert link"]') as HTMLElement;
    await fireEvent.click(linkBtn);

    expect(execSpy).toHaveBeenCalledWith("createLink", false, "#");

    execSpy.mockRestore();
  });

  it("allows safe URLs in link insertion", async () => {
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    vi.spyOn(window, "prompt").mockReturnValue("https://safe.example.com");

    render(RichTextEditor);
    const linkBtn = document.querySelector('[aria-label="Insert link"]') as HTMLElement;
    await fireEvent.click(linkBtn);

    expect(execSpy).toHaveBeenCalledWith("createLink", false, "https://safe.example.com");

    execSpy.mockRestore();
  });

  // Active format states for all tracked formats
  it("tracks underline active state", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState");
    stateSpy.mockImplementation((cmd) => cmd === "underline");
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.mouseUp(editor);

    const btn = document.querySelector('[aria-label="Underline"]');
    expect(btn?.classList.contains("cy-rte__btn--active")).toBe(true);

    stateSpy.mockRestore();
  });

  it("tracks strikeThrough active state", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState");
    stateSpy.mockImplementation((cmd) => cmd === "strikeThrough");
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.mouseUp(editor);

    const btn = document.querySelector('[aria-label="Strikethrough"]');
    expect(btn?.classList.contains("cy-rte__btn--active")).toBe(true);

    stateSpy.mockRestore();
  });

  it("tracks unordered list active state", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState");
    stateSpy.mockImplementation((cmd) => cmd === "insertUnorderedList");
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.mouseUp(editor);

    const btn = document.querySelector('[aria-label="Bullet list"]');
    expect(btn?.classList.contains("cy-rte__btn--active")).toBe(true);

    stateSpy.mockRestore();
  });

  it("tracks ordered list active state", async () => {
    const stateSpy = vi.spyOn(document, "queryCommandState");
    stateSpy.mockImplementation((cmd) => cmd === "insertOrderedList");
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    render(RichTextEditor);
    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    await fireEvent.mouseUp(editor);

    const btn = document.querySelector('[aria-label="Ordered list"]');
    expect(btn?.classList.contains("cy-rte__btn--active")).toBe(true);

    stateSpy.mockRestore();
  });

  // Syncing external value
  it("syncs editor content when value prop changes externally", () => {
    vi.spyOn(document, "queryCommandState").mockReturnValue(false);
    const { rerender } = render(RichTextEditor, {
      props: { value: "<p>Initial</p>" },
    });

    const editor = document.querySelector(".cy-rte__editor") as HTMLElement;
    expect(editor.innerHTML).toBe("<p>Initial</p>");
  });
});
