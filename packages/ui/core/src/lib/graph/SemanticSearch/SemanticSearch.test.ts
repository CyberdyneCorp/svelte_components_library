import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import SemanticSearch from "./SemanticSearch.svelte";

describe("SemanticSearch", () => {
  const results = [
    { id: "1", title: "Result One", snippet: "First result snippet", score: 0.95, tags: ["ml"] },
    { id: "2", title: "Result Two", snippet: "Second result snippet", score: 0.80 },
  ];

  it("renders with default props", () => {
    render(SemanticSearch);
    const el = document.querySelector(".cy-semantic-search");
    expect(el).toBeInTheDocument();
  });

  it("displays search results", () => {
    render(SemanticSearch, { props: { results } });
    expect(screen.getByText("Result One")).toBeInTheDocument();
    expect(screen.getByText("Result Two")).toBeInTheDocument();
  });

  it("shows query text", () => {
    render(SemanticSearch, { props: { query: "neural networks", results } });
    expect(screen.getByText("neural networks")).toBeInTheDocument();
  });

  it("shows empty message when no results", () => {
    render(SemanticSearch, { props: { results: [], emptyMessage: "Nothing found" } });
    expect(screen.getByText("Nothing found")).toBeInTheDocument();
  });

  it("calls onresultclick when a result is clicked", async () => {
    const onresultclick = vi.fn();
    render(SemanticSearch, { props: { results, onresultclick } });
    const btn = screen.getByText("Result One").closest("button")!;
    await fireEvent.click(btn);
    expect(onresultclick).toHaveBeenCalledWith("1");
  });
});
