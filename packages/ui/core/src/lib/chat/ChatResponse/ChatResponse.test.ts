import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ChatResponse from "./ChatResponse.svelte";

describe("ChatResponse", () => {
  it("renders with default props", () => {
    const { container } = render(ChatResponse);
    const response = container.querySelector(".cy-chat-response");
    expect(response).toBeInTheDocument();
  });

  it("displays content text", () => {
    render(ChatResponse, { props: { content: "Hello world" } });
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("applies role class", () => {
    const { container } = render(ChatResponse, { props: { role: "assistant" } });
    const response = container.querySelector(".cy-chat-response--assistant");
    expect(response).toBeInTheDocument();
  });

  it("displays timestamp when provided", () => {
    render(ChatResponse, { props: { content: "Test", timestamp: "10:30 AM" } });
    expect(screen.getByText("10:30 AM")).toBeInTheDocument();
  });

  it("shows avatar fallback for user role", () => {
    render(ChatResponse, { props: { role: "user" } });
    expect(screen.getByText("U")).toBeInTheDocument();
  });
});
