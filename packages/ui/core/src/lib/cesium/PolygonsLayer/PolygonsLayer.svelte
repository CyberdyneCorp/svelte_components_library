<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import type { LngLat, Polygon } from "../types.js";

  type Entity = import("cesium").Entity;
  type CustomDataSource = import("cesium").CustomDataSource;
  type Cartesian2 = import("cesium").Cartesian2;
  type Cesium3 = import("cesium").Cartesian3;

  type Props = {
    polygons: Polygon[];
    visible?: boolean;
    /**
     * When set, this id receives drawing events (vertex add on left-click,
     * finish on right-click / Enter / double-click, cancel on Escape,
     * undo on Ctrl/Cmd+Z). The consumer is responsible for mutating the
     * matching polygon's vertices in response.
     */
    drawingId?: string | null;
    /** Bindable id of the polygon the user clicked most recently. */
    selectedId?: string | null;
    onclick?: (polygon: Polygon) => void;
    onvertexadd?: (id: string, lngLat: LngLat) => void;
    onfinish?: (id: string) => void;
    oncancel?: (id: string) => void;
    onundo?: (id: string) => void;
  };

  let {
    polygons,
    visible = true,
    drawingId = null,
    selectedId = $bindable(null),
    onclick,
    onvertexadd,
    onfinish,
    oncancel,
    onundo,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let pickHandler: import("cesium").ScreenSpaceEventHandler | null = null;
  let CesiumMod: typeof import("cesium") | null = null;

  let mounted: Polygon[] = [];

  // Mount the data source and pick handler once.
  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;

      dataSource = new Cesium.CustomDataSource("cy-cesium-polygons");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      installPickHandler(Cesium, viewer);
      syncPolygons(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void polygons;
    if (!CesiumMod || !dataSource) return;
    syncPolygons(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  // While `drawingId` is non-null, capture the relevant screen + keyboard
  // events and turn them into callbacks. Re-installs whenever `drawingId`
  // changes so the cleanup function runs.
  $effect(() => {
    const id = drawingId;
    if (!id) return;
    const viewer = getViewer();
    if (!viewer || !CesiumMod) return;

    const drawHandler = new CesiumMod.ScreenSpaceEventHandler(
      viewer.scene.canvas,
    );

    drawHandler.setInputAction((ev: { position: Cartesian2 }) => {
      const ll = pickGround(viewer, ev.position);
      if (ll) onvertexadd?.(id, ll);
    }, CesiumMod.ScreenSpaceEventType.LEFT_CLICK);

    drawHandler.setInputAction(
      () => onfinish?.(id),
      CesiumMod.ScreenSpaceEventType.RIGHT_CLICK,
    );
    drawHandler.setInputAction(
      () => onfinish?.(id),
      CesiumMod.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );

    const keyListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        oncancel?.(id);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onfinish?.(id);
      } else if ((e.key === "z" || e.key === "Z") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onundo?.(id);
      }
    };
    window.addEventListener("keydown", keyListener);

    return () => {
      drawHandler.destroy();
      window.removeEventListener("keydown", keyListener);
    };
  });

  function syncPolygons(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, polygons);
    for (const id of removedIds) {
      const e = dataSource.entities.getById(`polygon:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const p of added) addEntity(Cesium, p);
    for (const p of updated) updateEntity(Cesium, p);
    mounted = polygons;
  }

  function positions(
    Cesium: typeof import("cesium"),
    p: Polygon,
  ): Cesium3[] {
    return p.vertices.map((v) => Cesium.Cartesian3.fromDegrees(v.lng, v.lat));
  }

  function buildFillColor(
    Cesium: typeof import("cesium"),
    p: Polygon,
  ): import("cesium").Color {
    const hex = p.color ?? "#00d4ff";
    return Cesium.Color.fromCssColorString(hex).withAlpha(p.fillOpacity ?? 0.35);
  }

  function addEntity(Cesium: typeof import("cesium"), p: Polygon): void {
    if (!dataSource) return;
    const fillColor = buildFillColor(Cesium, p);
    const outlineColor = Cesium.Color.fromCssColorString(
      p.outlineColor ?? p.color ?? "#00ff41",
    );

    dataSource.entities.add({
      id: `polygon:${p.id}`,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions(Cesium, p)) as never,
        material: fillColor as never,
        extrudedHeight: p.extrudedHeightM as never,
        outline: true as never,
        outlineColor: outlineColor as never,
        outlineWidth: (p.outlineWidth ?? 2) as never,
      },
      polyline: {
        positions: [...positions(Cesium, p), positions(Cesium, p)[0]] as never,
        width: (p.outlineWidth ?? 2) as never,
        material: outlineColor as never,
        clampToGround: true as never,
      },
    });
  }

  function updateEntity(Cesium: typeof import("cesium"), p: Polygon): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`polygon:${p.id}`);
    if (!entity) {
      addEntity(Cesium, p);
      return;
    }
    const pos = positions(Cesium, p);
    if (entity.polygon) {
      entity.polygon.hierarchy = new Cesium.PolygonHierarchy(pos) as never;
      entity.polygon.material = buildFillColor(Cesium, p) as never;
      entity.polygon.extrudedHeight = p.extrudedHeightM as never;
    }
    if (entity.polyline) {
      entity.polyline.positions = (pos.length > 0
        ? [...pos, pos[0]]
        : pos) as never;
      entity.polyline.material = Cesium.Color.fromCssColorString(
        p.outlineColor ?? p.color ?? "#00ff41",
      ) as never;
      entity.polyline.width = (p.outlineWidth ?? 2) as never;
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
        if (drawingId) return; // draw mode owns clicks
        const picked = viewer.scene.pick(ev.position) as
          | { id?: Entity }
          | undefined;
        const entity = picked?.id;
        const id =
          typeof (entity as Entity & { id?: string })?.id === "string"
            ? (entity as Entity & { id: string }).id
            : "";
        if (!id.startsWith("polygon:")) return;
        const key = id.slice("polygon:".length);
        const polygon = polygons.find((p) => p.id === key);
        if (!polygon) return;
        selectedId = key;
        onclick?.(polygon);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
  }

  function pickGround(
    viewer: import("cesium").Viewer,
    point: Cartesian2,
  ): LngLat | null {
    const Cesium = CesiumMod;
    if (!Cesium) return null;
    const cartesian =
      viewer.scene.pickPosition(point) ??
      viewer.camera.pickEllipsoid(point, viewer.scene.globe.ellipsoid);
    if (!cartesian) return null;
    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    return {
      lng: Cesium.Math.toDegrees(carto.longitude),
      lat: Cesium.Math.toDegrees(carto.latitude),
    };
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
