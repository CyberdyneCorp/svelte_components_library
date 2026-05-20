<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CesiumCoordinatesHud from "./CesiumCoordinatesHud.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/Chrome/CesiumCoordinatesHud",
    component: CesiumCoordinatesHud,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Bottom-left readout of the cursor's lng/lat, surface elevation under the cursor, and the live camera altitude. Move the mouse over the globe to update the coordinates.",
        },
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -119.5, lat: 37.7, heightM: 60_000 }}
    >
      <CesiumCoordinatesHud />
    </CesiumGlobe>
  {/snippet}
</Story>
