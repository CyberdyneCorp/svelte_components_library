<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GeoJsonLayer from "./GeoJsonLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/GeoJsonLayer",
    component: GeoJsonLayer,
    tags: ["autodocs"],
  });

  const triangle = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Cyberdyne AOI" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-122.50, 37.71],
            [-122.35, 37.71],
            [-122.40, 37.82],
            [-122.50, 37.71],
          ]],
        },
      },
    ],
  };

  const points = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "HQ" },
        geometry: { type: "Point", coordinates: [-122.4194, 37.7749] },
      },
      {
        type: "Feature",
        properties: { name: "Edge" },
        geometry: { type: "Point", coordinates: [-122.5194, 37.7749] },
      },
    ],
  };
</script>

<Story name="PolygonAOI">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -122.43, lat: 37.77, heightM: 30_000 }}
    >
      <GeoJsonLayer data={triangle} stroke="#00ff41" fill="#00ff41" fillOpacity={0.25} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="Points">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -122.45, lat: 37.77, heightM: 50_000 }}
    >
      <GeoJsonLayer data={points} markerColor="#00d4ff" />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="RemoteUrl">
  {#snippet template()}
    <!-- Public Natural Earth countries via cdn — confirms URL loading. -->
    <CesiumGlobe height="600px">
      <GeoJsonLayer
        data="https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
        stroke="#00ff41"
        fill="#00ff41"
        fillOpacity={0.05}
        strokeWidth={1}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
