<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CyclonesLayer from "./CyclonesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/CyclonesLayer",
    component: CyclonesLayer,
    tags: ["autodocs"],
  });

  const cyclones = [
    {
      id: "ts-nicole",
      name: "NICOLE",
      category: 2,
      track: [
        { lng: -82, lat: 18, windKts: 45 },
        { lng: -80, lat: 21, windKts: 55 },
        { lng: -79, lat: 24, windKts: 80 },
        { lng: -80, lat: 27, windKts: 95 },
      ],
      forecast: [
        { lng: -82, lat: 30 },
        { lng: -85, lat: 33 },
      ],
      cone: [
        { lng: -80, lat: 27 },
        { lng: -78, lat: 30 },
        { lng: -82, lat: 33 },
        { lng: -88, lat: 33 },
        { lng: -86, lat: 30 },
        { lng: -82, lat: 27 },
      ],
    },
  ];
</script>

<Story name="GulfTrack">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -82, lat: 27, heightM: 3_000_000 }}
    >
      <CyclonesLayer cyclones={cyclones} />
    </CesiumGlobe>
  {/snippet}
</Story>
