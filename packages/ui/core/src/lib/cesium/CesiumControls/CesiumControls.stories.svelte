<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CesiumControls from "./CesiumControls.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/Chrome/CesiumControls",
    component: CesiumControls,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Floating control cluster — zoom in/out, optional fit-to-extent, home, north-up, and 2D/3D toggle. Reads the shared viewer from context and issues imperative camera commands.",
        },
      },
    },
  });

  const home = { lng: -40, lat: 25, heightM: 18_000_000 };
  const fitExtent = { minLng: -10, minLat: 35, maxLng: 30, maxLat: 60 };
</script>

<Story name="Default">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <CesiumControls {home} {fitExtent} showSceneModeToggle showNorthUp />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="BottomLeftMinimal">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <CesiumControls position="bottom-left" showNorthUp={false} />
    </CesiumGlobe>
  {/snippet}
</Story>
