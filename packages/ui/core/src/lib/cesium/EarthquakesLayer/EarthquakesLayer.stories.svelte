<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EarthquakesLayer from "./EarthquakesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/EarthquakesLayer",
    component: EarthquakesLayer,
    tags: ["autodocs"],
  });

  const recent = [
    { id: "1", lng: 140.1, lat: 35.7, magnitude: 5.2, depthKm: 30, place: "off east coast of Honshu" },
    { id: "2", lng: -118.3, lat: 34.0, magnitude: 4.4, depthKm: 12, place: "Los Angeles area" },
    { id: "3", lng: 174.8, lat: -41.3, magnitude: 6.0, depthKm: 65, place: "Wellington" },
    { id: "4", lng: -70.6, lat: -33.4, magnitude: 4.8, depthKm: 90, place: "Santiago" },
    { id: "5", lng: 95.0, lat: 5.0, magnitude: 7.2, depthKm: 350, place: "Sumatra" },
  ];
</script>

<Story name="RecentSeismic">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <EarthquakesLayer earthquakes={recent} />
    </CesiumGlobe>
  {/snippet}
</Story>
