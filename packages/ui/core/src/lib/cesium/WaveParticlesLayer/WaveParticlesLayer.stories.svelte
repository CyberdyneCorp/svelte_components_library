<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WaveParticlesLayer from "./WaveParticlesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/WaveParticlesLayer",
    component: WaveParticlesLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Wave-direction particle layer. Same canvas engine as `WindParticlesLayer` but driven by significant wave height + direction + period. Stroke alpha pulses with each particle's local wave period so swell visibly breathes.",
        },
      },
    },
  });

  // Synthetic NW Atlantic swell grid — uniformly heading 60° from north
  // with Hs growing as latitude increases.
  function buildSyntheticGrid() {
    const grid = [];
    for (let lat = 30; lat <= 55; lat += 1) {
      for (let lng = -60; lng <= -10; lng += 1) {
        const heightM = 1.2 + (lat - 30) * 0.18;
        const dirDeg = 60 + Math.sin(lng / 5) * 8;
        const periodS = 9 + (lat - 30) * 0.15;
        grid.push({ lng, lat, heightM, dirDeg, periodS });
      }
    }
    return grid;
  }
  const grid = buildSyntheticGrid();
</script>

<Story name="AtlanticSwell">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -35, lat: 42, heightM: 7_000_000 }}
    >
      <WaveParticlesLayer grid={grid} />
    </CesiumGlobe>
  {/snippet}
</Story>
