import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import WordCloud from "./WordCloud.svelte";

describe("WordCloud", () => {
  const words = [
    { text: "Svelte", weight: 100 },
    { text: "TypeScript", weight: 80 },
    { text: "Rust", weight: 60 },
    { text: "Python", weight: 40 },
    { text: "Go", weight: 20 },
  ];

  it("renders without crashing", () => {
    render(WordCloud, { props: { words } });
    const el = document.querySelector(".cy-word-cloud");
    expect(el).toBeInTheDocument();
  });

  it("renders correct number of text elements", () => {
    render(WordCloud, { props: { words } });
    const texts = document.querySelectorAll(".cy-word-cloud__word");
    expect(texts.length).toBe(5);
  });

  it("applies custom class", () => {
    render(WordCloud, { props: { words, class: "my-cloud" } });
    const el = document.querySelector(".cy-word-cloud.my-cloud");
    expect(el).toBeInTheDocument();
  });

  it("handles empty words array", () => {
    render(WordCloud, { props: { words: [] } });
    const texts = document.querySelectorAll(".cy-word-cloud__word");
    expect(texts.length).toBe(0);
  });

  it("handles single word", () => {
    render(WordCloud, { props: { words: [{ text: "Solo", weight: 50 }] } });
    const texts = document.querySelectorAll(".cy-word-cloud__word");
    expect(texts.length).toBe(1);
  });
});
