<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StreamlinesLayer from "./StreamlinesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/StreamlinesLayer",
    component: StreamlinesLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Pre-computed streamlines as per-segment-coloured polylines. Each `Streamline` ships `points` (lng/lat/alt) and `values` (one scalar per point); colours are sampled from the ramp at the midpoint of each segment and rebuilt only when the array changes.",
        },
      },
    },
  });

  // Build a handful of synthetic streamlines around a CFD-like vortex.
  function buildLines() {
    const lines = [];
    const cx = -122.4194;
    const cy = 37.7749;
    for (let i = 0; i < 12; i++) {
      const startAng = (i / 12) * Math.PI * 2;
      const points = [];
      const values = [];
      for (let s = 0; s < 40; s++) {
        const t = s / 40;
        const r = 0.02 + t * 0.06;
        const theta = startAng + t * Math.PI;
        const lng = cx + Math.cos(theta) * r;
        const lat = cy + Math.sin(theta) * r * 0.7;
        const alt = 50 + t * 200;
        points.push([lng, lat, alt]);
        // Speed magnitude growing toward the corner — feeds the colour ramp.
        values.push(2 + t * 18);
      }
      lines.push({ id: `s${i}`, points, values });
    }
    return lines;
  }

  const lines = buildLines();
</script>

<Story name="SfVortex">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: -122.4194, lat: 37.7749, heightM: 8_500 }}
    >
      <StreamlinesLayer streamlines={lines} width={3} />
    </CesiumGlobe>
  {/snippet}
</Story>
