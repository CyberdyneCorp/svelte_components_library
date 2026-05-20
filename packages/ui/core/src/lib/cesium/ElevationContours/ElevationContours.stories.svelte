<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ElevationContours from "./ElevationContours.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";
  import Terrain from "../Terrain/Terrain.svelte";

  const { Story } = defineMeta({
    title: "Cesium/ElevationContours",
    component: ElevationContours,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Elevation contour overlay rendered via the active terrain provider's `ElevationContour` material. Optional shaded mode layers an `ElevationRamp` underneath using one of the built-in ramps (`grey` / `viridis` / `terrain`). Contours need a non-ellipsoid terrain to be visible — pair with `<Terrain provider={{ kind: 'world' }} />` plus a Cesium Ion token.",
        },
      },
    },
  });
</script>

<Story name="Plain">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: -119.6, lat: 36.6, heightM: 12_000 }}
    >
      <Terrain provider={{ kind: "world" }} />
      <ElevationContours spacingM={100} width={2} color="#00ff41" />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="ShadedTerrain">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="none"
      initialCamera={{ lng: 86.92, lat: 27.99, heightM: 18_000 }}
    >
      <Terrain provider={{ kind: "world" }} exaggeration={1.5} />
      <ElevationContours
        spacingM={250}
        width={1.5}
        color="#222"
        shaded={true}
        shadedRamp="terrain"
        minHeightM={0}
        maxHeightM={9000}
      />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="ViridisRamp">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="none"
      initialCamera={{ lng: -119.6, lat: 36.6, heightM: 12_000 }}
    >
      <Terrain provider={{ kind: "world" }} />
      <ElevationContours
        spacingM={150}
        width={2}
        color="#ffffff"
        shaded={true}
        shadedRamp="viridis"
        minHeightM={-500}
        maxHeightM={4000}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
