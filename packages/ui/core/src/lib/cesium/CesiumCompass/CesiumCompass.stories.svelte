<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CesiumCompass from "./CesiumCompass.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/Chrome/CesiumCompass",
    component: CesiumCompass,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Compass needle that tracks the live camera heading. Rotate the globe (hold the middle mouse or Ctrl+drag) and the needle follows; click it to fly back to north-up.",
        },
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: 2.29, lat: 48.86, heightM: 1_200, heading: 0.6, pitch: -0.6 }}
    >
      <CesiumCompass />
    </CesiumGlobe>
  {/snippet}
</Story>
