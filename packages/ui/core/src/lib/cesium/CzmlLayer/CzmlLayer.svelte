<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type { CzmlInput } from "../types.js";

  type DataSource = import("cesium").CzmlDataSource;
  type Entity = import("cesium").Entity;

  type Props = {
    /** A CZML URL, packet array, or single packet object. */
    data: CzmlInput;
    visible?: boolean;
    /**
     * Start the viewer's clock ticking on load. CZML is time-dynamic; without
     * a running clock its samples appear frozen at the document start time.
     */
    autoPlay?: boolean;
    /** Optional clock multiplier when `autoPlay` is enabled (e.g. 60 = 60×). */
    clockMultiplier?: number;
    onclick?: (entity: Entity) => void;
    onready?: (source: DataSource) => void;
  };

  let {
    data,
    visible = true,
    autoPlay = false,
    clockMultiplier,
    onclick,
    onready,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let source: DataSource | null = null;
  let pickHandler: import("cesium").ScreenSpaceEventHandler | null = null;

  $effect(() => {
    const d = data;
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = await import("cesium");
      if (cancelled) return;

      unloadExistingSource(viewer);
      try {
        source = await Cesium.CzmlDataSource.load(d as never);
      } catch (e) {
        console.warn("[CzmlLayer] load failed", e);
        return;
      }
      if (cancelled || !source) {
        source?.entities.removeAll();
        source = null;
        return;
      }

      await viewer.dataSources.add(source);
      source.show = visible;

      if (autoPlay) {
        viewer.clock.shouldAnimate = true;
        if (typeof clockMultiplier === "number") {
          viewer.clock.multiplier = clockMultiplier;
        }
        if (source.clock) {
          viewer.clock.startTime = source.clock.startTime;
          viewer.clock.stopTime = source.clock.stopTime;
          viewer.clock.currentTime = source.clock.currentTime;
          viewer.clock.clockRange = source.clock.clockRange;
        }
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

  $effect(() => {
    const viewer = getViewer();
    if (!viewer) return;
    viewer.clock.shouldAnimate = autoPlay && !!source;
    if (autoPlay && typeof clockMultiplier === "number") {
      viewer.clock.multiplier = clockMultiplier;
    }
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

  function unloadExistingSource(viewer: import("cesium").Viewer): void {
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
