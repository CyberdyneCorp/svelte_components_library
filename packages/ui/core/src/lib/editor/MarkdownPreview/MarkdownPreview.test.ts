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
});
