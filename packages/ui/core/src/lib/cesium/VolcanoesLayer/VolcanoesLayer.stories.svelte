<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import VolcanoesLayer from "./VolcanoesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/VolcanoesLayer",
    component: VolcanoesLayer,
    tags: ["autodocs"],
  });

  const ring = [
    { id: "fuji", lng: 138.73, lat: 35.36, name: "Fuji", elevationM: 3776, status: "Holocene" },
    { id: "rainier", lng: -121.76, lat: 46.85, name: "Rainier", elevationM: 4392, status: "active" },
    { id: "popo", lng: -98.62, lat: 19.02, name: "Popocatépetl", elevationM: 5426, status: "erupting" },
    { id: "etna", lng: 14.99, lat: 37.75, name: "Etna", elevationM: 3329, status: "erupting" },
  ];
</script>

<Story name="PacificRing">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <VolcanoesLayer volcanoes={ring} />
    </CesiumGlobe>
  {/snippet}
</Story>
