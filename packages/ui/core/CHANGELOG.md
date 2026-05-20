# @cyberdynecorp/svelte-ui-core

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
