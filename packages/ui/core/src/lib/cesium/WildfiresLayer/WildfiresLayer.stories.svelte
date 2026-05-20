<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WildfiresLayer from "./WildfiresLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/WildfiresLayer",
    component: WildfiresLayer,
    tags: ["autodocs"],
  });

  const fires = Array.from({ length: 30 }, (_, i) => ({
    id: `f${i}`,
    lng: -122 + (i % 6) * 0.6 + Math.random() * 0.3,
    lat: 38 + Math.floor(i / 6) * 0.5 + Math.random() * 0.3,
    confidencePct: 60 + Math.random() * 40,
    brightnessK: 300 + Math.random() * 80,
    frpMw: Math.random() * 200,
  }));
</script>

<Story name="CaliforniaSeason">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: -120, lat: 39, heightM: 600_000 }}
    >
      <WildfiresLayer wildfires={fires} />
    </CesiumGlobe>
  {/snippet}
</Story>
