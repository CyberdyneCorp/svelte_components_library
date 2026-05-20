<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AircraftLayer from "./AircraftLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/AircraftLayer",
    component: AircraftLayer,
    tags: ["autodocs"],
  });

  const fleet = [
    { id: "UAL901", lng: -122.4, lat: 37.6, altitudeM: 11_000, headingDeg: 90, callsign: "UAL901" },
    { id: "BAW271", lng: -115, lat: 38, altitudeM: 11_500, headingDeg: 60, callsign: "BAW271" },
    { id: "ANA7", lng: -110, lat: 40, altitudeM: 11_200, headingDeg: 100, callsign: "ANA7" },
    { id: "DLH458", lng: -100, lat: 42, altitudeM: 10_800, headingDeg: 75, callsign: "DLH458" },
  ];
</script>

<Story name="TransatlanticFleet">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -100, lat: 40, heightM: 6_000_000 }}
    >
      <AircraftLayer aircraft={fleet} alwaysShowLabels={true} />
    </CesiumGlobe>
  {/snippet}
</Story>
