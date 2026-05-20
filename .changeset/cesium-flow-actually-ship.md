---
"@cyberdynecorp/svelte-ui-core": minor
---

Actually ship the Cesium 3D globe suite, the flow node editor, and the four
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
