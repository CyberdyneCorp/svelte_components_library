import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import CRTBackground from "./CRTBackground.svelte";

describe("CRTBackground", () => {
  it("renders container", () => {
    render(CRTBackground);
    expect(screen.getByTestId("cy-crtbg")).toBeInTheDocument();
  });
  it("applies color via CSS var", () => {
    render(CRTBackground, { props: { color: "#ff0000" } });
    const el = screen.getByTestId("cy-crtbg");
    expect(el.style.getPropertyValue("--cy-crtbg-color")).toBe("#ff0000");
  });
  it("applies gridSize via CSS var", () => {
    render(CRTBackground, { props: { gridSize: 50 } });
    const el = screen.getByTestId("cy-crtbg");
    expect(el.style.getPropertyValue("--cy-crtbg-cell")).toBe("50px");
  });
  it("applies grid modifier by default", () => {
    const { container } = render(CRTBackground);
    expect(container.querySelector(".cy-crtbg--grid")).toBeInTheDocument();
  });
  it("omits grid modifier when showGrid=false", () => {
    const { container } = render(CRTBackground, { props: { showGrid: false } });
    expect(container.querySelector(".cy-crtbg--grid")).not.toBeInTheDocument();
  });
  it("applies scan modifier when showScanlines=true", () => {
    const { container } = render(CRTBackground, { props: { showScanlines: true } });
    expect(container.querySelector(".cy-crtbg--scan")).toBeInTheDocument();
  });
  it("applies full-screen modifier by default", () => {
    const { container } = render(CRTBackground);
    expect(container.querySelector(".cy-crtbg--full")).toBeInTheDocument();
  });
  it("omits full-screen when fullScreen=false", () => {
    const { container } = render(CRTBackground, { props: { fullScreen: false } });
    expect(container.querySelector(".cy-crtbg--full")).not.toBeInTheDocument();
  });
  it("renders children", () => {
    render(CRTBackground, {
      props: { children: createRawSnippet(() => ({ render: () => `<span>inside</span>` })) },
    });
    expect(screen.getByText("inside")).toBeInTheDocument();
  });
});
