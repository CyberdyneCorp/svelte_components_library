<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MarkersLayer from "./MarkersLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/MarkersLayer",
    component: MarkersLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Controlled marker billboards over the globe. Pass `markers` as a stable array; bind `selectedId` for click selection; enable `draggable` for click-and-hold repositioning (consumer applies new lng/lat via `onmove`).",
        },
      },
    },
  });

  const sites = [
    { id: "sf", lng: -122.4194, lat: 37.7749, label: "SF", color: "#00ff41" },
    { id: "ny", lng: -74.006, lat: 40.7128, label: "NYC", color: "#00d4ff" },
    { id: "ldn", lng: -0.1278, lat: 51.5074, label: "London", color: "#a855f7" },
    { id: "tk", lng: 139.6917, lat: 35.6895, label: "Tokyo", color: "#ffb800" },
    { id: "sp", lng: -46.6333, lat: -23.5505, label: "São Paulo", color: "#ff4444" },
  ];
</script>

<Story name="WorldSites">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <MarkersLayer markers={sites} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="Selectable">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <MarkersLayer
        markers={sites}
        onclick={(m) => console.log("clicked", m.id)}
      />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="Draggable">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <MarkersLayer
        markers={sites}
        draggable={true}
        onmove={(id, ll) => console.log("moved", id, ll)}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
