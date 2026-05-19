import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import NodeInspector from "./NodeInspector.svelte";

describe("NodeInspector", () => {
  it("renders all tab labels", () => {
    const { getByText } = render(NodeInspector, {
      props: {
        tabs: [
          { id: "inspect", label: "Inspect" },
          { id: "graph", label: "Graph" },
        ],
        panels: {},
      },
    });
    expect(getByText("Inspect")).toBeInTheDocument();
    expect(getByText("Graph")).toBeInTheDocument();
  });

  it("renders the inspector aside", () => {
    const { container } = render(NodeInspector, {
      props: {
        tabs: [{ id: "inspect", label: "Inspect" }],
        panels: {},
      },
    });
    expect(container.querySelector(".cy-node-inspector")).toBeInTheDocument();
  });
});
