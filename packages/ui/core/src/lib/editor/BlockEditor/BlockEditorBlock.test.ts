import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import BlockEditorBlock from "./BlockEditorBlock.svelte";

const baseBlock = {
  id: "block-1",
  content: "Hello world",
  type: "paragraph" as const,
};

const emptyBlock = {
  id: "block-2",
  content: "",
  type: "paragraph" as const,
};

describe("BlockEditorBlock", () => {
  it("renders block container", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock },
    });
    expect(container.querySelector(".cy-block-editor__block")).toBeInTheDocument();
  });

  it("renders preview with markdown content when not active", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: false },
    });
    expect(container.querySelector(".cy-block-editor__preview")).toBeInTheDocument();
    expect(container.querySelector(".cy-block-editor__textarea")).not.toBeInTheDocument();
  });

  it("renders textarea when active", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true },
    });
    expect(container.querySelector(".cy-block-editor__textarea")).toBeInTheDocument();
  });

  it("shows placeholder when content is empty and not active", () => {
    render(BlockEditorBlock, {
      props: { block: emptyBlock, active: false, placeholder: "Type here..." },
    });
    expect(screen.getByText("Type here...")).toBeInTheDocument();
  });

  it("renders drag handle when not readonly", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock },
    });
    expect(container.querySelector(".cy-block-editor__handle")).toBeInTheDocument();
  });

  it("hides drag handle in readonly mode", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, readonly: true },
    });
    expect(container.querySelector(".cy-block-editor__handle")).not.toBeInTheDocument();
  });

  it("calls onactivate when preview is clicked", async () => {
    const onactivate = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: false, onactivate },
    });
    const preview = container.querySelector(".cy-block-editor__preview")!;
    await fireEvent.click(preview);
    expect(onactivate).toHaveBeenCalled();
  });

  it("does not call onactivate when preview is clicked in readonly", async () => {
    const onactivate = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: false, readonly: true, onactivate },
    });
    const preview = container.querySelector(".cy-block-editor__preview")!;
    await fireEvent.click(preview);
    expect(onactivate).not.toHaveBeenCalled();
  });

  it("calls oncommit when Escape is pressed in textarea", async () => {
    const oncommit = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, oncommit },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")!;
    await fireEvent.keyDown(textarea, { key: "Escape" });
    expect(oncommit).toHaveBeenCalled();
  });

  it("calls oncreateafter on Enter for single-line block", async () => {
    const oncreateafter = vi.fn();
    const oncommit = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, oncreateafter, oncommit },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")!;
    await fireEvent.keyDown(textarea, { key: "Enter" });
    expect(oncommit).toHaveBeenCalled();
    expect(oncreateafter).toHaveBeenCalled();
  });

  it("calls ondelete on Backspace at empty content", async () => {
    const ondelete = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: emptyBlock, active: true, ondelete },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    // Cursor at position 0, content empty
    await fireEvent.keyDown(textarea, { key: "Backspace" });
    expect(ondelete).toHaveBeenCalled();
  });

  it("calls onmerge on Backspace at position 0 with content", async () => {
    const onmerge = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, onmerge },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    // Set cursor to position 0
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;
    await fireEvent.keyDown(textarea, { key: "Backspace" });
    expect(onmerge).toHaveBeenCalled();
  });

  it("calls onfocusprev on ArrowUp at first line", async () => {
    const onfocusprev = vi.fn();
    const oncommit = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, onfocusprev, oncommit },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    textarea.selectionStart = 0;
    await fireEvent.keyDown(textarea, { key: "ArrowUp" });
    expect(onfocusprev).toHaveBeenCalled();
    expect(oncommit).toHaveBeenCalled();
  });

  it("calls onfocusnext on ArrowDown at last line", async () => {
    const onfocusnext = vi.fn();
    const oncommit = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, onfocusnext, oncommit },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    textarea.selectionStart = textarea.value.length;
    await fireEvent.keyDown(textarea, { key: "ArrowDown" });
    expect(onfocusnext).toHaveBeenCalled();
    expect(oncommit).toHaveBeenCalled();
  });

  it("calls oncontentchange on input", async () => {
    const oncontentchange = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, oncontentchange },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")!;
    await fireEvent.input(textarea, { target: { value: "new content" } });
    expect(oncontentchange).toHaveBeenCalled();
  });

  it("applies active class when active", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true },
    });
    expect(container.querySelector(".cy-block-editor__block--active")).toBeInTheDocument();
  });

  it("applies empty class when content empty and not active", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: emptyBlock, active: false },
    });
    expect(container.querySelector(".cy-block-editor__block--empty")).toBeInTheDocument();
  });

  it("handles drag over event", async () => {
    const ondragover = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, ondragover },
    });
    const blockEl = container.querySelector(".cy-block-editor__block")!;
    await fireEvent.dragOver(blockEl);
    expect(ondragover).toHaveBeenCalled();
    expect(container.querySelector(".cy-block-editor__block--drag-over")).toBeInTheDocument();
  });

  it("removes drag-over class on drag leave", async () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock },
    });
    const blockEl = container.querySelector(".cy-block-editor__block")!;
    await fireEvent.dragOver(blockEl);
    expect(container.querySelector(".cy-block-editor__block--drag-over")).toBeInTheDocument();
    await fireEvent.dragLeave(blockEl);
    expect(container.querySelector(".cy-block-editor__block--drag-over")).not.toBeInTheDocument();
  });

  it("calls ondrop on drop event", async () => {
    const ondrop = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, ondrop },
    });
    const blockEl = container.querySelector(".cy-block-editor__block")!;
    await fireEvent.dragOver(blockEl);
    await fireEvent.drop(blockEl);
    expect(ondrop).toHaveBeenCalled();
  });

  it("calls onslashopen when typing / at start", async () => {
    const onslashopen = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: emptyBlock, active: true, onslashopen },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    textarea.value = "/";
    textarea.selectionStart = 1;
    await fireEvent.input(textarea);
    expect(onslashopen).toHaveBeenCalled();
  });

  it("calls onslashclose when slash is removed", async () => {
    const onslashclose = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: emptyBlock, active: true, onslashclose },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    textarea.value = "hello";
    textarea.selectionStart = 5;
    await fireEvent.input(textarea);
    expect(onslashclose).toHaveBeenCalled();
  });

  it("commits on blur unless focus goes to toolbar", async () => {
    const oncommit = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, oncommit },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")!;
    await fireEvent.blur(textarea, { relatedTarget: null });
    expect(oncommit).toHaveBeenCalled();
  });

  it("activates via Enter keydown on preview", async () => {
    const onactivate = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: false, onactivate },
    });
    const preview = container.querySelector(".cy-block-editor__preview")!;
    await fireEvent.keyDown(preview, { key: "Enter" });
    expect(onactivate).toHaveBeenCalled();
  });

  it("activates via Space keydown on preview", async () => {
    const onactivate = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: false, onactivate },
    });
    const preview = container.querySelector(".cy-block-editor__preview")!;
    await fireEvent.keyDown(preview, { key: " " });
    expect(onactivate).toHaveBeenCalled();
  });

  it("renders heading content in preview", () => {
    const headingBlock = {
      id: "h1",
      content: "# Title",
      type: "heading" as const,
    };
    const { container } = render(BlockEditorBlock, {
      props: { block: headingBlock, active: false },
    });
    expect(container.querySelector(".cy-md-preview")).toBeInTheDocument();
  });

  it("inserts Tab spaces in code block", async () => {
    const codeBlock = {
      id: "code-1",
      content: "```\nfunction hello() {\n```",
      type: "code-block" as const,
    };
    const { container } = render(BlockEditorBlock, {
      props: { block: codeBlock, active: true },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    await fireEvent.keyDown(textarea, { key: "Tab" });
    // Tab should be prevented (not default) - no error thrown
    expect(textarea).toBeInTheDocument();
  });

  it("does not create new block on Enter in multi-line list block", async () => {
    const listBlock = {
      id: "list-1",
      content: "- Item 1\n- Item 2",
      type: "unordered-list" as const,
    };
    const oncreateafter = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: listBlock, active: true, oncreateafter },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    // Position cursor in middle of content (not on empty list item)
    textarea.selectionStart = 5;
    await fireEvent.keyDown(textarea, { key: "Enter" });
    // Should NOT call oncreateafter since it's a multi-line block with content
    expect(oncreateafter).not.toHaveBeenCalled();
  });

  it("commits and creates after on Enter for empty list item marker", async () => {
    const listBlock = {
      id: "list-1",
      content: "- Item 1\n- ",
      type: "unordered-list" as const,
    };
    const oncreateafter = vi.fn();
    const oncommit = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: listBlock, active: true, oncreateafter, oncommit },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    // Place cursor at end (after "- ")
    textarea.selectionStart = textarea.value.length;
    await fireEvent.keyDown(textarea, { key: "Enter" });
    expect(oncommit).toHaveBeenCalled();
    expect(oncreateafter).toHaveBeenCalled();
  });

  it("does not commit on blur when focus goes to toolbar", async () => {
    const oncommit = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, oncommit },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")!;
    // Create a fake toolbar element
    const toolbar = document.createElement("div");
    toolbar.className = "cy-block-editor__toolbar";
    const toolbarBtn = document.createElement("button");
    toolbar.appendChild(toolbarBtn);
    document.body.appendChild(toolbar);
    await fireEvent.blur(textarea, { relatedTarget: toolbarBtn });
    expect(oncommit).not.toHaveBeenCalled();
    toolbar.remove();
  });

  it("calls ontextareaready when textarea mounts", () => {
    const ontextareaready = vi.fn();
    render(BlockEditorBlock, {
      props: { block: baseBlock, active: true, ontextareaready },
    });
    expect(ontextareaready).toHaveBeenCalled();
  });

  it("does not call ArrowDown handler when not at last line", async () => {
    const multiLineBlock = {
      id: "ml-1",
      content: "Line 1\nLine 2\nLine 3",
      type: "paragraph" as const,
    };
    const onfocusnext = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: multiLineBlock, active: true, onfocusnext },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    // Place cursor at beginning (not last line)
    textarea.selectionStart = 0;
    await fireEvent.keyDown(textarea, { key: "ArrowDown" });
    expect(onfocusnext).not.toHaveBeenCalled();
  });

  it("does not call ArrowUp handler when not at first line", async () => {
    const multiLineBlock = {
      id: "ml-2",
      content: "Line 1\nLine 2",
      type: "paragraph" as const,
    };
    const onfocusprev = vi.fn();
    const { container } = render(BlockEditorBlock, {
      props: { block: multiLineBlock, active: true, onfocusprev },
    });
    const textarea = container.querySelector(".cy-block-editor__textarea")! as HTMLTextAreaElement;
    // Place cursor at end (second line)
    textarea.selectionStart = textarea.value.length;
    await fireEvent.keyDown(textarea, { key: "ArrowUp" });
    expect(onfocusprev).not.toHaveBeenCalled();
  });

  it("preview has button role when not readonly", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: false, readonly: false },
    });
    const preview = container.querySelector(".cy-block-editor__preview");
    expect(preview?.getAttribute("role")).toBe("button");
  });

  it("preview has presentation role when readonly", () => {
    const { container } = render(BlockEditorBlock, {
      props: { block: baseBlock, active: false, readonly: true },
    });
    const preview = container.querySelector(".cy-block-editor__preview");
    expect(preview?.getAttribute("role")).toBe("presentation");
  });
});
