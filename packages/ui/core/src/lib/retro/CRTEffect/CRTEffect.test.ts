import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import CRTEffect from "./CRTEffect.svelte";

describe("CRTEffect", () => {
  it("renders container", () => {
    render(CRTEffect);
    expect(screen.getByTestId("cy-crt")).toBeInTheDocument();
  });
  it("applies scan modifier by default", () => {
    const { container } = render(CRTEffect);
    expect(container.querySelector(".cy-crt--scan")).toBeInTheDocument();
  });
  it("omits scan when disabled", () => {
    const { container } = render(CRTEffect, { props: { scanlines: false } });
    expect(container.querySelector(".cy-crt--scan")).not.toBeInTheDocument();
  });
  it("applies vignette by default", () => {
    const { container } = render(CRTEffect);
    expect(container.querySelector(".cy-crt--vig")).toBeInTheDocument();
  });
  it("omits vignette when disabled", () => {
    const { container } = render(CRTEffect, { props: { vignette: false } });
    expect(container.querySelector(".cy-crt--vig")).not.toBeInTheDocument();
  });
  it("applies flicker modifier when enabled", () => {
    const { container } = render(CRTEffect, { props: { flicker: true } });
    expect(container.querySelector(".cy-crt--flick")).toBeInTheDocument();
  });
  it("sets intensity CSS var", () => {
    render(CRTEffect, { props: { intensity: 0.4 } });
    expect(screen.getByTestId("cy-crt").style.getPropertyValue("--cy-crt-intensity")).toBe("0.4");
  });
  it("renders children", () => {
    render(CRTEffect, {
      props: { children: createRawSnippet(() => ({ render: () => `<span>kid</span>` })) },
    });
    expect(screen.getByText("kid")).toBeInTheDocument();
  });
});
