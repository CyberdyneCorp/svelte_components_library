<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ModelsLayer from "./ModelsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/ModelsLayer",
    component: ModelsLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Controlled glTF / .glb model entities placed at lng/lat with optional altitude + heading/pitch/roll + scale + tint and silhouette. The library never hosts model files — pass URLs you (or Cesium ion) host. When `altitudeM` is omitted the model's base is clamped to terrain.",
        },
      },
    },
  });

  // Cesium ion sample (Aircraft) — confirms the model graphics wire-up.
  // In a real app pass URLs to your own glTF / .glb (or Cesium ion asset URLs).
  const sample = [
    {
      id: "demo-aircraft",
      lng: -122.4194,
      lat: 37.7749,
      altitudeM: 400,
      headingDeg: 90,
      url: "https://assets.ion.cesium.com/138728/Cesium_Air.glb",
      scale: 1,
      silhouetteColor: "#00d4ff",
      silhouetteSize: 2,
    },
  ];
</script>

<Story name="SingleModel">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: -122.4194, lat: 37.7749, heightM: 2500 }}
    >
      <ModelsLayer models={sample} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="TintedSilhouette">
  {#snippet template()}
    {@const tinted = [{ ...sample[0], tintColor: "#a855f7", tintAmount: 0.6 }]}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: -122.4194, lat: 37.7749, heightM: 2500 }}
    >
      <ModelsLayer models={tinted} />
    </CesiumGlobe>
  {/snippet}
</Story>
