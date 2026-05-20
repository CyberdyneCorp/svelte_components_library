<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NasaGibsLayer from "./NasaGibsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/NasaGibsLayer",
    component: NasaGibsLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Convenience wrapper around `ImageryLayer` that builds the right URL template for a known NASA EOSDIS GIBS product. Pass `date=\"live\"` to auto-compute the most-recent composite or NRT timestamp.",
        },
      },
    },
  });
</script>

<Story name="Ndvi8Day">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <NasaGibsLayer product="MODIS_Terra_NDVI_8Day" alpha={0.85} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="TrueColorDaily">
  {#snippet template()}
    <CesiumGlobe height="600px">
      <NasaGibsLayer
        product="MODIS_Terra_CorrectedReflectance_TrueColor"
        alpha={1}
      />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="GoesEastLiveCloud">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -75, lat: 30, heightM: 18_000_000 }}
    >
      <NasaGibsLayer product="GOES-East_ABI_GeoColor" alpha={0.85} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="HimawariLiveCloud">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: 140, lat: 0, heightM: 18_000_000 }}
    >
      <NasaGibsLayer product="Himawari_AHI_GeoColor" alpha={0.85} />
    </CesiumGlobe>
  {/snippet}
</Story>
