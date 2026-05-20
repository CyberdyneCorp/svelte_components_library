<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SubmarineCablesLayer from "./SubmarineCablesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/SubmarineCablesLayer",
    component: SubmarineCablesLayer,
    tags: ["autodocs"],
  });

  const cables = [
    {
      id: "atlantic-1",
      name: "TAT-14",
      status: "active",
      vertices: [
        { lng: -74, lat: 40.5 },
        { lng: -60, lat: 43 },
        { lng: -30, lat: 50 },
        { lng: -10, lat: 51 },
        { lng: -4, lat: 51 },
      ],
    },
    {
      id: "trans-pac",
      name: "AAG (planned ext.)",
      status: "planned",
      vertices: [
        { lng: -157.8, lat: 21.3 },
        { lng: 145, lat: 14 },
        { lng: 121, lat: 22 },
      ],
    },
  ];
</script>

<Story name="OceanLinks">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <SubmarineCablesLayer cables={cables} />
    </CesiumGlobe>
  {/snippet}
</Story>
