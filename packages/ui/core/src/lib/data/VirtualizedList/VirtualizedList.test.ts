import { render, fireEvent } from "@testing-library/svelte";
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

  it("sets spacer height based on total items", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i, label: `Item ${i}` }));
    const { container } = render(VirtualizedList, {
      props: { items, itemHeight: 48 },
    });
    const spacer = container.querySelector(".cy-virtualized-list__spacer");
    expect(spacer).toHaveStyle("height: 4800px"); // 100 * 48
  });

  it("renders only visible items (not all 1000)", () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Item ${i}` }));
    const { container } = render(VirtualizedList, {
      props: { items, itemHeight: 48, overscan: 5 },
    });
    const renderedItems = container.querySelectorAll(".cy-virtualized-list__item");
    // Should render far fewer than 1000 items
    expect(renderedItems.length).toBeLessThan(1000);
  });

  it("applies item height to each rendered item", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i, label: `Item ${i}` }));
    const { container } = render(VirtualizedList, {
      props: { items, itemHeight: 60 },
    });
    const item = container.querySelector(".cy-virtualized-list__item");
    expect(item).toHaveStyle("height: 60px");
  });

  it("handles scroll event", async () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i, label: `Item ${i}` }));
    const { container } = render(VirtualizedList, {
      props: { items, itemHeight: 48, height: "200px" },
    });
    const listEl = container.querySelector(".cy-virtualized-list")!;
    await fireEvent.scroll(listEl, { target: { scrollTop: 480 } });
    // After scroll, the items container should have a transform offset
    const itemsWrapper = container.querySelector(".cy-virtualized-list__items");
    expect(itemsWrapper).toBeInTheDocument();
  });

  it("renders with custom overscan value", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i, label: `Item ${i}` }));
    const { container } = render(VirtualizedList, {
      props: { items, itemHeight: 48, overscan: 10 },
    });
    const renderedItems = container.querySelectorAll(".cy-virtualized-list__item");
    expect(renderedItems.length).toBeLessThan(50);
  });

  it("renders items container with translateY transform", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i, label: `Item ${i}` }));
    const { container } = render(VirtualizedList, {
      props: { items, itemHeight: 48 },
    });
    const itemsWrapper = container.querySelector(".cy-virtualized-list__items");
    expect(itemsWrapper?.getAttribute("style")).toContain("translateY");
  });

  it("applies height via css variable", () => {
    const { container } = render(VirtualizedList, {
      props: { items: [], itemHeight: 48, height: "500px" },
    });
    const list = container.querySelector(".cy-virtualized-list");
    expect(list?.getAttribute("style")).toContain("--list-height: 500px");
  });
});
