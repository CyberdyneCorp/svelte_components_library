<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TowersLayer from "./TowersLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/TowersLayer",
    component: TowersLayer,
    tags: ["autodocs"],
  });

  const towers = Array.from({ length: 15 }, (_, i) => ({
    id: `t${i}`,
    lng: -122.45 + (i % 5) * 0.04,
    lat: 37.75 + Math.floor(i / 5) * 0.04,
    heightM: 80 + Math.random() * 60,
    operator: "Cyberdyne RF",
  }));
</script>

<Story name="SfTowers">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -122.42, lat: 37.78, heightM: 12_000 }}
    >
      <TowersLayer towers={towers} />
    </CesiumGlobe>
  {/snippet}
</Story>
