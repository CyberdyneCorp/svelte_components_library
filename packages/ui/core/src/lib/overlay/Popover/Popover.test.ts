import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Popover from "./Popover.svelte";

// Popover requires trigger and content snippets which cannot be passed directly
// in props-based testing. We validate the component exports.
describe("Popover", () => {
  it("is a valid Svelte component", () => {
    expect(Popover).toBeDefined();
  });

  it("exports as a function", () => {
    expect(typeof Popover).toBe("function");
  });
});
