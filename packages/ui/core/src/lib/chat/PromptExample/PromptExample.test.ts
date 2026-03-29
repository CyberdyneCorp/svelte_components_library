import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PromptExample from "./PromptExample.svelte";

describe("PromptExample", () => {
  it("renders as a button", () => {
    render(PromptExample, { props: { title: "Test" } });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays title", () => {
    render(PromptExample, { props: { title: "Write a poem" } });
    expect(screen.getByText("Write a poem")).toBeInTheDocument();
  });

  it("displays description when provided", () => {
    render(PromptExample, { props: { title: "Test", description: "A helpful prompt" } });
    expect(screen.getByText("A helpful prompt")).toBeInTheDocument();
  });

  it("calls onclick when clicked", async () => {
    const onclick = vi.fn();
    render(PromptExample, { props: { title: "Click me", onclick } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("has button type attribute", () => {
    render(PromptExample, { props: { title: "Test" } });
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "button");
  });
});
