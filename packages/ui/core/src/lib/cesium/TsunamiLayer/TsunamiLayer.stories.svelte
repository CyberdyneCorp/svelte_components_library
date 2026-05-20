<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TsunamiLayer from "./TsunamiLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/TsunamiLayer",
    component: TsunamiLayer,
    tags: ["autodocs"],
  });

  const buoys = [
    { id: "b1", lng: -157.0, lat: 21.3, status: "ok", anomalyM: 0.02 },
    { id: "b2", lng: -145.0, lat: 50.0, status: "watch", anomalyM: 0.15 },
    { id: "b3", lng: 142.0, lat: 33.0, status: "event", anomalyM: 1.85 },
    { id: "b4", lng: -85.0, lat: 0.0, status: "offline" },
  ];
</script>

<Story name="PacificDart">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -160, lat: 25, heightM: 12_000_000 }}
    >
      <TsunamiLayer buoys={buoys} />
    </CesiumGlobe>
  {/snippet}
</Story>
