<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import VesselsLayer from "./VesselsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/VesselsLayer",
    component: VesselsLayer,
    tags: ["autodocs"],
  });

  const fleet = [
    { id: "v1", lng: -8, lat: 36, headingDeg: 30, vesselType: "cargo", name: "MAERSK SUEZ" },
    { id: "v2", lng: -10, lat: 38, headingDeg: 270, vesselType: "tanker", name: "FRONT LION" },
    { id: "v3", lng: -6, lat: 37, headingDeg: 110, vesselType: "fishing", name: "MARIA" },
    { id: "v4", lng: -7, lat: 35.5, headingDeg: 200, vesselType: "passenger", name: "STENA NORDICA" },
  ];
</script>

<Story name="GibraltarTraffic">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -7.5, lat: 36.5, heightM: 600_000 }}
    >
      <VesselsLayer vessels={fleet} alwaysShowLabels={true} />
    </CesiumGlobe>
  {/snippet}
</Story>
