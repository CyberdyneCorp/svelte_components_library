<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PowerPlantsLayer from "./PowerPlantsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/PowerPlantsLayer",
    component: PowerPlantsLayer,
    tags: ["autodocs"],
  });

  const fleet = [
    { id: "p1", lng: -85.65, lat: 39.27, name: "Gibson Generating", capacityMw: 3340, fuel: "coal" },
    { id: "p2", lng: -85.32, lat: 41.46, name: "Cook Nuclear", capacityMw: 2156, fuel: "nuclear" },
    { id: "p3", lng: -119.20, lat: 38.45, name: "Topaz Solar Farm", capacityMw: 550, fuel: "solar" },
    { id: "p4", lng: -101.05, lat: 35.21, name: "Roscoe Wind Farm", capacityMw: 781, fuel: "wind" },
    { id: "p5", lng: -111.49, lat: 36.94, name: "Glen Canyon Dam", capacityMw: 1320, fuel: "hydro" },
    { id: "p6", lng: -97.39, lat: 35.46, name: "Mustang Gas", capacityMw: 480, fuel: "gas" },
  ];
</script>

<Story name="UsFleet">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -100, lat: 38, heightM: 6_000_000 }}
    >
      <PowerPlantsLayer powerPlants={fleet} />
    </CesiumGlobe>
  {/snippet}
</Story>
