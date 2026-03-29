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
});
