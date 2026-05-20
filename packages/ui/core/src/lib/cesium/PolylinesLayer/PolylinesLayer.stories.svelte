<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PolylinesLayer from "./PolylinesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/PolylinesLayer",
    component: PolylinesLayer,
    tags: ["autodocs"],
  });

  const routes = [
    {
      id: "sf-tokyo",
      vertices: [
        { lng: -122.4194, lat: 37.7749 },
        { lng: -150, lat: 50 },
        { lng: 139.6917, lat: 35.6895 },
      ],
      color: "#00d4ff",
      width: 3,
    },
    {
      id: "ldn-nyc",
      vertices: [
        { lng: -0.1278, lat: 51.5074 },
        { lng: -30, lat: 50 },
        { lng: -74.006, lat: 40.7128 },
      ],
      color: "#a855f7",
      width: 2,
      dashed: true,
    },
  ];
</script>

<Story name="GlobalRoutes">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -90, lat: 35, heightM: 20_000_000 }}
    >
      <PolylinesLayer polylines={routes} />
    </CesiumGlobe>
  {/snippet}
</Story>
