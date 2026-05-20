<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PolygonHeatmapsLayer from "./PolygonHeatmapsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/PolygonHeatmapsLayer",
    component: PolygonHeatmapsLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Choropleth-style polygon shading. The polygon geometry is mounted once; only the fill colour is re-tinted when `values` changes — useful for time-series or scenario sweeps.",
        },
      },
    },
  });

  function buildGrid() {
    const polygons = [];
    const values = [];
    const cols = 6;
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lng = -122.6 + c * 0.05;
        const lat = 37.65 + r * 0.05;
        const id = `cell-${r}-${c}`;
        polygons.push({
          id,
          vertices: [
            { lng, lat },
            { lng: lng + 0.05, lat },
            { lng: lng + 0.05, lat: lat + 0.05 },
            { lng, lat: lat + 0.05 },
          ],
        });
        values.push({ id, value: Math.random() * 100 });
      }
    }
    return { polygons, values };
  }

  const seeded = buildGrid();
</script>

<Story name="RiskGrid">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -122.5, lat: 37.8, heightM: 30_000 }}
    >
      <PolygonHeatmapsLayer
        polygons={seeded.polygons}
        values={seeded.values}
        colorScale={[
          { value: 0, color: "#00ff41" },
          { value: 50, color: "#ffb800" },
          { value: 100, color: "#ff4444" },
        ]}
        opacity={0.55}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
