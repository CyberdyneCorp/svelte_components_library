<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CesiumLayerControl from "./CesiumLayerControl.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/Chrome/CesiumLayerControl",
    component: CesiumLayerControl,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Headless layer toggle panel. Pass a flat `layers` array (optionally grouped) plus an `onchange` callback; the consumer owns the visibility / opacity state and feeds it back in. Items with an `opacity` field render a slider.",
        },
      },
    },
  });

  const groups = [
    { id: "imagery", label: "Imagery", defaultOpen: true },
    { id: "live", label: "Live", defaultOpen: false },
  ];

  const layers = [
    { id: "buildings", label: "OSM Buildings", group: "imagery", visible: true, opacity: 0.85 },
    { id: "ndvi", label: "NDVI (8-day)", group: "imagery", visible: false, opacity: 0.6, hint: "MODIS Terra" },
    { id: "aircraft", label: "Aircraft", group: "live", visible: true, hint: "1,204 tracked" },
    { id: "quakes", label: "Earthquakes", group: "live", visible: false },
    { id: "labels", label: "City Labels", visible: true },
  ];
</script>

<Story name="Grouped">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <CesiumLayerControl
        {layers}
        {groups}
        onchange={(id, patch) => console.log("layer change", id, patch)}
      />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="FlatList">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <CesiumLayerControl
        layers={layers.map((l) => ({ ...l, group: undefined }))}
        position="top-left"
      />
    </CesiumGlobe>
  {/snippet}
</Story>
