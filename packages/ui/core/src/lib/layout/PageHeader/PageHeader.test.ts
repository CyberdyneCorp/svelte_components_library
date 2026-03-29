import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PageHeader from "./PageHeader.svelte";

describe("PageHeader", () => {
  it("renders with default props", () => {
    const { container } = render(PageHeader);
    const header = container.querySelector(".cy-page-header");
    expect(header).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(PageHeader, { props: { title: "Dashboard" } });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("displays the description when provided", () => {
    render(PageHeader, { props: { title: "Settings", description: "Manage your preferences" } });
    expect(screen.getByText("Manage your preferences")).toBeInTheDocument();
  });

  it("does not render description element when not provided", () => {
    const { container } = render(PageHeader, { props: { title: "Settings" } });
    const desc = container.querySelector(".cy-page-header__desc");
    expect(desc).not.toBeInTheDocument();
  });

  it("renders title as h1 element", () => {
    render(PageHeader, { props: { title: "Test" } });
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Test");
  });
});
