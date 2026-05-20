<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FarmsLayer from "./FarmsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/FarmsLayer",
    component: FarmsLayer,
    tags: ["autodocs"],
  });

  const farms = Array.from({ length: 60 }, (_, i) => ({
    id: `f${i}`,
    lng: -88 + Math.random() * 4,
    lat: 41 + Math.random() * 3,
    name: `Farm ${i + 1}`,
    crop: ["corn", "wheat", "soybean"][i % 3],
    areaHa: 50 + Math.random() * 400,
  }));
</script>

<Story name="MidwestCluster">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: -86, lat: 42, heightM: 900_000 }}
    >
      <FarmsLayer farms={farms} />
    </CesiumGlobe>
  {/snippet}
</Story>
