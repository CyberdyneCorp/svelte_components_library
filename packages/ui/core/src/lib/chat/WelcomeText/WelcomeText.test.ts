import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import WelcomeText from "./WelcomeText.svelte";

describe("WelcomeText", () => {
  it("renders with default title", () => {
    render(WelcomeText);
    expect(screen.getByText("How can I help?")).toBeInTheDocument();
  });

  it("displays custom title", () => {
    render(WelcomeText, { props: { title: "Welcome!" } });
    expect(screen.getByText("Welcome!")).toBeInTheDocument();
  });

  it("displays subtitle when provided", () => {
    render(WelcomeText, { props: { subtitle: "Ask me anything" } });
    expect(screen.getByText("Ask me anything")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    const { container } = render(WelcomeText);
    const subtitle = container.querySelector(".cy-welcome__subtitle");
    expect(subtitle).not.toBeInTheDocument();
  });

  it("renders title as h1", () => {
    render(WelcomeText, { props: { title: "Hello" } });
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Hello");
  });
});
