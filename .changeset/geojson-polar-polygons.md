---
"@cyberdynecorp/svelte-ui-core": patch
---

GeoJsonLayer: datasets with polygons touching a pole (e.g. Antarctica in world-countries GeoJSON) no longer crash Cesium with "Invalid array length" and stop the globe rendering. Those polygons are drawn with geodesic edges; all others keep the rhumb-line default.
