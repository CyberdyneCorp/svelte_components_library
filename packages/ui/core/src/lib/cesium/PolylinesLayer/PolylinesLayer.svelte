<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import type { Polyline } from "../types.js";

  type Entity = import("cesium").Entity;
  type CustomDataSource = import("cesium").CustomDataSource;
  type Cartesian2 = import("cesium").Cartesian2;
  type Cesium3 = import("cesium").Cartesian3;

  type Props = {
    polylines: Polyline[];
    visible?: boolean;
    selectedId?: string | null;
    onclick?: (polyline: Polyline) => void;
  };

  let {
    polylines,
    visible = true,
    selectedId = $bindable(null),
    onclick,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let pickHandler: import("cesium").ScreenSpaceEventHandler | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  let mounted: Polyline[] = [];

  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;

      dataSource = new Cesium.CustomDataSource("cy-cesium-polylines");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      installPickHandler(Cesium, viewer);
      syncLines(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void polylines;
    if (!CesiumMod || !dataSource) return;
    syncLines(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function positions(
    Cesium: typeof import("cesium"),
    p: Polyline,
  ): Cesium3[] {
    return p.vertices.map((v) =>
      typeof p.altitudeM === "number"
        ? Cesium.Cartesian3.fromDegrees(v.lng, v.lat, p.altitudeM)
        : Cesium.Cartesian3.fromDegrees(v.lng, v.lat),
    );
  }

  function buildMaterial(
    Cesium: typeof import("cesium"),
    p: Polyline,
  ): unknown {
    const color = Cesium.Color.fromCssColorString(p.color ?? "#00d4ff");
    if (p.dashed) {
      return new Cesium.PolylineDashMaterialProperty({
        color,
        dashLength: 16,
      });
    }
    return color;
  }

  function syncLines(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, polylines);
    for (const id of removedIds) {
      const e = dataSource.entities.getById(`polyline:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const p of added) addEntity(Cesium, p);
    for (const p of updated) updateEntity(Cesium, p);
    mounted = polylines;
  }

  function addEntity(Cesium: typeof import("cesium"), p: Polyline): void {
    if (!dataSource) return;
    dataSource.entities.add({
      id: `polyline:${p.id}`,
      polyline: {
        positions: positions(Cesium, p) as never,
        width: (p.width ?? 2) as never,
        material: buildMaterial(Cesium, p) as never,
        clampToGround: (typeof p.altitudeM !== "number") as never,
      },
    });
  }

  function updateEntity(Cesium: typeof import("cesium"), p: Polyline): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`polyline:${p.id}`);
    if (!entity) {
      addEntity(Cesium, p);
      return;
    }
    if (entity.polyline) {
      entity.polyline.positions = positions(Cesium, p) as never;
      entity.polyline.width = (p.width ?? 2) as never;
      entity.polyline.material = buildMaterial(Cesium, p) as never;
      entity.polyline.clampToGround = (typeof p.altitudeM !==
        "number") as never;
    }
  }

  function installPickHandler(
    Cesium: typeof import("cesium"),
    viewer: import("cesium").Viewer,
  ): void {
    if (pickHandler) return;
    pickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    pickHandler.setInputAction(
      (ev: { position: Cartesian2 }) => {
        const picked = viewer.scene.pick(ev.position) as
          | { id?: Entity }
          | undefined;
        const id =
          typeof (picked?.id as Entity & { id?: string })?.id === "string"
            ? (picked!.id as Entity & { id: string }).id
            : "";
        if (!id.startsWith("polyline:")) return;
        const key = id.slice("polyline:".length);
        const polyline = polylines.find((p) => p.id === key);
        if (!polyline) return;
        selectedId = key;
        onclick?.(polyline);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (pickHandler) {
      pickHandler.destroy();
      pickHandler = null;
    }
    if (viewer && dataSource) viewer.dataSources.remove(dataSource, true);
    dataSource = null;
    mounted = [];
  });
</script>
