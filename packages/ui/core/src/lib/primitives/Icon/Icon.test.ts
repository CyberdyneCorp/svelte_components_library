import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Icon from "./Icon.svelte";

describe("Icon", () => {
  it("renders with default props", () => {
    const { container } = render(Icon);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with a known icon name", () => {
    const { container } = render(Icon, { props: { name: "check" } });
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies custom size", () => {
    const { container } = render(Icon, { props: { name: "x", size: 32 } });
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("32");
    expect(svg?.getAttribute("height")).toBe("32");
  });

  it("applies custom color", () => {
    const { container } = render(Icon, { props: { name: "plus", color: "red" } });
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("stroke")).toBe("red");
  });

  it("has aria-hidden attribute", () => {
    const { container } = render(Icon, { props: { name: "check" } });
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
