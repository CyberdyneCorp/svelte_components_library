import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import DesktopGrid from "./DesktopGrid.svelte";

function childSnippet(html: string) {
  return createRawSnippet(() => ({ render: () => html }));
}

describe("DesktopGrid", () => {
  it("has group role with aria-label", () => {
    render(DesktopGrid, { props: { ariaLabel: "Icons" } });
    expect(screen.getByRole("group", { name: "Icons" })).toBeInTheDocument();
  });

  it("defaults aria-label to 'Desktop icons'", () => {
    render(DesktopGrid);
    expect(screen.getByRole("group", { name: "Desktop icons" })).toBeInTheDocument();
  });

  it("applies columns via CSS var", () => {
    const { container } = render(DesktopGrid, { props: { columns: 4 } });
    const el = container.querySelector<HTMLElement>(".cy-dgrid")!;
    expect(el.style.getPropertyValue("--cy-dgrid-cols")).toBe("4");
  });

  it("applies gap via CSS var", () => {
    const { container } = render(DesktopGrid, { props: { gap: 20 } });
    const el = container.querySelector<HTMLElement>(".cy-dgrid")!;
    expect(el.style.getPropertyValue("--cy-dgrid-gap")).toBe("20px");
  });

  it("applies side modifier (left default)", () => {
    const { container } = render(DesktopGrid);
    expect(container.querySelector(".cy-dgrid--left")).toBeInTheDocument();
  });

  it("applies side=right modifier", () => {
    const { container } = render(DesktopGrid, { props: { side: "right" } });
    expect(container.querySelector(".cy-dgrid--right")).toBeInTheDocument();
  });

  it.each(["start", "center", "end"] as const)("applies align=%s modifier", (align) => {
    const { container } = render(DesktopGrid, { props: { align } });
    expect(container.querySelector(`.cy-dgrid--${align}`)).toBeInTheDocument();
  });

  it("renders children slot", () => {
    render(DesktopGrid, {
      props: { children: childSnippet("<span>child-content</span>") },
    });
    expect(screen.getByText("child-content")).toBeInTheDocument();
  });
});
