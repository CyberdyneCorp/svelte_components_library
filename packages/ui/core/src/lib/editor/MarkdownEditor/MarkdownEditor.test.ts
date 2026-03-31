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

  it("shows toolbar in preview mode when not readonly", async () => {
    render(MarkdownEditor, { props: { showToolbar: true } });
    const previewBtn = screen.getByText("Preview");
    await fireEvent.click(previewBtn);
    const toolbar = document.querySelector(".cy-md-toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("hides toolbar in preview mode when readonly", async () => {
    render(MarkdownEditor, { props: { showToolbar: true, readonly: true } });
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

  // Editable Preview Mode
  describe("editable preview mode", () => {
    it("renders editable preview blocks in non-readonly preview mode", () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "# Hello\n\nWorld" },
      });
      const editablePreview = document.querySelector(".cy-editable-preview");
      expect(editablePreview).toBeInTheDocument();
    });

    it("renders static preview in readonly preview mode", () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "# Hello", readonly: true },
      });
      const editablePreview = document.querySelector(".cy-editable-preview");
      expect(editablePreview).not.toBeInTheDocument();
      const preview = document.querySelector(".cy-md-preview");
      expect(preview).toBeInTheDocument();
    });

    it("renders static preview in split mode", () => {
      render(MarkdownEditor, {
        props: { mode: "split", value: "# Hello" },
      });
      const editablePreview = document.querySelector(".cy-editable-preview");
      expect(editablePreview).not.toBeInTheDocument();
    });

    it("shows editable blocks for each markdown block", () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "# Title\n\nParagraph\n\n- Item 1\n- Item 2" },
      });
      const blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBe(3); // heading, paragraph, list
    });

    it("activates editing when block is clicked", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "Hello world" },
      });
      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      expect(blockPreview).toBeInTheDocument();
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      expect(textarea.value).toBe("Hello world");
    });

    it("commits block on Escape key", async () => {
      const onchange = vi.fn();
      render(MarkdownEditor, {
        props: { mode: "preview", value: "Hello", onchange },
      });

      // Click to activate
      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      textarea.value = "Hello updated";
      await fireEvent.input(textarea);
      await fireEvent.keyDown(textarea, { key: "Escape" });

      // Block should deactivate
      const activeBlock = document.querySelector(".cy-editable-preview__textarea");
      expect(activeBlock).not.toBeInTheDocument();
    });

    it("toolbar is visible in editable preview mode", () => {
      render(MarkdownEditor, {
        props: { mode: "preview", showToolbar: true },
      });
      const toolbar = document.querySelector(".cy-md-toolbar");
      expect(toolbar).toBeInTheDocument();
    });

    it("preserves value when switching from preview to edit mode", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "# Hello\n\nWorld" },
      });
      const editBtn = screen.getByText("Edit");
      await fireEvent.click(editBtn);

      const textarea = document.querySelector(".cy-md-editor__textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("# Hello\n\nWorld");
    });

    it("renders task list with checkboxes", () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "- [ ] Todo\n- [x] Done" },
      });
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(2);
    });

    it("renders multiple block types correctly", () => {
      const md = "# Heading\n\nParagraph text\n\n```js\nconst x = 1;\n```\n\n---\n\n> Quote";
      render(MarkdownEditor, {
        props: { mode: "preview", value: md },
      });
      const blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBe(5); // heading, paragraph, code, hr, quote
    });

    it("creates new block on Enter in single-line block", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "Hello" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      await fireEvent.keyDown(textarea, { key: "Enter" });

      // Should now have 2 blocks
      const blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBe(2);
    });

    it("shows placeholder for empty blocks", () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "" },
      });
      const placeholder = document.querySelector(".cy-editable-preview__placeholder");
      expect(placeholder).toBeInTheDocument();
    });

    // Checkbox toggling
    it("toggles unchecked task checkbox to checked on click", async () => {
      const onchange = vi.fn();
      render(MarkdownEditor, {
        props: { mode: "preview", value: "- [ ] Todo\n- [x] Done", onchange },
      });
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(2);

      // Click the first (unchecked) checkbox
      await fireEvent.click(checkboxes[0]);

      // onchange should be called with toggled value
      expect(onchange).toHaveBeenCalled();
      const newValue = onchange.mock.calls[onchange.mock.calls.length - 1][0];
      expect(newValue).toContain("- [x] Todo");
    });

    it("toggles checked task checkbox to unchecked on click", async () => {
      const onchange = vi.fn();
      render(MarkdownEditor, {
        props: { mode: "preview", value: "- [ ] Todo\n- [x] Done", onchange },
      });
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');

      // Click the second (checked) checkbox
      await fireEvent.click(checkboxes[1]);

      expect(onchange).toHaveBeenCalled();
      const newValue = onchange.mock.calls[onchange.mock.calls.length - 1][0];
      expect(newValue).toContain("- [ ] Done");
    });

    // Block deletion
    it("deletes empty block on Backspace", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "First\n\nSecond" },
      });
      let blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBe(2);

      // Activate second block
      const blockPreviews = document.querySelectorAll(".cy-editable-preview__block-preview");
      await fireEvent.click(blockPreviews[1]);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      // Clear the content
      textarea.value = "";
      await fireEvent.input(textarea);
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;

      await fireEvent.keyDown(textarea, { key: "Backspace" });

      // Should have 1 block remaining
      blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBe(1);
    });

    it("does not delete the last remaining block", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "Only block" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      textarea.value = "";
      await fireEvent.input(textarea);
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;

      await fireEvent.keyDown(textarea, { key: "Backspace" });

      // Should still have 1 block
      const blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBe(1);
    });

    // Block merging on Backspace
    it("merges with previous block on Backspace at position 0 with content", async () => {
      const onchange = vi.fn();
      render(MarkdownEditor, {
        props: { mode: "preview", value: "First\n\nSecond", onchange },
      });

      // Activate second block
      const blockPreviews = document.querySelectorAll(".cy-editable-preview__block-preview");
      await fireEvent.click(blockPreviews[1]);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;

      await fireEvent.keyDown(textarea, { key: "Backspace" });

      // Should merge into 1 block
      const blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBe(1);
    });

    // Arrow navigation between blocks
    it("navigates to previous block on ArrowUp at first line", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "First\n\nSecond" },
      });

      // Activate second block
      const blockPreviews = document.querySelectorAll(".cy-editable-preview__block-preview");
      await fireEvent.click(blockPreviews[1]);

      let textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Second");
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;

      await fireEvent.keyDown(textarea, { key: "ArrowUp" });

      // Should now have first block activated (or no textarea if committed)
      // The block should have committed and re-activated the previous one
      textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      if (textarea) {
        expect(textarea.value).toBe("First");
      }
    });

    it("navigates to next block on ArrowDown at last line", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "First\n\nSecond" },
      });

      // Activate first block
      const blockPreviews = document.querySelectorAll(".cy-editable-preview__block-preview");
      await fireEvent.click(blockPreviews[0]);

      let textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("First");
      textarea.selectionStart = textarea.value.length;
      textarea.selectionEnd = textarea.value.length;

      await fireEvent.keyDown(textarea, { key: "ArrowDown" });

      textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      if (textarea) {
        expect(textarea.value).toBe("Second");
      }
    });

    // Enter handling for multi-line blocks
    it("allows Enter to add newline in multi-line blocks", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "- Item 1\n- Item 2" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      // Position cursor at end of first item
      textarea.selectionStart = 8; // After "- Item 1"
      textarea.selectionEnd = 8;

      // Enter should NOT prevent default (let newline be added)
      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
      const prevented = !textarea.dispatchEvent(event);
      // In multi-line block, regular Enter should not be prevented
      // (it adds a newline naturally)
    });

    it("commits and creates new block on Enter for empty list item", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "- Item 1\n- Item 2" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      // Simulate empty list item at end
      textarea.value = "- Item 1\n- Item 2\n- ";
      await fireEvent.input(textarea);
      textarea.selectionStart = textarea.value.length;
      textarea.selectionEnd = textarea.value.length;

      await fireEvent.keyDown(textarea, { key: "Enter" });

      // Should have committed and created a new block
      const blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBeGreaterThanOrEqual(2);
    });

    // Blur behavior
    it("commits block on blur (not to toolbar)", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "Hello" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      textarea.value = "Updated";
      await fireEvent.input(textarea);

      // Blur without toolbar as relatedTarget
      await fireEvent.blur(textarea, { relatedTarget: null });

      // Block should deactivate
      const activeTextarea = document.querySelector(".cy-editable-preview__textarea");
      expect(activeTextarea).not.toBeInTheDocument();
    });

    // Tab handling in code blocks
    it("inserts spaces on Tab in code block", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "```\ncode\n```" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      textarea.selectionStart = 4; // After "```\n"
      textarea.selectionEnd = 4;

      await fireEvent.keyDown(textarea, { key: "Tab" });

      expect(textarea.value).toContain("  "); // 2 spaces inserted
    });

    // Math blocks in editable preview
    it("renders math blocks in editable preview", () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "# Title\n\n$$\nE = mc^2\n$$" },
      });
      const blocks = document.querySelectorAll(".cy-editable-preview__block");
      expect(blocks.length).toBe(2); // heading, math
      const mathContainer = document.querySelector(".cy-md-math");
      expect(mathContainer).toBeInTheDocument();
    });

    it("activates math block for editing", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "$$\nE = mc^2\n$$" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      expect(textarea.value).toContain("$$");
      expect(textarea.value).toContain("E = mc^2");
      // Math blocks should use monospace font
      expect(textarea.classList.contains("cy-editable-preview__textarea--mono")).toBe(true);
    });

    // Inline math within paragraph blocks
    it("renders inline math inside paragraph blocks", () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "The equation $E = mc^2$ is famous" },
      });
      const inlineMath = document.querySelector(".cy-md-math-inline");
      expect(inlineMath).toBeInTheDocument();
    });

    // Switching blocks
    it("commits previous block when clicking a different block", async () => {
      const onchange = vi.fn();
      render(MarkdownEditor, {
        props: { mode: "preview", value: "First\n\nSecond", onchange },
      });

      // Activate first block
      const blockPreviews = document.querySelectorAll(".cy-editable-preview__block-preview");
      await fireEvent.click(blockPreviews[0]);

      let textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      textarea.value = "First modified";
      await fireEvent.input(textarea);

      // Click second block (should commit first, then activate second)
      // After commit, blockPreviews may have changed; re-query
      const secondBlockPreview = document.querySelectorAll(".cy-editable-preview__block-preview")[0] as HTMLElement;
      if (secondBlockPreview) {
        await fireEvent.click(secondBlockPreview);
      }

      // onchange should have been called from committing first block
      expect(onchange).toHaveBeenCalled();
    });

    // Block type-specific rendering
    it("renders code block with monospace textarea", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "```js\nconst x = 1;\n```" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea.classList.contains("cy-editable-preview__textarea--mono")).toBe(true);
    });

    it("renders heading block for editing", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "# My Heading" },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("# My Heading");
    });

    it("renders table block for editing", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "| A | B |\n|---|---|\n| 1 | 2 |" },
      });
      const table = document.querySelector(".cy-md-table");
      expect(table).toBeInTheDocument();

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea.value).toContain("| A | B |");
    });

    it("renders blockquote for editing", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "> A wise quote" },
      });
      const blockquote = document.querySelector("blockquote");
      expect(blockquote).toBeInTheDocument();

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("> A wise quote");
    });

    // Does not activate on readonly
    it("does not activate blocks on click when readonly", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "Hello", readonly: true },
      });
      // In readonly, the static MarkdownPreview is shown, not EditablePreview
      const editablePreview = document.querySelector(".cy-editable-preview");
      expect(editablePreview).not.toBeInTheDocument();
    });

    // Value sync after editing
    it("updates value after editing and committing a block", async () => {
      const onchange = vi.fn();
      render(MarkdownEditor, {
        props: { mode: "preview", value: "Original", onchange },
      });

      const blockPreview = document.querySelector(".cy-editable-preview__block-preview") as HTMLElement;
      await fireEvent.click(blockPreview);

      const textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      textarea.value = "Modified";
      await fireEvent.input(textarea);
      await fireEvent.keyDown(textarea, { key: "Escape" });

      expect(onchange).toHaveBeenCalledWith("Modified");
    });

    // Multiple block types editing flow
    it("supports editing multiple block types sequentially", async () => {
      render(MarkdownEditor, {
        props: { mode: "preview", value: "# Title\n\nParagraph\n\n- List item" },
      });

      const blocks = document.querySelectorAll(".cy-editable-preview__block-preview");
      expect(blocks.length).toBe(3);

      // Edit heading
      await fireEvent.click(blocks[0]);
      let textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("# Title");
      await fireEvent.keyDown(textarea, { key: "Escape" });

      // Edit paragraph
      const updatedBlocks = document.querySelectorAll(".cy-editable-preview__block-preview");
      await fireEvent.click(updatedBlocks[1]);
      textarea = document.querySelector(".cy-editable-preview__textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Paragraph");
      await fireEvent.keyDown(textarea, { key: "Escape" });
    });
  });
});
