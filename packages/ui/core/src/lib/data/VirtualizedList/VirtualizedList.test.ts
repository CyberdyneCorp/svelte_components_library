import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import VirtualizedList from "./VirtualizedList.svelte";

describe("VirtualizedList", () => {
  it("renders the container", () => {
    const { container } = render(VirtualizedList, {
      props: { items: [], itemHeight: 48 },
    });
    expect(container.querySelector(".cy-virtualized-list")).toBeInTheDocument();
  });

  it("renders spacer element", () => {
    const { container } = render(VirtualizedList, {
      props: { items: [], itemHeight: 48 },
    });
    const spacer = container.querySelector(".cy-virtualized-list__spacer");
    expect(spacer).toBeInTheDocument();
  });

  it("applies custom height via css variable", () => {
    const { container } = render(VirtualizedList, {
      props: { items: [], itemHeight: 48, height: "300px" },
    });
    const list = container.querySelector(".cy-virtualized-list");
    expect(list).toBeInTheDocument();
  });

  it("renders with empty items and zero height spacer", () => {
    const { container } = render(VirtualizedList, {
      props: { items: [], itemHeight: 48 },
    });
    const spacer = container.querySelector(".cy-virtualized-list__spacer");
    expect(spacer).toHaveStyle("height: 0px");
  });
});
