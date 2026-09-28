import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import CesiumLayerControl from "./CesiumLayerControl.svelte";

const groups = [
  { id: "imagery", label: "Imagery", defaultOpen: true },
  { id: "live", label: "Live", defaultOpen: false },
];

const layers = [
  { id: "buildings", label: "OSM Buildings", group: "imagery", visible: true },
  { id: "aircraft", label: "Aircraft", group: "live", visible: true },
  { id: "labels", label: "City Labels", visible: true },
];

function groupButton(name: string) {
  return screen.getByRole("button", { name: new RegExp(name) });
}

describe("CesiumLayerControl groups", () => {
  // Regression: an $effect that read and rewrote the open-state record
  // re-triggered itself forever (effect_update_depth_exceeded) whenever
  // groups were passed.
  it("mounts with groups without an update loop", () => {
    expect(() => render(CesiumLayerControl, { props: { layers, groups } })).not.toThrow();
  });

  it("honours defaultOpen per group", () => {
    render(CesiumLayerControl, { props: { layers, groups } });
    expect(groupButton("Imagery").getAttribute("aria-expanded")).toBe("true");
    expect(groupButton("Live").getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText("OSM Buildings")).toBeTruthy();
    expect(screen.queryByText("Aircraft")).toBeNull();
  });

  it("toggles a group open and closed", async () => {
    render(CesiumLayerControl, { props: { layers, groups } });
    await fireEvent.click(groupButton("Live"));
    expect(groupButton("Live").getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Aircraft")).toBeTruthy();
    await fireEvent.click(groupButton("Imagery"));
    expect(screen.queryByText("OSM Buildings")).toBeNull();
  });
});
