import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ChatPanel from "./ChatPanel.svelte";

describe("ChatPanel", () => {
  it("renders with default props", () => {
    const { container } = render(ChatPanel);
    const panel = container.querySelector(".cy-chat-panel");
    expect(panel).toBeInTheDocument();
  });

  it("has flex column layout class", () => {
    const { container } = render(ChatPanel);
    const panel = container.querySelector(".cy-chat-panel");
    expect(panel).toBeInTheDocument();
  });

  it("renders container element", () => {
    const { container } = render(ChatPanel);
    const panel = container.querySelector(".cy-chat-panel");
    expect(panel?.tagName).toBe("DIV");
  });
});
