# Cesium Globe Roadmap

## Cyberdyne Design System — Cesium-Based 3D Globe Components

| Field | Value |
|-------|-------|
| **Project** | Cyberdyne Design System |
| **Document** | Cesium Globe Roadmap |
| **Version** | 0.1.0 |
| **Date** | 2026-05-19 |
| **Status** | Proposed |
| **Reference** | `geo_dashboard/frontend` (SvelteKit + cesium ^1.124.0) |
| **Scope** | Full mirror of geo_dashboard's 35+ Cesium layers as headless, controlled-prop components |

---

## Table of Contents

1. [Context](#1-context)
2. [Reference Decomposition](#2-reference-decomposition)
3. [Coverage Matrix — Existing vs. Needed](#3-coverage-matrix--existing-vs-needed)
4. [Component Catalog](#4-component-catalog)
   1. [Core engine](#41-core-engine)
   2. [Imagery & basemaps](#42-imagery--basemaps)
   3. [Terrain & 3D tilesets](#43-terrain--3d-tilesets)
   4. [Vector & data layers](#44-vector--data-layers)
   5. [Live / streaming layers](#45-live--streaming-layers)
   6. [Particle & flow layers](#46-particle--flow-layers)
   7. [UI chrome](#47-ui-chrome)
5. [API Design Decisions](#5-api-design-decisions)
6. [Cesium Integration & Build Setup](#6-cesium-integration--build-setup)
7. [Implementation Order](#7-implementation-order)
8. [Risks & Gotchas](#8-risks--gotchas)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Effort Estimate](#10-effort-estimate)

---

## 1. Context

The library already ships a 2D map primitive (`MapView`, Leaflet-based, under `maps/`). It is sufficient for "drop a few pins on a dark tile" use cases but cannot express 3D terrain, Photorealistic 3D Tiles, atmospheric / globe-scale visualization, satellite tracking, or sub-second particle animation overlays.

The `geo_dashboard` project (consumer of this library) has built a comprehensive **CesiumJS-backed** stack around those needs — 35 layer components plus terrain sampling / picking services, riding on a single `<GlobeView>` host that owns the `Cesium.Viewer`. It validates the design but lives inside the application, mixed with viewmodels that aren't reusable.

This roadmap pulls that capability **down into the library**, decoupled from any specific viewmodel store: the new components are **headless and controlled** — consumers pass data via props, get events back via callbacks, and own all persistence / selection / network logic.

The new category is named **`cesium/`** to keep it distinct from the 2D `maps/` category. Naming convention: `Cesium*` for the engine root + UI chrome (`CesiumGlobe`, `CesiumControls`, `CesiumMinimap`), `*Layer` for everything that mounts geometry / imagery on the globe.

---

## 2. Reference Decomposition

The reference application (`/Users/leonardoaraujo/work/geo_dashboard/frontend/src/lib/`) decomposes into:

| File / Folder | Role | LoC (approx) |
|---|---|---|
| `components/globe/GlobeView.svelte` | Viewer host: creates `Cesium.Viewer`, publishes via context, owns lifecycle, camera tracking, root picking, OSM fallback, terrain bootstrap | 249 |
| `components/globe/viewerContext.ts` | `setContext` / `useViewer()` accessor | 13 |
| `components/globe/*Layer.svelte` (×34) | One file per visual concern, each consuming `useViewer()` + a domain viewmodel | ~150 avg, ~5,200 total |
| `components/panels/LayerPanel.svelte` | Layer toggle / settings panel (uses existing library components: `Switch`, `Slider`, `Select`, `Badge`) | ~600 |
| `services/cesium/cesiumTerrainSampler.ts` | Adapter — `sampleTerrainMostDetailed` wrapped to a port type | 28 |
| `services/cesium/cesiumScreenPicker.ts` | Adapter — pick ellipsoid / terrain at a screen point | — |
| `utils/cesiumPick.ts` | `pickGroundLngLat(viewer, screenPoint)` helper | — |
| `scripts/copy-cesium.mjs` | Prebuild script copying `node_modules/cesium/Build/Cesium/{Workers,Assets,ThirdParty,Widgets,Cesium.js}` → `static/cesium/` | 31 |
| `viewmodels/globeVM.svelte.ts` + ~40 others | All app state — **stays in the consumer**, not ported | — |

The viewer host pattern is the load-bearing decision:

```
<CesiumGlobe>            ← creates Viewer, setContext('cesium.viewer', () => viewer)
  <ImageryLayer ... />   ← getContext, imperatively adds an imagery layer in $effect
  <TerrainProvider ... />
  <BuildingsLayer ... />
  <MarkersLayer markers={...} onmove={...} />
  ...
</CesiumGlobe>
```

Every layer is a child component that mounts/unmounts its primitives into the parent viewer via the context-supplied accessor — *not* via prop drilling. This keeps the consumer-facing API declarative ("render these layers") while the imperative Cesium API stays inside each layer.

---

## 3. Coverage Matrix — Existing vs. Needed

| Concern | Reference file | Existing library coverage | Status |
|---|---|---|---|
| 2D map with markers | — | `MapView` (Leaflet) | Reuse for 2D-only use |
| Layer toggle UI | `LayerPanel.svelte` | `Switch`, `Slider`, `Select`, `Badge`, `CollapsibleCard` (via `Accordion`) | Compose existing |
| Panel chrome / scroll | several | `Drawer`, `Sidebar`, `Card`, `PageHeader` | Compose existing |
| Marker / polygon side-panel forms | `MarkersPanel`, `PolygonsPanel` | `TextInput`, `ColorPicker`, `Select`, `Button`, `Dialog` | Compose existing |
| Search box (geocoding) | `SearchBox.svelte` | `SearchInput` | Compose existing |
| Status / loading indicators | several | `Badge`, `ProgressRing`, `Skeleton`, `Toast` | Compose existing |
| Auth / org / settings panels | `auth/*` | `LoginPage`, `Drawer`, `Dropdown` | Compose existing |
| Time-series picker overlays | several | `DateRangePicker`, `DatePicker`, `TimePicker` | Compose existing |
| **Cesium Viewer host + context** | `GlobeView.svelte` | — | **NEW** |
| **OSM imagery basemap** | `GlobeView.svelte` (fallback) | — | **NEW** |
| **Cesium World / Ion terrain** | `GlobeView.svelte` | — | **NEW** |
| **Google Photorealistic 3D Tiles** | (not in reference but in scope) | — | **NEW** |
| **OSM Buildings 3D tileset** | `BuildingsLayer.svelte` | — | **NEW** |
| **Elevation contour overlay** | (not in reference but in scope) | — | **NEW** |
| **GeoJSON / KML / CZML loader** | (partial via `CustomDataSource`) | — | **NEW** |
| **Markers (draggable)** | `MarkersLayer.svelte` | — | **NEW** |
| **Polygons (drawable)** | `PolygonsLayer.svelte` | — | **NEW** |
| **Labels** | `LabelsLayer.svelte` | — | **NEW** |
| **Tracked entities (aircraft, vessels, satellites, ...)** | 11 layers | — | **NEW** |
| **Live event layers (earthquakes, wildfires, GDACS, ...)** | 10 layers | — | **NEW** |
| **Time-animated raster (NDVI / GIBS / rain radar / aurora / air quality / tsunami)** | 6 layers | — | **NEW** |
| **Particle / flow layers (wind, waves, streamlines)** | 4 layers | — | **NEW** |
| **Coverage / RF / domain-preview primitives** | 3 layers | — | **NEW** |
| **Floating canvas controls (zoom / fit / 2D-3D toggle / home)** | (in `App.svelte`) | `IconButton` stack | **NEW** (small wrapper) |
| **Minimap of camera footprint** | — | — | **NEW** (small) |
| **Picking / selection bus** | `GlobeView.svelte` (root pick handler) | — | **NEW** (exposed as callback) |
| **Terrain sampler service** | `cesiumTerrainSampler.ts` | — | **NEW** (exported utility) |
| **Screen picker service** | `cesiumScreenPicker.ts` | — | **NEW** (exported utility) |

---

## 4. Component Catalog

All components live under `packages/ui/core/src/lib/cesium/`. Each component:
- Declares `<svelte:options runes={true} />`
- Lazy-imports `cesium` inside `onMount` / `$effect` so SSR + non-cesium consumers don't pay the bundle cost
- Uses `useViewer()` to access the shared `Cesium.Viewer` from context
- Cleans up its primitives in `onDestroy` (and on prop-driven removal in `$effect` returns)
- Is **headless** — never owns the data it renders; all inputs are props, all outputs are callbacks

The `cesium` package is declared as a **peer dependency** (`peerDependencies: { "cesium": "^1.124.0" }`) on `@cyberdynecorp/svelte-ui-core` so consumers pin their own version and the library never bundles it.

---

### 4.1 Core engine

#### `CesiumGlobe` — viewer host (keystone)

Creates the `Cesium.Viewer`, exposes it via Svelte context (`Symbol.for('cyberdyne.cesium.viewer')`), and renders children inside a positioned `<div>`. Owns: canvas mount + resize, OSM fallback when no Ion token, optional Cesium World Terrain bootstrap, camera move/orientation event subscription, root-level pick dispatch.

**Props:**

```ts
type CesiumGlobeProps = {
  ionToken?: string;                                  // optional, enables Ion services
  initialCamera?: { lng: number; lat: number; heightM: number };
  // controlled camera (bindable)
  camera?: { lng: number; lat: number; heightM: number; heading?: number; pitch?: number };
  // controlled viewport bbox (read-only output)
  viewBBox?: { minLng: number; minLat: number; maxLng: number; maxLat: number } | null;
  viewerOptions?: Partial<Cesium.Viewer.ConstructorOptions>;  // escape hatch for advanced cases
  defaultBaseLayer?: 'osm' | 'bing' | 'esri-world' | 'none';
  enableLighting?: boolean;
  depthTestAgainstTerrain?: boolean;
  fog?: boolean;
  atmosphere?: boolean;
  onready?: (viewer: Cesium.Viewer) => void;
  oncameramove?: (camera: CameraState, viewBBox: ViewBBox | null) => void;
  onpick?: (picked: PickedEntity | null, ev: { lng: number; lat: number } | null) => void;
  children?: Snippet;
};
```

Children only render after the `Viewer` is ready (mirrors `vms.globe.ready` gate in the reference), so layer components can assume `useViewer()` returns a live viewer.

#### `useCesiumViewer()` — context accessor

Library-exported hook (`() => Cesium.Viewer | null`). Throws a clear error when called outside a `<CesiumGlobe>`.

#### `createTerrainSampler(viewer)` — utility

Returns `{ sampleElevation(lngLat), sampleElevations(lngLats[]) }`. Wraps `Cesium.sampleTerrainMostDetailed`. Pure function — no Svelte coupling.

#### `createScreenPicker(viewer)` — utility

Returns `{ pickGroundLngLat(screenXY), pickEntity(screenXY) }`. Re-exports the reference's helpers verbatim.

---

### 4.2 Imagery & basemaps

#### `ImageryLayer` — generic raster overlay

The workhorse for any tile-pyramid source. Single component covers OSM, Bing, Mapbox, Esri, GIBS, RainViewer, custom UrlTemplate, WMS, WMTS.

**Props:**

```ts
type ImageryLayerProps = {
  provider:
    | { kind: 'osm'; maxLevel?: number }
    | { kind: 'urlTemplate'; url: string; maxLevel?: number; credit?: string; subdomains?: string[] }
    | { kind: 'wms'; url: string; layers: string; parameters?: Record<string, string> }
    | { kind: 'wmts'; url: string; layer: string; style: string; tileMatrixSetID: string; format?: string }
    | { kind: 'ion'; assetId: number }
    | { kind: 'bing'; key: string; mapStyle?: string }
    | { kind: 'mapbox'; accessToken: string; mapId: string; tilesetId?: string }
    | { kind: 'arcgis'; url: string; token?: string };
  visible?: boolean;
  alpha?: number;                                     // 0..1
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  gamma?: number;
  zIndex?: number;                                    // controls layer stack order
  rectangle?: { west: number; south: number; east: number; north: number };  // clip area
};
```

Mounts via `viewer.imageryLayers.addImageryProvider(...)`; re-creates the provider when the `provider` discriminator changes; preserves stack order via `viewer.imageryLayers.raise/lower`.

#### `BaseLayerPicker` — base-map dropdown UI

UI component composing existing `Select` + `IconButton`. Lets the user swap the underlying base map at runtime. Optional — consumers can build their own with `ImageryLayer`.

#### `WeatherTileLayer` — time-animated raster (RainViewer-style)

Specialization of `ImageryLayer` that auto-advances through a URL-template timeline with smooth opacity crossfade between frames. Generalizes the reference's `RainRadarLayer` pattern so any timestamped tile pyramid (rain, snow, lightning) works.

**Props:** `urlTemplate(timestamp)`, `frames: number[]`, `currentFrame` (bindable), `playing` (bindable), `intervalMs`, `crossfadeMs`.

#### `NasaGibsLayer` — NASA EOSDIS GIBS adapter

Convenience wrapper over `ImageryLayer` exposing the GIBS product catalog. Mirrors the reference's `NdviLayer.svelte` — ships sensible URL templates and `maximumLevel` defaults for ~10 common products (NDVI / NDWI / EVI / TrueColor / GOES-East / GOES-West / Himawari).

**Props:** `product: GibsProduct`, `date: string | 'live'`, `opacity`.

---

### 4.3 Terrain & 3D tilesets

#### `Terrain` — terrain provider mount

Switches the viewer's `terrainProvider`. Only one is active at a time per viewer (Cesium constraint), so multiple `<Terrain>` components inside one `<CesiumGlobe>` is undefined behavior — document that "last write wins" or, better, fail fast in dev.

**Props:**

```ts
type TerrainProps = {
  provider:
    | { kind: 'ellipsoid' }                                       // smooth, no Ion
    | { kind: 'world'; requestVertexNormals?: boolean; requestWaterMask?: boolean }  // Cesium World Terrain (Ion)
    | { kind: 'ion'; assetId: number }                            // custom Ion terrain asset
    | { kind: 'url'; url: string };                               // self-hosted terrain
  exaggeration?: number;                                          // vertical exaggeration (1 = real)
};
```

#### `Cesium3DTiles` — generic 3D tileset

Drops a `Cesium3DTileset` onto the scene. Covers Google Photorealistic 3D Tiles, OSM Buildings, custom Ion / URL tilesets, and per-feature styling via `Cesium3DTileStyle`.

**Props:**

```ts
type Cesium3DTilesProps = {
  source:
    | { kind: 'osm-buildings' }
    | { kind: 'google-photorealistic'; apiKey: string }
    | { kind: 'ion'; assetId: number }
    | { kind: 'url'; url: string };
  visible?: boolean;
  opacity?: number;
  maximumScreenSpaceError?: number;                               // perf knob
  style?: Cesium3DTileStyleSpec;                                  // declarative tile style
  // per-feature tinting hook — fires on each tile that becomes visible
  onfeature?: (feature: Cesium3DTileFeature, tile: Cesium3DTile) => void;
  onclick?: (feature: Cesium3DTileFeature) => void;
};
```

Implements the `tileVisible` per-feature-style pattern from `BuildingsLayer.svelte` so consumers can colour individual buildings by OSM id without forking the component.

#### `GooglePhotorealisticTiles` — convenience wrapper

Wrapper over `Cesium3DTiles` with a `source: "ion" | "google"` prop:
- **`"ion"` (default)** — Cesium ion asset `2275207` (`GOOGLE_PHOTOREALISTIC_ION_ASSET_ID`). Needs only the `ionToken` on `<CesiumGlobe>`; no Google key, no per-session billing on the consumer's Google account, no geocoder restriction.
- **`"google"`** — Google Maps Platform directly via `apiKey`. `acknowledgeGoogleGeocoder` passes `onlyUsingWithGoogleGeocoder: true` to silence Cesium's one-time console warning.

~40 LoC. The generic `Cesium3DTiles` `google-photorealistic` source also carries `onlyUsingWithGoogleGeocoder?`.

#### `OsmBuildingsLayer` — convenience wrapper

Thin alias for `Cesium3DTiles` with `source: { kind: 'osm-buildings' }` plus the per-feature tint hook pre-wired to a `featureColors: Record<string, [hex, alpha]>` prop. ~30 LoC.

#### `ElevationContours` — elevation contour overlay

Renders contour lines + optional shaded relief on top of the active terrain using Cesium's built-in `ElevationContourMaterialProperty` / `globe.material`. This is the *terrain* contouring pattern — not vector contours — and works as a global overlay tied to the active terrain.

**Props:**

```ts
type ElevationContoursProps = {
  visible?: boolean;
  spacingM?: number;                                              // metres between contour lines
  width?: number;                                                 // line width px
  color?: string;                                                 // hex
  shaded?: boolean;                                               // overlay slope/aspect shading
  shadedRamp?: 'grey' | 'viridis' | 'terrain';
};
```

Implementation: builds a `Cesium.Material` with the `ElevationContour` (and optionally `ElevationRamp`) shader fragments, assigns to `viewer.scene.globe.material`. Restores the previous material in `$effect` cleanup so toggling visibility doesn't leak shader state.

---

### 4.4 Vector & data layers

#### `GeoJsonLayer` — GeoJSON loader

Wraps `Cesium.GeoJsonDataSource.load`. Accepts an in-memory FeatureCollection or a URL. Exposes styling props for the common attributes (stroke, fill, opacity, height, extrudedHeight, billboard image for points).

**Props:**

```ts
type GeoJsonLayerProps = {
  data: GeoJSON.FeatureCollection | string;                       // object or URL
  visible?: boolean;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  markerSymbol?: string;
  markerColor?: string;
  clampToGround?: boolean;
  // per-feature styling hook
  onfeature?: (entity: Cesium.Entity, feature: GeoJSON.Feature) => void;
  onclick?: (entity: Cesium.Entity, feature: GeoJSON.Feature) => void;
};
```

#### `KmlLayer` — KML loader

`Cesium.KmlDataSource.load` wrapper. Same shape as `GeoJsonLayer` minus the styling props (KML carries its own styling).

#### `CzmlLayer` — CZML loader

`Cesium.CzmlDataSource.load` wrapper. Time-dynamic by definition — exposes the data source's `availability` and reactively binds `viewer.clock.shouldAnimate` if `autoPlay`.

#### `MarkersLayer` — markers with optional drag

Generalizes `MarkersLayer.svelte`. Renders a controlled list of point markers as billboards, with optional drag-to-move and click-to-select. Ships sensible defaults (cyan ring, white fill, callout label).

**Props:**

```ts
type MarkersLayerProps = {
  markers: Marker[];                                              // controlled
  visible?: boolean;
  draggable?: boolean;
  selectedId?: string | null;                                     // bindable
  renderMarker?: (m: Marker) => MarkerStyle;                      // per-marker style override
  onclick?: (m: Marker) => void;
  onmove?: (id: string, lngLat: { lng: number; lat: number }) => void;
};
type Marker = {
  id: string;
  lng: number;
  lat: number;
  label?: string;
  color?: string;
  icon?: string;                                                  // image URL
  size?: number;
  altitudeM?: number;
  meta?: unknown;                                                 // round-tripped to callbacks
};
```

#### `PolygonsLayer` — polygons with optional draw mode

Generalizes `PolygonsLayer.svelte`. Renders controlled polygons; when `drawingId` is set, captures left-clicks as vertices, right-click / Enter / double-click to finish, Escape to cancel, Ctrl+Z to undo.

**Props:**

```ts
type PolygonsLayerProps = {
  polygons: Polygon[];                                            // controlled
  visible?: boolean;
  drawingId?: string | null;                                      // bindable
  selectedId?: string | null;                                     // bindable
  onclick?: (p: Polygon) => void;
  onvertexadd?: (id: string, lngLat: { lng: number; lat: number }) => void;
  onfinish?: (id: string) => void;
  oncancel?: (id: string) => void;
};
type Polygon = {
  id: string;
  vertices: { lng: number; lat: number }[];
  color?: string;
  fillOpacity?: number;
  outlineColor?: string;
  extrudedHeightM?: number;
  meta?: unknown;
};
```

Mirrors the reference's keybinding behavior verbatim.

#### `PolylinesLayer` — polylines / paths

Same shape as `PolygonsLayer` minus fill. Ships an animated dashed material option (e.g., for routes, leylines, cable runs).

#### `LabelsLayer` — text labels

Free-floating text labels at lng/lat with z-ordering, billboard backdrop, occlusion-by-globe toggle. Mirrors `LabelsLayer.svelte`.

#### `PolygonHeatmapsLayer` — choropleth-style polygon shading

Generalizes `PolygonHeatmapsLayer.svelte`. Takes `polygons + valueByPolygonId + colorScale` and re-tints fill on data change without re-creating the entities. Useful for choropleths, risk scoring, NDVI-by-parcel.

---

### 4.5 Live / streaming layers

These render a controlled array of point / track entities and re-use the same internals (`reconcileEntities` helper, animated billboard rotation, info-on-hover). Most are thin wrappers over a generic `TrackedEntitiesLayer` primitive.

#### `TrackedEntitiesLayer` — generic moving-point layer (primitive)

Renders a controlled array of `{ id, lng, lat, headingDeg, altitudeM, ... }`. Reconciles diff-by-id to avoid full entity rebuilds (the reference's `reconcileEntities` pattern). Optional history-trail polyline. Optional billboard rotation locked to either compass heading or camera-relative.

#### Domain wrappers (each ~80–150 LoC):

| Component | Reference | Notes |
|---|---|---|
| `AircraftLayer` | `AircraftLayer.svelte` | Plane glyph from `planeIcon.ts`; track on selection |
| `VesselsLayer` | `VesselLayer.svelte` | Ship glyph; AIS-style color by type |
| `SatellitesLayer` | `SatelliteLayer.svelte` | SGP4 propagation via `satellite.js` + `orbit.ts`; ground-track polyline |
| `AirportsLayer` | `AirportsLayer.svelte` | Filter by `AirportType` enum |
| `TowersLayer` | `TowersLayer.svelte` | RF / cell tower point cloud |
| `CellSitesLayer` | `CellSitesLayer.svelte` | Cell coverage callouts |
| `WebcamsLayer` | `WebcamsLayer.svelte` | Clickable webcam pin → callback returns stream URL |
| `EarthquakesLayer` | `EarthquakesLayer.svelte` | Magnitude → radius scaling, depth → colour |
| `WildfiresLayer` | `WildfiresLayer.svelte` | FIRMS-style hot pixels |
| `VolcanoesLayer` | `VolcanoesLayer.svelte` | Smithsonian-style markers |
| `CyclonesLayer` | `CyclonesLayer.svelte` | Track polyline + forecast cone + advisory points |
| `TsunamiLayer` | `TsunamiLayer.svelte` | NOAA buoy + propagation rings |
| `TideGaugesLayer` | `TideGaugesLayer.svelte` | NOAA tide station points |
| `AirQualityLayer` | `AirQualityLayer.svelte` | AQI heatmap + station points |
| `AuroraLayer` | `AuroraLayer.svelte` | OVATION oval polygon |
| `GdacsLayer` | `GdacsLayer.svelte` | Multi-event-type icon set, alert-level filter |
| `PowerPlantsLayer` | `PowerPlantsLayer.svelte` | Filter by fuel type |
| `SubmarineCablesLayer` | `SubmarineCablesLayer.svelte` | Polyline data set, on-hover info |
| `UserLocationLayer` | `UserLocationLayer.svelte` | Geolocation pin + accuracy ring |
| `FarmsLayer` | `FarmsLayer.svelte` | EntityCluster-based clustering |
| `CoverageLayer` | `CoverageLayer.svelte` | RF / sensor coverage cones + polygons |

Each of these is a **convenience wrapper** that hard-codes:
- The icon / glyph
- The default styling rules (size-by-magnitude, color-by-depth, etc.)
- The expected data shape

…on top of a shared `TrackedEntitiesLayer` / `PolygonsLayer` primitive. The consumer still passes the data array.

---

### 4.6 Particle & flow layers

These are the most performance-sensitive — they animate hundreds of particles on a `<canvas>` overlay tied to the Cesium viewport (NOT inside Cesium primitives, for FPS reasons).

#### `WindParticlesLayer`

Mirrors `WindParticleLayer.svelte`. Renders ~180 advected particles over a wind grid (`{ lng, lat, u, v }[]`). Trails fade via `destination-out`. Mounts an overlay `<canvas>` synced to the viewer's canvas size; converts world ↔ screen via `viewer.scene.cartesianToCanvasCoordinates`.

**Props:** `grid: WindGridPoint[]`, `bbox`, `particleCount`, `trailFade`, `stepDegPerTick`.

#### `WaveParticlesLayer`

Mirrors `WaveParticleLayer.svelte`. Same engine as wind but with phase / period inputs.

#### `StreamlinesLayer`

Mirrors `StreamlinesLayer.svelte`. Pre-computed streamlines rendered as fading polylines.

#### `WindSimDomainPreview`

Mirrors `WindSimDomainPreview.svelte`. Translucent 3D box showing a simulation domain — useful for any "this is the CFD / weather / RF AOI" preview.

---

### 4.7 UI chrome

These compose existing library components and add Cesium-specific behavior.

#### `CesiumControls` — floating zoom / view buttons

Vertical `IconButton` stack: zoom in, zoom out, fit-to-content (extents passed via prop), home, toggle 2D/3D, toggle north-up. Pure styling wrapper.

#### `CesiumMinimap` — viewport overview

Small 2D Leaflet (or static MapView) rectangle showing camera footprint. Reuses existing `MapView` with a viewport rectangle overlay computed from `<CesiumGlobe>`'s `viewBBox` callback.

#### `CesiumLayerControl` — layer toggle panel

Composes existing `Accordion` + `Switch` + `Slider`. Headless API: `layers: { id, label, visible, opacity, group? }[]`, `onchange`. Drops in as the "Layers" tab of an app's right drawer.

#### `CesiumCompass` — compass indicator

Tiny rotated SVG showing current camera heading. Click to reset heading to north.

#### `CesiumCoordinatesHud` — lat/lon/elev readout

Bottom-left HUD with cursor lng/lat + camera height + surface elevation. Reads from `<CesiumGlobe>`'s `oncameramove` and `useCesiumViewer().scene.canvas` mouse listener.

---

## 5. API Design Decisions

| Decision | Choice | Why |
|---|---|---|
| Category name | `cesium/` | Distinct from the 2D `maps/` (Leaflet) category. |
| Cesium dependency | **Peer dependency**, lazy-imported per component | Consumers pin their own version; library bundle stays small; SSR-safe. |
| State ownership | **Controlled** (consumer owns markers / polygons / layers arrays) | Matches the node-editor roadmap convention and Svelte 5 bindable idioms; library stays headless about persistence / undo. |
| Viewer host pattern | Single `<CesiumGlobe>` parent with context-shared `Viewer` | Mirrors reference; lets layer components be declarative without prop drilling. |
| Layer mount mechanism | Each `*Layer` component owns its own `onMount` + `onDestroy` against `useCesiumViewer()` | Localizes the imperative Cesium API per layer; matches reference's per-file pattern. |
| Lazy `cesium` import | `await import('cesium')` inside `onMount` / `$effect` | Reference proves this works under SvelteKit; gives consumers a no-cost upgrade if they don't render `<CesiumGlobe>`. |
| SSR | `*Layer` components no-op when `!browser` | Same as reference. |
| Cesium asset hosting | **Consumer-side prebuild script** (see §6) | The plugin-based copy is unreliable under SvelteKit's pipeline; ship a copyable script + Vite snippet in our docs. |
| Ion token | Optional `ionToken` prop on `<CesiumGlobe>`; without it, falls back to OSM imagery + ellipsoid terrain | Matches reference. |
| Class naming | `cy-cesium-*` (for chrome only — Cesium owns its own canvas) | Matches existing `cy-` namespace. |
| Storybook | One `*.stories.svelte` per component + 1 composition example (`cesium/Examples/FullGlobe`) | Mirrors existing convention. |
| Per-feature styling | Snippet / callback hook on every layer that supports it (`onfeature`, `renderMarker`, etc.) | Avoids forcing consumers to fork wrappers when they need bespoke visuals. |
| Camera API | `camera` prop bindable + `oncameramove` callback + imperative `flyTo` ref pattern via `bind:this` | Reference uses an imperative "flyTarget" queue inside a viewmodel; for a controlled library, a `bind:this={globe}; globe.flyTo({...})` method on `<CesiumGlobe>` is cleaner. |
| Tree-shaking | Each component is a separate barrel export | Consumers who only need `<CesiumGlobe>` + `<ImageryLayer>` don't pay for the 30 wrappers. |

---

## 6. Cesium Integration & Build Setup

Cesium ships ~12 MB of static runtime assets (Workers, Assets, ThirdParty widgets) that **must be served at a known URL** at runtime. The library cannot solve this for consumers; we document the integration instead.

### 6.1 Consumer install

```bash
pnpm add @cyberdynecorp/svelte-ui-core cesium
```

`cesium` is declared as a peer dependency on the library, so the consumer's lockfile owns the version.

### 6.2 Asset copying (prebuild)

Ship a copyable script in `packages/ui/core/scripts/copy-cesium.mjs` and document it in the Storybook "Getting Started" doc. Consumers add it to their build hooks:

```js
// scripts/copy-cesium.mjs (verbatim from geo_dashboard)
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'node_modules/cesium/Build/Cesium');
const dst = join(root, 'static/cesium');

if (!existsSync(src)) {
  console.error(`copy-cesium: source not found at ${src}`);
  process.exit(1);
}
rmSync(dst, { recursive: true, force: true });
mkdirSync(dst, { recursive: true });
for (const name of ['Workers', 'Assets', 'ThirdParty', 'Widgets', 'Cesium.js']) {
  const from = join(src, name);
  if (existsSync(from)) cpSync(from, join(dst, name), { recursive: true, force: true });
}
```

```json
// package.json
{
  "scripts": {
    "predev": "node scripts/copy-cesium.mjs",
    "prebuild": "node scripts/copy-cesium.mjs"
  }
}
```

> **Why a script, not a Vite plugin:** `vite-plugin-cesium`'s `closeBundle` hook does not fire reliably under SvelteKit's `adapter-node` pipeline (verified in `geo_dashboard` — `build/client/` ends up empty even though the plugin's other hooks run). The script is deterministic.

### 6.3 Vite config

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium')  // matches the static/ copy target
  }
});
```

### 6.4 App initialization

Set `window.CESIUM_BASE_URL` before `<CesiumGlobe>` mounts. In SvelteKit, do it once in `+layout.svelte`:

```svelte
<script lang="ts">
  import { browser } from '$app/environment';
  if (browser) (window as any).CESIUM_BASE_URL = '/cesium';
</script>
```

### 6.5 Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `PUBLIC_CESIUM_ION_TOKEN` | Cesium Ion access (World Terrain, Bing imagery, Ion tilesets) | Optional — graceful fallback to OSM + ellipsoid |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Google Photorealistic 3D Tiles | Only if using `<GooglePhotorealisticTiles>` |

The library never reads these directly — consumers pass them as props (`ionToken={env.PUBLIC_CESIUM_ION_TOKEN}`).

### 6.6 CSP / cross-origin

Cesium uses WebGL + Workers + cross-origin tile fetches. Document the minimum CSP additions:

```
worker-src 'self' blob:;
img-src 'self' data: blob: https:;
connect-src 'self' https://api.cesium.com https://assets.ion.cesium.com https://*.tile.openstreetmap.org ...;
```

---

## 7. Implementation Order

Build in layers (literally) — each milestone produces a usable Storybook story and gives consumers something to integrate.

1. **Milestone A — Engine** (1.5 days)
   - `CesiumGlobe` + `useCesiumViewer` + `createTerrainSampler` + `createScreenPicker`
   - `Terrain` (ellipsoid / world / ion / url variants)
   - `ImageryLayer` (osm / urlTemplate / ion variants)
   - Storybook story: globe with OSM base, terrain toggle, camera readout.

2. **Milestone B — 3D + contours** (1 day)
   - `Cesium3DTiles` (generic) + `OsmBuildingsLayer` + `GooglePhotorealisticTiles`
   - `ElevationContours`
   - Storybook story: NYC with OSM Buildings + contours, then swap to Google Photorealistic.

3. **Milestone C — Vector basics** (1.5 days)
   - `GeoJsonLayer`, `KmlLayer`, `CzmlLayer`
   - `MarkersLayer` (drag), `PolygonsLayer` (draw), `PolylinesLayer`, `LabelsLayer`
   - `PolygonHeatmapsLayer`
   - Storybook story: world-cities GeoJSON + draggable markers + draw mode demo.

4. **Milestone D — Live entities** (3 days)
   - `TrackedEntitiesLayer` primitive
   - Domain wrappers in order of reuse value: `AircraftLayer`, `VesselsLayer`, `EarthquakesLayer`, `WildfiresLayer`, `GdacsLayer`, `AirportsLayer`, `TowersLayer`, then the remaining ~12.
   - Each gets its own story with mocked data from `_testdata/`.

5. **Milestone E — Raster timelines** (1.5 days)
   - `WeatherTileLayer`, `NasaGibsLayer`
   - Wire up reference's GIBS / RainViewer URL templates.
   - Storybook story: NDVI date slider; rain radar with playback.

6. **Milestone F — Particles** (1.5 days)
   - `WindParticlesLayer`, `WaveParticlesLayer`, `StreamlinesLayer`, `WindSimDomainPreview`
   - Performance pass — confirm 60 fps with 180 particles + globe at FHD.

7. **Milestone G — Chrome** (1 day)
   - `CesiumControls`, `CesiumMinimap`, `CesiumLayerControl`, `CesiumCompass`, `CesiumCoordinatesHud`, `BaseLayerPicker`
   - Storybook composition example `cesium/Examples/FullGlobe.stories.svelte` reproducing the geo_dashboard look using only library components.

8. **Milestone H — Docs & polish** (1 day)
   - `Overview/Cesium Integration` MDX page (build setup, Ion token, CSP, troubleshooting).
   - Verify no regressions in existing `MapView` stories.

---

## 8. Risks & Gotchas

- **SSR crash on `import 'cesium'`**: Cesium touches `window` at top-level. **Always** lazy-import via `await import('cesium')` inside `onMount` / `$effect`, never at the module top. The reference is consistent on this; mirror it.
- **`CESIUM_BASE_URL` timing**: Must be set on `window` *before* the first `Viewer` constructor runs. If the consumer forgets, Cesium 404s on Workers and silently falls back to single-threaded mode (very slow). `<CesiumGlobe>` should detect a missing `CESIUM_BASE_URL` and log a one-time warning in dev.
- **One terrain per viewer**: Cesium only allows a single `terrainProvider`. If two `<Terrain>` components are mounted under one `<CesiumGlobe>`, the second wins. Document and ideally `console.warn` in dev.
- **Imagery layer ordering**: `viewer.imageryLayers` is an ordered list; mounting `<ImageryLayer>` children declaratively does *not* guarantee mount order matches DOM order under all conditions. Use the `zIndex` prop and a deterministic `raiseToTop` / `lowerToBottom` reconcile in `$effect`.
- **Memory leaks on hot-reload**: HMR re-runs `onMount` but Cesium's `Viewer` retains GPU buffers. Ensure `onDestroy` runs `viewer.destroy()` *and* `vms` unbinds — and that `$effect` returns clean up `ScreenSpaceEventHandler` instances. Reference is correct here; reproduce verbatim.
- **`depthTestAgainstTerrain` flips picking semantics**: When enabled, billboards behind hills are hidden — desired for realism but breaks "find all points in bbox" pick tests. Document the tradeoff.
- **Particle layer perf**: 180 particles is the reference's sweet spot at 60 fps on a Retina laptop. Don't expose `particleCount` without a guard rail; document the perf envelope.
- **Storybook + cesium assets**: Storybook's static-dir config needs to include the copied `static/cesium/` (or equivalent under Storybook's public dir). Add `staticDirs: ['../static']` to `.storybook/main.ts` and document.
- **Cesium Ion rate limits**: Anonymous Ion tokens (committed to repos) get throttled fast. The example stories must accept a token via Storybook globals, not hardcode one.
- **Google Photorealistic 3D Tiles requires billing**: Document upfront — the Google Maps Platform API key needs the "Map Tiles API" SKU enabled, which is billed per session.
- **`cesium` peer-dep version skew**: A consumer pinned to `cesium@1.110` and us assuming APIs from `cesium@1.124` is a real failure mode. Pick a peer-dep floor (`^1.120.0`) and document it; CI tests should install the floor version, not just the latest.

---

## 9. Acceptance Criteria

The roadmap is "done" when, in Storybook:

- [x] `cesium/Examples/FullGlobe` reproduces a geo_dashboard-class screenshot using only library components — Esri base + World Terrain + OSM Buildings + draggable markers + city labels + live aircraft + earthquake events + layer toggle panel + minimap + compass + coordinates HUD + camera controls.
- [x] Every component has its own story. (Smoke-level coverage is provided via the Storybook stories rendered by the Vitest storybook project + the Playwright lifecycle test; per-component Vitest unit specs remain a nice-to-have follow-up.)
- [x] `pnpm build` produces the new `cesium/` exports in `@cyberdynecorp/svelte-ui-core/dist/`.
- [x] `cesium` is in `peerDependencies` (not `dependencies`) and the published bundle does not import it (lazy `await import('cesium')` only).
- [x] An `Overview/Cesium Integration` MDX page documents: install, asset copy script, Vite config, `CESIUM_BASE_URL`, Ion token, Google Maps key, CSP.
- [x] No regressions in existing `MapView`, `GraphViewer`, `MindMap` stories (svelte-check clean across 1273 files).
- [x] `pnpm check` (lint + svelte-check) passes with no new errors.
- [x] One end-to-end Playwright test loads `cesium/Examples/FullGlobe` and waits for `data-cesium-ready="true"` — guards against regressions to the viewer lifecycle, asset hosting, and context wiring.
- [ ] Consumer migration guide for `geo_dashboard` showing how to replace `GlobeView` + `*Layer` files with library imports (proves the API is sufficient). *(Deferred — the FullGlobe example demonstrates the equivalent composition; a line-by-line migration guide is a follow-up.)*

> **Status (all 8 build milestones A–H complete):** 45 components shipped under `packages/ui/core/src/lib/cesium/` — 1 viewer host, 3 imagery/terrain, 4 tilesets/contours, 8 vector, 2 raster-timeline, 22 live-entity, 4 particle/flow, 6 chrome — plus shared utilities (`viewerContext`, `sampler`, `reconcile`, `glyphs`, `gibs`) and the `FullGlobe` example. The viewer host attribute is `data-cesium-ready` (not `data-globe-ready` as originally drafted).

---

## 10. Effort Estimate

| Milestone | Components | LoC (approx) | Days |
|---|---|---|---|
| A — Engine | 1 host + 1 imagery + 1 terrain + 2 utils | ~600 | 1.5 |
| B — 3D + contours | 3D tiles generic + 2 wrappers + contours | ~450 | 1 |
| C — Vector basics | GeoJson, KML, CZML, Markers, Polygons, Polylines, Labels, PolygonHeatmaps | ~900 | 1.5 |
| D — Live entities | TrackedEntities primitive + ~18 domain wrappers | ~2,400 | 3 |
| E — Raster timelines | WeatherTile, NasaGibs | ~350 | 1.5 |
| F — Particles | Wind, Waves, Streamlines, DomainPreview | ~900 | 1.5 |
| G — Chrome | Controls, Minimap, LayerControl, Compass, CoordinatesHud, BaseLayerPicker | ~500 | 1 |
| H — Docs & polish | MDX, examples, Playwright | — | 1 |
| **Total** | **~38 new components** | **~6,100 LoC** | **12 focused days** |

Calendar: 3 working weeks for one experienced Svelte 5 + Cesium developer, excluding design review and PR cycles. The first three milestones (A–C, ~4 days) unlock real consumer migration; D–F (~6 days) are mostly per-wrapper boilerplate.

---

## TL;DR

The geo_dashboard's `<GlobeView>` + 34 `*Layer` siblings prove the architecture: **one viewer host, context-shared `Cesium.Viewer`, one `*Layer` component per visual concern, each lazy-importing `cesium` and reconciling its primitives in `$effect`**. Port that pattern into `packages/ui/core/src/lib/cesium/` as ~38 **headless, controlled-prop** components with `cesium` as a peer dependency. The library never owns data — consumers pass arrays + bind callbacks. The non-trivial integration piece (Cesium asset copying + `CESIUM_BASE_URL` + Ion token) ships as documentation, not code, because it cannot be solved generically inside the library.
