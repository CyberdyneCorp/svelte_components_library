<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import UserLocationLayer from "./UserLocationLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/UserLocationLayer",
    component: UserLocationLayer,
    tags: ["autodocs"],
  });

  const location = { lng: -122.4194, lat: 37.7749, accuracyM: 350 };
</script>

<Story name="WithAccuracyRing">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -122.42, lat: 37.78, heightM: 12_000 }}
    >
      <UserLocationLayer location={location} />
    </CesiumGlobe>
  {/snippet}
</Story>
