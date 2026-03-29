import { render } from "@testing-library/svelte";
import { describe, it, expect, beforeAll } from "vitest";
import MindMap from "./MindMap.svelte";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe("MindMap", () => {
  it("renders the container", () => {
    render(MindMap);
    const el = document.querySelector(".cy-mindmap");
    expect(el).toBeInTheDocument();
  });

  it("renders a canvas element", () => {
    render(MindMap);
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders the toolbar", () => {
    render(MindMap);
    const toolbar = document.querySelector(".cy-mindmap__toolbar");
    expect(toolbar).toBeInTheDocument();
  });
});
