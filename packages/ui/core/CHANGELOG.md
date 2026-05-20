# @cyberdynecorp/svelte-ui-core

## 0.4.0

### Minor Changes

- 979f8dc: Add `ModelsLayer` for glTF / .glb on the globe, plus additive primitive
  callbacks unblocking common app patterns.

  **New components & examples**
  - **`cesium/ModelsLayer`** — controlled list of 3D model entities at lng/lat
    with optional altitude, heading/pitch/roll, scale, `minimumPixelSize`,
    `maximumScale`, tint colour (blend) and silhouette. Diff-by-id
    reconciliation, bindable `selectedId`, `onclick`. Clamps the base to terrain
    when `altitudeM` is omitted.
  - **`ModelEntity`** type exported from the package entry.
  - **`cesium/Examples/UrbanCFD`** — composition story reproducing a CFD-over-
    buildings scene (OSM Buildings tinted by stress band + streamlines +
    pressure dots + numeric labels + wind-sim domain preview).

  **Primitive additions** (all additive — no breaking changes)
  - **`TextInput`** — `type` widened to also accept `"search"`, `"tel"`,
    `"date"`, `"datetime-local"`, `"time"`, `"month"`, `"week"`. New bindable
    `inputRef: HTMLInputElement | null` for imperative focus / `select()`.
    New `onchange`, `onfocus`, `onblur`, `onkeydown` callbacks.
  - **`Checkbox`** — `ariaLabel` prop (used when `label` is omitted, e.g.
    row-select checkboxes) and `onchange: (checked, e) => void` callback.
  - **`Slider`** (ml) — `oninput(value)` and `onchange(value)` callbacks for
    driving transforming setters / dispatching to a viewmodel.
  - **`Button`** — `title` and `ariaLabel` props passed through to the
    underlying `<button>`.
  - **`Icon`** — exported `IconName` string-literal union of the built-in icons
    and `BUILTIN_ICON_NAMES` array; `name` accepts `IconName | (string & {})`
    so consumers get autocomplete while keeping the unknown-name escape hatch.

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
