import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PageShell from "./PageShell.svelte";

describe("PageShell", () => {
  it("renders with default props", () => {
    const { container } = render(PageShell);
    const shell = container.querySelector(".cy-ps");
    expect(shell).toBeInTheDocument();
  });

  it("applies sidebar class when showSidebar is true", () => {
    const { container } = render(PageShell, { props: { showSidebar: true } });
    const shell = container.querySelector(".cy-ps");
    expect(shell?.className).toContain("with-sidebar");
  });

  it("applies header class when showHeader is true", () => {
    const { container } = render(PageShell, { props: { showHeader: true } });
    const shell = container.querySelector(".cy-ps");
    expect(shell?.className).toContain("with-header");
  });

  it("applies collapsed class", () => {
    const { container } = render(PageShell, { props: { collapsedSidebar: true } });
    const shell = container.querySelector(".cy-ps");
    expect(shell?.className).toContain("collapsed");
  });

  it("renders main content area", () => {
    const { container } = render(PageShell);
    const main = container.querySelector(".cy-ps__main");
    expect(main).toBeInTheDocument();
  });
});
