<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GooglePhotorealisticTiles from "./GooglePhotorealisticTiles.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/GooglePhotorealisticTiles",
    component: GooglePhotorealisticTiles,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Google Photorealistic 3D Tiles. Two sourcing paths:\n\n" +
            "- **`source=\"ion\"` (default)** — Cesium ion asset 2275207. Set `ionToken` on the parent `<CesiumGlobe>`; no Google key or per-session billing on your own account.\n" +
            "- **`source=\"google\"`** — Google Maps Platform directly. Requires `apiKey` (Map Tiles API SKU, billed per session). Pass `acknowledgeGoogleGeocoder` to silence Cesium's one-time geocoder warning.",
        },
      },
    },
  });
</script>

<Story name="ViaIon">
  {#snippet template()}
    <!-- Recommended path: needs only an ion token on the globe. Set
         ionToken={env.PUBLIC_CESIUM_ION_TOKEN} in a real app. -->
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="none"
      initialCamera={{ lng: 2.295, lat: 48.873, heightM: 1500 }}
    >
      <GooglePhotorealisticTiles source="ion" />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="ViaGoogleApiKey">
  {#snippet template()}
    <!-- Direct Google path. Pass apiKey={env.PUBLIC_GOOGLE_MAPS_API_KEY} and
         acknowledgeGoogleGeocoder to silence the one-time console warning. -->
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="none"
      initialCamera={{ lng: 2.295, lat: 48.873, heightM: 1500 }}
    >
      <GooglePhotorealisticTiles source="google" acknowledgeGoogleGeocoder />
    </CesiumGlobe>
  {/snippet}
</Story>
