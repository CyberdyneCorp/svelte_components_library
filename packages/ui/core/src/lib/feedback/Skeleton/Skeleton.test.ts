import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Skeleton from "./Skeleton.svelte";

describe("Skeleton", () => {
  it("renders text variant by default", () => {
    const { container } = render(Skeleton);
    expect(container.querySelector(".cy-skeleton--text")).toBeInTheDocument();
  });

  it("renders multiple lines for text variant", () => {
    const { container } = render(Skeleton, { props: { lines: 3 } });
    const lines = container.querySelectorAll(".cy-skeleton--text");
    expect(lines.length).toBe(3);
  });

  it("renders circle variant", () => {
    const { container } = render(Skeleton, { props: { variant: "circle" } });
    expect(container.querySelector(".cy-skeleton--circle")).toBeInTheDocument();
  });

  it("renders card variant with sub-elements", () => {
    const { container } = render(Skeleton, { props: { variant: "card" } });
    expect(container.querySelector(".cy-skeleton-card")).toBeInTheDocument();
    expect(container.querySelector(".cy-skeleton--rect")).toBeInTheDocument();
  });

  it("applies animated class by default", () => {
    const { container } = render(Skeleton);
    expect(container.querySelector(".cy-skeleton--animated")).toBeInTheDocument();
  });
});
