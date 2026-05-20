# @cyberdynecorp/svelte-ui-core

## 0.3.0

### Minor Changes

- 505c213: Actually ship the Cesium 3D globe suite, the flow node editor, and the four
  geospatial/utility components. These were nominally part of 0.2.0 but the
  published 0.2.0 tarball was a stale build that omitted them (a 0.2.0 already
  existed on the registry, so `changeset publish` skipped re-publishing). This
  release republishes the real `main` build.

  Included (verified present in `dist/`):
  - **`cesium/` category (49 components)** — headless, controlled CesiumJS globe
    toolkit: `CesiumGlobe` host, `Terrain`, `ImageryLayer`, 3D tilesets
    (`Cesium3DTiles`, `OsmBuildingsLayer`, `GooglePhotorealisticTiles`),
    `ElevationContours`, vector layers, 22 live-entity layers, raster timelines
    (`WeatherTileLayer`, `NasaGibsLayer`), particle/flow layers, and UI chrome.
    `cesium` is an optional peer dependency, lazy-imported and never bundled.
  - **`flow/` node editor (8 components)** — `NodeEditor`, `FlowNode`, `FlowPort`,
    `FlowEdge`, `NodePalette`, `NodeInspector`, `FlowMinimap`, `FlowCanvasControls`.
  - **`ElevationProfile`** (charts), **`GlobeLoader`** (feedback),
    **`FloatingPanel`** (layout), **`WeatherCard`** (data).

## 0.2.0

### Minor Changes

- 1c52a12: Add the CesiumJS 3D globe suite and four geospatial/utility components.
  - **`cesium/` category (49 components)** — headless, controlled CesiumJS globe
    toolkit: `CesiumGlobe` viewer host + terrain/imagery, 3D tilesets (incl.
    OSM Buildings and Google Photorealistic via ion asset 2275207 or a Google
    Maps API key), vector layers, 22 live-entity layers, raster timelines
    (`WeatherTileLayer`, `NasaGibsLayer`), particle/flow layers, and UI chrome
    (`CesiumControls`, `CesiumCompass`, `CesiumCoordinatesHud`,
    `CesiumLayerControl`, `BaseLayerPicker`, `CesiumMinimap`). `cesium` is an
    **optional peer dependency**, lazy-imported per component (SSR-safe, never
    bundled).
  - **`ElevationProfile`** (charts) — distance-vs-elevation cross-section with
    terrain fill and optional line-of-sight + Fresnel-zone overlay.
  - **`GlobeLoader`** (feedback) — self-contained animated rotating globe loader
    (2D canvas, no Cesium).
  - **`FloatingPanel`** (layout) — draggable + resizable titlebar window.
  - **`WeatherCard`** (data) — controlled current-conditions card.
