import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeAll } from "vitest";
import BlockEditor from "./BlockEditor.svelte";

// jsdom does not implement scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
import {
  parseMarkdownToBlocks,
  serializeBlocksToMarkdown,
  detectBlockType,
  createBlock,
  isMultiLineBlock,
  generateBlockId,
  insertMarkdown,
  insertLine,
  insertBlock,
} from "./block-utils.js";

// ---------------------------------------------------------------------------
// Component tests
// ---------------------------------------------------------------------------

describe("BlockEditor", () => {
  it("renders the component", () => {
    render(BlockEditor);
    const el = document.querySelector(".cy-block-editor");
    expect(el).toBeInTheDocument();
  });

  it("renders toolbar by default", () => {
    render(BlockEditor);
    const toolbar = document.querySelector(".cy-block-editor__toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("hides toolbar when showToolbar is false", () => {
    render(BlockEditor, { props: { showToolbar: false } });
    const toolbar = document.querySelector(".cy-block-editor__toolbar");
    expect(toolbar).not.toBeInTheDocument();
  });

  it("hides toolbar in readonly mode", () => {
    render(BlockEditor, { props: { readonly: true } });
    const toolbar = document.querySelector(".cy-block-editor__toolbar");
    expect(toolbar).not.toBeInTheDocument();
  });

  it("renders blocks from value", () => {
    render(BlockEditor, { props: { value: "# Hello\n\nWorld" } });
    const blocks = document.querySelectorAll(".cy-block-editor__block");
    expect(blocks.length).toBe(2);
  });

  it("applies readonly class", () => {
    render(BlockEditor, { props: { readonly: true } });
    const el = document.querySelector(".cy-block-editor--readonly");
    expect(el).toBeInTheDocument();
  });

  it("hides drag handles in readonly mode", () => {
    render(BlockEditor, { props: { readonly: true, value: "Hello" } });
    const handles = document.querySelectorAll(".cy-block-editor__handle");
    expect(handles.length).toBe(0);
  });

  it("shows drag handles in editable mode", () => {
    render(BlockEditor, { props: { value: "Hello" } });
    const handles = document.querySelectorAll(".cy-block-editor__handle");
    expect(handles.length).toBeGreaterThan(0);
  });

  it("applies custom height and minHeight styles", () => {
    render(BlockEditor, { props: { height: "500px", minHeight: "300px" } });
    const el = document.querySelector(".cy-block-editor") as HTMLElement;
    expect(el.style.height).toBe("500px");
    expect(el.style.minHeight).toBe("300px");
  });

  it("applies custom class", () => {
    render(BlockEditor, { props: { class: "my-custom" } });
    const el = document.querySelector(".cy-block-editor");
    expect(el?.classList.contains("my-custom")).toBe(true);
  });

  it("renders an empty block when value is empty", () => {
    render(BlockEditor, { props: { value: "" } });
    const blocks = document.querySelectorAll(".cy-block-editor__block");
    expect(blocks.length).toBe(1);
  });

  it("renders placeholder when block is empty and not active", () => {
    render(BlockEditor, {
      props: { value: "", placeholder: "Start typing..." },
    });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    );
    expect(placeholder).toBeInTheDocument();
    expect(placeholder?.textContent).toBe("Start typing...");
  });

  it("shows preview content for blocks with content", () => {
    render(BlockEditor, { props: { value: "Hello world" } });
    const preview = document.querySelector(".cy-block-editor__preview");
    expect(preview).toBeInTheDocument();
  });

  it("activates block on click in editable mode", async () => {
    render(BlockEditor, { props: { value: "Hello" } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);
    // After click, a textarea should appear
    const textarea = document.querySelector(".cy-block-editor__textarea");
    expect(textarea).toBeInTheDocument();
  });

  it("does not activate block on click in readonly mode", async () => {
    render(BlockEditor, { props: { value: "Hello", readonly: true } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);
    const textarea = document.querySelector(".cy-block-editor__textarea");
    expect(textarea).not.toBeInTheDocument();
  });

  it("renders multiple blocks from complex markdown", () => {
    const md = "# Title\n\nParagraph one\n\n- item 1\n- item 2\n\n> a quote";
    render(BlockEditor, { props: { value: md } });
    const blocks = document.querySelectorAll(".cy-block-editor__block");
    expect(blocks.length).toBe(4);
  });

  it("clicking container empty area when last block is empty focuses it", async () => {
    render(BlockEditor, { props: { value: "" } });
    const container = document.querySelector(
      ".cy-block-editor__blocks",
    ) as HTMLElement;
    await fireEvent.click(container);
    // The empty block should become active
    const textarea = document.querySelector(".cy-block-editor__textarea");
    expect(textarea).toBeInTheDocument();
  });

  it("clicking container when last block has content creates a new block", async () => {
    render(BlockEditor, { props: { value: "Some content" } });
    const container = document.querySelector(
      ".cy-block-editor__blocks",
    ) as HTMLElement;
    const blocksBefore = document.querySelectorAll(
      ".cy-block-editor__block",
    ).length;
    await fireEvent.click(container);
    const blocksAfter = document.querySelectorAll(
      ".cy-block-editor__block",
    ).length;
    expect(blocksAfter).toBe(blocksBefore + 1);
  });

  it("does not create block on container click in readonly mode", async () => {
    render(BlockEditor, { props: { value: "Content", readonly: true } });
    const container = document.querySelector(
      ".cy-block-editor__blocks",
    ) as HTMLElement;
    const blocksBefore = document.querySelectorAll(
      ".cy-block-editor__block",
    ).length;
    await fireEvent.click(container);
    const blocksAfter = document.querySelectorAll(
      ".cy-block-editor__block",
    ).length;
    expect(blocksAfter).toBe(blocksBefore);
  });

  it("commits block on Escape key", async () => {
    render(BlockEditor, { props: { value: "Hello" } });
    // Activate block
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();

    await fireEvent.keyDown(textarea, { key: "Escape" });
    // Block should deactivate (textarea disappears)
    const textareaAfter = document.querySelector(
      ".cy-block-editor__textarea",
    );
    expect(textareaAfter).not.toBeInTheDocument();
  });

  it("creates new block on Enter for single-line block", async () => {
    render(BlockEditor, { props: { value: "Hello" } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    const blocksBefore = document.querySelectorAll(
      ".cy-block-editor__block",
    ).length;

    await fireEvent.keyDown(textarea, { key: "Enter" });
    const blocksAfter = document.querySelectorAll(
      ".cy-block-editor__block",
    ).length;
    expect(blocksAfter).toBe(blocksBefore + 1);
  });

  it("deletes empty block on Backspace at position 0", async () => {
    render(BlockEditor, { props: { value: "First\n\nSecond" } });
    const blocks = document.querySelectorAll(".cy-block-editor__block");
    expect(blocks.length).toBe(2);

    // Click second block to activate it
    const previews = document.querySelectorAll(".cy-block-editor__preview");
    await fireEvent.click(previews[1]);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    // Clear the content to simulate an empty block
    Object.defineProperty(textarea, "selectionStart", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(textarea, "selectionEnd", {
      value: 0,
      writable: true,
    });

    // Set empty content
    textarea.value = "";
    await fireEvent.input(textarea);

    await fireEvent.keyDown(textarea, { key: "Backspace" });
  });

  it("navigates to previous block on ArrowUp at first line", async () => {
    render(BlockEditor, { props: { value: "First\n\nSecond" } });
    const previews = document.querySelectorAll(".cy-block-editor__preview");
    await fireEvent.click(previews[1]);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    Object.defineProperty(textarea, "selectionStart", {
      value: 0,
      writable: true,
    });

    await fireEvent.keyDown(textarea, { key: "ArrowUp" });
    // The first block should now be active
  });

  it("navigates to next block on ArrowDown at last line", async () => {
    render(BlockEditor, { props: { value: "First\n\nSecond" } });
    const previews = document.querySelectorAll(".cy-block-editor__preview");
    await fireEvent.click(previews[0]);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    // Set cursor at end
    const len = textarea.value.length;
    Object.defineProperty(textarea, "selectionStart", {
      value: len,
      writable: true,
    });

    await fireEvent.keyDown(textarea, { key: "ArrowDown" });
  });

  it("commits block on blur", async () => {
    render(BlockEditor, { props: { value: "Hello" } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    await fireEvent.blur(textarea);

    const textareaAfter = document.querySelector(
      ".cy-block-editor__textarea",
    );
    expect(textareaAfter).not.toBeInTheDocument();
  });

  it("calls onchange callback when blocks change", async () => {
    const onchange = vi.fn();
    render(BlockEditor, { props: { value: "Hello", onchange } });

    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    // Commit via escape
    await fireEvent.keyDown(textarea, { key: "Escape" });
    expect(onchange).toHaveBeenCalled();
  });

  it("calls onblockcommit callback when block is committed", async () => {
    const onblockcommit = vi.fn();
    render(BlockEditor, { props: { value: "Hello", onblockcommit } });

    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    await fireEvent.keyDown(textarea, { key: "Escape" });
    expect(onblockcommit).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Hello" }),
    );
  });

  it("calls onblockcreate when a new block is created", async () => {
    const onblockcreate = vi.fn();
    render(BlockEditor, { props: { value: "Hello", onblockcreate } });

    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    await fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onblockcreate).toHaveBeenCalled();
  });

  it("calls onblockdelete when a block is deleted", async () => {
    const onblockdelete = vi.fn();
    render(BlockEditor, {
      props: { value: "First\n\nSecond", onblockdelete },
    });

    // Activate second block
    const previews = document.querySelectorAll(".cy-block-editor__preview");
    await fireEvent.click(previews[1]);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    // Clear content and press Backspace at position 0
    textarea.value = "";
    await fireEvent.input(textarea);
    Object.defineProperty(textarea, "selectionStart", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(textarea, "selectionEnd", {
      value: 0,
      writable: true,
    });

    await fireEvent.keyDown(textarea, { key: "Backspace" });
    expect(onblockdelete).toHaveBeenCalled();
  });

  it("does not delete the last remaining block", async () => {
    render(BlockEditor, { props: { value: "Only block" } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "";
    await fireEvent.input(textarea);
    Object.defineProperty(textarea, "selectionStart", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(textarea, "selectionEnd", {
      value: 0,
      writable: true,
    });

    await fireEvent.keyDown(textarea, { key: "Backspace" });

    // Should still have 1 block
    const blocks = document.querySelectorAll(".cy-block-editor__block");
    expect(blocks.length).toBe(1);
  });

  it("merge with previous block on Backspace with content at position 0", async () => {
    render(BlockEditor, { props: { value: "First\n\nSecond" } });
    const previews = document.querySelectorAll(".cy-block-editor__preview");
    await fireEvent.click(previews[1]);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    Object.defineProperty(textarea, "selectionStart", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(textarea, "selectionEnd", {
      value: 0,
      writable: true,
    });

    // Content is not empty, so this should merge
    await fireEvent.keyDown(textarea, { key: "Backspace" });

    // After merge, should have 1 block
    const blocks = document.querySelectorAll(".cy-block-editor__block");
    expect(blocks.length).toBe(1);
  });

  it("opens slash menu when typing / at start of block", async () => {
    render(BlockEditor, { props: { value: "" } });
    // Activate the empty block
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    // Slash menu should now be open
    const slashMenu = document.querySelector(
      ".cy-block-editor__slash-menu",
    );
    expect(slashMenu).toBeInTheDocument();
  });

  it("filters slash menu items by typing after /", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/head";
    Object.defineProperty(textarea, "selectionStart", {
      value: 5,
      writable: true,
    });
    await fireEvent.input(textarea);

    const items = document.querySelectorAll(
      ".cy-block-editor__slash-item",
    );
    // Should show only heading items
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThan(13); // fewer than all items
  });

  it("closes slash menu when typing non-slash content", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;

    // Open slash menu
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    // Type normal content
    textarea.value = "hello";
    Object.defineProperty(textarea, "selectionStart", {
      value: 5,
      writable: true,
    });
    await fireEvent.input(textarea);

    const slashMenu = document.querySelector(
      ".cy-block-editor__slash-menu",
    );
    expect(slashMenu).not.toBeInTheDocument();
  });

  it("selects a slash menu item on click", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    const firstItem = document.querySelector(
      ".cy-block-editor__slash-item",
    ) as HTMLElement;
    if (firstItem) {
      await fireEvent.click(firstItem);
      // Slash menu should close
      const slashMenu = document.querySelector(
        ".cy-block-editor__slash-menu",
      );
      expect(slashMenu).not.toBeInTheDocument();
    }
  });

  it("navigates slash menu with keyboard", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    // ArrowDown moves focus in slash menu
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    const focused = document.querySelector(
      ".cy-block-editor__slash-item--focused",
    );
    expect(focused).toBeInTheDocument();
  });

  it("closes slash menu on Escape", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    await fireEvent.keyDown(window, { key: "Escape" });
    const slashMenu = document.querySelector(
      ".cy-block-editor__slash-menu",
    );
    expect(slashMenu).not.toBeInTheDocument();
  });

  it("selects slash menu item with Enter", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    // Move to Heading 1 (index 1)
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    await fireEvent.keyDown(window, { key: "Enter" });

    const slashMenu = document.querySelector(
      ".cy-block-editor__slash-menu",
    );
    expect(slashMenu).not.toBeInTheDocument();
  });

  it("shows empty state in slash menu when no items match filter", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/zzzznonexistent";
    Object.defineProperty(textarea, "selectionStart", {
      value: 16,
      writable: true,
    });
    await fireEvent.input(textarea);

    const empty = document.querySelector(
      ".cy-block-editor__slash-empty",
    );
    expect(empty).toBeInTheDocument();
  });

  it("Tab inserts spaces in code blocks", async () => {
    render(BlockEditor, { props: { value: "```\ncode\n```" } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    if (textarea) {
      Object.defineProperty(textarea, "selectionStart", {
        value: 4,
        writable: true,
      });
      Object.defineProperty(textarea, "selectionEnd", {
        value: 4,
        writable: true,
      });

      await fireEvent.keyDown(textarea, { key: "Tab" });
      // The content should have been updated with spaces
    }
  });

  it("renders drag handles with proper accessibility", () => {
    render(BlockEditor, { props: { value: "Hello" } });
    const handle = document.querySelector(
      ".cy-block-editor__handle",
    ) as HTMLElement;
    expect(handle).toBeInTheDocument();
    expect(handle.getAttribute("draggable")).toBe("true");
    expect(handle.getAttribute("aria-label")).toBe("Drag to reorder");
  });

  it("handles drag and drop events on blocks", async () => {
    render(BlockEditor, { props: { value: "First\n\nSecond\n\nThird" } });
    const handles = document.querySelectorAll(".cy-block-editor__handle");
    expect(handles.length).toBe(3);

    // Start dragging first block
    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn(),
    };

    await fireEvent.dragStart(handles[0], { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith("text/plain", "0");
  });

  it("handles dragover event on blocks", async () => {
    render(BlockEditor, { props: { value: "First\n\nSecond" } });
    const blocks = document.querySelectorAll(".cy-block-editor__block");

    await fireEvent.dragOver(blocks[1]);
    expect(blocks[1].classList.contains("cy-block-editor__block--drag-over")).toBe(true);
  });

  it("handles dragleave event", async () => {
    render(BlockEditor, { props: { value: "First\n\nSecond" } });
    const blocks = document.querySelectorAll(".cy-block-editor__block");

    await fireEvent.dragOver(blocks[1]);
    await fireEvent.dragLeave(blocks[1]);
    expect(blocks[1].classList.contains("cy-block-editor__block--drag-over")).toBe(false);
  });

  it("handles drop event reordering blocks", async () => {
    const onblockreorder = vi.fn();
    render(BlockEditor, {
      props: { value: "First\n\nSecond\n\nThird", onblockreorder },
    });

    const handles = document.querySelectorAll(".cy-block-editor__handle");
    const blocks = document.querySelectorAll(".cy-block-editor__block");

    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue("0"),
    };

    await fireEvent.dragStart(handles[0], { dataTransfer });
    await fireEvent.drop(blocks[2], { dataTransfer });
    expect(onblockreorder).toHaveBeenCalled();
  });

  it("handles dragend event", async () => {
    render(BlockEditor, { props: { value: "First\n\nSecond" } });
    const handles = document.querySelectorAll(".cy-block-editor__handle");
    await fireEvent.dragEnd(handles[0]);
    // No error should occur
  });

  it("preview block responds to Enter/Space keyboard events", async () => {
    render(BlockEditor, { props: { value: "Hello" } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.keyDown(preview, { key: "Enter" });
    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    );
    expect(textarea).toBeInTheDocument();
  });

  it("does not activate on preview keyboard in readonly", async () => {
    render(BlockEditor, { props: { value: "Hello", readonly: true } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.keyDown(preview, { key: "Enter" });
    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    );
    expect(textarea).not.toBeInTheDocument();
  });

  it("does not commit on blur when relatedTarget is toolbar", async () => {
    render(BlockEditor, { props: { value: "Hello" } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;

    // Create a mock toolbar element
    const toolbarEl = document.createElement("div");
    toolbarEl.className = "cy-block-editor__toolbar";
    document.body.appendChild(toolbarEl);
    const toolbarBtn = document.createElement("button");
    toolbarEl.appendChild(toolbarBtn);

    await fireEvent.blur(textarea, { relatedTarget: toolbarBtn });

    // Textarea should still be present (not committed)
    const textareaAfter = document.querySelector(
      ".cy-block-editor__textarea",
    );
    expect(textareaAfter).toBeInTheDocument();

    document.body.removeChild(toolbarEl);
  });

  it("supports custom slash menu items", async () => {
    const customItems = [
      {
        label: "Custom Block",
        type: "paragraph" as const,
        template: "custom content",
        icon: "C",
        description: "A custom block type",
      },
    ];
    render(BlockEditor, {
      props: { value: "", slashMenuItems: customItems },
    });

    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    const items = document.querySelectorAll(
      ".cy-block-editor__slash-item",
    );
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain("Custom Block");
  });

  it("updates content via handleInput in active block", async () => {
    render(BlockEditor, { props: { value: "Hello" } });
    const preview = document.querySelector(
      ".cy-block-editor__preview",
    ) as HTMLElement;
    await fireEvent.click(preview);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "Hello World";
    Object.defineProperty(textarea, "selectionStart", {
      value: 11,
      writable: true,
    });
    await fireEvent.input(textarea);

    // Commit
    await fireEvent.keyDown(textarea, { key: "Escape" });

    // Verify the content was updated
    const preview2 = document.querySelector(".cy-block-editor__preview");
    expect(preview2?.textContent).toContain("Hello World");
  });

  it("slash menu ArrowUp wraps around", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    // ArrowUp from index 0 should wrap to last item
    await fireEvent.keyDown(window, { key: "ArrowUp" });
    const focused = document.querySelector(
      ".cy-block-editor__slash-item--focused",
    );
    expect(focused).toBeInTheDocument();
    // Last item should be focused
    const items = document.querySelectorAll(
      ".cy-block-editor__slash-item",
    );
    expect(
      items[items.length - 1].classList.contains(
        "cy-block-editor__slash-item--focused",
      ),
    ).toBe(true);
  });

  it("slash menu mouseenter updates focused index", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    const items = document.querySelectorAll(
      ".cy-block-editor__slash-item",
    );
    if (items.length > 2) {
      await fireEvent.mouseEnter(items[2]);
      expect(
        items[2].classList.contains(
          "cy-block-editor__slash-item--focused",
        ),
      ).toBe(true);
    }
  });

  it("closes slash menu on outside click", async () => {
    render(BlockEditor, { props: { value: "" } });
    const placeholder = document.querySelector(
      ".cy-block-editor__placeholder",
    ) as HTMLElement;
    await fireEvent.click(placeholder);

    const textarea = document.querySelector(
      ".cy-block-editor__textarea",
    ) as HTMLTextAreaElement;
    textarea.value = "/";
    Object.defineProperty(textarea, "selectionStart", {
      value: 1,
      writable: true,
    });
    await fireEvent.input(textarea);

    // Click outside
    await fireEvent.click(document.body);

    const slashMenu = document.querySelector(
      ".cy-block-editor__slash-menu",
    );
    expect(slashMenu).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// block-utils
// ---------------------------------------------------------------------------

describe("block-utils", () => {
  describe("generateBlockId", () => {
    it("generates a non-empty string", () => {
      const id = generateBlockId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("generates unique ids", () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateBlockId()));
      expect(ids.size).toBe(100);
    });
  });

  describe("detectBlockType", () => {
    it("detects headings", () => {
      expect(detectBlockType("# Title")).toBe("heading");
      expect(detectBlockType("## Subtitle")).toBe("heading");
      expect(detectBlockType("###### Deep")).toBe("heading");
    });

    it("detects code blocks", () => {
      expect(detectBlockType("```\ncode\n```")).toBe("code-block");
      expect(detectBlockType("```typescript\ncode\n```")).toBe("code-block");
    });

    it("detects mermaid blocks", () => {
      expect(detectBlockType("```mermaid\nflowchart\n```")).toBe("mermaid");
    });

    it("detects lists", () => {
      expect(detectBlockType("- item")).toBe("unordered-list");
      expect(detectBlockType("* item")).toBe("unordered-list");
      expect(detectBlockType("1. item")).toBe("ordered-list");
    });

    it("detects task lists", () => {
      expect(detectBlockType("- [ ] task")).toBe("task-list");
      expect(detectBlockType("- [x] done")).toBe("task-list");
      expect(detectBlockType("* [ ] task")).toBe("task-list");
    });

    it("detects blockquotes", () => {
      expect(detectBlockType("> quote")).toBe("blockquote");
    });

    it("detects tables", () => {
      expect(detectBlockType("| a | b |\n|---|---|\n| 1 | 2 |")).toBe("table");
    });

    it("detects horizontal rules", () => {
      expect(detectBlockType("---")).toBe("horizontal-rule");
      expect(detectBlockType("***")).toBe("horizontal-rule");
      expect(detectBlockType("___")).toBe("horizontal-rule");
      expect(detectBlockType("----")).toBe("horizontal-rule");
    });

    it("detects math blocks", () => {
      expect(detectBlockType("$$\nE = mc^2\n$$")).toBe("math");
      expect(detectBlockType("$$")).toBe("math");
    });

    it("detects images", () => {
      expect(detectBlockType("![alt](url)")).toBe("image");
      expect(detectBlockType("![](image.png)")).toBe("image");
    });

    it("defaults to paragraph", () => {
      expect(detectBlockType("some text")).toBe("paragraph");
      expect(detectBlockType("")).toBe("paragraph");
    });

    it("handles whitespace-only content as paragraph", () => {
      expect(detectBlockType("   ")).toBe("paragraph");
      expect(detectBlockType("\t")).toBe("paragraph");
    });
  });

  describe("createBlock", () => {
    it("creates a block with defaults", () => {
      const block = createBlock();
      expect(block.id).toBeTruthy();
      expect(block.content).toBe("");
      expect(block.type).toBe("paragraph");
    });

    it("creates a block with content and detected type", () => {
      const block = createBlock("# Hello");
      expect(block.content).toBe("# Hello");
      expect(block.type).toBe("heading");
    });

    it("creates a block with code content", () => {
      const block = createBlock("```\ncode\n```");
      expect(block.type).toBe("code-block");
    });
  });

  describe("parseMarkdownToBlocks", () => {
    it("creates a single empty block for empty input", () => {
      const blocks = parseMarkdownToBlocks("");
      expect(blocks.length).toBe(1);
      expect(blocks[0].content).toBe("");
    });

    it("creates a single empty block for whitespace-only input", () => {
      const blocks = parseMarkdownToBlocks("   ");
      expect(blocks.length).toBe(1);
      expect(blocks[0].content).toBe("");
    });

    it("splits paragraphs on double newlines", () => {
      const blocks = parseMarkdownToBlocks("Hello\n\nWorld");
      expect(blocks.length).toBe(2);
      expect(blocks[0].content).toBe("Hello");
      expect(blocks[1].content).toBe("World");
    });

    it("keeps code blocks intact", () => {
      const md = "```typescript\nconst x = 1;\nconst y = 2;\n```";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("code-block");
    });

    it("handles code block without closing fence", () => {
      const md = "```\nunclosed code";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("code-block");
      expect(blocks[0].content).toContain("unclosed code");
    });

    it("groups consecutive list items", () => {
      const md = "- item 1\n- item 2\n- item 3";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("unordered-list");
    });

    it("groups ordered list items", () => {
      const md = "1. first\n2. second\n3. third";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("ordered-list");
    });

    it("groups task list items", () => {
      const md = "- [ ] todo\n- [x] done\n- [ ] pending";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("task-list");
    });

    it("groups blockquote lines", () => {
      const md = "> line 1\n> line 2\n> line 3";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("blockquote");
    });

    it("groups table rows", () => {
      const md = "| a | b |\n|---|---|\n| 1 | 2 |";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("table");
    });

    it("separates headings from paragraphs", () => {
      const md = "# Title\n\nSome text\n\n## Subtitle";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(3);
      expect(blocks[0].type).toBe("heading");
      expect(blocks[1].type).toBe("paragraph");
      expect(blocks[2].type).toBe("heading");
    });

    it("handles horizontal rules", () => {
      const md = "---";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("horizontal-rule");
    });

    it("handles images", () => {
      const md = "![alt text](image.png)";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("image");
    });

    it("handles mermaid blocks", () => {
      const md = "```mermaid\nflowchart TD\n    A --> B\n```";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("mermaid");
    });

    it("handles math blocks", () => {
      const md = "$$\nE = mc^2\n$$";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("math");
      expect(blocks[0].content).toContain("E = mc^2");
    });

    it("handles math blocks in mixed content", () => {
      const md = "# Title\n\n$$\n\\int_0^1 x dx\n$$\n\nParagraph";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(3);
      expect(blocks[0].type).toBe("heading");
      expect(blocks[1].type).toBe("math");
      expect(blocks[2].type).toBe("paragraph");
    });

    it("handles complex mixed content", () => {
      const md =
        "# Title\n\nSome text\n\n- item 1\n- item 2\n\n```js\ncode\n```\n\n> quote\n\n---\n\n![img](url)";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(7);
      expect(blocks[0].type).toBe("heading");
      expect(blocks[1].type).toBe("paragraph");
      expect(blocks[2].type).toBe("unordered-list");
      expect(blocks[3].type).toBe("code-block");
      expect(blocks[4].type).toBe("blockquote");
      expect(blocks[5].type).toBe("horizontal-rule");
      expect(blocks[6].type).toBe("image");
    });

    it("distinguishes horizontal rules from list items", () => {
      // "***" should be horizontal-rule, not unordered-list
      const blocks = parseMarkdownToBlocks("***");
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("horizontal-rule");
    });

    it("handles multi-line paragraphs", () => {
      const md = "line one\nline two\nline three";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].content).toBe("line one\nline two\nline three");
    });
  });

  describe("serializeBlocksToMarkdown", () => {
    it("joins blocks with double newlines", () => {
      const blocks = [createBlock("# Title"), createBlock("Hello world")];
      const md = serializeBlocksToMarkdown(blocks);
      expect(md).toBe("# Title\n\nHello world");
    });

    it("handles empty blocks", () => {
      const blocks = [createBlock("")];
      const md = serializeBlocksToMarkdown(blocks);
      expect(md).toBe("");
    });

    it("handles multiple blocks including empty", () => {
      const blocks = [createBlock("Hello"), createBlock(""), createBlock("World")];
      const md = serializeBlocksToMarkdown(blocks);
      expect(md).toBe("Hello\n\n\n\nWorld");
    });
  });

  describe("isMultiLineBlock", () => {
    it("returns true for multi-line types", () => {
      expect(isMultiLineBlock("code-block")).toBe(true);
      expect(isMultiLineBlock("mermaid")).toBe(true);
      expect(isMultiLineBlock("table")).toBe(true);
      expect(isMultiLineBlock("blockquote")).toBe(true);
      expect(isMultiLineBlock("unordered-list")).toBe(true);
      expect(isMultiLineBlock("ordered-list")).toBe(true);
      expect(isMultiLineBlock("task-list")).toBe(true);
      expect(isMultiLineBlock("math")).toBe(true);
    });

    it("returns false for single-line types", () => {
      expect(isMultiLineBlock("paragraph")).toBe(false);
      expect(isMultiLineBlock("heading")).toBe(false);
      expect(isMultiLineBlock("horizontal-rule")).toBe(false);
      expect(isMultiLineBlock("image")).toBe(false);
    });
  });

  describe("insertMarkdown", () => {
    it("wraps selected text with markdown markers", () => {
      const textarea = document.createElement("textarea");
      textarea.value = "hello world";
      textarea.selectionStart = 6;
      textarea.selectionEnd = 11;
      document.body.appendChild(textarea);

      const result = insertMarkdown(textarea, "**", "**", "bold text");
      expect(result).toBe("hello **world**");

      document.body.removeChild(textarea);
    });

    it("inserts default text when no selection", () => {
      const textarea = document.createElement("textarea");
      textarea.value = "hello ";
      textarea.selectionStart = 6;
      textarea.selectionEnd = 6;
      document.body.appendChild(textarea);

      const result = insertMarkdown(textarea, "**", "**", "bold text");
      expect(result).toBe("hello **bold text**");

      document.body.removeChild(textarea);
    });
  });

  describe("insertLine", () => {
    it("prepends prefix to current line", () => {
      const textarea = document.createElement("textarea");
      textarea.value = "some text";
      textarea.selectionStart = 4;
      document.body.appendChild(textarea);

      const result = insertLine(textarea, "# ", "Heading");
      expect(result).toBe("# some text");

      document.body.removeChild(textarea);
    });

    it("uses default text when cursor is at line start", () => {
      const textarea = document.createElement("textarea");
      textarea.value = "";
      textarea.selectionStart = 0;
      document.body.appendChild(textarea);

      const result = insertLine(textarea, "> ", "quote");
      expect(result).toBe("> quote");

      document.body.removeChild(textarea);
    });
  });

  describe("insertBlock", () => {
    it("inserts a block of text", () => {
      const textarea = document.createElement("textarea");
      textarea.value = "";
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
      document.body.appendChild(textarea);

      const result = insertBlock(textarea, "---");
      expect(result).toBe("---\n");

      document.body.removeChild(textarea);
    });

    it("adds newlines before block when needed", () => {
      const textarea = document.createElement("textarea");
      textarea.value = "hello";
      textarea.selectionStart = 5;
      textarea.selectionEnd = 5;
      document.body.appendChild(textarea);

      const result = insertBlock(textarea, "---");
      expect(result).toBe("hello\n\n---\n");

      document.body.removeChild(textarea);
    });

    it("adds single newline when cursor is after a newline", () => {
      const textarea = document.createElement("textarea");
      textarea.value = "hello\n";
      textarea.selectionStart = 6;
      textarea.selectionEnd = 6;
      document.body.appendChild(textarea);

      const result = insertBlock(textarea, "---");
      expect(result).toBe("hello\n\n---\n");

      document.body.removeChild(textarea);
    });
  });
});
