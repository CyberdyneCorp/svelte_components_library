<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TrackedEntitiesLayer from "./TrackedEntitiesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/TrackedEntitiesLayer",
    component: TrackedEntitiesLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Generic moving-point layer. Other live-entity wrappers (AircraftLayer, VesselsLayer, EarthquakesLayer, …) all delegate to this component after mapping their domain shape to `TrackedEntity[]`.",
        },
      },
    },
  });

  const entities = [
    { id: "a", lng: -120, lat: 30, color: "#00ff41", label: "Alpha" },
    { id: "b", lng: 0, lat: 0, color: "#00d4ff", label: "Beta" },
    { id: "c", lng: 120, lat: -20, color: "#a855f7", label: "Gamma" },
  ];
</script>

<Story name="ThreePoints">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <TrackedEntitiesLayer entities={entities} alwaysShowLabels={true} />
    </CesiumGlobe>
  {/snippet}
</Story>
