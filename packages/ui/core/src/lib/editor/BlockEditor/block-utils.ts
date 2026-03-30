// BlockEditor utility functions

export type BlockType =
  | "paragraph"
  | "heading"
  | "unordered-list"
  | "ordered-list"
  | "task-list"
  | "code-block"
  | "blockquote"
  | "table"
  | "horizontal-rule"
  | "image"
  | "mermaid";

export interface Block {
  id: string;
  content: string;
  type: BlockType;
}

export function generateBlockId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function detectBlockType(content: string): BlockType {
  const trimmed = content.trim();
  if (!trimmed) return "paragraph";

  const firstLine = trimmed.split("\n")[0];

  if (/^#{1,6}\s/.test(firstLine)) return "heading";
  if (/^```mermaid/.test(firstLine)) return "mermaid";
  if (/^```/.test(firstLine)) return "code-block";
  if (/^[-*]\s+\[[ x]\]\s/.test(firstLine)) return "task-list";
  if (/^[-*]\s/.test(firstLine)) return "unordered-list";
  if (/^\d+\.\s/.test(firstLine)) return "ordered-list";
  if (/^>\s/.test(firstLine)) return "blockquote";
  if (/^\|.+\|/.test(firstLine)) return "table";
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) return "horizontal-rule";
  if (/^!\[/.test(firstLine)) return "image";

  return "paragraph";
}

export function createBlock(content: string = ""): Block {
  return {
    id: generateBlockId(),
    content,
    type: detectBlockType(content),
  };
}

export function parseMarkdownToBlocks(markdown: string): Block[] {
  if (!markdown || !markdown.trim()) {
    return [createBlock("")];
  }

  const blocks: Block[] = [];
  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    // Skip empty lines between blocks
    if (lines[i].trim() === "") {
      i++;
      continue;
    }

    // Fenced code blocks — collect until closing ```
    if (/^```/.test(lines[i])) {
      const codeLines: string[] = [lines[i]];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        codeLines.push(lines[i]); // closing ```
        i++;
      }
      blocks.push(createBlock(codeLines.join("\n")));
      continue;
    }

    // Table — consecutive lines starting with |
    if (/^\|.+\|/.test(lines[i])) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push(createBlock(tableLines.join("\n")));
      continue;
    }

    // Blockquote — consecutive lines starting with >
    if (/^>\s?/.test(lines[i])) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i]);
        i++;
      }
      blocks.push(createBlock(quoteLines.join("\n")));
      continue;
    }

    // Task list — consecutive lines starting with - [ ] or - [x]
    if (/^[-*]\s+\[[ x]\]\s/.test(lines[i])) {
      const taskLines: string[] = [];
      while (i < lines.length && /^[-*]\s+\[[ x]\]\s/.test(lines[i])) {
        taskLines.push(lines[i]);
        i++;
      }
      blocks.push(createBlock(taskLines.join("\n")));
      continue;
    }

    // Unordered list — consecutive lines starting with - or *
    if (/^(\s*)[-*]\s/.test(lines[i]) && !/^[-*]{3,}$/.test(lines[i].trim())) {
      const listLines: string[] = [];
      while (
        i < lines.length &&
        /^(\s*)[-*]\s/.test(lines[i]) &&
        !/^[-*]{3,}$/.test(lines[i].trim())
      ) {
        listLines.push(lines[i]);
        i++;
      }
      blocks.push(createBlock(listLines.join("\n")));
      continue;
    }

    // Ordered list — consecutive lines starting with number.
    if (/^\d+\.\s/.test(lines[i])) {
      const listLines: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listLines.push(lines[i]);
        i++;
      }
      blocks.push(createBlock(listLines.join("\n")));
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())) {
      blocks.push(createBlock(lines[i]));
      i++;
      continue;
    }

    // Heading — single line
    if (/^#{1,6}\s/.test(lines[i])) {
      blocks.push(createBlock(lines[i]));
      i++;
      continue;
    }

    // Image — single line
    if (/^!\[/.test(lines[i])) {
      blocks.push(createBlock(lines[i]));
      i++;
      continue;
    }

    // Paragraph — consecutive non-empty, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\|.+\|/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
      !/^!\[/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(createBlock(paraLines.join("\n")));
    }
  }

  return blocks.length > 0 ? blocks : [createBlock("")];
}

export function serializeBlocksToMarkdown(blocks: Block[]): string {
  return blocks
    .map((b) => b.content)
    .filter((c) => c !== undefined)
    .join("\n\n");
}

/** Check if a block type supports multi-line editing (Enter adds newline, not commit) */
export function isMultiLineBlock(type: BlockType): boolean {
  return [
    "code-block",
    "mermaid",
    "table",
    "blockquote",
    "unordered-list",
    "ordered-list",
    "task-list",
  ].includes(type);
}

/** Insertion helpers for toolbar — work with any textarea */
export function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  defaultText: string,
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const text = selected || defaultText;
  const insertion = before + text + after;

  const newValue =
    textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
  textarea.value = newValue;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  const newStart = start + before.length;
  const newEnd = newStart + text.length;
  textarea.setSelectionRange(newStart, newEnd);
  textarea.focus();

  return newValue;
}

export function insertLine(
  textarea: HTMLTextAreaElement,
  prefix: string,
  defaultText: string,
): string {
  const start = textarea.selectionStart;
  const value = textarea.value;

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const beforeLine = value.substring(0, lineStart);
  const afterCursor = value.substring(start);
  const currentLineBeforeCursor = value.substring(lineStart, start);

  const text = currentLineBeforeCursor || defaultText;
  const insertion = prefix + text;
  const newValue = beforeLine + insertion + afterCursor;

  textarea.value = newValue;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  const newStart = lineStart + prefix.length;
  const newEnd = newStart + text.length;
  textarea.setSelectionRange(newStart, newEnd);
  textarea.focus();

  return newValue;
}

export function insertBlock(textarea: HTMLTextAreaElement, text: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const needsNewline = start > 0 && textarea.value[start - 1] !== "\n";
  const prefix = needsNewline ? "\n\n" : start > 0 ? "\n" : "";
  const insertion = prefix + text + "\n";

  const newValue =
    textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
  textarea.value = newValue;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  const newPos = start + insertion.length;
  textarea.setSelectionRange(newPos, newPos);
  textarea.focus();

  return newValue;
}
