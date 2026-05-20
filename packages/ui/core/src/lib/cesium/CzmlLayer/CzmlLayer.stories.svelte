<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CzmlLayer from "./CzmlLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/CzmlLayer",
    component: CzmlLayer,
    tags: ["autodocs"],
  });

  const flightCzml = [
    {
      id: "document",
      name: "Demo flight",
      version: "1.0",
      clock: {
        interval: "2024-01-01T00:00:00Z/2024-01-01T00:10:00Z",
        currentTime: "2024-01-01T00:00:00Z",
        multiplier: 60,
        range: "LOOP_STOP",
      },
    },
    {
      id: "flight",
      name: "Flight",
      availability: "2024-01-01T00:00:00Z/2024-01-01T00:10:00Z",
      billboard: {
        image:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='10' fill='%2300d4ff' stroke='white' stroke-width='2'/></svg>",
        scale: 1,
      },
      position: {
        epoch: "2024-01-01T00:00:00Z",
        cartographicDegrees: [
          0, -122.5, 37.5, 5_000,
          600, -120.0, 39.0, 6_000,
        ],
      },
      path: {
        leadTime: 0,
        trailTime: 600,
        material: { solidColor: { color: { rgba: [0, 212, 255, 200] } } },
        width: 2,
      },
    },
  ];
</script>

<Story name="AnimatedFlight">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -121.3, lat: 38.3, heightM: 200_000 }}
    >
      <CzmlLayer data={flightCzml} autoPlay={true} clockMultiplier={60} />
    </CesiumGlobe>
  {/snippet}
</Story>
