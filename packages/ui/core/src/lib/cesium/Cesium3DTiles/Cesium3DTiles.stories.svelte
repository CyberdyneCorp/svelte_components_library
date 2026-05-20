<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Cesium3DTiles from "./Cesium3DTiles.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/Cesium3DTiles",
    component: Cesium3DTiles,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Generic 3D-tileset mount. Accepts `osm-buildings`, `google-photorealistic`, `ion`, or `url` sources. Exposes a per-tile-feature visit hook (`onfeature`) for custom tinting and a `style` prop for declarative `Cesium3DTileStyle` expressions.",
        },
      },
    },
  });
</script>

<Story name="OsmBuildingsNyc">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -74.0086, lat: 40.7128, heightM: 1500 }}
    >
      <Cesium3DTiles source={{ kind: "osm-buildings" }} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="OsmBuildingsTokyo">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: 139.6917, lat: 35.6895, heightM: 1500 }}
    >
      <Cesium3DTiles source={{ kind: "osm-buildings" }} opacity={0.85} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="IonAssetSample">
  {#snippet template()}
    <!-- Ion asset 96188 is Cesium's "Aerometrex Denver" sample tileset.
         Without an Ion token, this will fail at runtime and log a warning;
         set the `ionToken` prop on `<CesiumGlobe>` to use it. -->
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -104.99, lat: 39.74, heightM: 1500 }}
    >
      <Cesium3DTiles source={{ kind: "ion", assetId: 96188 }} />
    </CesiumGlobe>
  {/snippet}
</Story>
