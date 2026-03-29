import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import BotAnswer from "./BotAnswer.svelte";

describe("BotAnswer", () => {
  it("renders with default props", () => {
    const { container } = render(BotAnswer);
    const answer = container.querySelector(".cy-bot-answer");
    expect(answer).toBeInTheDocument();
  });

  it("displays content text", () => {
    render(BotAnswer, { props: { content: "Hello there" } });
    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("shows typing indicator when typing", () => {
    const { container } = render(BotAnswer, { props: { typing: true } });
    const typing = container.querySelector(".cy-bot-answer__typing");
    expect(typing).toBeInTheDocument();
  });

  it("hides content when typing", () => {
    const { container } = render(BotAnswer, { props: { typing: true, content: "Test" } });
    const content = container.querySelector(".cy-bot-answer__content");
    expect(content).not.toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(BotAnswer, { props: { variant: "surface" } });
    const answer = container.querySelector(".cy-bot-answer--surface");
    expect(answer).toBeInTheDocument();
  });
});
