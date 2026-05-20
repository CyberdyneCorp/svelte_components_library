<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AuroraLayer from "./AuroraLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/AuroraLayer",
    component: AuroraLayer,
    tags: ["autodocs"],
  });

  // 24-point synthetic northern oval centred on the magnetic pole.
  const oval = Array.from({ length: 24 }, (_, i) => {
    const ang = (i / 24) * Math.PI * 2;
    const radius = 25 + Math.sin(ang * 2) * 4;
    return { lng: Math.cos(ang) * radius - 80, lat: 70 - Math.sin(ang) * radius * 0.6 };
  });
</script>

<Story name="NorthernOval">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -80, lat: 70, heightM: 12_000_000 }}
    >
      <AuroraLayer
        ovals={[{ id: "north", hemisphere: "north", polygon: oval, kp: 6 }]}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
