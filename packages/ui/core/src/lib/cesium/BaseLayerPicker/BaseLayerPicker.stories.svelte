<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BaseLayerPicker from "./BaseLayerPicker.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/Chrome/BaseLayerPicker",
    component: BaseLayerPicker,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Dropdown that swaps the base imagery at runtime. With `autoMount` (default) it mounts the selected provider via an internal `ImageryLayer`; set `autoMount={false}` to drive your own layer from the `onchange` callback.",
        },
      },
    },
  });

  const options = [
    {
      id: "osm",
      label: "OpenStreetMap",
      provider: { kind: "osm" },
    },
    {
      id: "esri",
      label: "Esri World Imagery",
      provider: {
        kind: "urlTemplate",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxLevel: 19,
        credit: "Esri",
      },
    },
    {
      id: "carto-dark",
      label: "Carto Dark",
      provider: {
        kind: "urlTemplate",
        url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        maxLevel: 19,
        credit: "CARTO",
      },
    },
  ];
</script>

<Story name="Default">
  {#snippet template()}
    <CesiumGlobe height="600px" defaultBaseLayer="none">
      <BaseLayerPicker {options} />
    </CesiumGlobe>
  {/snippet}
</Story>
