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

  it("renders plain text when markdown is false", () => {
    render(ChatResponse, {
      props: { role: "assistant", content: "**bold**", markdown: false },
    });
    expect(screen.getByText("**bold**")).toBeInTheDocument();
  });

  it("renders markdown content for assistant when markdown is true", () => {
    const { container } = render(ChatResponse, {
      props: { role: "assistant", content: "**bold**", markdown: true },
    });
    const mdPreview = container.querySelector(".cy-md-preview");
    expect(mdPreview).toBeInTheDocument();
  });

  it("renders plain text for user role even when markdown is true", () => {
    render(ChatResponse, {
      props: { role: "user", content: "**bold**", markdown: true },
    });
    expect(screen.getByText("**bold**")).toBeInTheDocument();
  });
});
