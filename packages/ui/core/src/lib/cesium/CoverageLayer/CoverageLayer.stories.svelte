<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CoverageLayer from "./CoverageLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/CoverageLayer",
    component: CoverageLayer,
    tags: ["autodocs"],
  });

  const cones = [
    {
      id: "antenna-a",
      lng: -122.42,
      lat: 37.76,
      rangeM: 18_000,
      bearingDeg: 60,
      halfBeamWidthDeg: 30,
      color: "#00d4ff",
    },
    {
      id: "omni-b",
      lng: -122.27,
      lat: 37.78,
      rangeM: 12_000,
      halfBeamWidthDeg: 180,
      color: "#00ff41",
    },
  ];
</script>

<Story name="RfSectors">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -122.35, lat: 37.78, heightM: 70_000 }}
    >
      <CoverageLayer coverages={cones} />
    </CesiumGlobe>
  {/snippet}
</Story>
