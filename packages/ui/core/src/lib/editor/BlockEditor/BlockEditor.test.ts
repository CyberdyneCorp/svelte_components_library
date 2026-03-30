import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import BlockEditor from "./BlockEditor.svelte";
import {
  parseMarkdownToBlocks,
  serializeBlocksToMarkdown,
  detectBlockType,
  createBlock,
  isMultiLineBlock,
} from "./block-utils.js";

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
});

describe("block-utils", () => {
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
    });

    it("detects images", () => {
      expect(detectBlockType("![alt](url)")).toBe("image");
    });

    it("defaults to paragraph", () => {
      expect(detectBlockType("some text")).toBe("paragraph");
      expect(detectBlockType("")).toBe("paragraph");
    });
  });

  describe("parseMarkdownToBlocks", () => {
    it("creates a single empty block for empty input", () => {
      const blocks = parseMarkdownToBlocks("");
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

    it("groups consecutive list items", () => {
      const md = "- item 1\n- item 2\n- item 3";
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("unordered-list");
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
  });

  describe("isMultiLineBlock", () => {
    it("returns true for multi-line types", () => {
      expect(isMultiLineBlock("code-block")).toBe(true);
      expect(isMultiLineBlock("table")).toBe(true);
      expect(isMultiLineBlock("unordered-list")).toBe(true);
    });

    it("returns false for single-line types", () => {
      expect(isMultiLineBlock("paragraph")).toBe(false);
      expect(isMultiLineBlock("heading")).toBe(false);
      expect(isMultiLineBlock("horizontal-rule")).toBe(false);
    });
  });
});
