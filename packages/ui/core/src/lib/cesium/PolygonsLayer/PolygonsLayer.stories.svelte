<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PolygonsLayer from "./PolygonsLayer.svelte";
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";

  const { Story } = defineMeta({
    title: "Cesium/PolygonsLayer",
    component: PolygonsLayer,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Controlled polygons with optional draw mode. When `drawingId` is set, left-click adds a vertex, right-click / Enter / double-click finishes, Esc cancels, Ctrl/Cmd+Z undoes the last vertex.",
        },
      },
    },
  });

  const aoi = [
    {
      id: "sf-aoi",
      vertices: [
        { lng: -122.5194, lat: 37.7088 },
        { lng: -122.3194, lat: 37.7088 },
        { lng: -122.3194, lat: 37.8088 },
        { lng: -122.5194, lat: 37.8088 },
      ],
      color: "#00ff41",
      fillOpacity: 0.25,
    },
  ];

  const extruded = [
    {
      id: "block",
      vertices: [
        { lng: -73.99, lat: 40.74 },
        { lng: -73.985, lat: 40.74 },
        { lng: -73.985, lat: 40.745 },
        { lng: -73.99, lat: 40.745 },
      ],
      color: "#00d4ff",
      fillOpacity: 0.5,
      outlineColor: "#00d4ff",
      extrudedHeightM: 300,
    },
  ];
</script>

<Story name="AOI">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -122.42, lat: 37.76, heightM: 20_000 }}
    >
      <PolygonsLayer polygons={aoi} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="ExtrudedBlock">
  {#snippet template()}
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -73.988, lat: 40.742, heightM: 1_200 }}
    >
      <PolygonsLayer polygons={extruded} />
    </CesiumGlobe>
  {/snippet}
</Story>

<Story name="DrawModeCallbacks">
  {#snippet template()}
    <!-- Draw-mode events are logged; wire `polygons` to your own $state in
         the consuming app to actually accumulate the drawn vertices. The
         keybindings (left-click vertex, right-click finish, Esc cancel,
         Ctrl/Cmd+Z undo) are active here. -->
    <CesiumGlobe
      height="600px"
      initialCamera={{ lng: -122.42, lat: 37.76, heightM: 30_000 }}
    >
      <PolygonsLayer
        polygons={aoi}
        drawingId="draft"
        onvertexadd={(id, ll) => console.log("vertex", id, ll)}
        onfinish={(id) => console.log("finish", id)}
        oncancel={(id) => console.log("cancel", id)}
        onundo={(id) => console.log("undo", id)}
      />
    </CesiumGlobe>
  {/snippet}
</Story>
