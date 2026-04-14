import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TVLSparkline from "./TVLSparkline.svelte";

describe("TVLSparkline", () => {
  it("renders img role", () => {
    render(TVLSparkline, { props: { values: [1, 2, 3] } });
    expect(screen.getByRole("img", { name: "Trend" })).toBeInTheDocument();
  });
  it("draws polyline when multiple points", () => {
    render(TVLSparkline, { props: { values: [1, 2, 3, 4] } });
    expect(screen.getByTestId("cy-tvlspark-line")).toBeInTheDocument();
  });
  it("omits line for single point", () => {
    render(TVLSparkline, { props: { values: [5] } });
    expect(screen.queryByTestId("cy-tvlspark-line")).not.toBeInTheDocument();
  });
  it("renders area fill by default", () => {
    render(TVLSparkline, { props: { values: [1, 2, 3] } });
    expect(screen.getByTestId("cy-tvlspark-area")).toBeInTheDocument();
  });
  it("omits area when fill=false", () => {
    render(TVLSparkline, { props: { values: [1, 2, 3], fill: false } });
    expect(screen.queryByTestId("cy-tvlspark-area")).not.toBeInTheDocument();
  });
  it("shows delta when enabled", () => {
    render(TVLSparkline, { props: { values: [100, 110], showDelta: true } });
    expect(screen.getByTestId("cy-tvlspark-delta")).toHaveTextContent("▲ 10.0%");
  });
  it("shows down delta for declining values", () => {
    render(TVLSparkline, { props: { values: [100, 75], showDelta: true } });
    expect(screen.getByTestId("cy-tvlspark-delta")).toHaveTextContent("▼ -25.0%");
  });
  it("applies down class", () => {
    const { container } = render(TVLSparkline, { props: { values: [100, 50], showDelta: true } });
    expect(container.querySelector(".cy-tvlspark__delta--down")).toBeInTheDocument();
  });
  it("applies up class", () => {
    const { container } = render(TVLSparkline, { props: { values: [50, 100], showDelta: true } });
    expect(container.querySelector(".cy-tvlspark__delta--up")).toBeInTheDocument();
  });
  it("applies custom color", () => {
    render(TVLSparkline, { props: { values: [1, 2, 3], color: "#ff00ff" } });
    expect(screen.getByTestId("cy-tvlspark-line").getAttribute("stroke")).toBe("#ff00ff");
  });
  it("handles flat values (min==max)", () => {
    expect(() => render(TVLSparkline, { props: { values: [5, 5, 5] } })).not.toThrow();
  });
  it("handles empty values", () => {
    render(TVLSparkline, { props: { values: [] } });
    expect(screen.getByTestId("cy-tvlspark")).toBeInTheDocument();
  });
  it("hides delta when values empty", () => {
    render(TVLSparkline, { props: { values: [], showDelta: true } });
    expect(screen.queryByTestId("cy-tvlspark-delta")).not.toBeInTheDocument();
  });
});
