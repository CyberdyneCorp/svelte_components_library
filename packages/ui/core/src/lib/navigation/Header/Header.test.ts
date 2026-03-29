import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Header from "./Header.svelte";

describe("Header", () => {
  it("renders a header element", () => {
    render(Header);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(Header, { props: { title: "My App" } });
    expect(screen.getByText("My App")).toBeInTheDocument();
  });

  it("renders title as h1", () => {
    render(Header, { props: { title: "Dashboard" } });
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Dashboard");
  });

  it("renders without title", () => {
    const { container } = render(Header);
    expect(container.querySelector(".cy-header__title")).not.toBeInTheDocument();
  });
});
