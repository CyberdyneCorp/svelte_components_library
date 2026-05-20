<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WindSimDomainPreview from "./WindSimDomainPreview.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/WindSimDomainPreview",
    component: WindSimDomainPreview,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Translucent simulation domain preview: ground-clamped footprint + extruded box + wind direction arrow + size label. Two visual states — green while editing, amber while a job is solving.",
        },
      },
    },
  });

  const editingDomain = {
    centre: { lng: -122.4194, lat: 37.7749 },
    sizeM: 800,
    windDirectionDeg: 240,
    heightM: 80,
    state: "editing",
  };

  const runningDomain = {
    centre: { lng: -73.985, lat: 40.748 },
    sizeM: 1200,
    windDirectionDeg: 60,
    heightM: 120,
    state: "running",
  };
</script>

<Story name="EditingGreen">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: -122.4194, lat: 37.775, heightM: 2_500 }}
    >
      <WindSimDomainPreview domain={editingDomain} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="RunningAmber">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: -73.985, lat: 40.748, heightM: 3_500 }}
    >
      <WindSimDomainPreview domain={runningDomain} />
    </CesiumGlobe>
  {/snippet}
</Story>
