<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SatellitesLayer from "./SatellitesLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/SatellitesLayer",
    component: SatellitesLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Satellite positions are NOT propagated by this component. Consumer owns SGP4 propagation (e.g. via satellite.js) and updates the array on each tick.",
        },
      },
    },
  });

  const cluster = Array.from({ length: 8 }, (_, i) => ({
    id: `STARLINK-${1000 + i}`,
    name: `STARLINK ${1000 + i}`,
    lng: -120 + i * 5,
    lat: 35 - i * 2,
    altitudeM: 550_000,
    group: "starlink",
  }));
</script>

<Story name="StarlinkCluster">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -90, lat: 30, heightM: 12_000_000 }}
    >
      <SatellitesLayer satellites={cluster} alwaysShowLabels={false} />
    </CesiumGlobe>
  {/snippet}
</Story>
