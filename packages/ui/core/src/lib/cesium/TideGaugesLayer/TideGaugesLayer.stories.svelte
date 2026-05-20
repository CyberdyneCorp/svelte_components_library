<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TideGaugesLayer from "./TideGaugesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/TideGaugesLayer",
    component: TideGaugesLayer,
    tags: ["autodocs"],
  });

  const gauges = [
    { id: "g1", lng: -122.47, lat: 37.81, levelM: 1.42, anomalyM: 0.6, station: "San Francisco" },
    { id: "g2", lng: -73.97, lat: 40.70, levelM: 0.81, anomalyM: -0.2, station: "Battery Park" },
    { id: "g3", lng: 139.78, lat: 35.65, levelM: 0.95, anomalyM: 0.1, station: "Tokyo Bay" },
    { id: "g4", lng: 18.07, lat: 59.33, levelM: 0.22, anomalyM: -0.55, station: "Stockholm" },
  ];
</script>

<Story name="CoastalGauges">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <TideGaugesLayer gauges={gauges} />
    </CesiumGlobe>
  {/snippet}
</Story>
