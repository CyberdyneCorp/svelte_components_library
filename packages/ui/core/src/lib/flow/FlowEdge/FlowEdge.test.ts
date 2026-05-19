import { describe, it, expect } from "vitest";
import { edgePath } from "../geometry.js";

describe("FlowEdge geometry", () => {
  it("produces a cubic bezier path between two points", () => {
    const d = edgePath(0, 0, 200, 100);
    expect(d).toMatch(/^M 0 0 C/);
    expect(d).toContain("200 100");
  });

  it("uses a minimum control distance of 40", () => {
    const d = edgePath(0, 0, 10, 0);
    expect(d).toContain("C 40 0");
  });

  it("scales the control distance for longer edges", () => {
    const d = edgePath(0, 0, 400, 0);
    expect(d).toContain("C 200 0");
  });
});
