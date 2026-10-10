import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Icon from "./Icon.svelte";
import { BUILTIN_ICON_NAMES } from "./icon-names.js";

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

  it.each(["clock", "alert-triangle"])("renders the %s built-in", (name) => {
    const { container } = render(Icon, { props: { name } });
    expect(container.querySelector("path")?.getAttribute("d")).toBeTruthy();
  });

  const consoleGlyphs = [
    "home",
    "bell",
    "edit",
    "trash",
    "key",
    "cloud",
    "globe",
    "more-vertical",
    "refresh",
    "box",
  ] as const;

  it.each(consoleGlyphs)("resolves the %s glyph to a non-empty 24x24 stroke path", (name) => {
    const { container } = render(Icon, { props: { name } });
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(container.querySelector("path")?.getAttribute("d")).toBeTruthy();
  });

  it.each(consoleGlyphs)("lists %s in BUILTIN_ICON_NAMES", (name) => {
    expect(BUILTIN_ICON_NAMES).toContain(name);
  });

  it("renders an empty path for an unknown name", () => {
    const { container } = render(Icon, { props: { name: "not-a-glyph" } });
    expect(container.querySelector("path")?.getAttribute("d")).toBe("");
  });
});
