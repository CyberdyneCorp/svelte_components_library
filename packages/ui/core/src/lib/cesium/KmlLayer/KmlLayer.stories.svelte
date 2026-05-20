<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import KmlLayer from "./KmlLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/KmlLayer",
    component: KmlLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Loads a KML / KMZ document into a Cesium data source. Accepts a URL, Blob, or parsed DOM Document.",
        },
      },
    },
  });
</script>

<Story name="SampleKml">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <KmlLayer
        data="https://sandcastle.cesium.com/SampleData/kml/facilities.kml"
        clampToGround={true}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
