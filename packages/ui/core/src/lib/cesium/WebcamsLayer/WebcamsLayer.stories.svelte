<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WebcamsLayer from "./WebcamsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/WebcamsLayer",
    component: WebcamsLayer,
    tags: ["autodocs"],
  });

  const cams = [
    { id: "k", lng: -157.86, lat: 21.3, title: "Waikiki" },
    { id: "v", lng: 12.34, lat: 45.43, title: "Venice San Marco" },
    { id: "n", lng: -74.0, lat: 40.76, title: "Times Square" },
  ];
</script>

<Story name="ScenicCams">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <WebcamsLayer webcams={cams} />
    </CesiumGlobe>
  {/snippet}
</Story>
