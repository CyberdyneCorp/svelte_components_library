<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WindParticlesLayer from "./WindParticlesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/WindParticlesLayer",
    component: WindParticlesLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Canvas-overlay particle layer. ~180 particles are advected over a u/v wind grid each frame, with destination-out trail fade. Particles spawn inside `bbox` (defaults to the grid AABB) and respawn when they exit. Designed for 60 fps at FHD; bumping `particleCount` past ~400 starts to hurt on integrated GPUs.",
        },
      },
    },
  });

  // Synthetic vortex-style flow over the Mediterranean — `u` and `v`
  // shaped so particles spiral around a centre point.
  function buildSyntheticGrid() {
    const grid = [];
    const cx = 15;
    const cy = 38;
    for (let lat = 30; lat <= 46; lat += 1) {
      for (let lng = 0; lng <= 30; lng += 1) {
        const dx = lng - cx;
        const dy = lat - cy;
        const r = Math.max(0.5, Math.sqrt(dx * dx + dy * dy));
        // Tangential flow + slight radial inflow.
        const u = (-dy / r) * 6 + (-dx / r) * 0.5;
        const v = (dx / r) * 6 + (-dy / r) * 0.5;
        grid.push({ lng, lat, u, v });
      }
    }
    return grid;
  }

  const grid = buildSyntheticGrid();
</script>

<Story name="MediterraneanVortex">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: 15, lat: 38, heightM: 3_500_000 }}
    >
      <WindParticlesLayer grid={grid} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="DensePalette">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: 15, lat: 38, heightM: 3_500_000 }}
    >
      <WindParticlesLayer
        grid={grid}
        particleCount={300}
        coolColor="#a5f3fc"
        warmColor="#fde68a"
      />
    </CesiumGlobe>
  {/snippet}
</Story>
