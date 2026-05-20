<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GdacsLayer from "./GdacsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/GdacsLayer",
    component: GdacsLayer,
    tags: ["autodocs"],
  });

  const events = [
    { id: "e1", lng: 95.0, lat: 5.0, eventType: "EQ", alertLevel: "Red", title: "M7.2 — Sumatra" },
    { id: "e2", lng: -88.0, lat: 17.0, eventType: "TC", alertLevel: "Orange", title: "TS NICOLE" },
    { id: "e3", lng: -120.0, lat: 39.0, eventType: "WF", alertLevel: "Orange", title: "Sierra Complex" },
    { id: "e4", lng: 30.5, lat: -2.0, eventType: "FL", alertLevel: "Green", title: "Lake Victoria Basin" },
    { id: "e5", lng: -98.6, lat: 19.0, eventType: "VO", alertLevel: "Red", title: "Popocatépetl" },
  ];
</script>

<Story name="ActiveEvents">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <GdacsLayer events={events} />
    </CesiumGlobe>
  {/snippet}
</Story>
