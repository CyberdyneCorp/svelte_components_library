/**
 * Shared types for the cesium/ category.
 *
 * Cesium's own type definitions are referenced via `import type` only — the
 * runtime module is lazy-imported per component so consumers who never render
 * a CesiumGlobe never pay the bundle cost.
 */
import type {
  Viewer,
  Entity,
  Cesium3DTileFeature,
  Cesium3DTileset,
  Cesium3DTile,
} from "cesium";

export type CameraState = {
  lng: number;
  lat: number;
  heightM: number;
  heading?: number;
  pitch?: number;
  roll?: number;
};

export type ViewBBox = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};

export type LngLat = { lng: number; lat: number };

export type DefaultBaseLayer = "osm" | "bing" | "esri-world" | "none";

export type ImageryProviderSpec =
  | { kind: "osm"; maxLevel?: number; credit?: string }
  | {
      kind: "urlTemplate";
      url: string;
      maxLevel?: number;
      minLevel?: number;
      credit?: string;
      subdomains?: string[];
    }
  | {
      kind: "wms";
      url: string;
      layers: string;
      parameters?: Record<string, string>;
      credit?: string;
    }
  | {
      kind: "wmts";
      url: string;
      layer: string;
      style: string;
      tileMatrixSetID: string;
      format?: string;
      credit?: string;
    }
  | { kind: "ion"; assetId: number }
  | { kind: "bing"; key: string; mapStyle?: string }
  | {
      kind: "arcgis";
      url: string;
      token?: string;
      credit?: string;
    };

/** Cesium ion asset id for Google Photorealistic 3D Tiles. */
export const GOOGLE_PHOTOREALISTIC_ION_ASSET_ID = 2275207;

export type TilesetSourceSpec =
  | { kind: "osm-buildings" }
  | {
      kind: "google-photorealistic";
      apiKey?: string;
      /**
       * Acknowledge that, per Google's terms, the tileset is used only with
       * the Google geocoder. Passing this suppresses Cesium's one-time
       * console warning on the direct Google Maps API path.
       */
      onlyUsingWithGoogleGeocoder?: boolean;
    }
  | { kind: "ion"; assetId: number }
  | { kind: "url"; url: string };

/**
 * Declarative style spec passed to `Cesium3DTileStyle`. Keys are property
 * names (e.g. "color", "show"); values are Cesium style expressions. Kept
 * loose because the underlying API accepts arbitrary expression objects.
 */
export type Cesium3DTileStyleSpec = Record<string, unknown>;

export type Cesium3DTileVisibleHandler = (
  feature: Cesium3DTileFeature,
  tile: Cesium3DTile,
) => void;

export type ContourShadedRamp = "grey" | "viridis" | "terrain";

// ──────────────────────────────────────────────────────────────────────
//  Vector layer shapes (Milestone C)
// ──────────────────────────────────────────────────────────────────────

export type Marker = {
  id: string;
  lng: number;
  lat: number;
  /** Altitude above the surface in metres. Defaults to clamp-to-ground. */
  altitudeM?: number;
  label?: string;
  /** Hex colour for the default billboard. */
  color?: string;
  /**
   * URL of an image to use as the billboard. When omitted a generated
   * circular SVG dot in `color` is used.
   */
  icon?: string;
  /** Billboard pixel size (diameter). */
  size?: number;
  /** Round-tripped to the consumer via callbacks. */
  meta?: unknown;
};

export type MarkerStyle = {
  color?: string;
  icon?: string;
  size?: number;
  scale?: number;
  /** Optional CSS-color outline rendered into the generated dot. */
  outlineColor?: string;
};

export type Polygon = {
  id: string;
  vertices: LngLat[];
  /** Hex fill colour. */
  color?: string;
  /** Fill alpha 0..1. */
  fillOpacity?: number;
  /** Hex outline colour. */
  outlineColor?: string;
  outlineWidth?: number;
  /** Extrude the footprint to this height in metres for prism polygons. */
  extrudedHeightM?: number;
  meta?: unknown;
};

export type Polyline = {
  id: string;
  vertices: LngLat[];
  color?: string;
  /** Polyline width in pixels. */
  width?: number;
  /** Render with a moving dashed pattern. */
  dashed?: boolean;
  /** Per-line altitude offset in metres; defaults to clamp-to-ground. */
  altitudeM?: number;
  meta?: unknown;
};

export type Label = {
  id: string;
  lng: number;
  lat: number;
  text: string;
  /** Hex text colour. */
  color?: string;
  /** Hex background colour for the label backdrop. */
  backgroundColor?: string;
  /** Show the rounded backdrop behind the text. */
  showBackground?: boolean;
  /** Pixel font size. */
  fontPx?: number;
  altitudeM?: number;
  /**
   * If false, labels stay visible even when occluded by the globe. Defaults
   * to true (occluded → hidden) which matches Cesium's stock behaviour.
   */
  cullByGlobe?: boolean;
  meta?: unknown;
};

export type PolygonHeatmapEntry = {
  /** Polygon id (matches `Polygon.id`). */
  id: string;
  /** Scalar value used to look up a colour from the scale. */
  value: number;
};

export type ColorScaleStop = { value: number; color: string };
export type ColorScale = ColorScaleStop[];

export type CzmlInput =
  | string
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

// ──────────────────────────────────────────────────────────────────────
//  Live-entity shapes (Milestone D)
// ──────────────────────────────────────────────────────────────────────

/**
 * Generic moving-point entity. Used directly via `<TrackedEntitiesLayer>`
 * or transformed from a domain shape by one of the wrapper components.
 */
export type TrackedEntity = {
  id: string;
  lng: number;
  lat: number;
  /** Altitude in metres above sea level. Defaults to clamp-to-ground. */
  altitudeM?: number;
  /** Heading clockwise from compass north, in degrees. Drives billboard rotation when set. */
  headingDeg?: number;
  /** Hex colour for the generated default glyph. */
  color?: string;
  /** Override the billboard image; falls back to a generated coloured dot. */
  icon?: string;
  /** Billboard pixel size. */
  size?: number;
  /** Text rendered above the billboard. */
  label?: string;
  /** Optional history trail polyline. */
  trail?: LngLat[];
  trailColor?: string;
  trailWidth?: number;
  meta?: unknown;
};

export type Aircraft = {
  id: string;
  lng: number;
  lat: number;
  altitudeM?: number;
  headingDeg?: number;
  callsign?: string;
  /** Knots; used in tooltip / future colouring. */
  speedKts?: number;
  /** Two-letter operator code or full carrier name. */
  operator?: string;
  selected?: boolean;
  trail?: LngLat[];
  meta?: unknown;
};

export type Vessel = {
  id: string;
  lng: number;
  lat: number;
  headingDeg?: number;
  /** AIS MMSI for tooltip / linking. */
  mmsi?: string;
  /** AIS ship type code or one of "cargo" | "tanker" | "passenger" | "fishing" | "other". */
  vesselType?: string;
  name?: string;
  speedKts?: number;
  trail?: LngLat[];
  meta?: unknown;
};

export type Satellite = {
  id: string;
  /** NORAD catalogue number (5-digit). */
  noradId?: string;
  name?: string;
  lng: number;
  lat: number;
  altitudeM: number;
  /** Constellation key — `starlink` | `gps-ops` | `iridium` | etc. — for colouring. */
  group?: string;
  trail?: LngLat[];
  meta?: unknown;
};

export type Earthquake = {
  id: string;
  lng: number;
  lat: number;
  /** Richter / moment magnitude. Drives glyph radius. */
  magnitude: number;
  /** Depth below surface in km. Drives colour ramp. */
  depthKm: number;
  /** ISO timestamp string. */
  time?: string;
  place?: string;
  meta?: unknown;
};

export type Wildfire = {
  id: string;
  lng: number;
  lat: number;
  /** Detection confidence 0..100; drives opacity. */
  confidencePct?: number;
  /** Brightness temperature in Kelvin; drives colour ramp. */
  brightnessK?: number;
  /** Fire Radiative Power in MW. */
  frpMw?: number;
  detectedAt?: string;
  meta?: unknown;
};

export type Volcano = {
  id: string;
  lng: number;
  lat: number;
  name?: string;
  /** Elevation in metres above sea level. */
  elevationM?: number;
  /** Status: "Holocene" | "Pleistocene" | "active" | "erupting". */
  status?: string;
  meta?: unknown;
};

export type AirportType =
  | "large_airport"
  | "medium_airport"
  | "small_airport"
  | "heliport"
  | "seaplane_base";

export type Airport = {
  id: string;
  lng: number;
  lat: number;
  /** ICAO code like "EGLL". */
  icao?: string;
  /** IATA code like "LHR". */
  iata?: string;
  name?: string;
  type?: AirportType;
  meta?: unknown;
};

export type Tower = {
  id: string;
  lng: number;
  lat: number;
  heightM?: number;
  operator?: string;
  /** "radio" | "tv" | "telecom" | "observation". */
  towerType?: string;
  meta?: unknown;
};

export type CellSite = {
  id: string;
  lng: number;
  lat: number;
  /** Mobile network code ("LTE" | "5G" | "GSM"). */
  radio?: string;
  /** Cellular operator name. */
  operator?: string;
  meta?: unknown;
};

export type Webcam = {
  id: string;
  lng: number;
  lat: number;
  title?: string;
  /** Live-stream or snapshot URL. */
  streamUrl?: string;
  thumbnailUrl?: string;
  meta?: unknown;
};

export type PowerPlantFuel =
  | "coal"
  | "gas"
  | "oil"
  | "nuclear"
  | "hydro"
  | "wind"
  | "solar"
  | "biomass"
  | "geothermal"
  | "other";

export type PowerPlant = {
  id: string;
  lng: number;
  lat: number;
  name?: string;
  /** Nameplate capacity in megawatts. */
  capacityMw?: number;
  fuel?: PowerPlantFuel;
  meta?: unknown;
};

export type AirQualityStation = {
  id: string;
  lng: number;
  lat: number;
  /** AQI value 0..500. */
  aqi: number;
  /** Pollutant name (e.g. "PM2.5"). */
  pollutant?: string;
  station?: string;
  meta?: unknown;
};

export type TideGauge = {
  id: string;
  lng: number;
  lat: number;
  /** Latest observation in metres. */
  levelM?: number;
  /** Anomaly relative to climatology. */
  anomalyM?: number;
  station?: string;
  meta?: unknown;
};

export type TsunamiBuoy = {
  id: string;
  lng: number;
  lat: number;
  status?: "ok" | "event" | "watch" | "offline";
  /** Last reported anomaly in metres. */
  anomalyM?: number;
  reportedAt?: string;
  meta?: unknown;
};

export type GdacsAlertLevel = "Green" | "Orange" | "Red";
export type GdacsEventType = "EQ" | "TC" | "FL" | "VO" | "DR" | "WF";

export type GdacsEvent = {
  id: string;
  lng: number;
  lat: number;
  eventType: GdacsEventType;
  alertLevel: GdacsAlertLevel;
  title?: string;
  /** ISO timestamp. */
  startedAt?: string;
  meta?: unknown;
};

export type Cyclone = {
  id: string;
  /** Best-track points (past); the last point is the current position. */
  track: { lng: number; lat: number; windKts?: number; pressureMb?: number }[];
  /** Forecast track points (future). */
  forecast?: { lng: number; lat: number }[];
  /** Forecast uncertainty polygon (cone of uncertainty). */
  cone?: LngLat[];
  name?: string;
  /** Saffir-Simpson category 0..5 (0 = tropical storm). */
  category?: number;
  meta?: unknown;
};

export type AuroraOval = {
  id: string;
  /** Northern or southern oval. */
  hemisphere: "north" | "south";
  /** Closed polygon describing the oval. */
  polygon: LngLat[];
  /** Forecast Kp index 0..9. */
  kp?: number;
  meta?: unknown;
};

export type Farm = {
  id: string;
  lng: number;
  lat: number;
  name?: string;
  /** Crop hint ("corn" | "wheat" | "rice" | …). */
  crop?: string;
  /** Hectares of cultivated area. */
  areaHa?: number;
  meta?: unknown;
};

export type CoverageCone = {
  id: string;
  /** Origin (sensor / antenna) lng/lat. */
  lng: number;
  lat: number;
  altitudeM?: number;
  /** Range in metres along the ground. */
  rangeM: number;
  /** Bearing of the main lobe in degrees from north. */
  bearingDeg?: number;
  /** Half beam-width in degrees (omnidirectional = 180). */
  halfBeamWidthDeg?: number;
  color?: string;
  meta?: unknown;
};

export type SubmarineCable = {
  id: string;
  name?: string;
  vertices: LngLat[];
  status?: "active" | "planned" | "out-of-service";
  meta?: unknown;
};

export type UserLocation = {
  lng: number;
  lat: number;
  /** Reported horizontal accuracy in metres; rendered as a ring. */
  accuracyM?: number;
  /** Heading in degrees if `geolocation.heading` was available. */
  headingDeg?: number;
};

// ──────────────────────────────────────────────────────────────────────
//  Particle / flow shapes (Milestone F)
// ──────────────────────────────────────────────────────────────────────

/**
 * A sample on a 2D wind grid. `u` is the eastward component, `v` is the
 * northward component, both typically in metres per second.
 */
export type WindGridPoint = {
  lng: number;
  lat: number;
  u: number;
  v: number;
};

/**
 * A sample on a 2D wave grid. `dirDeg` is the wave direction in degrees
 * clockwise from north (the direction the wave is travelling TOWARDS).
 * `periodS` is the wave period in seconds.
 */
export type WaveGridPoint = {
  lng: number;
  lat: number;
  /** Significant wave height in metres. */
  heightM: number;
  /** Direction wave is going TOWARDS, degrees clockwise from north. */
  dirDeg: number;
  /** Wave period in seconds. */
  periodS: number;
};

/**
 * A pre-computed streamline. `points` are [lng, lat, altitudeM] tuples;
 * `values` align with `points` and feed the colour ramp at each vertex.
 */
export type Streamline = {
  id: string;
  /** Array of [lng, lat, altitudeM]. */
  points: [number, number, number][];
  /** Scalar value at each point — same length as `points`. */
  values: number[];
};

/**
 * Footprint of a simulation domain. Rendered as a clamped-to-ground
 * rectangle plus a translucent extruded box and a wind-direction arrow.
 */
export type WindSimDomain = {
  /** Domain centre. */
  centre: LngLat;
  /** Domain edge length in metres. */
  sizeM: number;
  /** Inflow direction in degrees clockwise from north (wind is from). */
  windDirectionDeg: number;
  /** Vertical extent in metres above ground. */
  heightM?: number;
  /**
   * "editing" → green; "running" → amber; controls colour / label text /
   * subtle pulsing affordances.
   */
  state?: "editing" | "running";
  /** Optional override label below the domain size. */
  label?: string;
};

export type TerrainProviderSpec =
  | { kind: "ellipsoid" }
  | {
      kind: "world";
      requestVertexNormals?: boolean;
      requestWaterMask?: boolean;
    }
  | { kind: "ion"; assetId: number }
  | { kind: "url"; url: string };

/**
 * 3D model placed on the globe (glTF / .glb). The library never owns the
 * model URL — pass a URL the consumer hosts or a Cesium ion asset URL.
 */
export type ModelEntity = {
  id: string;
  lng: number;
  lat: number;
  /** Altitude in metres above the ellipsoid. When unset, clamp the bottom to terrain. */
  altitudeM?: number;
  /** Compass heading in degrees clockwise from north. Defaults to 0. */
  headingDeg?: number;
  pitchDeg?: number;
  rollDeg?: number;
  /** URL to a glTF (.gltf) or glb file. Required. */
  url: string;
  /** Uniform scale factor applied to the model. Defaults to 1. */
  scale?: number;
  /** Smallest screen size in pixels — the model never shrinks below this. */
  minimumPixelSize?: number;
  /** Hard cap on the world-space scale, useful for ion-managed models. */
  maximumScale?: number;
  /** Optional tint colour blended over the model. */
  tintColor?: string;
  /** Blend amount 0..1 between the model's original colour and `tintColor`. */
  tintAmount?: number;
  /** Outline colour drawn around the silhouette. */
  silhouetteColor?: string;
  /** Silhouette stroke width in pixels. */
  silhouetteSize?: number;
  /** Round-tripped to callbacks. */
  meta?: unknown;
};

export type PickedEntity = {
  kind: "entity" | "tile-feature" | "primitive";
  entity?: Entity;
  feature?: Cesium3DTileFeature;
  tileset?: Cesium3DTileset;
  id: unknown;
};

export type TerrainSampler = {
  sampleElevation: (point: LngLat) => Promise<number | null>;
  sampleElevations: (points: LngLat[]) => Promise<(number | null)[]>;
};

export type ScreenPicker = {
  pickGroundLngLat: (screen: { x: number; y: number }) => Promise<LngLat | null>;
  pickEntity: (screen: { x: number; y: number }) => PickedEntity | null;
};

export type ViewerAccessor = () => Viewer | null;
