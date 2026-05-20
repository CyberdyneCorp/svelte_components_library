<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";

  type DataSource = import("cesium").KmlDataSource;
  type Entity = import("cesium").Entity;

  type Props = {
    /** URL, KML/KMZ Blob, or parsed Document. */
    data: string | Blob | Document;
    visible?: boolean;
    clampToGround?: boolean;
    /** Override the resolver for relative URLs inside the KML. */
    sourceUri?: string;
    onclick?: (entity: Entity) => void;
    onready?: (source: DataSource) => void;
  };

  let {
    data,
    visible = true,
    clampToGround = false,
    sourceUri,
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
        const created = new Cesium.KmlDataSource({
          camera: viewer.scene.camera,
          canvas: viewer.scene.canvas,
          clampToGround,
          sourceUri,
        });
        await created.load(d, { clampToGround, sourceUri });
        source = created;
      } catch (e) {
        console.warn("[KmlLayer] load failed", e);
        return;
      }
      if (cancelled || !source) {
        source?.entities.removeAll();
        source = null;
        return;
      }

      await viewer.dataSources.add(source);
      source.show = visible;
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
