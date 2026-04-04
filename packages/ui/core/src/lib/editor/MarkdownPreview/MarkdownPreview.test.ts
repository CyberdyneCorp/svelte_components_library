import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import MarkdownPreview from "./MarkdownPreview.svelte";

describe("MarkdownPreview", () => {
  it("renders the component", () => {
    render(MarkdownPreview);
    const el = document.querySelector(".cy-md-preview");
    expect(el).toBeInTheDocument();
  });

  it("renders markdown content as HTML", () => {
    render(MarkdownPreview, { props: { content: "# Hello" } });
    const h1 = document.querySelector("h1");
    expect(h1).toBeInTheDocument();
  });

  it("renders empty state with no content", () => {
    render(MarkdownPreview, { props: { content: "" } });
    const el = document.querySelector(".cy-md-preview");
    expect(el).toBeInTheDocument();
  });

  it("accepts custom className", () => {
    render(MarkdownPreview, { props: { class: "custom-class" } });
    const el = document.querySelector(".cy-md-preview");
    expect(el).toBeInTheDocument();
  });

  // Headings
  it("renders h2 headings", () => {
    render(MarkdownPreview, { props: { content: "## Subtitle" } });
    const h2 = document.querySelector("h2");
    expect(h2).toBeInTheDocument();
    expect(h2?.textContent).toBe("Subtitle");
  });

  // Bold and italic
  it("renders bold text", () => {
    render(MarkdownPreview, { props: { content: "**bold**" } });
    const strong = document.querySelector("strong");
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe("bold");
  });

  it("renders italic text", () => {
    render(MarkdownPreview, { props: { content: "*italic*" } });
    const em = document.querySelector("em");
    expect(em).toBeInTheDocument();
    expect(em?.textContent).toBe("italic");
  });

  // Strikethrough
  it("renders strikethrough text", () => {
    render(MarkdownPreview, { props: { content: "~~deleted~~" } });
    const del = document.querySelector("del");
    expect(del).toBeInTheDocument();
  });

  // Code
  it("renders inline code", () => {
    render(MarkdownPreview, { props: { content: "`const x = 1`" } });
    const code = document.querySelector(".cy-md-inline-code");
    expect(code).toBeInTheDocument();
  });

  it("renders code blocks", () => {
    render(MarkdownPreview, { props: { content: "```js\nconst x = 1;\n```" } });
    const pre = document.querySelector(".cy-md-pre");
    expect(pre).toBeInTheDocument();
  });

  // Lists
  it("renders unordered lists", () => {
    render(MarkdownPreview, { props: { content: "- Item 1\n- Item 2" } });
    const ul = document.querySelector("ul");
    expect(ul).toBeInTheDocument();
    const items = document.querySelectorAll("li");
    expect(items.length).toBe(2);
  });

  it("renders ordered lists", () => {
    render(MarkdownPreview, { props: { content: "1. First\n2. Second" } });
    const ol = document.querySelector("ol");
    expect(ol).toBeInTheDocument();
  });

  // Task lists
  it("renders task lists with checkboxes", () => {
    render(MarkdownPreview, { props: { content: "- [ ] Todo\n- [x] Done" } });
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
  });

  // Blockquotes
  it("renders blockquotes", () => {
    render(MarkdownPreview, { props: { content: "> Quote text" } });
    const blockquote = document.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
  });

  // Links
  it("renders links", () => {
    render(MarkdownPreview, { props: { content: "[Click](https://example.com)" } });
    const link = document.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute("href")).toBe("https://example.com");
  });

  // Images
  it("renders images", () => {
    render(MarkdownPreview, { props: { content: "![Alt](https://example.com/img.png)" } });
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("alt")).toBe("Alt");
  });

  // Horizontal rules
  it("renders horizontal rules", () => {
    render(MarkdownPreview, { props: { content: "---" } });
    const hr = document.querySelector("hr");
    expect(hr).toBeInTheDocument();
  });

  // Tables
  it("renders tables", () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    render(MarkdownPreview, { props: { content: md } });
    const table = document.querySelector(".cy-md-table");
    expect(table).toBeInTheDocument();
  });

  // Mermaid
  it("renders mermaid container", () => {
    render(MarkdownPreview, { props: { content: "```mermaid\nflowchart TD\n    A-->B\n```" } });
    const mermaid = document.querySelector(".cy-md-mermaid");
    expect(mermaid).toBeInTheDocument();
  });

  it("renders mermaid container for invalid syntax (pre-render)", () => {
    render(MarkdownPreview, { props: { content: "```mermaid\ninvalid <br/> stuff\n```" } });
    const mermaid = document.querySelector(".cy-md-mermaid");
    expect(mermaid).toBeInTheDocument();
    expect(mermaid?.getAttribute("data-mermaid-idx")).toBe("0");
  });

  it("renders multiple mermaid blocks with separate indices", () => {
    const md = "```mermaid\nflowchart TD\n    A-->B\n```\n\n```mermaid\npie\n    \"A\" : 50\n```";
    render(MarkdownPreview, { props: { content: md } });
    const blocks = document.querySelectorAll(".cy-md-mermaid");
    expect(blocks.length).toBe(2);
    expect(blocks[0]?.getAttribute("data-mermaid-idx")).toBe("0");
    expect(blocks[1]?.getAttribute("data-mermaid-idx")).toBe("1");
  });

  // Math
  it("renders display math container", () => {
    render(MarkdownPreview, { props: { content: "$$\nE = mc^2\n$$" } });
    const math = document.querySelector(".cy-md-math");
    expect(math).toBeInTheDocument();
  });

  it("renders inline math container", () => {
    render(MarkdownPreview, { props: { content: "The equation $E = mc^2$ is famous" } });
    const math = document.querySelector(".cy-md-math-inline");
    expect(math).toBeInTheDocument();
  });

  it("renders multiple inline math expressions", () => {
    render(MarkdownPreview, { props: { content: "$a^2$ plus $b^2$ equals $c^2$" } });
    const maths = document.querySelectorAll(".cy-md-math-inline");
    expect(maths.length).toBe(3);
  });

  // Security
  it("sanitizes javascript URLs in links", () => {
    render(MarkdownPreview, { props: { content: "[click](javascript:alert(1))" } });
    const link = document.querySelector("a");
    expect(link?.getAttribute("href")).toBe("#");
  });

  it("escapes HTML in code blocks", () => {
    render(MarkdownPreview, { props: { content: "```\n<script>alert(1)</script>\n```" } });
    const codeBlock = document.querySelector(".cy-md-pre code");
    expect(codeBlock).toBeInTheDocument();
    // The script should be escaped as text, not executed as HTML
    expect(codeBlock?.innerHTML).toContain("&lt;script&gt;");
    expect(codeBlock?.innerHTML).toContain("&lt;/script&gt;");
  });

  // Additional heading levels
  it("renders h3 headings", () => {
    render(MarkdownPreview, { props: { content: "### H3 Title" } });
    const h3 = document.querySelector("h3");
    expect(h3).toBeInTheDocument();
    expect(h3?.textContent).toBe("H3 Title");
  });

  it("renders h4 headings", () => {
    render(MarkdownPreview, { props: { content: "#### H4 Title" } });
    const h4 = document.querySelector("h4");
    expect(h4).toBeInTheDocument();
    expect(h4?.textContent).toBe("H4 Title");
  });

  it("renders h5 headings", () => {
    render(MarkdownPreview, { props: { content: "##### H5 Title" } });
    const h5 = document.querySelector("h5");
    expect(h5).toBeInTheDocument();
  });

  it("renders h6 headings", () => {
    render(MarkdownPreview, { props: { content: "###### H6 Title" } });
    const h6 = document.querySelector("h6");
    expect(h6).toBeInTheDocument();
  });

  // Bold with underscores
  it("renders bold with underscores", () => {
    render(MarkdownPreview, { props: { content: "__bold text__" } });
    const strong = document.querySelector("strong");
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe("bold text");
  });

  // Italic with underscores
  it("renders italic with underscores", () => {
    render(MarkdownPreview, { props: { content: "_italic text_" } });
    const em = document.querySelector("em");
    expect(em).toBeInTheDocument();
    expect(em?.textContent).toBe("italic text");
  });

  // Code blocks with language class
  it("renders code blocks with language class", () => {
    render(MarkdownPreview, { props: { content: "```python\nprint('hello')\n```" } });
    const code = document.querySelector(".cy-md-pre code.language-python");
    expect(code).toBeInTheDocument();
  });

  // Code blocks without language
  it("renders code blocks without language class", () => {
    render(MarkdownPreview, { props: { content: "```\nplain code\n```" } });
    const code = document.querySelector(".cy-md-pre code");
    expect(code).toBeInTheDocument();
    expect(code?.classList.length).toBe(0); // no language class
  });

  // Horizontal rules with different markers
  it("renders horizontal rule with asterisks", () => {
    render(MarkdownPreview, { props: { content: "***" } });
    const hr = document.querySelector("hr");
    expect(hr).toBeInTheDocument();
  });

  it("renders horizontal rule with underscores", () => {
    render(MarkdownPreview, { props: { content: "___" } });
    const hr = document.querySelector("hr");
    expect(hr).toBeInTheDocument();
  });

  // Tables with multiple rows
  it("renders table with multiple rows", () => {
    const md = "| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |\n| 4 | 5 | 6 |";
    render(MarkdownPreview, { props: { content: md } });
    const rows = document.querySelectorAll(".cy-md-table tbody tr");
    expect(rows.length).toBe(2);
    const headers = document.querySelectorAll(".cy-md-table th");
    expect(headers.length).toBe(3);
  });

  // Consecutive blockquotes merge
  it("merges consecutive blockquotes", () => {
    render(MarkdownPreview, { props: { content: "> Line 1\n> Line 2" } });
    const blockquotes = document.querySelectorAll("blockquote");
    expect(blockquotes.length).toBe(1);
  });

  // Images with alt text
  it("renders image with correct src", () => {
    render(MarkdownPreview, { props: { content: "![Photo](https://example.com/photo.jpg)" } });
    const img = document.querySelector("img.cy-md-img") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img?.src).toBe("https://example.com/photo.jpg");
    expect(img?.alt).toBe("Photo");
  });

  // Links with target blank
  it("renders links with target _blank and rel noopener", () => {
    render(MarkdownPreview, { props: { content: "[Example](https://example.com)" } });
    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link?.target).toBe("_blank");
    expect(link?.rel).toContain("noopener");
  });

  // Sanitize data: URLs
  it("sanitizes data: URLs in links", () => {
    render(MarkdownPreview, { props: { content: "[click](data:text/html,<script>)" } });
    const link = document.querySelector("a");
    expect(link?.getAttribute("href")).toBe("#");
  });

  // Sanitize vbscript: URLs
  it("sanitizes vbscript: URLs in links", () => {
    render(MarkdownPreview, { props: { content: "[click](vbscript:alert(1))" } });
    const link = document.querySelector("a");
    expect(link?.getAttribute("href")).toBe("#");
  });

  // Sanitize URLs in images
  it("sanitizes javascript URLs in images", () => {
    render(MarkdownPreview, { props: { content: "![img](javascript:alert(1))" } });
    const img = document.querySelector("img");
    expect(img?.getAttribute("src")).toBe("#");
  });

  // Task lists checked/unchecked
  it("renders checked and unchecked task items", () => {
    render(MarkdownPreview, { props: { content: "- [x] Done\n- [ ] Todo" } });
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
  });

  // Paragraphs
  it("wraps plain text in paragraphs", () => {
    render(MarkdownPreview, { props: { content: "Hello world" } });
    const p = document.querySelector("p");
    expect(p).toBeInTheDocument();
    expect(p?.textContent).toBe("Hello world");
  });

  // Line breaks within paragraphs
  it("renders line breaks within paragraphs", () => {
    render(MarkdownPreview, { props: { content: "Line 1\nLine 2" } });
    const br = document.querySelector("br");
    expect(br).toBeInTheDocument();
  });

  // Multiple paragraphs separated by blank lines
  it("renders multiple paragraphs", () => {
    render(MarkdownPreview, { props: { content: "First paragraph\n\nSecond paragraph" } });
    const paragraphs = document.querySelectorAll("p");
    expect(paragraphs.length).toBe(2);
  });

  // Escapes HTML entities in inline code
  it("escapes HTML in inline code", () => {
    render(MarkdownPreview, { props: { content: "`<div>test</div>`" } });
    const code = document.querySelector(".cy-md-inline-code");
    expect(code?.innerHTML).toContain("&lt;div&gt;");
  });

  // Unordered list with asterisk
  it("renders unordered lists with asterisk marker", () => {
    render(MarkdownPreview, { props: { content: "* Item A\n* Item B" } });
    const ul = document.querySelector("ul");
    expect(ul).toBeInTheDocument();
  });
});
