<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";

  type DataSource = import("cesium").GeoJsonDataSource;
  type Entity = import("cesium").Entity;

  type Props = {
    /**
     * GeoJSON or TopoJSON. Either a URL string or an in-memory object.
     * Reloaded when the reference changes (consumers should keep stable
     * references when not mutating).
     */
    data: string | object;
    visible?: boolean;
    /** Hex outline colour for polylines and polygon strokes. */
    stroke?: string;
    strokeWidth?: number;
    /** Hex fill colour for polygon interiors. */
    fill?: string;
    /** Fill alpha 0..1 — multiplied into `fill`. */
    fillOpacity?: number;
    /** Single character or Maki symbol id for the default pin marker. */
    markerSymbol?: string;
    markerColor?: string;
    clampToGround?: boolean;
    /** Optional per-feature visit hook fired once per entity after load. */
    onfeature?: (entity: Entity) => void;
    onclick?: (entity: Entity) => void;
    onready?: (source: DataSource) => void;
  };

  let {
    data,
    visible = true,
    stroke = "#00ff41",
    strokeWidth = 2,
    fill = "#00d4ff",
    fillOpacity = 0.35,
    markerSymbol,
    markerColor = "#00ff41",
    clampToGround = false,
    onfeature,
    onclick,
    onready,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let source: DataSource | null = null;
  let pickHandler: import("cesium").ScreenSpaceEventHandler | null = null;

  // Re-load when `data` changes by reference. Visibility flips don't trigger
  // a reload; they only mutate `source.show`.
  $effect(() => {
    const d = data;
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = await import("cesium");
      if (cancelled) return;

      await unloadExistingSource(viewer);
      try {
        source = await Cesium.GeoJsonDataSource.load(d as never, {
          stroke: Cesium.Color.fromCssColorString(stroke),
          strokeWidth,
          fill: Cesium.Color.fromCssColorString(fill).withAlpha(fillOpacity),
          markerColor: Cesium.Color.fromCssColorString(markerColor),
          markerSymbol,
          clampToGround,
        });
      } catch (e) {
        console.warn("[GeoJsonLayer] load failed", e);
        return;
      }
      if (cancelled || !source) {
        source?.entities.removeAll();
        source = null;
        return;
      }

      await viewer.dataSources.add(source);
      source.show = visible;
      if (onfeature) {
        for (const entity of source.entities.values) onfeature(entity);
      }
      attachPickHandler(Cesium);
      onready?.(source);
    })();

    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    if (source) source.show = visible;
  });

  function attachPickHandler(Cesium: typeof import("cesium")): void {
    const viewer = getViewer();
    if (!viewer || !onclick || pickHandler) return;
    pickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    pickHandler.setInputAction(
      (ev: { position: import("cesium").Cartesian2 }) => {
        if (!viewer || !source) return;
        const picked = viewer.scene.pick(ev.position) as
          | { id?: Entity }
          | undefined;
        const entity = picked?.id;
        if (!entity || !source.entities.contains(entity)) return;
        onclick!(entity);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
  }

  async function unloadExistingSource(
    viewer: import("cesium").Viewer,
  ): Promise<void> {
    if (!source) return;
    viewer.dataSources.remove(source, true);
    source = null;
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && source) viewer.dataSources.remove(source, true);
    source = null;
    if (pickHandler) pickHandler.destroy();
    pickHandler = null;
  });
</script>
