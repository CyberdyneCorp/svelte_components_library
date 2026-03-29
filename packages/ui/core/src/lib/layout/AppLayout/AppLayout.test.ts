import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import AppLayout from "./AppLayout.svelte";

describe("AppLayout", () => {
  it("renders with default props", () => {
    const { container } = render(AppLayout);
    const layout = container.querySelector(".cy-app-layout");
    expect(layout).toBeInTheDocument();
  });

  it("applies sidebar class when hasSidebar is true", () => {
    const { container } = render(AppLayout, { props: { hasSidebar: true } });
    const layout = container.querySelector(".cy-app-layout");
    expect(layout?.className).toContain("with-sidebar");
  });

  it("does not render sidebar when hasSidebar is false", () => {
    const { container } = render(AppLayout, { props: { hasSidebar: false } });
    const sidebar = container.querySelector(".cy-app-layout__sidebar");
    expect(sidebar).not.toBeInTheDocument();
  });

  it("renders main content area", () => {
    const { container } = render(AppLayout);
    const main = container.querySelector(".cy-app-layout__content");
    expect(main).toBeInTheDocument();
  });

  it("sets sidebar width custom property", () => {
    const { container } = render(AppLayout, { props: { sidebarWidth: "300px" } });
    const layout = container.querySelector(".cy-app-layout") as HTMLElement;
    expect(layout.style.getPropertyValue("--sidebar-width")).toBe("300px");
  });
});
