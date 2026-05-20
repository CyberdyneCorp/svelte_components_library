<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CesiumMinimap from "./CesiumMinimap.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/Chrome/CesiumMinimap",
    component: CesiumMinimap,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Equirectangular overview showing the camera footprint as a rectangle plus a camera dot. Click anywhere on the minimap to fly the main camera there. Continent outlines are bundled silhouettes (indicative, not survey-grade).",
        },
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: 10, lat: 48, heightM: 3_000_000 }}
    >
      <CesiumMinimap />
    </CesiumGlobe>
  {/snippet}
</Story>
