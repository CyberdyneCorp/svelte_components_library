<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AirportsLayer from "./AirportsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/AirportsLayer",
    component: AirportsLayer,
    tags: ["autodocs"],
  });

  const hubs = [
    { id: "JFK", lng: -73.778, lat: 40.640, iata: "JFK", icao: "KJFK", name: "John F. Kennedy", type: "large_airport" },
    { id: "LAX", lng: -118.408, lat: 33.942, iata: "LAX", icao: "KLAX", name: "Los Angeles", type: "large_airport" },
    { id: "LHR", lng: -0.461, lat: 51.470, iata: "LHR", icao: "EGLL", name: "Heathrow", type: "large_airport" },
    { id: "HND", lng: 139.781, lat: 35.553, iata: "HND", icao: "RJTT", name: "Haneda", type: "large_airport" },
    { id: "GIG", lng: -43.243, lat: -22.808, iata: "GIG", icao: "SBGL", name: "Galeão", type: "large_airport" },
  ];
</script>

<Story name="GlobalHubs">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <AirportsLayer airports={hubs} />
    </CesiumGlobe>
  {/snippet}
</Story>
