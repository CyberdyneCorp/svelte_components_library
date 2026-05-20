<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AirQualityLayer from "./AirQualityLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/AirQualityLayer",
    component: AirQualityLayer,
    tags: ["autodocs"],
  });

  const stations = [
    { id: "delhi", lng: 77.20, lat: 28.61, aqi: 320, station: "Delhi" },
    { id: "bj", lng: 116.40, lat: 39.90, aqi: 180, station: "Beijing" },
    { id: "la", lng: -118.24, lat: 34.05, aqi: 95, station: "Los Angeles" },
    { id: "wel", lng: 174.78, lat: -41.29, aqi: 28, station: "Wellington" },
    { id: "rey", lng: -21.94, lat: 64.13, aqi: 12, station: "Reykjavík" },
  ];
</script>

<Story name="WorldSnapshot">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <AirQualityLayer stations={stations} />
    </CesiumGlobe>
  {/snippet}
</Story>
