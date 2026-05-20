<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CellSitesLayer from "./CellSitesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/CellSitesLayer",
    component: CellSitesLayer,
    tags: ["autodocs"],
  });

  const sites = Array.from({ length: 40 }, (_, i) => ({
    id: `c${i}`,
    lng: -73.99 + (i % 8) * 0.02,
    lat: 40.74 + Math.floor(i / 8) * 0.02,
    radio: ["5G", "LTE", "GSM"][i % 3],
    operator: "Cyberdyne Mobile",
  }));
</script>

<Story name="ManhattanGrid">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -73.97, lat: 40.76, heightM: 12_000 }}
    >
      <CellSitesLayer cellSites={sites} />
    </CesiumGlobe>
  {/snippet}
</Story>
