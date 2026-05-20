import type {
  Aircraft,
  Earthquake,
  Marker,
} from "../types.js";

/** Seed markers for major operations centres. */
export const SITE_MARKERS: Marker[] = [
  { id: "sf", lng: -122.4194, lat: 37.7749, label: "SF", color: "#00ff41" },
  { id: "nyc", lng: -74.006, lat: 40.7128, label: "NYC", color: "#00d4ff" },
  { id: "ldn", lng: -0.1278, lat: 51.5074, label: "London", color: "#a855f7" },
  { id: "tk", lng: 139.6917, lat: 35.6895, label: "Tokyo", color: "#ffb800" },
  { id: "sp", lng: -46.6333, lat: -23.5505, label: "São Paulo", color: "#ff4444" },
];

/** A handful of in-flight aircraft with headings for the rotated glyphs. */
export const AIRCRAFT: Aircraft[] = [
  { id: "UAL901", lng: -118, lat: 38, altitudeM: 11_000, headingDeg: 80, callsign: "UAL901" },
  { id: "BAW271", lng: -100, lat: 41, altitudeM: 11_500, headingDeg: 70, callsign: "BAW271" },
  { id: "ANA7", lng: -85, lat: 43, altitudeM: 11_200, headingDeg: 95, callsign: "ANA7" },
  { id: "DLH458", lng: -60, lat: 47, altitudeM: 10_800, headingDeg: 60, callsign: "DLH458" },
];

/** Recent seismic events with mixed magnitude + depth for the colour ramp. */
export const EARTHQUAKES: Earthquake[] = [
  { id: "q1", lng: 140.1, lat: 35.7, magnitude: 5.2, depthKm: 30, place: "Honshu" },
  { id: "q2", lng: -118.3, lat: 34.0, magnitude: 4.4, depthKm: 12, place: "Los Angeles" },
  { id: "q3", lng: 174.8, lat: -41.3, magnitude: 6.0, depthKm: 65, place: "Wellington" },
  { id: "q4", lng: 95.0, lat: 5.0, magnitude: 7.2, depthKm: 350, place: "Sumatra" },
  { id: "q5", lng: -70.6, lat: -33.4, magnitude: 4.8, depthKm: 90, place: "Santiago" },
];

/** Layer-control panel definition. */
export const LAYER_GROUPS = [
  { id: "base", label: "Imagery & Terrain", defaultOpen: true },
  { id: "live", label: "Live", defaultOpen: true },
  { id: "ref", label: "Reference", defaultOpen: false },
];

export type FullGlobeLayerState = {
  buildings: boolean;
  terrain: boolean;
  aircraft: boolean;
  earthquakes: boolean;
  markers: boolean;
  labels: boolean;
};

export const INITIAL_LAYER_STATE: FullGlobeLayerState = {
  buildings: true,
  terrain: true,
  aircraft: true,
  earthquakes: true,
  markers: true,
  labels: true,
};
