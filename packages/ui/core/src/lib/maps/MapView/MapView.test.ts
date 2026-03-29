import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import MapView from "./MapView.svelte";

describe("MapView", () => {
  it("renders the container", () => {
    render(MapView);
    const el = document.querySelector(".cy-map");
    expect(el).toBeInTheDocument();
  });

  it("renders the map container div", () => {
    render(MapView);
    const container = document.querySelector(".cy-map__container");
    expect(container).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(MapView);
    const loading = document.querySelector(".cy-map__loading");
    expect(loading).toBeInTheDocument();
  });
});
