<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LabelsLayer from "./LabelsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/LabelsLayer",
    component: LabelsLayer,
    tags: ["autodocs"],
  });

  const cities = [
    { id: "sf", lng: -122.4194, lat: 37.7749, text: "SAN FRANCISCO", color: "#00ff41" },
    { id: "ny", lng: -74.006, lat: 40.7128, text: "NEW YORK", color: "#00d4ff" },
    { id: "ldn", lng: -0.1278, lat: 51.5074, text: "LONDON", color: "#a855f7" },
    { id: "tk", lng: 139.6917, lat: 35.6895, text: "TOKYO", color: "#ffb800" },
  ];
</script>

<Story name="CityLabels">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <LabelsLayer labels={cities} />
    </CesiumGlobe>
  {/snippet}
</Story>
