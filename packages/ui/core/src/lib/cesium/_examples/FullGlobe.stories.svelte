<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Cesium/Examples/FullGlobe",
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "A geo_dashboard-class composition: globe + Esri imagery + markers + live aircraft + earthquake events, wrapped in a layer-control panel, minimap, compass, coordinates HUD, and camera controls. Everything is controlled by the host story's `$state` — the library components are headless.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import CesiumGlobe from "../CesiumGlobe/CesiumGlobe.svelte";
  import Terrain from "../Terrain/Terrain.svelte";
  import OsmBuildingsLayer from "../OsmBuildingsLayer/OsmBuildingsLayer.svelte";
  import MarkersLayer from "../MarkersLayer/MarkersLayer.svelte";
  import LabelsLayer from "../LabelsLayer/LabelsLayer.svelte";
  import AircraftLayer from "../AircraftLayer/AircraftLayer.svelte";
  import EarthquakesLayer from "../EarthquakesLayer/EarthquakesLayer.svelte";
  import CesiumControls from "../CesiumControls/CesiumControls.svelte";
  import CesiumCompass from "../CesiumCompass/CesiumCompass.svelte";
  import CesiumCoordinatesHud from "../CesiumCoordinatesHud/CesiumCoordinatesHud.svelte";
  import CesiumLayerControl from "../CesiumLayerControl/CesiumLayerControl.svelte";
  import CesiumMinimap from "../CesiumMinimap/CesiumMinimap.svelte";
  import {
    SITE_MARKERS,
    AIRCRAFT,
    EARTHQUAKES,
    LAYER_GROUPS,
    INITIAL_LAYER_STATE,
  } from "./full-globe-data.js";

  let layerState = $state({ ...INITIAL_LAYER_STATE });
  let markers = $state(SITE_MARKERS.map((m) => ({ ...m })));
  let selectedMarkerId = $state<string | null>(null);
  let selectedAircraftId = $state<string | null>(null);

  // City labels derive from the markers so the two stay consistent. The
  // LabelsLayer owns the text, so the markers are rendered as bare dots
  // (label stripped) to avoid drawing each name twice.
  const markerDots = $derived(
    markers.map(({ label: _label, ...rest }) => rest),
  );
  const labels = $derived(
    markers.map((m) => ({
      id: m.id,
      lng: m.lng,
      lat: m.lat,
      text: m.label ?? m.id,
      color: m.color,
    })),
  );

  const layerControlItems = $derived([
    { id: "terrain", label: "World Terrain", group: "base", visible: layerState.terrain },
    { id: "buildings", label: "OSM Buildings", group: "base", visible: layerState.buildings },
    { id: "aircraft", label: "Aircraft", group: "live", visible: layerState.aircraft, hint: `${AIRCRAFT.length} tracked` },
    { id: "earthquakes", label: "Earthquakes", group: "live", visible: layerState.earthquakes, hint: `${EARTHQUAKES.length} events` },
    { id: "markers", label: "Site Markers", group: "ref", visible: layerState.markers },
    { id: "labels", label: "City Labels", group: "ref", visible: layerState.labels },
  ]);

  function onLayerChange(id: string, patch: { visible?: boolean }) {
    if (patch.visible === undefined) return;
    if (id in layerState) {
      layerState = { ...layerState, [id]: patch.visible };
    }
  }

  function onMarkerMove(id: string, ll: { lng: number; lat: number }) {
    markers = markers.map((m) =>
      m.id === id ? { ...m, lng: ll.lng, lat: ll.lat } : m,
    );
  }
</script>

<Story name="FullGlobe">
  {#snippet template()}
    <div class="full-globe">
      <CesiumGlobe
        height="100vh"
        defaultBaseLayer="esri-world"
        initialCamera={{ lng: -95, lat: 39, heightM: 14_000_000 }}
      >
        {#if layerState.terrain}
          <Terrain provider={{ kind: "world" }} />
        {/if}
        {#if layerState.buildings}
          <OsmBuildingsLayer />
        {/if}
        {#if layerState.markers}
          <MarkersLayer
            markers={markerDots}
            draggable
            bind:selectedId={selectedMarkerId}
            onmove={onMarkerMove}
          />
        {/if}
        {#if layerState.labels}
          <LabelsLayer labels={labels} />
        {/if}
        {#if layerState.aircraft}
          <AircraftLayer
            aircraft={AIRCRAFT}
            alwaysShowLabels
            bind:selectedId={selectedAircraftId}
          />
        {/if}
        {#if layerState.earthquakes}
          <EarthquakesLayer earthquakes={EARTHQUAKES} />
        {/if}

        <CesiumLayerControl
          layers={layerControlItems}
          groups={LAYER_GROUPS}
          onchange={onLayerChange}
          position="top-right"
        />
        <CesiumControls
          home={{ lng: -95, lat: 39, heightM: 14_000_000 }}
          showSceneModeToggle
          position="top-left"
        />
        <CesiumCompass position="top-left" />
        <CesiumCoordinatesHud position="bottom-left" />
        <CesiumMinimap position="bottom-right" />
      </CesiumGlobe>
    </div>
  {/snippet}
</Story>

<style>
  .full-globe {
    width: 100%;
    height: 100vh;
  }
  /* Nudge the compass below the controls cluster so they don't overlap. */
  .full-globe :global(.cy-cesium-compass[data-position="top-left"]) {
    top: 220px;
  }
</style>
