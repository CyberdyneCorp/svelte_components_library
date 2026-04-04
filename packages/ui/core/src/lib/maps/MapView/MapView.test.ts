import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeAll } from "vitest";
import MapView from "./MapView.svelte";

// Mock Leaflet
const mockMap = {
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  setView: vi.fn(),
  flyTo: vi.fn(),
  fitBounds: vi.fn(),
  remove: vi.fn(),
};

const mockLayerGroup = {
  clearLayers: vi.fn(),
  addTo: vi.fn().mockReturnThis(),
};

const mockMarker = {
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  setLatLng: vi.fn(),
};

const mockTileLayer = {
  addTo: vi.fn(),
};

beforeAll(() => {
  (window as any).L = {
    map: vi.fn().mockReturnValue(mockMap),
    tileLayer: vi.fn().mockReturnValue(mockTileLayer),
    layerGroup: vi.fn().mockReturnValue(mockLayerGroup),
    marker: vi.fn().mockReturnValue(mockMarker),
    divIcon: vi.fn().mockReturnValue({}),
    latLngBounds: vi.fn().mockReturnValue({}),
  };
});

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

  it("applies custom height via CSS variable", () => {
    render(MapView, { props: { height: "300px" } });
    const el = document.querySelector(".cy-map") as HTMLElement;
    expect(el.style.getPropertyValue("--map-height")).toBe("300px");
  });

  it("renders with markers prop", () => {
    const markers = [
      { lat: 40.7, lng: -74.0, label: "NYC", color: "green" as const },
      { lat: 34.0, lng: -118.2, label: "LA", color: "red" as const },
    ];
    render(MapView, { props: { markers } });
    const el = document.querySelector(".cy-map");
    expect(el).toBeInTheDocument();
  });

  it("renders with non-interactive mode", () => {
    render(MapView, { props: { interactive: false } });
    const el = document.querySelector(".cy-map");
    expect(el).toBeInTheDocument();
  });

  it("renders with custom center and zoom", () => {
    render(MapView, {
      props: { center: [51.5, -0.1] as [number, number], zoom: 10 },
    });
    const el = document.querySelector(".cy-map");
    expect(el).toBeInTheDocument();
  });

  it("renders with fitBounds enabled", () => {
    const markers = [
      { lat: 40.7, lng: -74.0 },
      { lat: 34.0, lng: -118.2 },
    ];
    render(MapView, { props: { markers, fitBounds: true } });
    expect(document.querySelector(".cy-map")).toBeInTheDocument();
  });

  it("renders markers with popup content", () => {
    const markers = [
      { lat: 40.7, lng: -74.0, label: "NYC", popup: "New York City" },
    ];
    render(MapView, { props: { markers } });
    expect(document.querySelector(".cy-map")).toBeInTheDocument();
  });

  it("renders markers with different colors", () => {
    const markers = [
      { lat: 40.7, lng: -74.0, color: "cyan" as const },
      { lat: 34.0, lng: -118.2, color: "amber" as const },
    ];
    render(MapView, { props: { markers } });
    expect(document.querySelector(".cy-map")).toBeInTheDocument();
  });
});
