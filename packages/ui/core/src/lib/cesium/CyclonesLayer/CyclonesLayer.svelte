<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import { alertTriangle } from "../glyphs.js";
  import type { Cyclone } from "../types.js";

  type Entity = import("cesium").Entity;
  type CustomDataSource = import("cesium").CustomDataSource;
  type Cesium3 = import("cesium").Cartesian3;
  type Cartesian2 = import("cesium").Cartesian2;

  type Props = {
    cyclones: Cyclone[];
    visible?: boolean;
    selectedId?: string | null;
    /** Render the forecast cone polygon (default true). */
    showCone?: boolean;
    /** Render the forecast track polyline (default true). */
    showForecast?: boolean;
    onclick?: (cyclone: Cyclone) => void;
  };

  let {
    cyclones,
    visible = true,
    selectedId = $bindable(null),
    showCone = true,
    showForecast = true,
    onclick,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let handler: import("cesium").ScreenSpaceEventHandler | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  let mounted: Cyclone[] = [];

  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource("cy-cesium-cyclones");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      installPickHandler(Cesium, viewer);
      sync(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void cyclones;
    void showCone;
    void showForecast;
    if (!CesiumMod || !dataSource) return;
    sync(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function categoryColor(category: number | undefined): string {
    switch (category ?? 0) {
      case 5:
        return "#7f1d1d";
      case 4:
        return "#ef4444";
      case 3:
        return "#ff7a1a";
      case 2:
        return "#ffb800";
      case 1:
        return "#a855f7";
      default:
        return "#00d4ff";
    }
  }

  function ids(id: string): Record<string, string> {
    return {
      head: `cyclone:${id}`,
      track: `cyclone-track:${id}`,
      forecast: `cyclone-forecast:${id}`,
      cone: `cyclone-cone:${id}`,
    };
  }

  function removeBundle(id: string): void {
    if (!dataSource) return;
    for (const key of Object.values(ids(id))) {
      const e = dataSource.entities.getById(key);
      if (e) dataSource.entities.remove(e);
    }
  }

  function trackPositions(
    Cesium: typeof import("cesium"),
    c: Cyclone,
  ): Cesium3[] {
    return c.track.map((p) => Cesium.Cartesian3.fromDegrees(p.lng, p.lat));
  }

  function forecastPositions(
    Cesium: typeof import("cesium"),
    c: Cyclone,
  ): Cesium3[] {
    const tail = c.track.length ? c.track[c.track.length - 1] : null;
    const forecast = c.forecast ?? [];
    const points = tail ? [tail, ...forecast] : forecast;
    return points.map((p) => Cesium.Cartesian3.fromDegrees(p.lng, p.lat));
  }

  function conePositions(
    Cesium: typeof import("cesium"),
    c: Cyclone,
  ): Cesium3[] {
    return (c.cone ?? []).map((p) => Cesium.Cartesian3.fromDegrees(p.lng, p.lat));
  }

  function addBundle(Cesium: typeof import("cesium"), c: Cyclone): void {
    if (!dataSource) return;
    const id = ids(c.id);
    const color = categoryColor(c.category);

    if (c.track.length >= 2) {
      dataSource.entities.add({
        id: id.track,
        polyline: {
          positions: trackPositions(Cesium, c),
          width: 3 as never,
          material: Cesium.Color.fromCssColorString(color) as never,
          clampToGround: true as never,
        },
      });
    }

    if (showForecast && (c.forecast?.length ?? 0) > 0) {
      dataSource.entities.add({
        id: id.forecast,
        polyline: {
          positions: forecastPositions(Cesium, c),
          width: 2 as never,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString(color),
            dashLength: 14,
          }) as never,
          clampToGround: true as never,
        },
      });
    }

    if (showCone && (c.cone?.length ?? 0) >= 3) {
      dataSource.entities.add({
        id: id.cone,
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(conePositions(Cesium, c)) as never,
          material: Cesium.Color.fromCssColorString(color).withAlpha(0.15) as never,
          outline: true as never,
          outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(
            0.5,
          ) as never,
        },
      });
    }

    const head = c.track[c.track.length - 1];
    if (head) {
      dataSource.entities.add({
        id: id.head,
        position: Cesium.Cartesian3.fromDegrees(head.lng, head.lat),
        billboard: {
          image: alertTriangle(color),
          width: 30,
          height: 30,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
        },
        label: c.name
          ? {
              text: c.name,
              font: "12px JetBrains Mono, monospace",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -22),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            }
          : undefined,
      });
    }
  }

  function sync(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, cyclones);
    for (const id of removedIds) removeBundle(id);
    for (const c of added) addBundle(Cesium, c);
    for (const c of updated) {
      // Track shape can change every frame; safest to rebuild the bundle.
      removeBundle(c.id);
      addBundle(Cesium, c);
    }
    mounted = cyclones;
  }

  function installPickHandler(
    Cesium: typeof import("cesium"),
    viewer: import("cesium").Viewer,
  ): void {
    if (handler || !onclick) return;
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(
      (ev: { position: Cartesian2 }) => {
        if (!dataSource) return;
        const picked = viewer.scene.pick(ev.position) as
          | { id?: Entity }
          | undefined;
        const id =
          typeof (picked?.id as Entity & { id?: string })?.id === "string"
            ? (picked!.id as Entity & { id: string }).id
            : "";
        const match = id.match(/^cyclone:(.+)$/);
        if (!match) return;
        const c = cyclones.find((x) => x.id === match[1]);
        if (!c) return;
        selectedId = match[1];
        onclick?.(c);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (handler) {
      handler.destroy();
      handler = null;
    }
    if (viewer && dataSource) viewer.dataSources.remove(dataSource, true);
    dataSource = null;
    mounted = [];
  });
</script>
