import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PixelProgressBar from "./PixelProgressBar.svelte";

describe("PixelProgressBar", () => {
  it("renders progressbar role", () => {
    render(PixelProgressBar);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
  it("sets aria values", () => {
    render(PixelProgressBar, { props: { value: 45, max: 100 } });
    const p = screen.getByRole("progressbar");
    expect(p).toHaveAttribute("aria-valuenow", "45");
    expect(p).toHaveAttribute("aria-valuemax", "100");
  });
  it("renders the right number of segments", () => {
    const { container } = render(PixelProgressBar, { props: { segments: 8 } });
    expect(container.querySelectorAll(".cy-pbar__seg")).toHaveLength(8);
  });
  it("fills segments proportional to value", () => {
    const { container } = render(PixelProgressBar, { props: { value: 50, max: 100, segments: 10 } });
    expect(container.querySelectorAll(".cy-pbar__seg--on")).toHaveLength(5);
  });
  it("clamps value above max", () => {
    const { container } = render(PixelProgressBar, { props: { value: 999, max: 100, segments: 10 } });
    expect(container.querySelectorAll(".cy-pbar__seg--on")).toHaveLength(10);
  });
  it("clamps negative value", () => {
    const { container } = render(PixelProgressBar, { props: { value: -5, max: 100, segments: 10 } });
    expect(container.querySelectorAll(".cy-pbar__seg--on")).toHaveLength(0);
  });
  it("handles zero max safely", () => {
    const { container } = render(PixelProgressBar, { props: { value: 5, max: 0, segments: 10 } });
    expect(container.querySelectorAll(".cy-pbar__seg--on")).toHaveLength(0);
  });
  it.each(["brand", "info", "success", "warning", "danger"] as const)("applies %s variant", (variant) => {
    const { container } = render(PixelProgressBar, { props: { variant } });
    expect(container.querySelector(`.cy-pbar--${variant}`)).toBeInTheDocument();
  });
  it("shows percentage label when showLabel=true", () => {
    render(PixelProgressBar, { props: { value: 60, max: 100, showLabel: true } });
    expect(screen.getByTestId("cy-pbar-label")).toHaveTextContent("60%");
  });
  it("shows custom label when provided", () => {
    render(PixelProgressBar, { props: { value: 10, showLabel: true, label: "loading..." } });
    expect(screen.getByTestId("cy-pbar-label")).toHaveTextContent("loading...");
  });
  it("hides label by default", () => {
    const { container } = render(PixelProgressBar, { props: { value: 10 } });
    expect(container.querySelector(".cy-pbar__label")).not.toBeInTheDocument();
  });
});
