<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CesiumGlobe from "./CesiumGlobe.svelte";
  import Terrain from "../Terrain/Terrain.svelte";
  import ImageryLayer from "../ImageryLayer/ImageryLayer.svelte";

  const { Story } = defineMeta({
    title: "Cesium/CesiumGlobe",
    component: CesiumGlobe,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "3D globe powered by CesiumJS. Defaults to OpenStreetMap basemap + ellipsoid terrain when no Cesium Ion token is provided. Compose with `<ImageryLayer>` and `<Terrain>` children for 3D terrain, additional basemaps, NDVI overlays, etc.",
        },
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template()}
    <CesiumGlobe height="600px" />
  {/snippet}
</Story>

<Story name="EsriWorldImagery">
  {#snippet template()}
    <CesiumGlobe height="600px" defaultBaseLayer="esri-world" />
  {/snippet}
</Story>

<Story name="WithNdviOverlay">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -95, lat: 37, heightM: 8_000_000 }}
    >
      <ImageryLayer
        provider={{
          kind: "urlTemplate",
          url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2024-09-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
          maxLevel: 9,
          credit: "NASA EOSDIS GIBS",
        }}
        alpha={0.7}
      />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="WithTerrainWorld">
  {#snippet template()}
    <!-- World terrain requires a Cesium Ion token at runtime; without one
         the component falls back to the ellipsoid surface. Pass the token
         via the `ionToken` prop in a real app. -->
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -119.5, lat: 37.5, heightM: 80_000 }}
    >
      <Terrain provider={{ kind: "world" }} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="HimalayasContext">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      defaultBaseLayer="esri-world"
      initialCamera={{ lng: 86.92, lat: 27.99, heightM: 12_000 }}
    >
      <Terrain provider={{ kind: "world" }} exaggeration={1.5} />
    </CesiumGlobe>
  {/snippet}
</Story>
