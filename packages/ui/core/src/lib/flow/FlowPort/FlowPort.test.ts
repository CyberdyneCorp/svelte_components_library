import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import FlowPort from "./FlowPort.svelte";

describe("FlowPort", () => {
  it("renders an in port", () => {
    const { container } = render(FlowPort, {
      props: { side: "in", color: "#3FE07F" },
    });
    const port = container.querySelector(".cy-flow-port");
    expect(port).toBeInTheDocument();
    expect(port?.className).toContain("cy-flow-port--in");
  });

  it("renders an out port", () => {
    const { container } = render(FlowPort, {
      props: { side: "out", color: "#3FE07F" },
    });
    const port = container.querySelector(".cy-flow-port");
    expect(port?.className).toContain("cy-flow-port--out");
  });

  it("applies compatible state", () => {
    const { container } = render(FlowPort, {
      props: { side: "in", color: "#3FE07F", compatible: true },
    });
    const port = container.querySelector(".cy-flow-port");
    expect(port?.className).toContain("cy-flow-port--compatible");
  });

  it("uses the provided color via CSS variable", () => {
    const { container } = render(FlowPort, {
      props: { side: "in", color: "#FB7185" },
    });
    const port = container.querySelector(".cy-flow-port") as HTMLElement;
    expect(port.style.getPropertyValue("--port-color")).toBe("#FB7185");
  });

  it("renders a title combining label and type", () => {
    const { container } = render(FlowPort, {
      props: { side: "out", color: "#3FE07F", label: "scalar", type: "scalar" },
    });
    const port = container.querySelector(".cy-flow-port");
    expect(port?.getAttribute("title")).toBe("scalar · scalar");
  });
});
